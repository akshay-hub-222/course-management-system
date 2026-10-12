import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const show = useCallback((type, text) => {
    clearTimeout(timer.current);
    setToast({ type, text });
    timer.current = setTimeout(() => setToast(null), 4200);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = toast && (
    <div className={`toast toast-${toast.type}`} role="status">
      <Icon name={toast.type === 'ok' ? 'check' : 'x'} size={16} strokeWidth={2.4} />
      <span>{toast.text}</span>
    </div>
  );
  return [node, show];
}
