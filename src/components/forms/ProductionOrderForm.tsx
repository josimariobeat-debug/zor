/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { mockProducts, mockWorkshops, mockFabrics } from '@/lib/mock-data';
import type { ProductionOrder } from '@/lib/types';

interface Variation {id: number;size: string;color: string;qty: number;}

interface ProductionOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<ProductionOrder>) => void;
  initial?: ProductionOrder | null;
}

export default function ProductionOrderForm({ open, onOpenChange, onSave, initial = null }: ProductionOrderFormProps) {
  const [products] = useState(mockProducts);
  const [workshops] = useState(mockWorkshops);
  const [fabrics] = useState(mockFabrics);
  const today = new Date().toISOString().slice(0, 10);
  const empty = { product_id: '', workshop_id: '', fabric_id: '', quantity: 1, status: 'modelagem', start_date: today, deadline: today, variations: [] as Variation[] };
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          ...empty,
          ...initial,
          variations: (initial.variations || []).map((v, i) => ({ ...v, id: i }))
        });
      } else setForm(empty);
    }
  }, [open, initial]);

  const product = products.find((p) => p.id === form.product_id);
  const fabric = fabrics.find((f) => f.id === form.fabric_id);
  const workshop = workshops.find((w) => w.id === form.workshop_id);
  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const addVariation = () => {
    const size = product?.sizes?.[0] || 'M';
    const color = product?.colors?.[0] || '';
    setForm((p) => ({ ...p, variations: [...p.variations, { id: Date.now(), size, color, qty: 1 }] }));
  };
  const removeVariation = (id: number) => setForm((p) => ({ ...p, variations: p.variations.filter((v) => v.id !== id) }));
  const updateVariation = (id: number, patch: Partial<Variation>) => setForm((p) => ({ ...p, variations: p.variations.map((v) => v.id === id ? { ...v, ...patch } : v) }));

  const totalQty = useMemo(() => {
    if (form.variations.length === 0) return Number(form.quantity) || 0;
    return form.variations.reduce((s, v) => s + (Number(v.qty) || 0), 0);
  }, [form.variations, form.quantity]);

  const consumedMeters = (product?.meters_per_unit || 0) * totalQty;
  const fabricAvailable = fabric?.stock || 0;
  const efficiency = fabricAvailable > 0 ? Math.min(100, Math.round(consumedMeters / fabricAvailable * 100)) : 0;

  const totalCost = useMemo(() => {
    if (!product) return 0;
    return (product.cost_price || 0) * totalQty + (workshop?.price_per_piece || 0) * totalQty;
  }, [product, workshop, totalQty]);
  const totalRevenue = (product?.sale_price || 0) * totalQty;

  const submit = () => {
    if (!form.product_id) return;
    onSave({
      product_id: form.product_id,
      product_name: product?.name || '',
      workshop_id: form.workshop_id,
      workshop_name: workshop?.name || '',
      fabric_id: form.fabric_id,
      quantity: totalQty,
      variations: form.variations.map(({ id, ...v }) => ({ ...v, qty: Number(v.qty) })),
      status: form.status,
      start_date: form.start_date,
      deadline: form.deadline,
      total_cost: totalCost,
      total_revenue: totalRevenue
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-white p-0">
        <DialogHeader className="px-7 pt-7 pb-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <DialogTitle className="text-xl font-semibold text-stone-900 tracking-tight">{initial ? `Editar OP ${initial.number || ''}` : 'Nova Ordem de Produção'}</DialogTitle>
        </DialogHeader>
        <div data-ev-id="ev_79b1b77123" className="px-7 py-6 flex flex-col gap-6">
          <div data-ev-id="ev_b95e0c5f1b" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div data-ev-id="ev_e848f05d72">
              <Label className="text-xs text-stone-600">Produto *</Label>
              <Select value={form.product_id} onValueChange={(v) => set('product_id', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
                <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div data-ev-id="ev_d164620b40">
              <Label className="text-xs text-stone-600">Oficina responsável</Label>
              <Select value={form.workshop_id} onValueChange={(v) => set('workshop_id', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecionar oficina" /></SelectTrigger>
                <SelectContent>{workshops.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div data-ev-id="ev_199e26e959">
              <Label className="text-xs text-stone-600">Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{['modelagem', 'corte', 'costura', 'revisao', 'finalizado', 'cancelado'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div data-ev-id="ev_be8e28f279">
              <Label className="text-xs text-stone-600">Quantidade (sem variações)</Label>
              <Input type="number" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} className="mt-1.5" disabled={form.variations.length > 0} />
            </div>
            <div data-ev-id="ev_1366082203">
              <Label className="text-xs text-stone-600">Data de início</Label>
              <Input type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} className="mt-1.5" />
            </div>
            <div data-ev-id="ev_1736234d3f">
              <Label className="text-xs text-stone-600">Prazo de entrega</Label>
              <Input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className="mt-1.5" />
            </div>
          </div>

          <section data-ev-id="ev_8b8692a865" className="border border-stone-200 rounded-xl p-4 bg-stone-50/50">
            <h3 data-ev-id="ev_2966b6c5e5" className="text-sm font-semibold text-stone-900 mb-3">Tecido utilizado</h3>
            <div data-ev-id="ev_d14a7e8d42" className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div data-ev-id="ev_901e170502" className="md:col-span-2">
                <Label className="text-xs text-stone-600">Tecido cadastrado</Label>
                <Select value={form.fabric_id} onValueChange={(v) => set('fabric_id', v)}>
                  <SelectTrigger className="mt-1.5 bg-white"><SelectValue placeholder="Selecionar tecido" /></SelectTrigger>
                  <SelectContent>{fabrics.map((f) => <SelectItem key={f.id} value={f.id}>{f.name} — {f.color} ({f.stock}m)</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div data-ev-id="ev_9ceb17d9de">
                <Label className="text-xs text-stone-600">Metros disponíveis</Label>
                <Input value={fabricAvailable ? `${fabricAvailable}m` : '-'} readOnly className="mt-1.5 bg-stone-100 pointer-events-none" />
              </div>
            </div>
            {form.fabric_id &&
            <div data-ev-id="ev_0a005f2c44" className="mt-3">
                <div data-ev-id="ev_59e6a7604e" className="flex items-center justify-between text-xs">
                  <span data-ev-id="ev_da9deaa6db" className="text-stone-600">Consumo: <strong data-ev-id="ev_9fcc1c7b02">{consumedMeters.toFixed(2)}m</strong> / Sobra: <strong data-ev-id="ev_85368a2453">{Math.max(0, fabricAvailable - consumedMeters).toFixed(2)}m</strong></span>
                  <span data-ev-id="ev_3e2364d3db" className="font-semibold text-stone-900">{efficiency}%</span>
                </div>
                <div data-ev-id="ev_71744015fd" className="mt-1.5 h-1.5 bg-stone-200 rounded-full overflow-hidden"><div data-ev-id="ev_b19d1651ab" className="h-full bg-stone-900 transition-all" style={{ width: `${efficiency}%` }} /></div>
              </div>
            }
          </section>

          <section data-ev-id="ev_1f7acdf261">
            <div data-ev-id="ev_270a177877" className="flex items-center justify-between mb-3">
              <h3 data-ev-id="ev_559223a4ba" className="text-sm font-semibold text-stone-900">Variações (tamanho/cor)</h3>
              <Button onClick={addVariation} type="button" size="sm" variant="outline" disabled={!product} className="text-xs gap-1.5 h-8"><Plus className="w-3.5 h-3.5" /> Adicionar</Button>
            </div>
            {form.variations.length === 0 ? <p data-ev-id="ev_6ed85123a6" className="text-sm text-stone-400">Nenhuma variação. Usará a quantidade geral acima.</p> :
            <div data-ev-id="ev_3796203a93" className="flex flex-col gap-2">{form.variations.map((v) =>
              <div data-ev-id="ev_8511c6a93f" key={v.id} className="grid grid-cols-12 gap-2 items-center py-2 px-3 rounded-lg bg-stone-50 border border-stone-200">
                  <div data-ev-id="ev_0a74a81c2d" className="col-span-4"><Select value={v.size} onValueChange={(val) => updateVariation(v.id, { size: val })}><SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger><SelectContent>{(product?.sizes || ['P', 'M', 'G']).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                  <div data-ev-id="ev_22b15f31f9" className="col-span-4"><Select value={v.color} onValueChange={(val) => updateVariation(v.id, { color: val })}><SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger><SelectContent>{(product?.colors || ['Preto']).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                  <div data-ev-id="ev_8497fbd491" className="col-span-3"><Input type="number" value={v.qty} onChange={(e) => updateVariation(v.id, { qty: Number(e.target.value) })} className="h-9 bg-white" placeholder="Qtd" /></div>
                  <div data-ev-id="ev_afdf3f2f43" className="col-span-1 flex justify-end"><button data-ev-id="ev_78e35d670f" onClick={() => removeVariation(v.id)} type="button" className="p-1.5 text-stone-400 hover:text-rose-700 rounded"><Trash2 className="w-3.5 h-3.5" /></button></div>
                </div>
              )}</div>
            }
          </section>

          <section data-ev-id="ev_5974a37977" className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
            <div data-ev-id="ev_b3b023d3af" className="flex flex-col gap-1.5 text-sm">
              <div data-ev-id="ev_32de19df3c" className="flex justify-between"><span data-ev-id="ev_89466e181f" className="text-stone-600">Total de peças:</span><span data-ev-id="ev_a9f4acd184" className="font-semibold text-stone-900">{totalQty}</span></div>
              <div data-ev-id="ev_1552693f2b" className="flex justify-between"><span data-ev-id="ev_bc1c8d0e29" className="text-stone-600">Custo total estimado:</span><span data-ev-id="ev_ab555a9fb0" className="font-medium text-stone-900">R$ {totalCost.toFixed(2)}</span></div>
              <div data-ev-id="ev_f8a3961d96" className="flex justify-between"><span data-ev-id="ev_d777bb4cc0" className="text-stone-600">Receita esperada:</span><span data-ev-id="ev_f3a87cc143" className="font-medium text-stone-900">R$ {totalRevenue.toFixed(2)}</span></div>
              <div data-ev-id="ev_afc4f7e336" className="flex justify-between pt-2 mt-1 border-t border-stone-200"><span data-ev-id="ev_c0951e1ed0" className="font-semibold text-stone-900">Lucro estimado:</span><span data-ev-id="ev_4b1b10a94d" className="font-semibold text-emerald-700">R$ {(totalRevenue - totalCost).toFixed(2)}</span></div>
            </div>
          </section>
        </div>
        <DialogFooter className="px-7 py-4 border-t border-stone-100 bg-stone-50/50 sticky bottom-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} className="bg-stone-900 hover:bg-stone-800 text-white">{initial ? 'Salvar' : 'Criar OP'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}