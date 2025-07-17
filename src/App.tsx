import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import WorldcupPage from './WorldcupPage';
import WinnerPage from './WinnerPage';

function extractPlaylistId(url: string): string | null {
  try {
    const u = new URL(url);
    return u.searchParams.get('list');
  } catch {
    return null;
  }
}

function AppMain() {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoCount, setVideoCount] = useState<number | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<{ videoId: string; title: string }[]>([]);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaylistUrl(e.target.value);
  };

  // 라운드 버튼 생성 로직
  function getAvailableRounds(count: number): number[] {
    const rounds = [8, 16, 32, 64, 128];
    return rounds.filter(n => count >= n * 2);
  }

  const fetchPlaylistInfo = async (url: string) => {
    setLoading(true);
    setError(null);
    setVideoCount(null);
    setPlaylistTitle(null);
    setVideos([]);
    try {
      const apiKey = process.env.REACT_APP_YT_API_KEY;
      if (!apiKey) throw new Error('API 키가 설정되지 않았습니다.');
      const playlistId = extractPlaylistId(url);
      if (!playlistId) throw new Error('유효한 유튜브 재생목록 URL을 입력하세요.');

      // 1. 재생목록 정보(제목 등) 가져오기
      const infoRes = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`);
      const infoData = await infoRes.json();
      if (!infoData.items || infoData.items.length === 0) throw new Error('재생목록 정보를 찾을 수 없습니다.');
      setPlaylistTitle(infoData.items[0].snippet.title);

      // 2. 영상 전체 리스트 가져오기 (최대 300개, 필요시 추가 페이지네이션)
      let allVideos: { videoId: string; title: string }[] = [];
      let nextPageToken = '';
      while (allVideos.length < 300) {
        const itemsRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`);
        const itemsData = await itemsRes.json();
        if (!itemsData.items) break;
        allVideos = allVideos.concat(
          itemsData.items
            .filter((item: any) => item.snippet?.resourceId?.videoId)
            .map((item: any) => ({
              videoId: item.snippet.resourceId.videoId,
              title: item.snippet.title,
            }))
        );
        if (!itemsData.nextPageToken) break;
        nextPageToken = itemsData.nextPageToken;
      }
      setVideos(allVideos);
      setVideoCount(allVideos.length);
    } catch (e: any) {
      setError(e.message || '재생목록 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlaylistInfo(playlistUrl);
  };

  // n강 버튼 클릭 시 월드컵 페이지로 이동
  const handleRoundClick = (round: number) => {
    // n*2개 랜덤 추출 (n강이면 32개)
    const shuffled = [...videos].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, round * 2);
    navigate('/worldcup', {
      state: {
        playlistTitle,
        videos: selected,
        round,
      },
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f9f9f9' }}>
      <h1 style={{ marginBottom: 32 }}>유튜브 재생목록 이상형 월드컵</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 350 }}>
        <label htmlFor="playlist-url" style={{ fontWeight: 500, fontSize: 18 }}>유튜브 재생목록 URL을 입력하세요</label>
        <input
          id="playlist-url"
          type="text"
          value={playlistUrl}
          onChange={handleChange}
          placeholder="https://www.youtube.com/playlist?list=..."
          style={{ padding: '12px 16px', fontSize: 16, borderRadius: 8, border: '1px solid #ccc' }}
          disabled={loading}
        />
        <button
          type="submit"
          style={{ padding: '12px 0', fontSize: 17, borderRadius: 8, background: '#ff5252', color: '#fff', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}
          disabled={loading || !playlistUrl}
        >
          {loading ? '불러오는 중...' : '생성하기'}
        </button>
        <div style={{ minHeight: 28, marginTop: 4 }}>
          {loading && (
            <div style={{ width: '100%', height: 6, background: '#eee', borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #ff5252 30%, #ffbaba 100%)', animation: 'loadingBar 1.2s linear infinite' }} />
            </div>
          )}
          {!loading && error && (
            <span style={{ color: '#ff5252', fontSize: 15 }}>{error}</span>
          )}
          {!loading && videoCount !== null && !error && (
            <>
              <span style={{ color: '#333', fontSize: 16 }}>
                {playlistTitle && <b>『{playlistTitle}』</b>} 불러온 영상 개수: <b>{videoCount}</b>개
              </span>
              {videoCount >= 300 && (
                <div style={{ color: '#ff5252', fontWeight: 500, fontSize: 15, marginTop: 6 }}>
                  영상은 최대 300개까지 불러올 수 있습니다.
                </div>
              )}
              <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                {videoCount < 8 ? (
                  <span style={{ color: '#ff5252', fontWeight: 500, fontSize: 15 }}>영상이 8개 이상 담겨야 합니다.</span>
                ) : (
                  getAvailableRounds(videoCount).map(round => (
                    <button
                      key={round}
                      type="button"
                      style={{ padding: '8px 20px', fontSize: 16, borderRadius: 8, background: '#fff', border: '2px solid #ff5252', color: '#ff5252', fontWeight: 600, cursor: 'pointer', marginBottom: 4 }}
                      onClick={() => handleRoundClick(round)}
                    >
                      {round}강
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </form>
      {/* 로딩 바 애니메이션 스타일 */}
      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        div[style*='linear-gradient'] {
          animation: loadingBar 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}

// 라우팅 적용
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppMain />} />
        <Route path="/worldcup" element={<WorldcupPageWrapper />} />
        <Route path="/winner" element={<WinnerPageWrapper />} />
      </Routes>
    </Router>
  );
}

// 월드컵 페이지에 location state로 데이터 전달
function WorldcupPageWrapper() {
  const location = useLocation();
  const state = location.state as { playlistTitle: string; videos: { videoId: string; title: string }[]; round: number } | undefined;
  if (!state) return <Navigate to="/" replace />;
  return <WorldcupPage playlistTitle={state.playlistTitle} videos={state.videos} round={state.round} />;
}

function WinnerPageWrapper() {
  const location = useLocation();
  const state = location.state as { videoId: string; title: string } | undefined;
  if (!state) return <Navigate to="/" replace />;
  return <WinnerPage videoId={state.videoId} title={state.title} />;
}

export default App;
