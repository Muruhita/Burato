import dynamic from 'next/dynamic';
import Layout from '../components/Layout';

const ShooterGame = dynamic(() => import('../components/ShooterGame'), {
  ssr: false,
  loading: () => (
    <div className="loading-line">ЗАГРУЗКА АРЕНЫ...</div>
  ),
});

export default function Terms() {
  return (
    <Layout>
      <div className="info">
        <header className="page-head">
          <div className="ph-stamp">TRAINING · SIMULATION RANGE</div>
          <h1 className="ph-title">ПОЛИГОН<span className="ph-dot">.</span></h1>
          <p className="ph-sub">
            Тактическая тренировка: сразитесь с ботами на процедурно-сгенерированной арене.
            Выбирайте оружие и сложность перед стартом.
          </p>
          <div className="ph-rule" />
        </header>

        <section className="panel">
          <div className="panel-head">
            <span className="p-num">01</span>
            <h2 className="p-title">АРЕНА</h2>
            <span className="p-tag">LIVE</span>
          </div>
          <div className="panel-body no-pad">
            <ShooterGame />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <span className="p-num">02</span>
            <h2 className="p-title">УПРАВЛЕНИЕ</h2>
            <span className="p-tag">MANUAL</span>
          </div>
          <div className="panel-body">
            <ul className="controls">
              <li><b>WASD / ←↑→↓</b> — движение</li>
              <li><b>Мышь</b> — прицел</li>
              <li><b>ЛКМ</b> — огонь</li>
              <li><b>R</b> — перезарядка</li>
              <li><b>1–4 / Q–E / колесо мыши</b> — смена оружия</li>
              <li><b>M</b> — выход в меню (после смерти)</li>
            </ul>
          </div>
        </section>
      </div>

      <style jsx>{`
        .info { max-width: 1180px; margin: 0 auto; }

        .page-head { margin-bottom: 22px; animation: fadeIn 0.45s ease; }
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
        .panel-body { padding: 20px; }
        .panel-body.no-pad { padding: 0; }

        .controls {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 8px;
        }
        .controls li {
          color: #b0b0b0;
          font-size: 13px;
          padding: 8px 12px;
          background: #060606;
          border: 1px solid #1a1a1a;
          font-family: ui-monospace, monospace;
          letter-spacing: 0.5px;
        }
        .controls b { color: #fff; font-weight: 700; }

        .loading-line {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 2.4px;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 640px) {
          .ph-title { font-size: 26px; letter-spacing: 2px; }
          .panel-body { padding: 14px; }
        }
      `}</style>
    </Layout>
  );
}
