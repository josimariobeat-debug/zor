// @ts-nocheck - Cloud habilitado mas tabelas ainda não criadas; remova após gerar tipos.
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface Collection {
  id: string;
  name: string;
  season: string | null;
  launch_date: string | null;
  goal: number;
  status: string;
  description: string | null;
  image: string | null;
}

export default function Collections() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const { data: collections, loading, remove } = useSupabaseData<Collection>('collections');

  const list = collections.filter((c) => (c.name || '').toLowerCase().includes(q.toLowerCase()));

  const handleDelete = async (c: Collection) => {
    const confirmed = await confirm({
      title: `Excluir "${c.name}"?`,
      description: 'A coleção será removida permanentemente.',
      level: 'critical',
      confirmText: 'Excluir permanentemente',
      context: [
      { label: 'Estação', value: c.season || '-' },
      { label: 'Status', value: c.status || '-' }],

      itemType: 'Coleção'
    });
    if (!confirmed) return;

    const success = await remove(c.id);
    if (success) {
      toast({ title: 'Coleção excluída', description: c.name });
    }
  };

  if (loading) {
    return (
      <div data-ev-id="ev_70051ced21" className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>);

  }

  return (
    <div data-ev-id="ev_366028cd79" className="flex flex-col gap-6">
      <header data-ev-id="ev_6a9dc84292" className="flex items-start justify-between">
        <div data-ev-id="ev_4e64821efd">
          <h1 data-ev-id="ev_e302a5c743" className="text-[26px] font-semibold text-stone-900 tracking-tight">Coleções</h1>
          <p data-ev-id="ev_249dfa770a" className="text-sm text-stone-500 mt-1">{collections.length} coleções cadastradas</p>
        </div>
        <Button onClick={() => navigate('/colecoes/nova')} className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2">
          <Plus className="w-4 h-4" /> Nova Coleção
        </Button>
      </header>

      <div data-ev-id="ev_25919680e9" className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input placeholder="Buscar coleção..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-white border-stone-200 rounded-lg h-10" />
      </div>

      {list.length === 0 ?
      <Card className="p-12 text-center bg-white border-stone-200/80 shadow-none">
          <p data-ev-id="ev_eb55170ff5" className="text-stone-500">{collections.length === 0 ? 'Nenhuma coleção cadastrada.' : 'Nenhuma coleção encontrada.'}</p>
        </Card> :

      <Card className="bg-white border-stone-200/80 shadow-none overflow-hidden">
          <table data-ev-id="ev_c12365f07e" className="w-full">
            <thead data-ev-id="ev_9998df03e7">
              <tr data-ev-id="ev_8468791cc1" className="border-b border-stone-200 bg-stone-50/50">
                {['Nome', 'Estação', 'Lançamento', 'Meta', 'Status', ''].map((h) =>
              <th data-ev-id="ev_2475fe2bb6" key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
              )}
              </tr>
            </thead>
            <tbody data-ev-id="ev_383f0df6b7">
              {list.map((c) =>
            <tr data-ev-id="ev_e8dfcf2dc7" key={c.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                  <td data-ev-id="ev_33b1bdee7d" className="px-5 py-4">
                    <div data-ev-id="ev_efc4e6e146" className="flex items-center gap-3">
                      {c.image ?
                  <img data-ev-id="ev_5cd5aa3144" src={c.image} alt={c.name} className="w-10 h-10 object-cover rounded-md" /> :

                  <div data-ev-id="ev_de4a2133e3" className="w-10 h-10 bg-stone-100 rounded-md" />
                  }
                      <span data-ev-id="ev_e82d72a749" className="text-sm font-medium text-stone-900">{c.name}</span>
                    </div>
                  </td>
                  <td data-ev-id="ev_cee31a1887" className="px-5 py-4 text-sm text-stone-600">{c.season || '-'}</td>
                  <td data-ev-id="ev_c66692979f" className="px-5 py-4 text-sm text-stone-600">
                    {c.launch_date ? new Date(c.launch_date).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td data-ev-id="ev_e41f5f8265" className="px-5 py-4 text-sm text-stone-900">R$ {(c.goal || 0).toLocaleString('pt-BR')}</td>
                  <td data-ev-id="ev_8aeb9df04d" className="px-5 py-4">
                    <span data-ev-id="ev_5440b91586" className={`text-xs px-2 py-1 rounded-full ${
                c.status === 'Ativa' ? 'bg-emerald-50 text-emerald-700' :
                c.status === 'Planejamento' ? 'bg-amber-50 text-amber-700' :
                'bg-stone-100 text-stone-600'}`
                }>
                      {c.status}
                    </span>
                  </td>
                  <td data-ev-id="ev_95b5992c19" className="px-5 py-4">
                    <div data-ev-id="ev_2e82f4a3ae" className="flex items-center gap-1 justify-end">
                      <button data-ev-id="ev_910e1ef173" onClick={() => navigate(`/colecoes/${c.id}/editar`)} className="text-stone-400 hover:text-stone-900 p-1">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button data-ev-id="ev_d3ecc8b51a" onClick={() => handleDelete(c)} className="text-stone-400 hover:text-rose-700 p-1">
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