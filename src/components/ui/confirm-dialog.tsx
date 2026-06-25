/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext, useCallback } from 'react';
import { AlertTriangle, Trash2, AlertCircle, Info, X } from 'lucide-react';
import { Button } from './button';

export type ConfirmLevel = 'light' | 'medium' | 'critical';

export interface ConfirmContextItem {
  label: string;
  value: string | number;
}

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  level?: ConfirmLevel;
  context?: ConfirmContextItem[];
  itemType?: string;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return context.confirm;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

const levelConfig = {
  light: {
    icon: Info,
    iconBg: 'bg-stone-100 text-stone-600',
    button: 'bg-stone-900 hover:bg-stone-800 text-white',
    title: 'Confirmar ação',
    description: 'Deseja continuar com esta ação?'
  },
  medium: {
    icon: AlertCircle,
    iconBg: 'bg-amber-100 text-amber-600',
    button: 'bg-stone-900 hover:bg-stone-800 text-white',
    title: 'Atenção',
    description: 'Esta ação pode afetar outros registros relacionados.'
  },
  critical: {
    icon: Trash2,
    iconBg: 'bg-rose-100 text-rose-600',
    button: 'bg-stone-900 hover:bg-stone-800 text-white',
    title: 'Exclusão permanente',
    description: 'Esta ação não pode ser desfeita. O item será removido permanentemente.'
  }
};

export function ConfirmProvider({ children }: {children: React.ReactNode;}) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  const level = state?.level || 'medium';
  const config = levelConfig[level];
  const IconComponent = config.icon;

  const getConfirmText = () => {
    if (state?.confirmText) return state.confirmText;
    switch (level) {
      case 'light':return 'Confirmar';
      case 'medium':return 'Continuar';
      case 'critical':return 'Excluir permanentemente';
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {/* Backdrop */}
      {state &&
      <div data-ev-id="ev_005b590601"
      className="fixed inset-0 bg-black/30 z-50 animate-in fade-in duration-200"
      onClick={handleCancel} />

      }
      
      {/* Confirm Card */}
      {state &&
      <div data-ev-id="ev_83ae6e959f" className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div data-ev-id="ev_5bd5e83efd" className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-[440px] max-w-[calc(100vw-32px)] overflow-hidden">
            {/* Header */}
            <div data-ev-id="ev_0aa397e469" className="p-6 pb-0">
              <div data-ev-id="ev_d846e538fe" className="flex items-start gap-4">
                <div data-ev-id="ev_01ea5e819c" className={`w-11 h-11 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div data-ev-id="ev_b2c06659f2" className="flex-1 min-w-0">
                  <div data-ev-id="ev_29405e8f72" className="flex items-start justify-between gap-2">
                    <h3 data-ev-id="ev_e0737ff2a5" className="text-lg font-semibold text-stone-900">{state.title}</h3>
                    <button data-ev-id="ev_b648267bf8"
                  onClick={handleCancel}
                  className="text-stone-400 hover:text-stone-600 transition-colors -mt-1 -mr-1 p-1 rounded-lg hover:bg-stone-100">

                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p data-ev-id="ev_b9267e88ad" className="text-sm text-stone-500 mt-1 leading-relaxed">
                    {state.description || config.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Context Info */}
            {state.context && state.context.length > 0 &&
          <div data-ev-id="ev_6127e991d4" className="mx-6 mt-5 p-4 bg-stone-50 rounded-xl border border-stone-100">
                <div data-ev-id="ev_ddf89dab01" className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-3">
                  {state.itemType || 'Detalhes do item'}
                </div>
                <div data-ev-id="ev_a01e5a94ba" className="grid grid-cols-2 gap-3">
                  {state.context.map((item, index) =>
              <div data-ev-id="ev_da6fca9bb2" key={index}>
                      <div data-ev-id="ev_801feed3d9" className="text-[11px] text-stone-400 font-medium">{item.label}</div>
                      <div data-ev-id="ev_d6ed81bb99" className="text-sm font-medium text-stone-900 mt-0.5">{item.value}</div>
                    </div>
              )}
                </div>
              </div>
          }

            {/* Level indicator */}
            {level === 'critical' &&
          <div data-ev-id="ev_fec908a6d7" className="mx-6 mt-4 flex items-center gap-2 text-xs text-rose-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span data-ev-id="ev_c9dfec4358">Ação irreversível</span>
              </div>
          }
            
            {/* Actions */}
            <div data-ev-id="ev_a9f0470f2d" className="flex items-center justify-end gap-3 p-6 pt-5">
              <Button
              variant="outline"
              onClick={handleCancel}
              className="h-10 px-5 text-sm font-medium text-stone-600 hover:text-stone-900 border-stone-200">

                {state.cancelText || 'Cancelar'}
              </Button>
              <Button
              onClick={handleConfirm}
              className={`h-10 px-6 text-sm font-semibold ${config.button}`}>

                {getConfirmText()}
              </Button>
            </div>
          </div>
        </div>
      }
    </ConfirmContext.Provider>);

}