import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface Supplier {
  id: string;
  name: string;
  type: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  lead_time: number;
  rating: number;
  status: string;
}

export default function Suppliers() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const { data: suppliers, loading, remove } = useSupabaseData<Supplier>('suppliers');

  const list = suppliers.filter((s) => (s.name || '').toLowerCase().includes(q.toLowerCase()));

  const handleDelete = async (s: Supplier) => {
    const confirmed = await confirm({
      title: `Excluir "${s.name}"?`,
      description: 'O fornecedor será removido permanentemente.',
      level: 'critical',
      confirmText: 'Excluir permanentemente',
      context: [
      { label: 'Tipo', value: s.type || '-' },
      { label: 'Cidade', value: s.city || '-' }],

      itemType: 'Fornecedor'
    });
    if (!confirmed) return;

    const success = await remove(s.id);
    if (success) {
      toast({ title: 'Fornecedor excluído', description: s.name });
    }
  };

  if (loading) {
    return (
      <div data-ev-id="ev_f1f546b178" className="flex items-center justify-center h-64">
        <ScissorsLoader />
      </div>);

  }

  return (
    <div data-ev-id="ev_8199c5b7ef" className="flex flex-col gap-6">
      <header data-ev-id="ev_8d33d99db7" className="flex items-start justify-between">
        <div data-ev-id="ev_87138516ed">
          <h1 data-ev-id="ev_59681038b0" className="text-[26px] font-semibold text-stone-900 tracking-tight">Fornecedores</h1>
          <p data-ev-id="ev_ec9b1d2066" className="text-sm text-stone-500 mt-1">{suppliers.length} fornecedores cadastrados</p>
        </div>
        <Button onClick={() => navigate('/fornecedores/novo')} className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2">
          <Plus className="w-4 h-4" /> Novo Fornecedor
        </Button>
      </header>

      <div data-ev-id="ev_c9287ba2b1" className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input placeholder="Buscar fornecedor..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-white border-stone-200 rounded-lg h-10" />
      </div>

      {list.length === 0 ?
      <Card className="p-12 text-center bg-white border-stone-200/80 shadow-none">
          <p data-ev-id="ev_c9374d5b90" className="text-stone-500">{suppliers.length === 0 ? 'Nenhum fornecedor cadastrado.' : 'Nenhum fornecedor encontrado.'}</p>
        </Card> :

      <Card className="bg-white border-stone-200/80 shadow-none overflow-hidden">
          <table data-ev-id="ev_e2c35af235" className="w-full">
            <thead data-ev-id="ev_d98f713779">
              <tr data-ev-id="ev_ee3750b7c5" className="border-b border-stone-200 bg-stone-50/50">
                {['Nome', 'Tipo', 'Contato', 'Telefone', 'Cidade', 'Prazo', 'Status', ''].map((h) =>
              <th data-ev-id="ev_50f8a4168c" key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
              )}
              </tr>
            </thead>
            <tbody data-ev-id="ev_56bd9d4d3e">
              {list.map((s) =>
            <tr data-ev-id="ev_5966ebb6ca" key={s.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                  <td data-ev-id="ev_5fdd7d28d5" className="px-5 py-4 text-sm font-medium text-stone-900">{s.name}</td>
                  <td data-ev-id="ev_92eeedf0ad" className="px-5 py-4 text-sm text-stone-600">{s.type}</td>
                  <td data-ev-id="ev_86df01909c" className="px-5 py-4 text-sm text-stone-600">{s.contact || '-'}</td>
                  <td data-ev-id="ev_f971d21766" className="px-5 py-4 text-sm text-stone-600">{s.phone || '-'}</td>
                  <td data-ev-id="ev_be94e5bca3" className="px-5 py-4 text-sm text-stone-600">{s.city || '-'}</td>
                  <td data-ev-id="ev_2cfcb2c68b" className="px-5 py-4 text-sm text-stone-600">{s.lead_time} dias</td>
                  <td data-ev-id="ev_e5fe2e3cfc" className="px-5 py-4 text-sm text-stone-600">{s.status}</td>
                  <td data-ev-id="ev_a354725c75" className="px-5 py-4">
                    <div data-ev-id="ev_2e41a3601d" className="flex items-center gap-1 justify-end">
                      <button data-ev-id="ev_335a6bded0" onClick={() => navigate(`/fornecedores/${s.id}/editar`)} className="text-stone-400 hover:text-stone-900 p-1">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button data-ev-id="ev_75ec2e3d0f" onClick={() => handleDelete(s)} className="text-stone-400 hover:text-rose-700 p-1">
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