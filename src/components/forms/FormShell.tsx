import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface FormShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onSubmit: () => void;
  submitLabel?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function FormShell({ open, onOpenChange, title, onSubmit, submitLabel = 'Salvar', children, maxWidth = 'max-w-2xl' }: FormShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${maxWidth} max-h-[92vh] overflow-y-auto bg-white p-0`}>
        <DialogHeader className="px-7 pt-7 pb-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <DialogTitle className="text-xl font-semibold text-stone-900 tracking-tight">{title}</DialogTitle>
        </DialogHeader>
        <div data-ev-id="ev_b79b908754" className="px-7 py-6 flex flex-col gap-4">{children}</div>
        <DialogFooter className="px-7 py-4 border-t border-stone-100 bg-stone-50/50 sticky bottom-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit} className="bg-stone-900 hover:bg-stone-800 text-white">{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}

export function Field({ label, children, full }: {label: string;children: React.ReactNode;full?: boolean;}) {
  return (
    <div data-ev-id="ev_181bf11a09" className={full ? 'md:col-span-2' : ''}>
      <label data-ev-id="ev_ed2debab88" className="text-xs text-stone-600">{label}</label>
      <div data-ev-id="ev_ccd2d545de" className="mt-1.5">{children}</div>
    </div>);

}