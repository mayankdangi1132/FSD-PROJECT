import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import Modal from '../components/Modal';

const FeedbackContext = createContext();

// Small notifications in the corner (toast) and a confirm popup.
// We use these instead of alert() and window.confirm() so they match the site design.
export const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3500);
  }, []);

  // usage: if (await confirm('Delete this event?')) { ... }
  const confirm = useCallback(
    (message, { title = 'Are you sure?', confirmText = 'Delete', danger = true } = {}) =>
      new Promise((resolve) => setDialog({ message, title, confirmText, danger, resolve })),
    []
  );

  const answer = (value) => {
    dialog.resolve(value);
    setDialog(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {dialog && (
        <Modal title={dialog.title} onClose={() => answer(false)}>
          <p className="modal-text">{dialog.message}</p>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => answer(false)}>
              Cancel
            </button>
            <button className={dialog.danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={() => answer(true)} autoFocus>
              {dialog.confirmText}
            </button>
          </div>
        </Modal>
      )}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => useContext(FeedbackContext);
