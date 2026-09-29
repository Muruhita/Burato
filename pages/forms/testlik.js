import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ImageUploader from '../../components/ImageUploader';
import MultiImageUploader from '../../components/MultiImageUploader';
import BanOverlay from '../../components/BanOverlay';

export default function TestLikPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [banned, setBanned] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banUntil, setBanUntil] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    message: '',
    category: 'option1',
    date: '',
    agree: false,
    singleImage: '',
    multiImages: []
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.banned) {
          setBanned(true);
          setBanReason(data.banReason || 'Ваш доступ к системе заявок заблокирован.');
          setBanUntil(data.banUntil || null);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'testlik', ...formData })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/dashboard'), 1800);
        return;
      }
      if (res.status === 403) {
        const err = await res.json();
        if (err.banned) {
          setBanned(true);
          setBanReason(err.reason || 'Ваш доступ к системе заявок заблокирован.');
          setBanUntil(err.until || null);
          setSubmitting(false);
          return;
        }
        throw new Error(err.error || 'Доступ запрещён');
      }
      const err = await res.json();
      throw new Error(err.error || 'Ошибка');
    } catch (error) {
      alert('❌ ' + error.message);
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      message: '',
      category: 'option1',
      date: '',
      agree: false,
      singleImage: '',
      multiImages: []
    });
  };

  return (
    <>
      <Head>
        <title>TESTLAB · FIB Forms</title>
        <meta name="description" content="Тестовая песочница FIB Forms" />
      </Head>

      <div className={`lab ${mounted ? 'mounted' : ''}`}>
        {/* ── ВЕРХНЯЯ СЛУЖЕБНАЯ ПОЛОСА ── */}
        <div className="lab-topbar">
          <span className="lt-mark">◆</span>
          <span className="lt-title">FIB · TESTLAB</span>
          <span className="lt-spacer" />
          <span className="lt-meta">SANDBOX MODE</span>
          <span className="lt-sep">·</span>
          <span className="lt-meta">NO PERSIST</span>
        </div>

        {/* ── КНОПКА НАЗАД ── */}
        <button className="back-float" onClick={() => router.push('/dashboard')} title="Вернуться">
          <span>←</span>
          <span className="bf-text">НАЗАД</span>
        </button>

        <div className="lab-content">
          {/* ── ШАПКА ── */}
          <header className="lab-head">
            <div className="lh-stamp">FIELD TEST · FORM-000</div>
            <h1 className="lh-title">ПЕСОЧНИЦА<span className="lh-dot">.</span></h1>
            <p className="lh-sub">
              Тестовый бланк для проверки всех полей и загрузки файлов без реальных последствий.
            </p>
            <div className="lh-rule" />
            <div className="lh-meta">
              <span>ОТПРАВЛЯЕТСЯ В: TESTLIK_WEBHOOK</span>
              <span className="lh-sep">·</span>
              <span>РЕЖИМ: SANDBOX</span>
            </div>
          </header>

          {/* ── ФОРМА ── */}
          <div className="form-shell">
            <form onSubmit={handleSubmit} className="form-body">
              <div className="field-block">
                <label className="lbl">Имя / любой текст</label>
                <input
                  className="field"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Test User 123456"
                />
              </div>

              <div className="field-block">
                <label className="lbl">Сообщение</label>
                <textarea
                  className="field"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="4"
                  placeholder="Проверка многострочного текста..."
                />
              </div>

              <div className="dual">
                <div className="field-block">
                  <label className="lbl">Категория</label>
                  <select
                    className="field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="option1">Опция 1</option>
                    <option value="option2">Опция 2</option>
                    <option value="option3">Опция 3</option>
                  </select>
                </div>
                <div className="field-block">
                  <label className="lbl">Дата</label>
                  <input
                    className="field"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="check-block">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={formData.agree}
                    onChange={(e) => setFormData({ ...formData, agree: e.target.checked })}
                  />
                  <span className="check-box" />
                  <span className="check-text">ПОДТВЕРЖДАЮ, ЧТО ЭТО ТЕСТ</span>
                </label>
              </div>

              <ImageUploader
                label="Одиночная картинка"
                value={formData.singleImage}
                onChange={(url) => setFormData(prev => ({ ...prev, singleImage: url }))}
                allowManualUrl
              />

              <MultiImageUploader
                label="Несколько картинок"
                value={formData.multiImages}
                onChange={(urls) => setFormData(prev => ({ ...prev, multiImages: urls }))}
                max={5}
              />

              <div className="actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  ♻ ОЧИСТИТЬ
                </button>
                <button
                  type="submit"
                  className="btn btn-solid"
                  disabled={submitting || success || banned}
                >
                  {submitting
                    ? <><span className="btn-spinner" /> ОТПРАВКА...</>
                    : banned
                      ? '🚫 ЗАБЛОКИРОВАН'
                      : '◆ ОТПРАВИТЬ ТЕСТ'}
                </button>
              </div>
            </form>

            <div className="form-foot">
              <span className="ff-mark">"</span>
              SANDBOX · ALL PROTOCOLS
              <span className="ff-mark">"</span>
            </div>
          </div>

          {/* ── ИНФО-СТРИП ── */}
          <div className="info-strip">
            <div className="is-cell">
              <span className="is-val">LAB-01</span>
              <span className="is-lbl">СЕКТОР</span>
            </div>
            <div className="is-sep" />
            <div className="is-cell">
              <span className="is-val">SAFE</span>
              <span className="is-lbl">РЕЖИМ</span>
            </div>
            <div className="is-sep" />
            <div className="is-cell">
              <span className="is-val">v7.1.0</span>
              <span className="is-lbl">ВЕРСИЯ</span>
            </div>
            <div className="is-sep" />
            <div className="is-cell">
              <span className="is-val">TESTLIK</span>
              <span className="is-lbl">ОБРАБОТЧИК</span>
            </div>
          </div>

          <p className="lab-footer">
            FIB · FORMS TERMINAL — SANDBOX ENVIRONMENT
          </p>
        </div>
      </div>

      {/* ── УСПЕХ ── */}
      {success && (
        <div className="success-overlay">
          <div className="success-box">
            <svg className="checkmark-svg" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="25" fill="none" />
              <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
            <p className="success-text">ТЕСТ ОТПРАВЛЕН</p>
            <p className="success-subtext">Проверьте Discord-канал</p>
          </div>
        </div>
      )}

      <BanOverlay show={banned} reason={banReason} until={banUntil} />

      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          background: #0a0a0a;
          overflow-x: hidden;
        }
      `}</style>

      <style jsx>{`
        .lab {
          position: relative;
          min-height: 100vh;
          width: 100%;
          background: #0a0a0a;
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .lab.mounted { opacity: 1; }

        /* ── ВЕРХНЯЯ ПОЛОСА ── */
        .lab-topbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 105;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 20px;
          background: #000;
          border-bottom: 1px solid #1f1f1f;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #555;
        }
        .lt-mark { color: #fff; font-size: 11px; }
        .lt-title { color: #ddd; font-weight: 700; }
        .lt-spacer { flex: 1; }
        .lt-meta { color: #555; }
        .lt-sep { color: #333; }

        /* ── КНОПКА НАЗАД ── */
        .back-float {
          position: fixed;
          top: 42px;
          left: 20px;
          z-index: 100;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: #0c0c0c;
          border: 1px solid #2a2a2a;
          color: #ccc;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.8px;
          transition: all 0.18s;
        }
        .back-float:hover {
          background: #fff;
          border-color: #fff;
          color: #000;
          transform: translateX(-3px);
        }

        /* ── КОНТЕНТ ── */
        .lab-content {
          position: relative;
          z-index: 10;
          max-width: 780px;
          margin: 0 auto;
          padding: 90px 24px 60px;
        }

        /* ── ШАПКА ── */
        .lab-head { margin-bottom: 24px; }
        .lh-stamp {
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
        .lh-title {
          font-size: 42px;
          font-weight: 900;
          letter-spacing: 3px;
          margin: 0;
          color: #fff;
          line-height: 1;
          text-transform: uppercase;
        }
        .lh-dot { color: #fff; animation: blink 1.2s steps(2, start) infinite; }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0.15; }
        }
        .lh-sub {
          color: #888;
          font-size: 13px;
          margin: 12px 0 0;
          line-height: 1.55;
        }
        .lh-rule {
          height: 1px;
          background: linear-gradient(90deg, #fff 0%, #555 20%, #1a1a1a 100%);
          margin: 18px 0 12px;
        }
        .lh-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          font-family: ui-monospace, monospace;
          font-size: 10.5px;
          letter-spacing: 1.6px;
          color: #666;
          text-transform: uppercase;
        }
        .lh-sep { color: #333; }

        /* ── ФОРМА ── */
        .form-shell {
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          position: relative;
          animation: cardIn 0.5s ease;
        }
        .form-shell::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: repeating-linear-gradient(
            90deg,
            #fff 0px, #fff 20px,
            #0c0c0c 20px, #0c0c0c 40px
          );
          opacity: 0.9;
        }

        .form-body { padding: 30px; }

        .field-block { margin-bottom: 20px; }
        .lbl {
          display: block;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 7px;
        }
        .lbl::before { content: '▸ '; color: #333; }
        .field {
          width: 100%;
          padding: 12px 14px;
          background: #060606;
          border: 1px solid #262626;
          color: #fff;
          border-radius: 0;
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }
        .field:focus { border-color: #fff; background: #0a0a0a; }
        .field::placeholder { color: #444; }
        textarea.field { resize: vertical; min-height: 80px; line-height: 1.55; }
        select.field {
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #666 50%),
                            linear-gradient(135deg, #666 50%, transparent 50%);
          background-position: calc(100% - 18px) center, calc(100% - 13px) center;
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          padding-right: 36px;
          cursor: pointer;
        }
        select.field option { background: #0c0c0c; color: #fff; }

        .dual {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 540px) {
          .dual { grid-template-columns: 1fr; gap: 0; }
        }

        /* ── ЧЕКБОКС ── */
        .check-block { margin-bottom: 22px; }
        .check {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 1.6px;
          color: #ccc;
          text-transform: uppercase;
        }
        .check input { display: none; }
        .check-box {
          width: 16px; height: 16px;
          border: 1px solid #444;
          background: #060606;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.18s;
          flex-shrink: 0;
        }
        .check-box::after {
          content: '';
          width: 8px; height: 8px;
          background: #fff;
          transform: scale(0);
          transition: transform 0.15s;
        }
        .check input:checked + .check-box { border-color: #fff; }
        .check input:checked + .check-box::after { transform: scale(1); }

        /* ── КНОПКИ ── */
        .actions {
          display: flex;
          gap: 10px;
          margin-top: 22px;
        }
        @media (max-width: 500px) {
          .actions { flex-direction: column; }
        }
        .btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 20px;
          background: transparent;
          border: 1px solid #333;
          color: #eaeaea;
          cursor: pointer;
          font-family: ui-monospace, monospace;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 2.4px;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .btn:hover:not(:disabled) {
          background: #fff;
          border-color: #fff;
          color: #000;
        }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-solid {
          background: #fff;
          color: #000;
          border-color: #fff;
          font-weight: 800;
        }
        .btn-solid:hover:not(:disabled) {
          background: #ccc;
          border-color: #ccc;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,255,255,0.1);
        }
        .btn-ghost {
          flex: 0 0 auto;
          padding: 14px 22px;
        }
        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── ПОДВАЛ ФОРМЫ ── */
        .form-foot {
          text-align: center;
          color: #555;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2.4px;
          padding: 16px 20px;
          border-top: 1px dashed #1a1a1a;
          background: #0a0a0a;
          text-transform: uppercase;
        }
        .ff-mark { color: #fff; font-weight: 900; margin: 0 6px; }

        /* ── ИНФО-СТРИП ── */
        .info-strip {
          display: grid;
          grid-template-columns: repeat(7, auto);
          align-items: center;
          gap: 0;
          margin-top: 22px;
          padding: 18px 24px;
          background: #0c0c0c;
          border: 1px solid #1f1f1f;
          animation: cardIn 0.6s ease 0.1s both;
        }
        .is-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 0 12px;
        }
        .is-val {
          color: #fff;
          font-family: ui-monospace, monospace;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .is-lbl {
          color: #555;
          font-family: ui-monospace, monospace;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .is-sep {
          width: 1px;
          height: 28px;
          background: #1f1f1f;
          justify-self: center;
        }

        @media (max-width: 640px) {
          .info-strip {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
            padding: 14px;
          }
          .is-sep { display: none; }
          .is-cell {
            padding: 6px 10px;
            border: 1px solid #1a1a1a;
          }
        }

        .lab-footer {
          text-align: center;
          color: #444;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 2.4px;
          margin-top: 26px;
          text-transform: uppercase;
        }

        /* ── УСПЕХ ── */
        .success-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 5, 5, 0.85);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: overlayIn 0.3s ease;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .success-box {
          background: #0c0c0c;
          border: 1px solid #2a2a2a;
          padding: 46px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: boxIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 30px 80px rgba(0,0,0,0.7);
        }
        @keyframes boxIn {
          0%   { transform: scale(0.7) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .checkmark-svg {
          width: 88px;
          height: 88px;
          margin-bottom: 22px;
        }
        .checkmark-svg circle {
          stroke: #fff;
          stroke-width: 2;
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          animation: strokeCircle 0.7s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark-svg path {
          stroke: #fff;
          stroke-width: 3.5;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: strokeCheck 0.45s cubic-bezier(0.65, 0, 0.45, 1) 0.55s forwards;
        }
        @keyframes strokeCircle { to { stroke-dashoffset: 0; } }
        @keyframes strokeCheck { to { stroke-dashoffset: 0; } }
        .success-text {
          color: #fff;
          font-family: ui-monospace, monospace;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 2.4px;
          margin: 0 0 6px;
          text-transform: uppercase;
          opacity: 0;
          animation: textIn 0.4s ease 0.85s forwards;
        }
        .success-subtext {
          color: #777;
          font-size: 12px;
          margin: 0;
          letter-spacing: 0.4px;
          opacity: 0;
          animation: textIn 0.4s ease 1s forwards;
        }
        @keyframes textIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── МОБИЛЬНАЯ ── */
        @media (max-width: 640px) {
          .lab-content { padding: 100px 16px 40px; }
          .lh-title { font-size: 30px; letter-spacing: 2px; }
          .lh-sub { font-size: 12px; }
          .form-body { padding: 22px 18px; }
          .back-float { top: 42px; left: 12px; padding: 7px 11px; font-size: 10px; }
          .bf-text { display: none; }
          .success-box { padding: 36px 34px; }
          .checkmark-svg { width: 68px; height: 68px; margin-bottom: 18px; }
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
