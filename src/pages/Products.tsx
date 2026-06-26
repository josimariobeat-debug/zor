import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  internal_code: string | null;
  category: string | null;
  collection_id: string | null;
  sizes: string[];
  colors: string[];
  stock: number;
  cost_price: number;
  sale_price: number;
  margin: number;
  status: string;
  image: string | null;
}

export default function Products() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [q, setQ] = useState('');
  const { data: products, loading, remove } = useSupabaseData<Product>('products');

  const list = products.filter((p) =>
  (p.name || '').toLowerCase().includes(q.toLowerCase()) ||
  (p.sku || '').toLowerCase().includes(q.toLowerCase())
  );

  const handleDelete = async (p: Product) => {
    const confirmed = await confirm({
      title: `Excluir "${p.name}"?`,
      description: 'O produto será removido permanentemente.',
      level: 'critical',
      confirmText: 'Excluir permanentemente',
      context: [
      { label: 'SKU', value: p.sku || '-' },
      { label: 'Categoria', value: p.category || '-' },
      { label: 'Estoque', value: String(p.stock) }],

      itemType: 'Produto'
    });
    if (!confirmed) return;

    const success = await remove(p.id);
    if (success) {
      toast({ title: 'Produto excluído', description: p.name });
    }
  };

  if (loading) {
    return (
      <div data-ev-id="ev_4a04073215" className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>);

  }

  return (
    <div data-ev-id="ev_5071e2449a" className="flex flex-col gap-6">
      <header data-ev-id="ev_b9ca548fb8" className="flex items-start justify-between">
        <div data-ev-id="ev_8213773ea5">
          <h1 data-ev-id="ev_ec81c3c23f" className="text-[26px] font-semibold text-stone-900 tracking-tight">Produtos</h1>
          <p data-ev-id="ev_96e5ebdcdf" className="text-sm text-stone-500 mt-1">{products.length} produtos cadastrados</p>
        </div>
        <Button onClick={() => navigate('/produtos/novo')} className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2">
          <Plus className="w-4 h-4" /> Novo Produto
        </Button>
      </header>

      <div data-ev-id="ev_c31d246d4a" className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input placeholder="Buscar produto..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-white border-stone-200 rounded-lg h-10" />
      </div>

      {list.length === 0 ?
      <Card className="p-12 text-center bg-white border-stone-200/80 shadow-none">
          <p data-ev-id="ev_83794a3ec1" className="text-stone-500">{products.length === 0 ? 'Nenhum produto cadastrado.' : 'Nenhum produto encontrado.'}</p>
        </Card> :

      <Card className="bg-white border-stone-200/80 shadow-none overflow-hidden">
          <table data-ev-id="ev_e420591a31" className="w-full">
            <thead data-ev-id="ev_15869704e5">
              <tr data-ev-id="ev_526669bb53" className="border-b border-stone-200 bg-stone-50/50">
                {['Produto', 'SKU', 'Categoria', 'Tamanhos', 'Estoque', 'Custo', 'Venda', 'Status', ''].map((h) =>
              <th data-ev-id="ev_cd6896ab58" key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
              )}
              </tr>
            </thead>
            <tbody data-ev-id="ev_b3c4039297">
              {list.map((p) =>
            <tr data-ev-id="ev_85e50ff09b" key={p.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                  <td data-ev-id="ev_d673e9b52e" className="px-5 py-4">
                    <div data-ev-id="ev_9b6500c259" className="flex items-center gap-3">
                      {p.image ?
                  <img data-ev-id="ev_b7b9137292" src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-md" /> :

                  <div data-ev-id="ev_718ddfd828" className="w-10 h-10 bg-stone-100 rounded-md" />
                  }
                      <span data-ev-id="ev_be96606e87" className="text-sm font-medium text-stone-900">{p.name}</span>
                    </div>
                  </td>
                  <td data-ev-id="ev_e39c5737e5" className="px-5 py-4 text-sm text-stone-600">{p.sku || '-'}</td>
                  <td data-ev-id="ev_c70b1baa10" className="px-5 py-4 text-sm text-stone-600">{p.category || '-'}</td>
                  <td data-ev-id="ev_776d24a63f" className="px-5 py-4 text-sm text-stone-600">{(p.sizes || []).join(', ') || '-'}</td>
                  <td data-ev-id="ev_b64b426d0d" className="px-5 py-4 text-sm text-stone-900 font-medium">{p.stock}</td>
                  <td data-ev-id="ev_4d2a0fd6c0" className="px-5 py-4 text-sm text-stone-600">R$ {(p.cost_price || 0).toFixed(2)}</td>
                  <td data-ev-id="ev_3c16f1ea4d" className="px-5 py-4 text-sm text-stone-900 font-medium">R$ {(p.sale_price || 0).toFixed(2)}</td>
                  <td data-ev-id="ev_a6e524511b" className="px-5 py-4">
                    <span data-ev-id="ev_a1d6941bb2" className={`text-xs px-2 py-1 rounded-full ${p.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td data-ev-id="ev_eae0aa8ea5" className="px-5 py-4">
                    <div data-ev-id="ev_118eb3c504" className="flex items-center gap-1 justify-end">
                      <button data-ev-id="ev_5da635637c" onClick={() => navigate(`/produtos/${p.id}/editar`)} className="text-stone-400 hover:text-stone-900 p-1">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button data-ev-id="ev_c200d7e2b8" onClick={() => handleDelete(p)} className="text-stone-400 hover:text-rose-700 p-1">
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