import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RotateCcw, Clock, Package, Scissors, Sparkles, Factory, Truck, FolderOpen, ClipboardList, ArrowLeftRight, FileText } from 'lucide-react';
import { getDeletionHistory, clearDeletionHistory, getTypeLabel, type DeletionRecord } from '@/lib/deletion-history';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { toast } from '@/hooks/use-toast';

const typeIcons: Record<DeletionRecord['type'], React.ElementType> = {
  product: Package,
  fabric: Scissors,
  trim: Sparkles,
  workshop: Factory,
  supplier: Truck,
  collection: FolderOpen,
  production_order: ClipboardList,
  stock_movement: ArrowLeftRight,
  technical_sheet: FileText
};

const typeColors: Record<DeletionRecord['type'], string> = {
  product: 'bg-blue-100 text-blue-700',
  fabric: 'bg-purple-100 text-purple-700',
  trim: 'bg-pink-100 text-pink-700',
  workshop: 'bg-amber-100 text-amber-700',
  supplier: 'bg-emerald-100 text-emerald-700',
  collection: 'bg-indigo-100 text-indigo-700',
  production_order: 'bg-orange-100 text-orange-700',
  stock_movement: 'bg-cyan-100 text-cyan-700',
  technical_sheet: 'bg-stone-100 text-stone-700'
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return date.toLocaleDateString('pt-BR');
}

export default function DeletionHistory() {
  const [history, setHistory] = useState<DeletionRecord[]>([]);
  const confirm = useConfirm();

  useEffect(() => {
    setHistory(getDeletionHistory());
  }, []);

  const handleClearAll = async () => {
    const confirmed = await confirm({
      title: 'Limpar histórico?',
      description: 'Todo o histórico de exclusões será removido. Os itens não poderão mais ser recuperados.',
      level: 'critical',
      confirmText: 'Limpar tudo'
    });
    if (!confirmed) return;
    clearDeletionHistory();
    setHistory([]);
    toast({ title: 'Histórico limpo' });
  };

  const handleRestore = async (record: DeletionRecord) => {
    const confirmed = await confirm({
      title: `Restaurar "${record.name}"?`,
      description: 'O item será restaurado com os dados originais.',
      level: 'light',
      confirmText: 'Restaurar',
      context: record.context,
      itemType: getTypeLabel(record.type)
    });
    if (!confirmed) return;

    // Aqui você implementaria a lógica de restauração real
    toast({ title: 'Item restaurado', description: record.name });
  };

  return (
    <div data-ev-id="ev_85cfbb101b" className="flex flex-col gap-6">
      <header data-ev-id="ev_5bdf02fe75" className="flex items-start justify-between">
        <div data-ev-id="ev_5c4ed62b95">
          <h1 data-ev-id="ev_799f464d45" className="text-[26px] font-semibold text-stone-900 tracking-tight">Histórico de Exclusões</h1>
          <p data-ev-id="ev_65da32418f" className="text-sm text-stone-500 mt-1">
            {history.length === 0 ? 'Nenhum item excluído recentemente' : `${history.length} itens excluídos recentemente`}
          </p>
        </div>
        {history.length > 0 &&
        <Button onClick={handleClearAll} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-2">
            <Trash2 className="w-4 h-4" /> Limpar Histórico
          </Button>
        }
      </header>

      {history.length === 0 ?
      <Card className="bg-white border-stone-200/80 shadow-none p-12 text-center">
          <div data-ev-id="ev_ba74bbd51d" className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-stone-400" />
          </div>
          <h3 data-ev-id="ev_10c33a5d5c" className="text-lg font-medium text-stone-900">Histórico vazio</h3>
          <p data-ev-id="ev_caf11b4b41" className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
            Quando você excluir produtos, tecidos, ordens ou outros itens, eles aparecerão aqui para possível recuperação.
          </p>
        </Card> :

      <Card className="bg-white border-stone-200/80 shadow-none overflow-hidden">
          <div data-ev-id="ev_c1d83d3cb6" className="divide-y divide-stone-100">
            {history.map((record) => {
            const Icon = typeIcons[record.type];
            return (
              <div data-ev-id="ev_14200e434a" key={record.id} className="p-5 hover:bg-stone-50/50 transition-colors">
                  <div data-ev-id="ev_3dc439f575" className="flex items-start gap-4">
                    <div data-ev-id="ev_66c6d5bc9a" className={`w-10 h-10 rounded-xl ${typeColors[record.type]} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div data-ev-id="ev_6e379a42f1" className="flex-1 min-w-0">
                      <div data-ev-id="ev_0e542742db" className="flex items-start justify-between gap-4">
                        <div data-ev-id="ev_c02bbf04d0">
                          <div data-ev-id="ev_f9b6ef9764" className="flex items-center gap-2">
                            <h3 data-ev-id="ev_286bfff956" className="text-sm font-semibold text-stone-900">{record.name}</h3>
                            <Badge className="bg-stone-100 text-stone-600 border-0 text-[10px]">
                              {getTypeLabel(record.type)}
                            </Badge>
                          </div>
                          <div data-ev-id="ev_8ba0d68c94" className="flex items-center gap-1.5 mt-1 text-xs text-stone-400">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(record.deletedAt)}
                          </div>
                        </div>
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(record)}
                        className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50">

                          <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                        </Button>
                      </div>
                      {record.context && record.context.length > 0 &&
                    <div data-ev-id="ev_7c17269777" className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-stone-100">
                          {record.context.map((item, index) =>
                      <div data-ev-id="ev_d6bd1de4db" key={index} className="text-xs">
                              <span data-ev-id="ev_6e1adf38e4" className="text-stone-400">{item.label}:</span>{' '}
                              <span data-ev-id="ev_9ddffb0b06" className="text-stone-600 font-medium">{item.value}</span>
                            </div>
                      )}
                        </div>
                    }
                    </div>
                  </div>
                </div>);

          })}
          </div>
        </Card>
      }
    </div>);

}