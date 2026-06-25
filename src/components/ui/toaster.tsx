import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <div data-ev-id="ev_acfaf49fc2" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) =>
      <div data-ev-id="ev_f4a913caf5"
      key={toast.id}
      className="bg-white border border-stone-200 rounded-lg shadow-lg p-4 min-w-[280px] max-w-[400px] animate-in slide-in-from-right">

          <div data-ev-id="ev_192d3b46c2" className="flex items-start justify-between gap-3">
            <div data-ev-id="ev_a835de3e67">
              <div data-ev-id="ev_ba453765cc" className="text-sm font-semibold text-stone-900">{toast.title}</div>
              {toast.description &&
            <div data-ev-id="ev_cc62ef0463" className="text-xs text-stone-500 mt-0.5">{toast.description}</div>
            }
            </div>
            <button data-ev-id="ev_234d501791"
          onClick={() => dismissToast(toast.id)}
          className="text-stone-400 hover:text-stone-600">

              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>);

}