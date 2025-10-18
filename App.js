import React, { useState, useEffect, useRef } from 'react';
import './App.css';

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [message, setMessage] = useState('');
  const [records, setRecords] = useState([]);
  const [streak, setStreak] = useState(0);

  // カメラ起動
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        alert('カメラを使えません: ' + err);
      }
    }
    startCamera();
  }, []);

  // localStorageから記録取得
  useEffect(() => {
    const data = localStorage.getItem('goOutRecords');
    const arr = data ? JSON.parse(data) : [];
    setRecords(arr);
    setStreak(calcStreak(arr));
  }, []);

  function getTodayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function dateDiff(d1, d2) {
    return Math.floor((new Date(d2) - new Date(d1)) / (1000 * 60 * 60 * 24));
  }

  function calcStreak(dates) {
    if (dates.length === 0) return 0;
    let streakCount = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      if (dateDiff(dates[i - 1], dates[i]) === 1) streakCount++;
      else break;
    }
    return streakCount;
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    alert('写真を撮りました！');
  };

  const goOut = () => {
    const today = getTodayStr();
    if (!records.includes(today)) {
      const newRecords = [...records, today].sort();
      setRecords(newRecords);
      localStorage.setItem('goOutRecords', JSON.stringify(newRecords));
      const newStreak = calcStreak(newRecords);
      setStreak(newStreak);
      setMessage('やった！やった！すごい！すごい！');
    } else {
      setMessage('もう今日の記録はありますよ！');
    }
  };

  // 過去7日間のカレンダー用日付配列
  const last7days = [];
  const todayDate = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    last7days.push(d.toISOString().slice(0, 10));
  }

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <h1>外に出たら褒めるアプリ＋連続記録 (React)</h1>

      <video ref={videoRef} autoPlay style={{ width: 300, height: 225, border: '1px solid #ccc' }}></video>
      <br />
      <button onClick={takePhoto} style={{ marginTop: 10 }}>写真を撮る</button>
      <br />
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <br />
      <button onClick={goOut} style={{ marginTop: 10 }}>外に出たよ！</button>

      <div style={{ marginTop: 20, fontSize: 24, color: '#e91e63' }}>{message}</div>

      <div style={{ marginTop: 30 }}>
        <strong>過去7日間の外出記録</strong>
        <br />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          {last7days.map(date => {
            const dayLabel = new Date(date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
            const stamped = records.includes(date);
            return (
              <div
                key={date}
                style={{
                  width: 32,
                  height: 32,
                  lineHeight: '32px',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  backgroundColor: stamped ? '#e91e63' : '#fff',
                  color: stamped ? '#fff' : '#000',
                  fontWeight: stamped ? 'bold' : 'normal',
                  userSelect: 'none',
                }}
              >
                {dayLabel}
                {stamped && ' ✓'}
              </div>
            );
          })}
        </div>
        {streak > 1 && (
          <div style={{ marginTop: 10, fontSize: 20, color: '#333' }}>
            {streak}日連続で外出成功！すごい！
          </div>
        )}
      </div>
    </div>
  );
}
