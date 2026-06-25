import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Trash2, Shirt, Scissors, Building2 } from 'lucide-react';
import { mockFabrics, mockTrims, mockWorkshops } from '@/lib/mock-data';
import { productCategories, productStatuses } from '@/lib/constants';
import type { Product } from '@/lib/types';

interface FabricItem {id: number;fabric_id: string;meters: number;}
interface TrimItem {id: number;trim_id: string;qty: number;}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Product>) => void;
  initial?: Product | null;
}

const emptyForm = {
  name: '', sku: '', internal_code: '', category: 'Vestido',
  colors: '', sizes: '', stock: 0, status: 'Rascunho',
  description: '', image: '',
  fabrics: [] as FabricItem[], trims: [] as TrimItem[],
  workshop_id: '', labor_cost: 0, operational_cost: 0, sale_price: 0
};

export default function ProductForm({ open, onOpenChange, onSave, initial = null }: ProductFormProps) {
  const [fabrics] = useState(mockFabrics);
  const [trims] = useState(mockTrims);
  const [workshops] = useState(mockWorkshops);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          ...emptyForm,
          ...initial,
          colors: Array.isArray(initial.colors) ? initial.colors.join(', ') : initial.colors || '',
          sizes: Array.isArray(initial.sizes) ? initial.sizes.join(', ') : initial.sizes || '',
          fabrics: (initial.fabric_ids || []).map((id, i) => ({ id: i, fabric_id: id, meters: 1 })),
          trims: (initial.trim_ids || []).map((id, i) => ({ id: i, trim_id: id, qty: 1 }))
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, initial]);

  const setField = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const addFabric = () => setForm((f) => ({ ...f, fabrics: [...f.fabrics, { id: Date.now(), fabric_id: fabrics[0]?.id || '', meters: 1 }] }));
  const removeFabric = (id: number) => setForm((f) => ({ ...f, fabrics: f.fabrics.filter((x) => x.id !== id) }));
  const updateFabric = (id: number, patch: Partial<FabricItem>) => setForm((f) => ({ ...f, fabrics: f.fabrics.map((x) => x.id === id ? { ...x, ...patch } : x) }));

  const addTrim = () => setForm((f) => ({ ...f, trims: [...f.trims, { id: Date.now(), trim_id: trims[0]?.id || '', qty: 1 }] }));
  const removeTrim = (id: number) => setForm((f) => ({ ...f, trims: f.trims.filter((x) => x.id !== id) }));
  const updateTrim = (id: number, patch: Partial<TrimItem>) => setForm((f) => ({ ...f, trims: f.trims.map((x) => x.id === id ? { ...x, ...patch } : x) }));

  const totals = useMemo(() => {
    const fab = form.fabrics.reduce((s, it) => {const f = fabrics.find((x) => x.id === it.fabric_id);return s + (f?.price_per_meter || 0) * (Number(it.meters) || 0);}, 0);
    const tri = form.trims.reduce((s, it) => {const t = trims.find((x) => x.id === it.trim_id);return s + (t?.price_per_unit || 0) * (Number(it.qty) || 0);}, 0);
    const labor = Number(form.labor_cost) || 0;
    const op = Number(form.operational_cost) || 0;
    const total = fab + tri + labor + op;
    const sale = Number(form.sale_price) || 0;
    const margin = sale > 0 ? Math.round((sale - total) / sale * 100) : 0;
    return { fab, tri, labor, op, total, margin };
  }, [form, fabrics, trims]);

  const handleSubmit = () => {
    if (!form.name) return;
    onSave({
      name: form.name, sku: form.sku || `SKU-${Date.now()}`, internal_code: form.internal_code,
      category: form.category,
      sizes: typeof form.sizes === 'string' ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
      colors: typeof form.colors === 'string' ? form.colors.split(',').map((s) => s.trim()).filter(Boolean) : [],
      description: form.description, status: form.status,
      stock: Number(form.stock) || 0,
      cost_price: totals.total,
      sale_price: Number(form.sale_price) || 0,
      margin: totals.margin,
      labor_cost: Number(form.labor_cost) || 0,
      operational_cost: Number(form.operational_cost) || 0,
      workshop_id: form.workshop_id,
      fabric_ids: form.fabrics.map((f) => f.fabric_id),
      trim_ids: form.trims.map((t) => t.trim_id),
      image: form.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop'
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-white p-0">
        <DialogHeader className="px-7 pt-7 pb-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <DialogTitle className="text-xl font-semibold text-stone-900 tracking-tight">{initial ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <div data-ev-id="ev_adbf9a4d41" className="px-7 py-6 flex flex-col gap-7">
          <div data-ev-id="ev_ff3397fc6a" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-ev-id="ev_0b6aca0256"><Label className="text-xs text-stone-600">Nome *</Label><Input value={form.name} onChange={(e) => setField('name', e.target.value)} className="mt-1.5" placeholder="Ex: Vestido Fernanda" /></div>
            <div data-ev-id="ev_97969d6a4c"><Label className="text-xs text-stone-600">SKU</Label><Input value={form.sku} onChange={(e) => setField('sku', e.target.value)} className="mt-1.5" placeholder="Ex: VST-FER-001" /></div>
            <div data-ev-id="ev_4e58b37ad4"><Label className="text-xs text-stone-600">Código Interno</Label><Input value={form.internal_code} onChange={(e) => setField('internal_code', e.target.value)} className="mt-1.5" /></div>
            <div data-ev-id="ev_018ab88bf0"><Label className="text-xs text-stone-600">Categoria</Label><Select value={form.category} onValueChange={(v) => setField('category', v)}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{productCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div data-ev-id="ev_e439760a86"><Label className="text-xs text-stone-600">Cores disponíveis (separadas por vírgula)</Label><Input value={form.colors} onChange={(e) => setField('colors', e.target.value)} className="mt-1.5" placeholder="Rosa, Preto, Branco" /></div>
            <div data-ev-id="ev_83f28ec996"><Label className="text-xs text-stone-600">Tamanhos (separados por vírgula)</Label><Input value={form.sizes} onChange={(e) => setField('sizes', e.target.value)} className="mt-1.5" placeholder="P, M, G, GG" /></div>
            <div data-ev-id="ev_e71ca99af1"><Label className="text-xs text-stone-600">Estoque</Label><Input type="number" value={form.stock} onChange={(e) => setField('stock', e.target.value)} className="mt-1.5" /></div>
            <div data-ev-id="ev_87e505b5f4"><Label className="text-xs text-stone-600">Status</Label><Select value={form.status} onValueChange={(v) => setField('status', v)}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{productStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div data-ev-id="ev_93d91ef309"><Label className="text-xs text-stone-600">Descrição</Label><Textarea value={form.description} onChange={(e) => setField('description', e.target.value)} className="mt-1.5 min-h-[90px]" /></div>
          <div data-ev-id="ev_ee48f7c16e"><Label className="text-xs text-stone-600">URL da Imagem</Label><Input value={form.image} onChange={(e) => setField('image', e.target.value)} className="mt-1.5" placeholder="https://..." /></div>

          <section data-ev-id="ev_535b3a78ec" className="border-t border-stone-100 pt-6">
            <div data-ev-id="ev_fa80f2e00d" className="flex items-center justify-between mb-3">
              <div data-ev-id="ev_8d43865d8a" className="flex items-center gap-2"><Shirt className="w-4 h-4 text-stone-700" strokeWidth={1.75} /><h3 data-ev-id="ev_7144f896ee" className="text-base font-semibold text-stone-900">Tecidos utilizados</h3></div>
              <Button onClick={addFabric} type="button" size="sm" variant="outline" className="text-xs gap-1.5 h-8"><Plus className="w-3.5 h-3.5" /> Adicionar Tecido</Button>
            </div>
            {form.fabrics.length === 0 ? <p data-ev-id="ev_79a34ffd09" className="text-sm text-stone-400">Nenhum tecido adicionado.</p> :
            <div data-ev-id="ev_354d974886" className="flex flex-col gap-2">{form.fabrics.map((it) => {
                const f = fabrics.find((x) => x.id === it.fabric_id);
                const cost = (f?.price_per_meter || 0) * (Number(it.meters) || 0);
                return (
                  <div data-ev-id="ev_04c8519818" key={it.id} className="grid grid-cols-12 gap-2 items-center py-2 px-3 rounded-lg bg-stone-50 border border-stone-200">
                    <div data-ev-id="ev_9855fcf46d" className="col-span-6"><Select value={it.fabric_id} onValueChange={(v) => updateFabric(it.id, { fabric_id: v })}><SelectTrigger className="h-9 bg-white"><SelectValue placeholder="Selecionar tecido" /></SelectTrigger><SelectContent>{fabrics.map((f) => <SelectItem key={f.id} value={f.id}>{f.name} — {f.color}</SelectItem>)}</SelectContent></Select></div>
                    <div data-ev-id="ev_e2d174b974" className="col-span-3"><Input type="number" step="0.1" value={it.meters} onChange={(e) => updateFabric(it.id, { meters: Number(e.target.value) })} className="h-9 bg-white" placeholder="Metros" /></div>
                    <div data-ev-id="ev_28c57c4df9" className="col-span-2 text-sm font-medium text-stone-900 text-right">R$ {cost.toFixed(2)}</div>
                    <div data-ev-id="ev_35a4d9a153" className="col-span-1 flex justify-end"><button data-ev-id="ev_58edcdb859" onClick={() => removeFabric(it.id)} type="button" className="p-1.5 text-stone-400 hover:text-rose-700 rounded"><Trash2 className="w-3.5 h-3.5" /></button></div>
                  </div>);

              })}</div>}
          </section>

          <section data-ev-id="ev_1c180fd3c6" className="border-t border-stone-100 pt-6">
            <div data-ev-id="ev_1ce099276a" className="flex items-center justify-between mb-3">
              <div data-ev-id="ev_b402667d83" className="flex items-center gap-2"><Scissors className="w-4 h-4 text-stone-700" strokeWidth={1.75} /><h3 data-ev-id="ev_1cb12af31a" className="text-base font-semibold text-stone-900">Aviamentos utilizados</h3></div>
              <Button onClick={addTrim} type="button" size="sm" variant="outline" className="text-xs gap-1.5 h-8"><Plus className="w-3.5 h-3.5" /> Adicionar Aviamento</Button>
            </div>
            {form.trims.length === 0 ? <p data-ev-id="ev_41c77283d1" className="text-sm text-stone-400">Nenhum aviamento adicionado.</p> :
            <div data-ev-id="ev_0b359f4478" className="flex flex-col gap-2">{form.trims.map((it) => {
                const t = trims.find((x) => x.id === it.trim_id);
                const cost = (t?.price_per_unit || 0) * (Number(it.qty) || 0);
                return (
                  <div data-ev-id="ev_fc73ceb85e" key={it.id} className="grid grid-cols-12 gap-2 items-center py-2 px-3 rounded-lg bg-stone-50 border border-stone-200">
                    <div data-ev-id="ev_e111c4c3bf" className="col-span-6"><Select value={it.trim_id} onValueChange={(v) => updateTrim(it.id, { trim_id: v })}><SelectTrigger className="h-9 bg-white"><SelectValue placeholder="Selecionar aviamento" /></SelectTrigger><SelectContent>{trims.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} ({t.type})</SelectItem>)}</SelectContent></Select></div>
                    <div data-ev-id="ev_471b5ec9f3" className="col-span-3"><Input type="number" value={it.qty} onChange={(e) => updateTrim(it.id, { qty: Number(e.target.value) })} className="h-9 bg-white" placeholder="Qtd" /></div>
                    <div data-ev-id="ev_850b3fcc86" className="col-span-2 text-sm font-medium text-stone-900 text-right">R$ {cost.toFixed(2)}</div>
                    <div data-ev-id="ev_a6192ee61d" className="col-span-1 flex justify-end"><button data-ev-id="ev_33ba8f6291" onClick={() => removeTrim(it.id)} type="button" className="p-1.5 text-stone-400 hover:text-rose-700 rounded"><Trash2 className="w-3.5 h-3.5" /></button></div>
                  </div>);

              })}</div>}
          </section>

          <section data-ev-id="ev_bf0902260a" className="border-t border-stone-100 pt-6">
            <div data-ev-id="ev_1f386c0d59" className="flex items-center gap-2 mb-4"><Building2 className="w-4 h-4 text-stone-700" strokeWidth={1.75} /><h3 data-ev-id="ev_7cb8a5549d" className="text-base font-semibold text-stone-900">Fábrica e Custos de Produção</h3></div>
            <div data-ev-id="ev_aec5422199" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-ev-id="ev_26e6c9a0f7"><Label className="text-xs text-stone-600">Fábrica / Oficina responsável</Label><Select value={form.workshop_id} onValueChange={(v) => setField('workshop_id', v)}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecionar oficina" /></SelectTrigger><SelectContent>{workshops.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select></div>
              <div data-ev-id="ev_2072ea18a5"><Label className="text-xs text-stone-600">Mão de Obra (R$)</Label><Input type="number" step="0.01" value={form.labor_cost} onChange={(e) => setField('labor_cost', e.target.value)} className="mt-1.5" /></div>
              <div data-ev-id="ev_6dad57e26e"><Label className="text-xs text-stone-600">Custo Operacional (R$)</Label><Input type="number" step="0.01" value={form.operational_cost} onChange={(e) => setField('operational_cost', e.target.value)} className="mt-1.5" /></div>
              <div data-ev-id="ev_211b275853"><Label className="text-xs text-stone-600">Preço de Venda (R$)</Label><Input type="number" step="0.01" value={form.sale_price} onChange={(e) => setField('sale_price', e.target.value)} className="mt-1.5" /></div>
            </div>
            <div data-ev-id="ev_7fb4d30fb7" className="mt-5 p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <div data-ev-id="ev_409e4208ad" className="flex flex-col gap-1.5 text-sm">
                <div data-ev-id="ev_2dc66dc914" className="flex justify-between"><span data-ev-id="ev_746cb29f64" className="text-stone-600">Tecidos:</span><span data-ev-id="ev_3cca90a59b" className="font-medium text-stone-900">R$ {totals.fab.toFixed(2)}</span></div>
                <div data-ev-id="ev_67f2866f6c" className="flex justify-between"><span data-ev-id="ev_39ec5a7439" className="text-stone-600">Aviamentos:</span><span data-ev-id="ev_db14b43fc3" className="font-medium text-stone-900">R$ {totals.tri.toFixed(2)}</span></div>
                <div data-ev-id="ev_756f350090" className="flex justify-between"><span data-ev-id="ev_3c004f6af6" className="text-stone-600">Mão de obra:</span><span data-ev-id="ev_493fd7ccbd" className="font-medium text-stone-900">R$ {totals.labor.toFixed(2)}</span></div>
                <div data-ev-id="ev_a7c1aef990" className="flex justify-between"><span data-ev-id="ev_335b6b1063" className="text-stone-600">Operacional:</span><span data-ev-id="ev_cb1d2531fd" className="font-medium text-stone-900">R$ {totals.op.toFixed(2)}</span></div>
                <div data-ev-id="ev_2d296ddd8b" className="flex justify-between pt-2 mt-1 border-t border-stone-200"><span data-ev-id="ev_0b5ea41fd7" className="font-semibold text-stone-900">Custo Total:</span><span data-ev-id="ev_7ea7b94dbd" className="font-semibold text-stone-900">R$ {totals.total.toFixed(2)}</span></div>
                {Number(form.sale_price) > 0 && <div data-ev-id="ev_9399055ec4" className="flex justify-between"><span data-ev-id="ev_937940e968" className="text-stone-600">Margem estimada:</span><span data-ev-id="ev_f53e17c01c" className="font-semibold text-emerald-700">{totals.margin}%</span></div>}
              </div>
            </div>
          </section>
        </div>
        <DialogFooter className="px-7 py-4 border-t border-stone-100 bg-stone-50/50 sticky bottom-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-stone-900 hover:bg-stone-800 text-white">{initial ? 'Salvar' : 'Criar Produto'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}