import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Loader2, Star } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface Workshop {
  id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  price_per_piece: number;
  rating: number;
  status: string;
  in_progress: number;
}

export default function Workshops() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const { data: workshops, loading, remove } = useSupabaseData<Workshop>('workshops');

  const list = workshops.filter((w) => (w.name || '').toLowerCase().includes(q.toLowerCase()));

  const handleDelete = async (w: Workshop) => {
    const confirmed = await confirm({
      title: `Excluir "${w.name}"?`,
      description: 'A oficina será removida permanentemente.',
      level: 'critical',
      confirmText: 'Excluir permanentemente',
      context: [
      { label: 'Especialidade', value: w.specialty || '-' },
      { label: 'Preço/peça', value: `R$ ${(w.price_per_piece || 0).toFixed(2)}` }],

      itemType: 'Oficina'
    });
    if (!confirmed) return;

    const success = await remove(w.id);
    if (success) {
      toast({ title: 'Oficina excluída', description: w.name });
    }
  };

  if (loading) {
    return (
      <div data-ev-id="ev_2ae8c7c343" className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>);

  }

  return (
    <div data-ev-id="ev_8bbf144131" className="flex flex-col gap-6">
      <header data-ev-id="ev_ef397ee11e" className="flex items-start justify-between">
        <div data-ev-id="ev_a721abe5cb">
          <h1 data-ev-id="ev_a6def28c09" className="text-[26px] font-semibold text-stone-900 tracking-tight">Oficinas</h1>
          <p data-ev-id="ev_8a720efdf2" className="text-sm text-stone-500 mt-1">{workshops.length} oficinas cadastradas</p>
        </div>
        <Button onClick={() => navigate('/oficinas/nova')} className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2">
          <Plus className="w-4 h-4" /> Nova Oficina
        </Button>
      </header>

      <div data-ev-id="ev_80dcacce0e" className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input placeholder="Buscar oficina..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-white border-stone-200 rounded-lg h-10" />
      </div>

      {list.length === 0 ?
      <Card className="p-12 text-center bg-white border-stone-200/80 shadow-none">
          <p data-ev-id="ev_e32b5e4171" className="text-stone-500">{workshops.length === 0 ? 'Nenhuma oficina cadastrada.' : 'Nenhuma oficina encontrada.'}</p>
        </Card> :

      <Card className="bg-white border-stone-200/80 shadow-none overflow-hidden">
          <table data-ev-id="ev_4cc81e5851" className="w-full">
            <thead data-ev-id="ev_9e5dd9585f">
              <tr data-ev-id="ev_d606f75ceb" className="border-b border-stone-200 bg-stone-50/50">
                {['Nome', 'Especialidade', 'Telefone', 'Preço/Peça', 'Avaliação', 'Status', ''].map((h) =>
              <th data-ev-id="ev_a85d89afb7" key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
              )}
              </tr>
            </thead>
            <tbody data-ev-id="ev_56b47fae4b">
              {list.map((w) =>
            <tr data-ev-id="ev_31a7d7aa39" key={w.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                  <td data-ev-id="ev_e45ee566db" className="px-5 py-4 text-sm font-medium text-stone-900">{w.name}</td>
                  <td data-ev-id="ev_2fac7f0527" className="px-5 py-4 text-sm text-stone-600">{w.specialty || '-'}</td>
                  <td data-ev-id="ev_aab64ef447" className="px-5 py-4 text-sm text-stone-600">{w.phone || '-'}</td>
                  <td data-ev-id="ev_28642537c2" className="px-5 py-4 text-sm text-stone-900 font-medium">R$ {(w.price_per_piece || 0).toFixed(2)}</td>
                  <td data-ev-id="ev_cd0bb94d4b" className="px-5 py-4">
                    <div data-ev-id="ev_356b523de2" className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) =>
                  <Star key={i} className={`w-3 h-3 ${i < w.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                  )}
                    </div>
                  </td>
                  <td data-ev-id="ev_0a6b2a96de" className="px-5 py-4 text-sm text-stone-600">{w.status}</td>
                  <td data-ev-id="ev_207dca3e05" className="px-5 py-4">
                    <div data-ev-id="ev_447c7aa7b5" className="flex items-center gap-1 justify-end">
                      <button data-ev-id="ev_7c4b7b79b9" onClick={() => navigate(`/oficinas/${w.id}/editar`)} className="text-stone-400 hover:text-stone-900 p-1">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button data-ev-id="ev_44d5151bb0" onClick={() => handleDelete(w)} className="text-stone-400 hover:text-rose-700 p-1">
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