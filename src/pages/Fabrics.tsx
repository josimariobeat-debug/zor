import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface Fabric {
  id: string;
  name: string;
  type: string | null;
  color: string | null;
  supplier_id: string | null;
  width: number;
  gramatura: number;
  stock: number;
  price_per_meter: number;
  location: string | null;
  min_stock: number | null;
}

export default function Fabrics() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const { data: fabrics, loading, remove } = useSupabaseData<Fabric>('fabrics');

  const list = fabrics.filter((f) => (f.name || '').toLowerCase().includes(q.toLowerCase()));

  const handleDelete = async (f: Fabric) => {
    const confirmed = await confirm({
      title: `Excluir "${f.name}"?`,
      description: 'O tecido será removido permanentemente do estoque.',
      level: 'critical',
      confirmText: 'Excluir permanentemente',
      context: [
      { label: 'Tipo', value: f.type || '-' },
      { label: 'Cor', value: f.color || '-' },
      { label: 'Estoque', value: `${f.stock}m` },
      { label: 'Preço/m', value: `R$ ${(f.price_per_meter || 0).toFixed(2)}` }],

      itemType: 'Tecido'
    });
    if (!confirmed) return;

    const success = await remove(f.id);
    if (success) {
      toast({ title: 'Tecido excluído', description: f.name });
    }
  };

  if (loading) {
    return (
      <div data-ev-id="ev_9372f90011" className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>);

  }

  return (
    <div data-ev-id="ev_a0f9383986" className="flex flex-col gap-6">
      <header data-ev-id="ev_f0c4599ed5" className="flex items-start justify-between">
        <div data-ev-id="ev_2cb036dc54">
          <h1 data-ev-id="ev_ffa6767d5a" className="text-[26px] font-semibold text-stone-900 tracking-tight">Tecidos</h1>
          <p data-ev-id="ev_57fe86314a" className="text-sm text-stone-500 mt-1">
            {fabrics.length} tecidos · {fabrics.filter((f) => f.stock < (f.min_stock || 5)).length} com estoque baixo
          </p>
        </div>
        <Button onClick={() => navigate('/tecidos/novo')} className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2">
          <Plus className="w-4 h-4" /> Novo Tecido
        </Button>
      </header>

      <div data-ev-id="ev_96b4b6cce0" className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input placeholder="Buscar tecido..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-white border-stone-200 rounded-lg h-10" />
      </div>

      {list.length === 0 ?
      <Card className="p-12 text-center bg-white border-stone-200/80 shadow-none">
          <p data-ev-id="ev_0e5ad45f52" className="text-stone-500">{fabrics.length === 0 ? 'Nenhum tecido cadastrado.' : 'Nenhum tecido encontrado.'}</p>
        </Card> :

      <Card className="bg-white border-stone-200/80 shadow-none overflow-hidden">
          <table data-ev-id="ev_7e6cd8f129" className="w-full">
            <thead data-ev-id="ev_a29e266e46">
              <tr data-ev-id="ev_eba2c71207" className="border-b border-stone-200 bg-stone-50/50">
                {['Nome', 'Tipo', 'Cor', 'Estoque', 'R$/Metro', 'Localização', ''].map((h) =>
              <th data-ev-id="ev_c02bbe74b8" key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
              )}
              </tr>
            </thead>
            <tbody data-ev-id="ev_1163f04345">
              {list.map((f) =>
            <tr data-ev-id="ev_0187b4d009" key={f.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                  <td data-ev-id="ev_5724fe10e2" className="px-5 py-4 text-sm font-medium text-stone-900">{f.name}</td>
                  <td data-ev-id="ev_a97d047817" className="px-5 py-4 text-sm text-stone-600">{f.type || '-'}</td>
                  <td data-ev-id="ev_5379110933" className="px-5 py-4 text-sm text-stone-600">{f.color || '-'}</td>
                  <td data-ev-id="ev_e0dd3e2e51" className="px-5 py-4">
                    <div data-ev-id="ev_a0dacf97df" className="flex items-center gap-1.5">
                      <span data-ev-id="ev_0454a26659" className={`text-sm font-medium ${f.stock < (f.min_stock || 5) ? 'text-amber-700' : 'text-stone-900'}`}>
                        {f.stock}m
                      </span>
                      {f.stock < (f.min_stock || 5) && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                  </td>
                  <td data-ev-id="ev_57261b52d4" className="px-5 py-4 text-sm text-stone-900">R$ {(f.price_per_meter || 0).toFixed(2)}</td>
                  <td data-ev-id="ev_3b623dc5cc" className="px-5 py-4 text-sm text-stone-500">{f.location || '-'}</td>
                  <td data-ev-id="ev_eba4d261cf" className="px-5 py-4">
                    <div data-ev-id="ev_ba1b6251e0" className="flex items-center gap-1 justify-end">
                      <button data-ev-id="ev_dac1ac654c" onClick={() => navigate(`/tecidos/${f.id}/editar`)} className="text-stone-400 hover:text-stone-900 p-1">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button data-ev-id="ev_3c600e2c7b" onClick={() => handleDelete(f)} className="text-stone-400 hover:text-rose-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </Card>
      }
    </div>);

}