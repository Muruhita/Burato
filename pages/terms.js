import Layout from '../components/Layout';
import { useState, useEffect, useRef } from 'react';

export default function Terms() {
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [target, setTarget] = useState({ x: 0, y: 0, visible: true });
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const timerRef = useRef(null);
  const boardRef = useRef(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Ошибка загрузки лидерборда:', error);
    }
  };

  const startGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setTimeLeft(15);
    setGameState('playing');
    setShowLeaderboard(false);
    moveTarget();
  };

  const saveScore = async (finalScore) => {
    try {
      const meRes = await fetch('/api/me');
      const meData = await meRes.json();
      if (meData.user) {
        const res = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: meData.user.id,
            username: meData.user.username,
            score: finalScore
          })
        });
        if (res.ok) await fetchLeaderboard();
      }
    } catch (error) {
      console.error('Ошибка сохранения результата:', error);
    }
    setShowLeaderboard(true);
  };

  const stopGame = () => {
    clearInterval(timerRef.current);
    setGameState('finished');
    saveScore(scoreRef.current);
  };

  const moveTarget = () => {
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const x = Math.random() * (rect.width - 50);
    const y = Math.random() * (rect.height - 50);
    setTarget({ x, y, visible: true });
  };

  const catchTarget = (e) => {
    e.stopPropagation();
    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);
    setTarget(prev => ({ ...prev, visible: false }));
    setTimeout(() => {
      moveTarget();
      setTarget(prev => ({ ...prev, visible: true }));
    }, 150);
  };

  const handleBoardClick = () => {};

  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameState('finished');
          saveScore(scoreRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const getRating = (s) => {
    if (s >= 20) return { code: 'S++', text: 'ЭЛИТА' };
    if (s >= 15) return { code: 'A', text: 'ОТЛИЧНО' };
    if (s >= 5)  return { code: 'C', text: 'УДОВЛЕТВОРИТЕЛЬНО' };
    return { code: 'F', text: 'ПРОВАЛ' };
  };

  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">TRAINING · SIMULATION RANGE</div>
          <h1 className="ph-title">ПОЛИГОН<span className="ph-dot">.</span></h1>
          <p className="ph-sub">
            Тактическая тренировка: цель помечена как 🔍. Кликайте по ней, пока не истекло время.
          </p>
          <div className="ph-rule" />
        </header>

        <section className="panel">
          <div className="panel-head">
            <span className="p-num">01</span>
            <h2 className="p-title">ТРЕНИРОВКА</h2>
            <span className={`p-tag ${gameState === 'playing' ? 'p-tag-on' : ''}`}>
              {gameState === 'idle' && 'READY'}
              {gameState === 'playing' && 'RUNNING'}
              {gameState === 'finished' && 'COMPLETE'}
            </span>
          </div>
          <div className="panel-body">
            {gameState === 'idle' && (
              <div className="stage stage-idle">
                <div className="stage-icon">◎</div>
                <p className="stage-text">
                  Готовы к тренировке? У вас будет <strong>15 секунд</strong>, чтобы поразить
                  как можно больше целей.
                </p>
                <button className="btn btn-solid" onClick={startGame}>▶ НАЧАТЬ ТРЕНИРОВКУ</button>
              </div>
            )}

            {gameState === 'playing' && (
              <>
                <div className="hud">
                  <div className="hud-item">
                    <span className="hud-key">ВРЕМЯ</span>
                    <span className="hud-val">{String(timeLeft).padStart(2, '0')}<span className="hud-sec">с</span></span>
                  </div>
                  <div className="hud-item hud-item-right">
                    <span className="hud-key">ОЧКИ</span>
                    <span className="hud-val">{score}</span>
                  </div>
                </div>

                <div ref={boardRef} className="board" onClick={handleBoardClick}>
                  <div className="board-grid" />
                  {target.visible && (
                    <div
                      className="target"
                      style={{ left: target.x, top: target.y }}
                      onClick={catchTarget}
                    >
                      <div className="target-ring" />
                      <div className="target-ring-inner" />
                      <div className="target-cross">+</div>
                    </div>
                  )}
                </div>

                <button className="btn btn-danger" onClick={stopGame}>■ ЗАВЕРШИТЬ ДОСРОЧНО</button>
              </>
            )}

            {gameState === 'finished' && (
              <div className="stage stage-finished">
                <div className="result-rank">
                  <span className="rank-code">{getRating(score).code}</span>
                  <span className="rank-text">{getRating(score).text}</span>
                </div>
                <div className="result-score">
                  <span className="rs-num">{score}</span>
                  <span className="rs-lbl">ПОРАЖЁННЫХ ЦЕЛЕЙ</span>
                </div>
                <button className="btn btn-solid" onClick={startGame}>↻ СЫГРАТЬ СНОВА</button>
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="p-num">02</span>
            <h2 className="p-title">ТАБЛИЦА РЕЗУЛЬТАТОВ</h2>
            <span className="p-tag">{leaderboard.length} ЗАПИСЕЙ</span>
            <button className="p-edit" onClick={() => setShowLeaderboard(!showLeaderboard)}>
              {showLeaderboard ? '× СКРЫТЬ' : '▸ ПОКАЗАТЬ'}
            </button>
          </div>

          {showLeaderboard && (
            <div className="panel-body no-pad">
              {leaderboard.length === 0 ? (
                <div className="empty">
                  <span className="empty-icon">//</span>
                  <p>ПОКА НЕТ РЕЗУЛЬТАТОВ</p>
                </div>
              ) : (
                <div className="lead">
                  <div className="lead-head">
                    <span className="lh-rank">#</span>
                    <span className="lh-user">ОПЕРАТОР</span>
                    <span className="lh-score">ОЧКИ</span>
                  </div>
                  {leaderboard.map((entry, i) => (
                    <div key={i} className={`lead-row ${i === 0 ? 'is-top' : ''}`}>
                      <span className="lr-rank">{String(i + 1).padStart(2, '0')}</span>
                      <span className="lr-user">{entry.username}</span>
                      <span className="lr-dots" />
                      <span className="lr-score">{entry.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .info { max-width: 820px; margin: 0 auto; }

        .page-head { margin-bottom: 26px; animation: fadeIn 0.45s ease; }
        .ph-stamp {
          display: inline-block;
          padding: 3px 10px;
          border: 1px solid #333;
          color: #888;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .ph-title {
          font-size: 42px;
          font-weight: 900;
          letter-spacing: 3px;
          margin: 0;
          color: #fff;
          line-height: 1;
          text-transform: uppercase;
        }
        .ph-dot { color: #fff; animation: blink 1.2s steps(2, start) infinite; }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0.15; }
        }
        .ph-sub { color: #888; font-size: 13px; margin: 12px 0 0; line-height: 1.55; }
        .ph-rule {
          height: 1px;
          background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%);
          margin: 18px 0 0;
        }

        .panel {
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          margin-bottom: 14px;
          animation: cardIn 0.45s ease;
        }
        .panel-head {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 18px;
          border-bottom: 1px solid #1f1f1f;
          background: #0a0a0a;
        }
        .p-num {
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2px;
          color: #666;
          font-weight: 700;
        }
        .p-title {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2.4px;
          color: #fff;
          margin: 0;
          text-transform: uppercase;
          flex: 1;
        }
        .p-tag {
          font-family: ui-monospace, monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: #666;
          border: 1px solid #2a2a2a;
          padding: 2px 8px;
        }
        .p-tag-on {
          color: #000;
          background: #fff;
          border-color: #fff;
        }
        .p-edit {
          background: transparent;
          border: 1px solid #333;
          color: #ccc;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 1.6px;
          padding: 4px 10px;
          cursor: pointer;
          transition: all 0.18s;
        }
        .p-edit:hover { background: #fff; color: #000; border-color: #fff; }

        .panel-body { padding: 20px; }
        .panel-body.no-pad { padding: 0; }

        /* ── STAGE ── */
        .stage {
          text-align: center;
          padding: 34px 20px;
        }
        .stage-icon {
          font-size: 60px;
          color: #fff;
          line-height: 1;
          margin-bottom: 20px;
          opacity: 0.85;
        }
        .stage-text {
          color: #b0b0b0;
          font-size: 14px;
          line-height: 1.7;
          max-width: 460px;
          margin: 0 auto 24px;
        }
        .stage-text strong { color: #fff; }

        /* ── HUD ── */
        .hud {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          background: #060606;
          border: 1px solid #1f1f1f;
          margin-bottom: 14px;
          font-family: ui-monospace, monospace;
        }
        .hud-item {
          display: flex;
          align-items: baseline;
          gap: 12px;
        }
        .hud-key {
          font-size: 10px;
          letter-spacing: 2px;
          color: #666;
        }
        .hud-val {
          font-size: 26px;
          font-weight: 900;
          color: #fff;
          line-height: 1;
        }
        .hud-sec {
          font-size: 12px;
          color: #555;
          margin-left: 3px;
          font-weight: 400;
        }

        /* ── BOARD ── */
        .board {
          position: relative;
          width: 100%;
          height: 340px;
          background: #060606;
          border: 1px solid #262626;
          overflow: hidden;
          cursor: crosshair;
          margin-bottom: 14px;
        }
        .board-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .target {
          position: absolute;
          width: 52px;
          height: 52px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.1s;
          animation: targetIn 0.15s ease;
        }
        @keyframes targetIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        .target:hover { transform: scale(1.15); }
        .target-ring {
          position: absolute;
          inset: 0;
          border: 2px solid #fff;
          border-radius: 50%;
          box-shadow: 0 0 18px rgba(255,255,255,0.4);
          animation: ringPulse 1.4s ease-in-out infinite;
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(255,255,255,0.3); }
          50%      { box-shadow: 0 0 22px rgba(255,255,255,0.65); }
        }
        .target-ring-inner {
          position: absolute;
          inset: 12px;
          border: 1px solid #fff;
          border-radius: 50%;
          opacity: 0.7;
        }
        .target-cross {
          position: relative;
          color: #fff;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          z-index: 1;
        }

        /* ── FINISHED ── */
        .result-rank {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 26px;
          border: 1px solid #2a2a2a;
          margin-bottom: 20px;
          background: #060606;
        }
        .rank-code {
          font-family: ui-monospace, monospace;
          font-size: 44px;
          font-weight: 900;
          color: #fff;
          line-height: 1;
          letter-spacing: 3px;
        }
        .rank-text {
          font-family: ui-monospace, monospace;
          font-size: 10.5px;
          letter-spacing: 3px;
          color: #888;
        }
        .result-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-bottom: 26px;
        }
        .rs-num {
          font-size: 56px;
          font-weight: 900;
          color: #fff;
          line-height: 1;
          font-family: ui-monospace, monospace;
        }
        .rs-lbl {
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 3px;
          color: #666;
        }

        /* ── LEADERBOARD ── */
        .lead { display: flex; flex-direction: column; }
        .lead-head {
          display: grid;
          grid-template-columns: 50px 1fr 80px;
          gap: 12px;
          padding: 11px 18px;
          background: #0a0a0a;
          border-bottom: 1px solid #1f1f1f;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #666;
          text-transform: uppercase;
        }
        .lh-rank { text-align: left; }
        .lh-score { text-align: right; }
        .lead-row {
          display: grid;
          grid-template-columns: 50px 1fr auto 80px;
          gap: 12px;
          align-items: center;
          padding: 12px 18px;
          border-bottom: 1px solid #1a1a1a;
          font-family: ui-monospace, monospace;
          font-size: 13px;
          transition: background 0.18s;
        }
        .lead-row:last-child { border-bottom: none; }
        .lead-row:hover { background: #131313; }
        .lead-row.is-top .lr-rank,
        .lead-row.is-top .lr-score { color: #fff; }
        .lead-row.is-top .lr-user { font-weight: 800; }
        .lr-rank {
          color: #666;
          font-size: 11px;
          letter-spacing: 2px;
        }
        .lr-user {
          color: #eaeaea;
          font-size: 13.5px;
          font-weight: 600;
          font-family: -apple-system, sans-serif;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .lr-dots {
          height: 1px;
          background: repeating-linear-gradient(
            90deg, #2a2a2a 0px, #2a2a2a 3px,
            transparent 3px, transparent 6px
          );
          min-width: 20px;
        }
        .lr-score {
          color: #fff;
          text-align: right;
          font-weight: 700;
          font-size: 14px;
        }

        /* ── BUTTONS ── */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 22px;
          background: transparent;
          border: 1px solid #333;
          color: #eaeaea;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .btn:hover { background: #fff; border-color: #fff; color: #000; }
        .btn-solid {
          background: #fff;
          color: #000;
          border-color: #fff;
          font-weight: 800;
        }
        .btn-solid:hover { background: #ccc; border-color: #ccc; }
        .btn-danger {
          color: #ff8080;
          border-color: #553030;
        }
        .btn-danger:hover { background: #ff4444; border-color: #ff4444; color: #fff; }

        .empty {
          padding: 50px 20px;
          text-align: center;
          color: #666;
        }
        .empty-icon {
          display: block;
          font-family: ui-monospace, monospace;
          font-size: 32px;
          color: #2a2a2a;
          letter-spacing: 6px;
          margin-bottom: 12px;
        }
        .empty p {
          font-family: ui-monospace, monospace;
          font-size: 10.5px;
          letter-spacing: 2px;
          margin: 0;
          text-transform: uppercase;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 640px) {
          .ph-title { font-size: 26px; letter-spacing: 2px; }
          .panel-body { padding: 14px; }
          .board { height: 260px; }
          .hud-val { font-size: 20px; }
          .lead-head { grid-template-columns: 40px 1fr 60px; padding: 9px 12px; }
          .lead-row { grid-template-columns: 40px 1fr auto 60px; padding: 10px 12px; font-size: 12px; }
          .lr-user { font-size: 12.5px; }
          .rs-num { font-size: 42px; }
          .rank-code { font-size: 34px; }
        }
      `}</style>
    </Layout>
  );
}
