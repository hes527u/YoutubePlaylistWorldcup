import React from 'react';
import { useNavigate } from 'react-router-dom';

interface WinnerPageProps {
  videoId: string;
  title: string;
}

const WinnerPage: React.FC<WinnerPageProps> = ({ videoId, title }) => {
  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const videoUrl = `https://youtu.be/${videoId}`;
  const navigate = useNavigate();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `이상형 월드컵 우승곡: ${title}`,
          url: videoUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(videoUrl);
      alert('링크가 복사되었습니다!');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#222', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontSize: 48, marginBottom: 24, color: '#ffb300', textShadow: '0 4px 24px #000, 0 1px 0 #fff8' }}>우승!</h1>
      <img src={thumbnail} alt={title} style={{ width: 360, maxWidth: '80vw', borderRadius: 16, boxShadow: '0 4px 32px #0008', marginBottom: 24 }} />
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, textAlign: 'center' }}>{title}</div>
      <button
        onClick={handleShare}
        style={{ background: '#2196f3', color: '#fff', fontWeight: 700, fontSize: 22, border: 'none', borderRadius: 8, padding: '16px 40px', cursor: 'pointer', boxShadow: '0 2px 12px #0004', marginBottom: 24 }}
      >
        공유하기
      </button>
      <button
        onClick={handleHome}
        style={{ background: '#fff', color: '#222', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 8, padding: '12px 32px', cursor: 'pointer', boxShadow: '0 2px 12px #0002', display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <span style={{ display: 'flex', alignItems: 'center', fontSize: 24, marginRight: 4 }}>
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 11.5L12 4l9 7.5" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10.5V20a1 1 0 001 1h3.5a1 1 0 001-1v-4.5h2V20a1 1 0 001 1H18a1 1 0 001-1v-9.5" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
        홈으로 돌아가기
      </button>
    </div>
  );
};

export default WinnerPage; 