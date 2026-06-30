import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 3600);
    return () => window.clearTimeout(timer);
  }, [onClose, toast]);

  if (!toast) return null;

  const Icon = toast.type === "error" ? AlertCircle : CheckCircle2;

  return (
    <div className={`toast ${toast.type}`} role="status">
      <Icon size={19} />
      <p>{toast.message}</p>
      <button type="button" onClick={onClose} aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
}
