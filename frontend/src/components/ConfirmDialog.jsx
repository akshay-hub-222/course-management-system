import { useEffect } from 'react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger, busy, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="dialog dialog-sm" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-body">
          <h2 className="dialog-title">{title}</h2>
          <p className="dialog-text">{message}</p>
          <div className="dialog-actions">
            <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button className={`btn ${danger ? 'btn-danger-solid' : 'btn-primary'}`} disabled={busy} onClick={onConfirm}>
              {busy ? 'Please wait…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
