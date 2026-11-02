import { useEffect, useRef, useState } from 'react';
import type { DayAlmanac } from '../domain/types';
import { createSharePoster } from '../sharePoster';

interface SharePosterButtonProps {
  almanac: DayAlmanac;
  dayWord: string;
}

export function SharePosterButton({ almanac, dayWord }: SharePosterButtonProps) {
  const [open, setOpen] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const mountedRef = useRef(true);
  const filename = `ai-huangli-${almanac.dateKey}.png`;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const openPoster = async () => {
    setOpen(true);
    if (url) {
      return;
    }

    setError(null);
    try {
      const next = await createSharePoster(almanac);
      if (!mountedRef.current) {
        return;
      }
      setBlob(next);
      setUrl(URL.createObjectURL(next));
    } catch {
      if (mountedRef.current) {
        setError('生成失败，请重试');
      }
    }
  };

  const download = () => {
    if (!url) {
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const share = async () => {
    if (!blob) {
      return;
    }
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'AI 老黄历',
          text: `${almanac.dateKey} ${dayWord}宜忌`,
        });
        return;
      } catch (shareError) {
        if ((shareError as DOMException).name === 'AbortError') {
          return;
        }
      }
    }
    download();
  };

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <>
      <button type="button" className="share-button" onClick={openPoster}>
        生成{dayWord}黄历图
      </button>

      {open ? (
        <div
          className="share-modal"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            className="share-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-poster-title"
          >
            <div className="share-head">
              <div>
                <h2 id="share-poster-title" className="share-title">
                  {dayWord}黄历图
                </h2>
                <p className="share-subtitle">{almanac.dateKey} · 长按图片可保存</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="share-close"
                aria-label="关闭"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            {url ? (
              <img
                className="share-preview"
                src={url}
                alt={`${almanac.dateKey} ${dayWord}黄历分享图`}
                width={1080}
                height={1440}
              />
            ) : null}
            {!url && !error ? (
              <div className="share-loading" role="status">
                正在生成分享图…
              </div>
            ) : null}
            {error ? (
              <div className="share-error" role="alert">
                {error}
              </div>
            ) : null}

            <div className="share-actions">
              <button type="button" className="primary-button" disabled={!url} onClick={download}>
                保存图片
              </button>
              {canNativeShare ? (
                <button type="button" className="primary-button" disabled={!url} onClick={share}>
                  分享
                </button>
              ) : null}
            </div>
            <p className="share-hint">图片仅供娱乐，分享时请保留域名。</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
