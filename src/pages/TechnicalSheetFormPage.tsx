/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FormPageShell, FormSection, FormGrid, FormField } from '@/components/forms/FormPageShell';
import { mockTechnicalSheets, mockProducts, mockFabrics, mockTrims } from '@/lib/mock-data';
import { toast } from '@/hooks/use-toast';
import { generateId } from '@/lib/utils';
import type { TechnicalSheet } from '@/lib/types';

export default function TechnicalSheetFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [products] = useState(mockProducts);
  const [fabrics] = useState(mockFabrics);
  const [trims] = useState(mockTrims);

  const [form, setForm] = useState({
    product_id: '',
    product_name: '',
    fabric_cost: 0,
    trims_cost: 0,
    labor_cost: 0,
    suggested_price: 0,
    notes: ''
  });

  useEffect(() => {
    if (id) {
      const sheet = mockTechnicalSheets.find((s) => s.id === id);
      if (sheet) {
        setForm({
          product_id: sheet.product_id || '',
          product_name: sheet.product_name || '',
          fabric_cost: sheet.fabric_cost || 0,
          trims_cost: sheet.trims_cost || 0,
          labor_cost: sheet.labor_cost || 0,
          suggested_price: sheet.suggested_price || 0,
          notes: (sheet as any).notes || ''
        });
      }
    }
  }, [id]);

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleProductChange = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    setForm((f) => ({
      ...f,
      product_id: productId,
      product_name: p?.name || '',
      fabric_cost: p?.cost_price ? p.cost_price * 0.4 : 0,
      labor_cost: p?.labor_cost || 0
    }));
  };

  const totals = useMemo(() => {
    const fabricCost = Number(form.fabric_cost) || 0;
    const trimsCost = Number(form.trims_cost) || 0;
    const laborCost = Number(form.labor_cost) || 0;
    const total = fabricCost + trimsCost + laborCost;
    const suggested = total * 2.5;
    const finalPrice = Number(form.suggested_price) || suggested;
    const margin = finalPrice > 0 ? Math.round((finalPrice - total) / finalPrice * 100) : 0;
    return { fabricCost, trimsCost, laborCost, total, suggested, finalPrice, margin };
  }, [form]);

  const handleSubmit = () => {
    if (!form.product_id) return;
    const data = {
      id: id || generateId(),
      product_id: form.product_id,
      product_name: form.product_name,
      fabric_cost: totals.fabricCost,
      trims_cost: totals.trimsCost,
      labor_cost: totals.laborCost,
      total_cost: totals.total,
      suggested_price: totals.finalPrice,
    };
    toast({ title: isEditing ? 'Ficha atualizada' : 'Ficha criada', description: form.product_name });
    navigate('/fichas-tecnicas');
  };

  const product = products.find((p) => p.id === form.product_id);

  return (
    <FormPageShell
      title={isEditing ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica'}
      subtitle={isEditing ? form.product_name : 'Cadastre os custos de produção de um produto'}
      backTo="/fichas-tecnicas"
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Salvar Alterações' : 'Criar Ficha'}
      isValid={!!form.product_id}>

      <FormSection title="Produto">
        <FormGrid cols={2}>
          <FormField label="Produto" required>
            <Select value={form.product_id} onValueChange={handleProductChange}>
              <SelectTrigger><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
              <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          {product &&
          <div data-ev-id="ev_f4f843345a" className="flex items-center gap-4 p-4 bg-stone-50 rounded-lg">
              {product.image && <img data-ev-id="ev_387f29e21e" src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />}
              <div data-ev-id="ev_052ae8ed2e">
                <div data-ev-id="ev_d3ac50a7e8" className="text-sm font-medium text-stone-900">{product.name}</div>
                <div data-ev-id="ev_7fd1a539ce" className="text-xs text-stone-500">{product.category} · {product.sku}</div>
              </div>
            </div>
          }
        </FormGrid>
      </FormSection>

      <FormSection title="Custos de Produção">
        <FormGrid cols={3}>
          <FormField label="Custo de Tecidos (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.fabric_cost}
              onChange={(e) => set('fabric_cost', e.target.value)}
              placeholder="0.00" />

          </FormField>
          <FormField label="Custo de Aviamentos (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.trims_cost}
              onChange={(e) => set('trims_cost', e.target.value)}
              placeholder="0.00" />

          </FormField>
          <FormField label="Custo de Mão de Obra (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.labor_cost}
              onChange={(e) => set('labor_cost', e.target.value)}
              placeholder="0.00" />

          </FormField>
        </FormGrid>

        <div data-ev-id="ev_12cc99c3da" className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100">
          <div data-ev-id="ev_53797eb531" className="text-center p-4 bg-stone-50 rounded-lg">
            <div data-ev-id="ev_28009b71c8" className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Tecidos</div>
            <div data-ev-id="ev_f8703070ae" className="text-lg font-semibold text-stone-900">R$ {totals.fabricCost.toFixed(2)}</div>
          </div>
          <div data-ev-id="ev_e0911c1237" className="text-center p-4 bg-stone-50 rounded-lg">
            <div data-ev-id="ev_c8d442c1ad" className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Aviamentos</div>
            <div data-ev-id="ev_101ee06412" className="text-lg font-semibold text-stone-900">R$ {totals.trimsCost.toFixed(2)}</div>
          </div>
          <div data-ev-id="ev_cd8b5915bf" className="text-center p-4 bg-stone-50 rounded-lg">
            <div data-ev-id="ev_6ceae0c26b" className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Mão de Obra</div>
            <div data-ev-id="ev_51e1ff8336" className="text-lg font-semibold text-stone-900">R$ {totals.laborCost.toFixed(2)}</div>
          </div>
          <div data-ev-id="ev_a0b64c35cb" className="text-center p-4 bg-amber-50 rounded-lg">
            <div data-ev-id="ev_d49087cff9" className="text-[10px] uppercase tracking-wider text-amber-600 font-medium">Custo Total</div>
            <div data-ev-id="ev_f52d02b1e1" className="text-lg font-semibold text-amber-700">R$ {totals.total.toFixed(2)}</div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Precificação">
        <div data-ev-id="ev_f816f7ccc3" className="p-5 bg-stone-50 rounded-xl border border-stone-200 mb-4">
          <div data-ev-id="ev_b67730ba22" className="flex items-center justify-between">
            <div data-ev-id="ev_b458c436dc">
              <div data-ev-id="ev_88a9c18507" className="text-sm font-medium text-stone-700">Preço Sugerido (2.5x custo)</div>
              <div data-ev-id="ev_244166d29e" className="text-2xl font-bold text-emerald-700">R$ {totals.suggested.toFixed(2)}</div>
            </div>
            <div data-ev-id="ev_404fe23b2e" className="text-right">
              <div data-ev-id="ev_d02c421200" className="text-sm font-medium text-stone-700">Margem</div>
              <div data-ev-id="ev_4d72ba2128" className="text-2xl font-bold text-stone-900">{totals.margin}%</div>
            </div>
          </div>
        </div>

        <FormGrid cols={2}>
          <FormField label="Preço de Venda Final (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.suggested_price || totals.suggested}
              onChange={(e) => set('suggested_price', e.target.value)}
              placeholder={totals.suggested.toFixed(2)} />

          </FormField>
          <FormField label="Observações" full>
            <Textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Anotações sobre a ficha técnica..."
              rows={3} />

          </FormField>
        </FormGrid>
      </FormSection>
    </FormPageShell>);

}