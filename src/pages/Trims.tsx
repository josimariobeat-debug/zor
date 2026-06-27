import ScissorsLoader from '@/components/ScissorsLoader';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

import { getTrimUnitCost } from '@/lib/trim-cost';

interface Trim {
  id: string;
  name: string;
  type: string | null;
  supplier_id: string | null;
  stock: number;
  unit: string;
  price_per_unit: number;
  operational_cost?: number | null;
  min_stock: number;
}

export default function Trims() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const { data: trims, loading, remove } = useSupabaseData<Trim>('trims');

  const list = trims.filter((t) => (t.name || '').toLowerCase().includes(q.toLowerCase()));
  const lowStock = trims.filter((t) => t.stock < (t.min_stock || 10)).length;

  const handleDelete = async (t: Trim) => {
    const confirmed = await confirm({
      title: `Excluir "${t.name}"?`,
      description: 'O aviamento será removido permanentemente do estoque.',
      level: 'critical',
      confirmText: 'Excluir permanentemente',
      context: [
      { label: 'Tipo', value: t.type || '-' },
      { label: 'Estoque', value: `${t.stock} ${t.unit}` },
      { label: 'Custo/un', value: `R$ ${getTrimUnitCost(t).toFixed(2)}` }],

      itemType: 'Aviamento'
    });
    if (!confirmed) return;

    const success = await remove(t.id);
    if (success) {
      toast({ title: 'Aviamento excluído', description: t.name });
    }
  };

  if (loading) {
    return (
      <div data-ev-id="ev_e887aabcd7" className="flex items-center justify-center min-h-[70vh]">
        <ScissorsLoader />
      </div>);

  }

  return (
    <div data-ev-id="ev_38d99ff542" className="flex flex-col gap-6">
      <header data-ev-id="ev_700e24b4a1" className="flex items-start justify-between">
        <div data-ev-id="ev_756f501549">
          <h1 data-ev-id="ev_5217f9e034" className="text-[26px] font-semibold text-stone-900 tracking-tight">Aviamentos</h1>
          <p data-ev-id="ev_ff4e3331cb" className="text-sm text-stone-500 mt-1">
            {trims.length} aviamentos · {lowStock} com estoque baixo
          </p>
        </div>
        <Button onClick={() => navigate('/aviamentos/novo')} className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2">
          <Plus className="w-4 h-4" /> Novo Aviamento
        </Button>
      </header>

      <div data-ev-id="ev_aaf0bf2a93" className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input placeholder="Buscar aviamento..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-white border-stone-200 rounded-lg h-10" />
      </div>

      {list.length === 0 ?
      <Card className="p-12 text-center bg-white border-stone-200/80 shadow-none">
          <p data-ev-id="ev_965e21ec28" className="text-stone-500">{trims.length === 0 ? 'Nenhum aviamento cadastrado.' : 'Nenhum aviamento encontrado.'}</p>
        </Card> :

      <Card className="bg-white border-stone-200/80 shadow-none overflow-hidden">
          <table data-ev-id="ev_f10b41a6c7" className="w-full">
            <thead data-ev-id="ev_226c698c6e">
              <tr data-ev-id="ev_63b4b9eed2" className="border-b border-stone-200 bg-stone-50/50">
                {['Nome', 'Tipo', 'Estoque', 'Unidade', 'Custo/un', 'Mín.', ''].map((h) =>
              <th data-ev-id="ev_bdf7079218" key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
              )}
              </tr>
            </thead>
            <tbody data-ev-id="ev_abed54e750">
              {list.map((t) => {
              const isLow = t.stock < (t.min_stock || 10);
              return (
                <tr data-ev-id="ev_640df0d5d4" key={t.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                    <td data-ev-id="ev_e224cb1b06" className="px-5 py-4 text-sm font-medium text-stone-900">{t.name}</td>
                    <td data-ev-id="ev_dbd0ef728e" className="px-5 py-4 text-sm text-stone-600">{t.type || '-'}</td>
                    <td data-ev-id="ev_4e7a85de5f" className="px-5 py-4">
                      <div data-ev-id="ev_e4f72f4cfa" className="flex items-center gap-1.5">
                        <span data-ev-id="ev_226aa411e4" className={`text-sm font-medium ${isLow ? 'text-amber-700' : 'text-stone-900'}`}>
                          {t.stock}
                        </span>
                        {isLow && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                      </div>
                    </td>
                    <td data-ev-id="ev_dd87ba9ace" className="px-5 py-4 text-sm text-stone-600">{t.unit}</td>
                    <td data-ev-id="ev_4f00b98362" className="px-5 py-4 text-sm font-medium text-stone-900">R$ {getTrimUnitCost(t).toFixed(2)}</td>
                    <td data-ev-id="ev_24344f6d5c" className="px-5 py-4 text-sm text-stone-500">{t.min_stock}</td>
                    <td data-ev-id="ev_75b1e10db5" className="px-5 py-4">
                      <div data-ev-id="ev_28b701f95c" className="flex items-center gap-1 justify-end">
                        <button data-ev-id="ev_3b3fbeb117" onClick={() => navigate(`/aviamentos/${t.id}/editar`)} className="text-stone-400 hover:text-stone-900 p-1">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button data-ev-id="ev_55136fd45e" onClick={() => handleDelete(t)} className="text-stone-400 hover:text-rose-700 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>);

            })}
            </tbody>
          </table>
        </Card>
      }
    </div>);

}