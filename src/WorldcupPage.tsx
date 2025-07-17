import React, { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { useNavigate } from 'react-router-dom';

interface Video {
  videoId: string;
  title: string;
}

interface WorldcupPageProps {
  playlistTitle: string;
  videos: Video[];
  round: number;
}

const WorldcupPage: React.FC<WorldcupPageProps> = ({ playlistTitle, videos, round }) => {
  const [current, setCurrent] = useState(0);
  const [winners, setWinners] = useState<Video[]>([]);
  const [stage, setStage] = useState(1);
  const [currentVideos, setCurrentVideos] = useState<Video[]>(videos);
  const totalMatches = Math.floor(currentVideos.length / 2);

  // YouTube Player refs
  const leftPlayerRef = useRef<YouTubePlayer | null>(null);
  const rightPlayerRef = useRef<YouTubePlayer | null>(null);

  const left = currentVideos[current * 2];
  const right = currentVideos[current * 2 + 1];

  // 대진이 바뀔 때 ref를 무조건 null로 초기화
  useEffect(() => {
    leftPlayerRef.current = null;
    rightPlayerRef.current = null;
  }, [currentVideos, current, stage]);

  const navigate = useNavigate();

  // 방어: 필수 데이터가 없으면 메인으로 이동
  useEffect(() => {
    if (!playlistTitle || !videos || !Array.isArray(videos) || videos.length < 2 || !round) {
      navigate('/', { replace: true });
    }
  }, [playlistTitle, videos, round, navigate]);

  const handleSelect = (winner: Video) => {
    const nextWinners = [...winners, winner];
    if (current + 1 < totalMatches) {
      setWinners(nextWinners);
      setCurrent(current + 1);
    } else {
      if (nextWinners.length === 1) {
        // 우승자 결정 시 WinnerPage로 이동
        navigate('/winner', { state: { videoId: nextWinners[0].videoId, title: nextWinners[0].title } });
        return;
      }
      setCurrent(0);
      setCurrentVideos(nextWinners);
      setWinners([]);
      setStage(stage + 1);
    }
  };

  // hover 시 해당 영상만 unmute, 나머지는 mute (null 체크 추가)
  const handleLeftHover = () => {
    try {
      if (left && leftPlayerRef.current) leftPlayerRef.current.unMute();
    } catch (e) {}
    try {
      if (right && rightPlayerRef.current) rightPlayerRef.current.mute();
    } catch (e) {}
  };
  const handleRightHover = () => {
    try {
      if (right && rightPlayerRef.current) rightPlayerRef.current.unMute();
    } catch (e) {}
    try {
      if (left && leftPlayerRef.current) leftPlayerRef.current.mute();
    } catch (e) {}
  };
  const handleMouseLeave = () => {
    try {
      if (left && leftPlayerRef.current) leftPlayerRef.current.mute();
    } catch (e) {}
    try {
      if (right && rightPlayerRef.current) rightPlayerRef.current.mute();
    } catch (e) {}
  };

  // 라운드/진행상황 표시
  const roundLabel = `${currentVideos.length / 2}강 ${current + 1}/${totalMatches}`;

  // YouTube 옵션: 자동재생, 음소거 시작
  const ytOpts = {
    width: '100%',
    height: '340',
    playerVars: {
      autoplay: 0,
      mute: 1,
      rel: 0,
      modestbranding: 1,
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#222', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ textAlign: 'center', fontSize: 36, margin: '32px 0 12px 0' }}>{playlistTitle}</h1>
      <div style={{ textAlign: 'center', fontSize: 24, marginBottom: 8 }}>{roundLabel}</div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, flex: 1, height: 'calc(100vh - 120px)' }}>
        {/* 왼쪽 */}
        <div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#ffbaba', minHeight: 0, minWidth: 0, height: '100%', justifyContent: 'center' }}
          onMouseEnter={handleLeftHover}
          onMouseLeave={handleMouseLeave}
        >
          <div style={{ width: '100%', textAlign: 'center', fontWeight: 600, fontSize: 22, color: '#222', margin: '18px 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{left?.title}</div>
          <div style={{ width: '100%', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {left && (
              <div style={{ width: '100%', height: '60vh', minHeight: 340, maxHeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <YouTube
                  key={left.videoId + '-' + current + '-' + stage}
                  videoId={left.videoId}
                  opts={{ ...ytOpts, width: '100%', height: '100%' }}
                  onReady={e => {
                    leftPlayerRef.current = e.target;
                    e.target.mute();
                  }}
                  onError={() => { leftPlayerRef.current = null; }}
                  style={{ width: '100%', height: '100%', borderRadius: 12, background: '#000' }}
                />
              </div>
            )}
          </div>
          <button
            style={{ width: '100%', background: '#ff5252', color: '#fff', fontWeight: 700, fontSize: 24, border: 'none', borderRadius: 0, padding: '18px 0', marginTop: 18, cursor: 'pointer' }}
            onClick={() => left && handleSelect(left)}
            disabled={!left || !right}
          >
            ✓ 선택
          </button>
        </div>
        {/* VS */}
        <div style={{ width: 0, position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: 64, fontWeight: 900, color: '#ffb300', textShadow: '0 4px 24px #000, 0 1px 0 #fff8', borderRadius: 24, padding: '16px 36px', userSelect: 'none' }}>VS</div>
        </div>
        {/* 오른쪽 */}
        <div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#badaff', minHeight: 0, minWidth: 0, height: '100%', justifyContent: 'center' }}
          onMouseEnter={handleRightHover}
          onMouseLeave={handleMouseLeave}
        >
          <div style={{ width: '100%', textAlign: 'center', fontWeight: 600, fontSize: 22, color: '#222', margin: '18px 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{right?.title}</div>
          <div style={{ width: '100%', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {right && (
              <div style={{ width: '100%', height: '60vh', minHeight: 340, maxHeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <YouTube
                  key={right.videoId + '-' + current + '-' + stage}
                  videoId={right.videoId}
                  opts={{ ...ytOpts, width: '100%', height: '100%' }}
                  onReady={e => {
                    rightPlayerRef.current = e.target;
                    e.target.mute();
                  }}
                  onError={() => { rightPlayerRef.current = null; }}
                  style={{ width: '100%', height: '100%', borderRadius: 12, background: '#000' }}
                />
              </div>
            )}
          </div>
          <button
            style={{ width: '100%', background: '#2196f3', color: '#fff', fontWeight: 700, fontSize: 24, border: 'none', borderRadius: 0, padding: '18px 0', marginTop: 18, cursor: 'pointer' }}
            onClick={() => right && handleSelect(right)}
            disabled={!left || !right}
          >
            ✓ 선택
          </button>
        </div>
      </div>
      {/* 유튜브 컨테이너 스타일 */}
      {/* 스타일 태그 제거: 부모 div에서 직접 스타일 적용 */}
    </div>
  );
};

export default WorldcupPage; 