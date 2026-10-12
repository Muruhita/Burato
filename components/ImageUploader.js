import { useState, useRef } from 'react';
import { isSafeUrl, TRUSTED_IMAGE_HOSTS } from '../lib/urlValidator';

const MAX_SIZE_MB = 10;
const INTERNAL_MAX = 10;

export default function ImageUploader({
  value = '',
  onChange,
  label = 'Скриншот',
  allowManualUrl = false,
  allowMultipleUrls = false,
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manualText, setManualText] = useState('');
  const inputRef = useRef(null);

  // value хранится строкой. Разбираем в массив.
  const urls = value
    ? String(value).split('\n').map(s => s.trim()).filter(Boolean)
    : [];

  const setUrls = (arr) => {
    const clean = arr.filter(Boolean);
    onChange(clean.length ? clean.join('\n') : '');
  };

  // ── Загрузка файла ──
  const uploadOne = async (file) => {
    if (!file.type.startsWith('image/')) throw new Error('Не изображение');
    if (file.size > MAX_SIZE_MB * 1024 * 1024) throw new Error(`Файл больше ${MAX_SIZE_MB} МБ`);

    const base64 = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = (e) => resolve(e.target.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка загрузки');
    return data.url;
  };

  const handleFiles = async (files) => {
    setError('');
    const list = Array.from(files || []).filter(Boolean);
    if (!list.length) return;

    if (!allowMultipleUrls && urls.length >= 1) {
      setError('❌ Уже загружено одно изображение. Удалите его, чтобы загрузить другое.');
      return;
    }

    const slotsLeft = INTERNAL_MAX - urls.length;
    if (slotsLeft <= 0) {
      setError(`❌ Максимум ${INTERNAL_MAX} файлов`);
      return;
    }

    const toUpload = allowMultipleUrls ? list.slice(0, slotsLeft) : [list[0]];

    setUploading(true);
    const added = [];
    for (const file of toUpload) {
      try {
        const url = await uploadOne(file);
        added.push(url);
        setUrls([...urls, ...added]);
      } catch (e) {
        setError('❌ ' + e.message);
      }
    }
    setUploading(false);

    if (!allowMultipleUrls && list.length > 1) {
      setError('⚠️ Загружено только первое изображение.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handlePaste = (e) => {
    const items = [...(e.clipboardData?.items || [])].filter(i => i.type.startsWith('image/'));
    const files = items.map(i => i.getAsFile()).filter(Boolean);
    if (files.length) handleFiles(files);
  };

  const clear = () => {
    onChange('');
    setError('');
    setManualText('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeAt = (idx) => {
    setUrls(urls.filter((_, i) => i !== idx));
  };

  // ── Ручной ввод ──
  const parseManualUrls = (raw) =>
    raw.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean);

  const applyManualUrls = () => {
    setError('');
    const candidates = parseManualUrls(manualText);

    if (!candidates.length) {
      setError('❌ Введите хотя бы одну ссылку');
      return;
    }

    const valid = [];
    const invalid = [];
    for (const url of candidates) {
      const safe = isSafeUrl(url, { maxLength: 1000, allowedHosts: TRUSTED_IMAGE_HOSTS });
      if (safe) valid.push(url);
      else invalid.push(url);
    }

    if (!valid.length) {
      setError('❌ Ни одна ссылка не прошла проверку. Разрешены только доверенные хостеры.');
      return;
    }

    if (!allowMultipleUrls) {
      // Один URL — берём первый валидный
      setUrls([valid[0]]);
      if (valid.length > 1) {
        setError(`⚠️ Принята только первая ссылка: остальные не сохранены.`);
      }
      setShowManual(false);
      setManualText('');
      return;
    }

    // Мультиввод
    const slotsLeft = INTERNAL_MAX - urls.length;
    const toAdd = valid.slice(0, slotsLeft);
    const skipped = valid.length - toAdd.length;
    setUrls([...urls, ...toAdd]);

    if (invalid.length || skipped > 0) {
      const parts = [];
      if (invalid.length) parts.push(`невалидных: ${invalid.length}`);
      if (skipped > 0) parts.push(`сверх лимита: ${skipped}`);
      setError(`⚠️ Добавлено ${toAdd.length}. Пропущено — ${parts.join(', ')}.`);
      setManualText([...invalid, ...valid.slice(slotsLeft)].join('\n'));
    } else {
      setShowManual(false);
      setManualText('');
    }
  };

  const cancelManual = () => {
    setShowManual(false);
    setManualText('');
    setError('');
  };

  const canAddMore = allowMultipleUrls ? urls.length < INTERNAL_MAX : urls.length === 0;

  return (
    <>
      <div className="uploader">
        <label className="uploader-label">
          {label}
          {allowMultipleUrls && urls.length > 0 && (
            <span className="counter">{urls.length}/{INTERNAL_MAX}</span>
          )}
        </label>

        {/* Пустая зона */}
        {urls.length === 0 && (
          <div
            className={`dropzone ${dragging ? 'dragging' : ''} ${uploading ? 'loading' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onPaste={handlePaste}
            tabIndex={0}
          >
            {uploading ? (
              <>
                <div className="uploader-spinner" />
                <p>Загрузка на imgbb...</p>
              </>
            ) : (
              <>
                <div className="dropzone-icon">📸</div>
                <p className="dropzone-title">Перетащи {allowMultipleUrls ? 'скриншоты' : 'скриншот'} сюда</p>
                <p className="dropzone-hint">
                  или <strong>кликни</strong> · <kbd>Ctrl+V</kbd>
                  {allowMultipleUrls && <> · до {INTERNAL_MAX} файлов</>}
                </p>
                <p className="dropzone-limit">PNG, JPG, GIF · до {MAX_SIZE_MB} МБ</p>
              </>
            )}
          </div>
        )}

        {/* Превью — одна картинка или сетка */}
        {urls.length === 1 && !allowMultipleUrls && (
          <div className="preview-box">
            <img src={urls[0]} alt="preview" className="preview-img" />
            {uploading && (
              <div className="preview-overlay">
                <div className="uploader-spinner" />
                <span>Загрузка...</span>
              </div>
            )}
            <button type="button" className="preview-remove" onClick={clear} title="Удалить">✕</button>
          </div>
        )}

        {urls.length >= 1 && allowMultipleUrls && (
          <div className="preview-grid">
            {urls.map((u, idx) => (
              <div key={u + idx} className="preview-item">
                <img src={u} alt={`preview-${idx}`} />
                <button
                  type="button"
                  className="preview-remove"
                  onClick={() => removeAt(idx)}
                  title="Удалить"
                >
                  ✕
                </button>
                <div className="preview-num">#{idx + 1}</div>
              </div>
            ))}

            {canAddMore && !uploading && (
              <div
                className={`preview-item add ${dragging ? 'dragging' : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onPaste={handlePaste}
                tabIndex={0}
              >
                <span className="add-icon">+</span>
                <span className="add-text">Добавить</span>
              </div>
            )}
          </div>
        )}

        {/* Ручной ввод */}
        {allowManualUrl && canAddMore && !uploading && (
          <>
            {!showManual ? (
              <button
                type="button"
                className="manual-toggle"
                onClick={() => setShowManual(true)}
              >
                🔗 Если не работает — вставьте вручную (Нажмите сюда чтобы вставить)
              </button>
            ) : (
              <div className="manual-block">
                {allowMultipleUrls ? (
                  <>
                    <p className="manual-hint">
                      Каждая ссылка — с новой строки или через запятую. До {INTERNAL_MAX - urls.length} шт.
                    </p>
                    <textarea
                      className="manual-textarea"
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      placeholder={'https://i.ibb.co/abc1.png\nhttps://i.imgur.com/abc2.png'}
                      rows="4"
                      autoFocus
                    />
                  </>
                ) : (
                  <input
                    type="url"
                    className="manual-input"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="https://i.ibb.co/... (только доверенные хостеры)"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); applyManualUrls(); }
                    }}
                  />
                )}
                <div className="manual-actions">
                  <button type="button" className="manual-apply" onClick={applyManualUrls}>
                    ✓ Применить ({parseManualUrls(manualText).length})
                  </button>
                  <button type="button" className="manual-cancel" onClick={cancelManual}>
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={allowMultipleUrls}
          style={{ display: 'none' }}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {error && <p className="uploader-error">{error}</p>}
      </div>

      <style jsx>{`
        .uploader { margin-bottom: 20px; }
        .uploader-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #888;
          margin-bottom: 8px;
        }
        .counter {
          background: rgba(168, 85, 247, 0.15);
          border: 1px solid rgba(168, 85, 247, 0.4);
          color: #C4A5F0;
          border-radius: 12px;
          padding: 1px 8px;
          font-size: 11px;
          font-weight: 700;
        }

        .dropzone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          text-align: center;
          min-height: 160px;
          outline: none;
        }
        .dropzone:hover,
        .dropzone:focus {
          border-color: rgba(168, 85, 247, 0.6);
          background: rgba(168, 85, 247, 0.05);
        }
        .dropzone.dragging {
          border-color: #A855F7;
          background: rgba(168, 85, 247, 0.12);
          transform: scale(1.01);
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.25);
        }
        .dropzone.loading { cursor: wait; opacity: 0.8; }

        .dropzone-icon {
          font-size: 44px;
          margin-bottom: 12px;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));
        }
        .dropzone-title { color: #ddd; font-size: 15px; font-weight: 600; margin: 0 0 6px; }
        .dropzone-hint { color: #888; font-size: 13px; margin: 0 0 8px; }
        .dropzone-hint strong { color: #C4A5F0; }
        .dropzone-hint kbd {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          padding: 1px 6px;
          font-size: 11px;
          font-family: ui-monospace, monospace;
          color: #ccc;
        }
        .dropzone-limit { color: #666; font-size: 11px; margin: 0; }

        /* Одиночное превью */
        .preview-box {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(76, 175, 80, 0.4);
          background: #0a0a0a;
        }
        .preview-img {
          display: block;
          width: 100%;
          max-height: 300px;
          object-fit: contain;
        }
        .preview-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(0,0,0,0.7);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          backdrop-filter: blur(4px);
        }
        .preview-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          background: rgba(0,0,0,0.7);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 2;
        }
        .preview-remove:hover {
          background: #ff4444;
          border-color: #ff4444;
          transform: scale(1.1);
        }

        /* Сетка */
        .preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }
        .preview-item {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          overflow: hidden;
          background: #0a0a0a;
          border: 1px solid rgba(76, 175, 80, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .preview-num {
          position: absolute;
          bottom: 6px;
          left: 6px;
          background: rgba(0,0,0,0.65);
          color: #C4A5F0;
          border-radius: 8px;
          padding: 2px 7px;
          font-size: 11px;
          font-weight: 700;
          z-index: 2;
        }
        .preview-item.add {
          border: 2px dashed rgba(168, 85, 247, 0.4);
          background: rgba(168, 85, 247, 0.04);
          cursor: pointer;
          flex-direction: column;
          gap: 4px;
          transition: all 0.25s;
          color: #C4A5F0;
        }
        .preview-item.add:hover,
        .preview-item.add.dragging {
          border-color: #A855F7;
          background: rgba(168, 85, 247, 0.12);
          transform: scale(1.02);
        }
        .add-icon {
          font-size: 28px;
          font-weight: 300;
          line-height: 1;
          color: #C4A5F0;
        }
        .add-text {
          font-size: 12px;
          font-weight: 600;
        }

        .uploader-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255,255,255,0.15);
          border-top-color: #A855F7;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 10px;
        }

        /* Ручной ввод */
        .manual-toggle {
          display: block;
          width: 100%;
          margin-top: 12px;
          padding: 14px 16px;
          background: rgba(168, 85, 247, 0.08);
          border: 1px dashed rgba(168, 85, 247, 0.55);
          color: #C4A5F0;
          font-size: 13.5px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.22s ease;
          font-family: inherit;
          line-height: 1.4;
        }
        .manual-toggle:hover {
          background: rgba(168, 85, 247, 0.18);
          border-color: #A855F7;
          border-style: solid;
          color: #fff;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(168, 85, 247, 0.25);
        }

        .manual-block {
          margin-top: 12px;
          padding: 14px;
          background: rgba(168, 85, 247, 0.06);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 10px;
          animation: manualIn 0.25s ease;
        }
        .manual-hint {
          color: #888;
          font-size: 11.5px;
          margin: 0 0 8px;
          line-height: 1.5;
        }
        .manual-input,
        .manual-textarea {
          width: 100%;
          padding: 10px 12px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          border-radius: 8px;
          font-size: 13px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }
        .manual-textarea {
          font-family: ui-monospace, monospace;
          resize: vertical;
          line-height: 1.5;
        }
        .manual-input:focus,
        .manual-textarea:focus {
          border-color: #A855F7;
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.15);
        }
        .manual-textarea::placeholder { color: #555; }

        .manual-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }
        .manual-apply {
          flex: 1;
          padding: 9px 14px;
          background: rgba(168, 85, 247, 0.25);
          border: 1px solid rgba(168, 85, 247, 0.5);
          color: #E0C8FF;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .manual-apply:hover {
          background: rgba(168, 85, 247, 0.4);
          color: #fff;
        }
        .manual-cancel {
          padding: 9px 14px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          color: #888;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .manual-cancel:hover {
          border-color: rgba(255,255,255,0.3);
          color: #ccc;
        }

        .uploader-error {
          margin-top: 8px;
          color: #ff6b6b;
          font-size: 13px;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes manualIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
