import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface StockMovement {
  id: string;
  type: string;
  category: string;
  item_id: string | null;
  item_name: string;
  qty: number;
  unit: string;
  reason: string | null;
  created_at: string;
}

export default function Stock() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const { data: movements, loading } = useSupabaseData<StockMovement>('stock_movements');

  const list = movements.filter((m) => (m.item_name || '').toLowerCase().includes(q.toLowerCase()));

  if (loading) {
    return (
      <div data-ev-id="ev_4b5ea88cfa" className="flex items-center justify-center h-64">
        <ScissorsLoader />
      </div>);

  }

  return (
    <div data-ev-id="ev_a76f0218c7" className="flex flex-col gap-6">
      <header data-ev-id="ev_6efaed74c7" className="flex items-start justify-between">
        <div data-ev-id="ev_2fb6f07486">
          <h1 data-ev-id="ev_3814c8d3d2" className="text-[26px] font-semibold text-stone-900 tracking-tight">Movimentações de Estoque</h1>
          <p data-ev-id="ev_a52a753d23" className="text-sm text-stone-500 mt-1">{movements.length} movimentações registradas</p>
        </div>
        <Button onClick={() => navigate('/estoque/nova')} className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2">
          <Plus className="w-4 h-4" /> Nova Movimentação
        </Button>
      </header>

      <div data-ev-id="ev_a1137b657a" className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input placeholder="Buscar por item..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-white border-stone-200 rounded-lg h-10" />
      </div>

      {list.length === 0 ?
      <Card className="p-12 text-center bg-white border-stone-200/80 shadow-none">
          <p data-ev-id="ev_b84f90f319" className="text-stone-500">{movements.length === 0 ? 'Nenhuma movimentação registrada.' : 'Nenhuma movimentação encontrada.'}</p>
        </Card> :

      <Card className="bg-white border-stone-200/80 shadow-none overflow-hidden">
          <table data-ev-id="ev_9d03e73207" className="w-full">
            <thead data-ev-id="ev_82a3f3f052">
              <tr data-ev-id="ev_f2019b490f" className="border-b border-stone-200 bg-stone-50/50">
                {['Tipo', 'Categoria', 'Item', 'Quantidade', 'Motivo', 'Data'].map((h) =>
              <th data-ev-id="ev_3ab0a21dea" key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
              )}
              </tr>
            </thead>
            <tbody data-ev-id="ev_c1040b35e6">
              {list.map((m) =>
            <tr data-ev-id="ev_7a1b463bd6" key={m.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                  <td data-ev-id="ev_654bb4f155" className="px-5 py-4">
                    <div data-ev-id="ev_82b22cf616" className="flex items-center gap-2">
                      {m.type === 'Entrada' ?
                  <ArrowUpCircle className="w-4 h-4 text-emerald-600" /> :

                  <ArrowDownCircle className="w-4 h-4 text-rose-600" />
                  }
                      <span data-ev-id="ev_27f2f18b9f" className={`text-sm font-medium ${m.type === 'Entrada' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {m.type}
                      </span>
                    </div>
                  </td>
                  <td data-ev-id="ev_1b9a6b480d" className="px-5 py-4 text-sm text-stone-600">{m.category}</td>
                  <td data-ev-id="ev_cd882212d5" className="px-5 py-4 text-sm font-medium text-stone-900">{m.item_name}</td>
                  <td data-ev-id="ev_f271b931e3" className="px-5 py-4 text-sm text-stone-900">{m.qty} {m.unit}</td>
                  <td data-ev-id="ev_8f2275bfdc" className="px-5 py-4 text-sm text-stone-600">{m.reason || '-'}</td>
                  <td data-ev-id="ev_6915d5d228" className="px-5 py-4 text-sm text-stone-500">
                    {new Date(m.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </Card>
      }
    </div>);

}