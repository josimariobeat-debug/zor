import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCloseFormConfirm } from '@/hooks/useCloseFormConfirm';

interface FormPageShellProps {
  title: string;
  subtitle?: string;
  backTo: string;
  children: React.ReactNode;
  onSubmit: () => void;
  submitLabel?: string;
  isValid?: boolean;
}

export function FormPageShell({
  title,
  subtitle,
  backTo,
  children,
  onSubmit,
  submitLabel = 'Salvar',
  isValid = true
}: FormPageShellProps) {
  const handleBack = useCloseFormConfirm(backTo);


  return (
    <div data-ev-id="ev_fec6c0772f" className="min-h-full flex flex-col">
      {/* Header */}
      <header data-ev-id="ev_0d7316c7b4" className="sticky top-0 z-10 bg-stone-50 border-b border-stone-200 px-6 py-4">
        <div data-ev-id="ev_b874a35d08" className="flex items-center justify-between max-w-5xl mx-auto">
          <div data-ev-id="ev_72286968fb" className="flex items-center gap-4">
            <button data-ev-id="ev_d6ebc68b42"
            onClick={handleBack}
            className="w-9 h-9 rounded-lg border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors">

              <ArrowLeft className="w-4 h-4" />
            </button>
            <div data-ev-id="ev_88964a9793">
              <h1 data-ev-id="ev_6fccdfbb37" className="text-xl font-semibold text-stone-900 tracking-tight">{title}</h1>
              {subtitle && <p data-ev-id="ev_d715f21a36" className="text-sm text-stone-500">{subtitle}</p>}
            </div>
          </div>
          <div data-ev-id="ev_2940b7ade4" className="flex items-center gap-3">
            <Button variant="outline" onClick={handleBack} className="h-10 px-5">
              Cancelar
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!isValid}
              className="h-10 px-6 bg-stone-900 hover:bg-stone-800 text-white">

              {submitLabel}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main data-ev-id="ev_6828e6f288" className="flex-1 px-6 py-8">
        <div data-ev-id="ev_ab92b99992" className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>);

}

export function FormSection({ title, icon, action, children }: {title?: string;icon?: React.ReactNode;action?: React.ReactNode;children: React.ReactNode;}) {
  return (
    <section data-ev-id="ev_d8083b2743" className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
      {(title || action) &&
      <div data-ev-id="ev_581dcf1be2" className="flex items-center justify-between mb-4">
          {title &&
        <h2 data-ev-id="ev_96199b8b66" className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              {icon}
              {title}
            </h2>
        }
          {action}
        </div>
      }
      {children}
    </section>);

}

export function FormGrid({ children, cols = 2 }: {children: React.ReactNode;cols?: 2 | 3 | 4;}) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };
  return <div data-ev-id="ev_2c029ff28e" className={`grid ${gridCols[cols]} gap-4`}>{children}</div>;
}

export function FormField({ label, required, children, full }: {label: string;required?: boolean;children: React.ReactNode;full?: boolean;}) {
  return (
    <div data-ev-id="ev_483cfb8766" className={full ? 'md:col-span-2 lg:col-span-full' : ''}>
      <label data-ev-id="ev_09ef638417" className="block text-xs font-medium text-stone-600 mb-1.5">
        {label} {required && <span data-ev-id="ev_04c5b3105e" className="text-rose-500">*</span>}
      </label>
      {children}
    </div>);

}