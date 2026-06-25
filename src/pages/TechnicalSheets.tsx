import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { mockTechnicalSheets, mockProducts } from '@/lib/mock-data';
import { toast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { addDeletionRecord } from '@/lib/deletion-history';
import type { TechnicalSheet } from '@/lib/types';

export default function TechnicalSheets() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [sheets, setSheets] = useState<TechnicalSheet[]>(mockTechnicalSheets);
  const [products] = useState(mockProducts);

  const handleDelete = async (ts: TechnicalSheet) => {
    const confirmed = await confirm({
      title: `Excluir ficha de "${ts.product_name}"?`,
      description: 'A ficha técnica será removida permanentemente.',
      level: 'critical',
      confirmText: 'Excluir permanentemente',
      context: [
      { label: 'Produto', value: ts.product_name || '-' },
      { label: 'Custo Total', value: `R$ ${(ts.total_cost || 0).toFixed(2)}` },
      { label: 'Preço Sugerido', value: `R$ ${(ts.suggested_price || 0).toFixed(2)}` }],

      itemType: 'Ficha Técnica'
    });
    if (!confirmed) return;

    addDeletionRecord({
      type: 'technical_sheet',
      name: ts.product_name,
      data: ts as unknown as Record<string, unknown>,
      context: [
      { label: 'Custo Total', value: `R$ ${(ts.total_cost || 0).toFixed(2)}` }]

    });

    setSheets((prev) => prev.filter((s) => s.id !== ts.id));
    toast({ title: 'Ficha excluída', description: ts.product_name });
  };

  return (
    <div data-ev-id="ev_5f6bad24b6" className="flex flex-col gap-6">
      <header data-ev-id="ev_ea5d0d411d" className="flex items-start justify-between">
        <div data-ev-id="ev_2ab1bc0c85">
          <h1 data-ev-id="ev_7a252e4c42" className="text-[26px] font-semibold text-stone-900 tracking-tight">Fichas Técnicas</h1>
          <p data-ev-id="ev_0f4d9bf972" className="text-sm text-stone-500 mt-1">{sheets.length} fichas cadastradas</p>
        </div>
        <Button onClick={() => navigate('/fichas-tecnicas/nova')} className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2">
          <Plus className="w-4 h-4" /> Nova Ficha
        </Button>
      </header>
      
      {sheets.length === 0 ?
      <Card className="p-12 text-center bg-white border-stone-200/80 shadow-none">
          <p data-ev-id="ev_bfb7125fe8" className="text-stone-500">Nenhuma ficha cadastrada.</p>
        </Card> :

      <div data-ev-id="ev_8ce5b40f36" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map((ts) => {
          const p = products.find((pr) => pr.id === ts.product_id);
          return (
            <Card key={ts.id} className="overflow-hidden bg-white border-stone-200/80 shadow-none hover:border-stone-300 transition-colors">
                {p?.image &&
              <div data-ev-id="ev_7c3679d93a" className="aspect-[4/3] bg-stone-100">
                    <img data-ev-id="ev_5179c1eaa3" src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
              }
                <div data-ev-id="ev_45d0f7c1cb" className="p-5">
                  <h3 data-ev-id="ev_1ea25d51cd" className="text-base font-semibold text-stone-900">{ts.product_name}</h3>
                  <div data-ev-id="ev_deb22c4623" className="flex flex-col gap-1.5 mt-3 text-sm">
                    <div data-ev-id="ev_2618de9967" className="flex justify-between">
                      <span data-ev-id="ev_73f3685a03" className="text-stone-500">Tecidos</span>
                      <span data-ev-id="ev_2036b87f7d" className="text-stone-900 font-medium">R$ {(ts.fabric_cost || 0).toFixed(2)}</span>
                    </div>
                    <div data-ev-id="ev_cbc3ceb6e3" className="flex justify-between">
                      <span data-ev-id="ev_2097c5bf7c" className="text-stone-500">Aviamentos</span>
                      <span data-ev-id="ev_e91e527a55" className="text-stone-900 font-medium">R$ {(ts.trims_cost || 0).toFixed(2)}</span>
                    </div>
                    <div data-ev-id="ev_eaf0954087" className="flex justify-between">
                      <span data-ev-id="ev_a30065f1c9" className="text-stone-500">Mão de obra</span>
                      <span data-ev-id="ev_e05bef27da" className="text-stone-900 font-medium">R$ {(ts.labor_cost || 0).toFixed(2)}</span>
                    </div>
                    <div data-ev-id="ev_a1d5e99574" className="flex justify-between pt-2 mt-2 border-t border-stone-100">
                      <span data-ev-id="ev_4e6af01d2a" className="text-stone-900 font-semibold">Custo Total</span>
                      <span data-ev-id="ev_755d5a0569" className="text-stone-900 font-semibold">R$ {(ts.total_cost || 0).toFixed(2)}</span>
                    </div>
                    <div data-ev-id="ev_af8cd54198" className="flex justify-between">
                      <span data-ev-id="ev_8d92800009" className="text-stone-500">Preço sugerido</span>
                      <span data-ev-id="ev_a15b16d813" className="text-emerald-700 font-semibold">R$ {(ts.suggested_price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div data-ev-id="ev_4cbc669a5d" className="flex gap-1.5 mt-4 pt-4 border-t border-stone-100">
                    <Button
                    onClick={() => navigate(`/fichas-tecnicas/${ts.id}/editar`)}
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 h-8 flex-1">

                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </Button>
                    <Button
                    onClick={() => handleDelete(ts)}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 px-2 text-stone-500 hover:text-rose-700">

                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>);

        })}
        </div>
      }
    </div>);

}