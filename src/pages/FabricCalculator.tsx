import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Calculator as CalcIcon } from 'lucide-react';
import { mockFabrics, mockProducts } from '@/lib/mock-data';

export default function FabricCalculator() {
  const [fabrics] = useState(mockFabrics);
  const [products] = useState(mockProducts);
  const [fabricId, setFabricId] = useState('');
  const [meters, setMeters] = useState(50);
  const [wastePct, setWastePct] = useState(10);
  const [items, setItems] = useState<{id: number;product_id: string;qty: number;}[]>([]);

  useEffect(() => {
    if (fabrics.length) setFabricId(fabrics[0].id);
    if (products.length >= 2) setItems([{ id: 1, product_id: products[0].id, qty: 10 }, { id: 2, product_id: products[1].id, qty: 15 }]);else
    if (products.length >= 1) setItems([{ id: 1, product_id: products[0].id, qty: 10 }]);
  }, [fabrics, products]);

  const fabric = fabrics.find((f) => f.id === fabricId);
  const usableMeters = meters * (1 - wastePct / 100);
  const consumed = items.reduce((s, it) => {
    const p = products.find((pr) => pr.id === it.product_id);
    return s + (p?.meters_per_unit || 0) * (Number(it.qty) || 0);
  }, 0);
  const efficiency = usableMeters > 0 ? Math.min(100, Math.round(consumed / usableMeters * 100)) : 0;
  const totalRevenue = items.reduce((s, it) => {const p = products.find((pr) => pr.id === it.product_id);return s + (p?.sale_price || 0) * (Number(it.qty) || 0);}, 0);
  const totalCost = (fabric?.price_per_meter || 0) * meters + items.reduce((s, it) => {const p = products.find((pr) => pr.id === it.product_id);return s + (p?.cost_price || 0) * (Number(it.qty) || 0);}, 0);

  const addItem = () => products[0] && setItems([...items, { id: Date.now(), product_id: products[0].id, qty: 1 }]);
  const removeItem = (id: number) => setItems(items.filter((i) => i.id !== id));

  return (
    <div data-ev-id="ev_6e95e47a44" className="flex flex-col gap-6">
      <header data-ev-id="ev_e0490222c6">
        <h1 data-ev-id="ev_77b730d288" className="text-[26px] font-semibold text-stone-900 tracking-tight">Calculadora de Tecido</h1>
        <p data-ev-id="ev_bc8df1599d" className="text-sm text-stone-500 mt-1">Simule o aproveitamento de uma peça de tecido com múltiplos produtos</p>
      </header>
      <div data-ev-id="ev_8c3d480205" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div data-ev-id="ev_b02617386a" className="lg:col-span-2 flex flex-col gap-5">
          <Card className="p-6 bg-white border-stone-200/80 shadow-none">
            <h3 data-ev-id="ev_8092b5a8b2" className="text-sm font-semibold text-stone-900 mb-4">1. Selecione o Tecido</h3>
            <div data-ev-id="ev_dad404ee3f" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div data-ev-id="ev_b3c6a404f1" className="sm:col-span-2">
                <Label className="text-xs text-stone-600">Tecido cadastrado</Label>
                <select data-ev-id="ev_d27862d0f8" value={fabricId} onChange={(e) => setFabricId(e.target.value)} className="mt-1 w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm">
                  {fabrics.map((f) => <option data-ev-id="ev_9668531aba" key={f.id} value={f.id}>{f.name} — {f.color}</option>)}
                </select>
              </div>
              <div data-ev-id="ev_624a018308"><Label className="text-xs text-stone-600">Total de metros</Label><Input type="number" value={meters} onChange={(e) => setMeters(+e.target.value || 0)} className="mt-1" /></div>
              <div data-ev-id="ev_b49dec8acc"><Label className="text-xs text-stone-600">% Desperdício</Label><Input type="number" value={wastePct} onChange={(e) => setWastePct(+e.target.value || 0)} className="mt-1" /></div>
            </div>
          </Card>
          <Card className="p-6 bg-white border-stone-200/80 shadow-none">
            <div data-ev-id="ev_d26b674059" className="flex items-center justify-between mb-4">
              <h3 data-ev-id="ev_f5c979052d" className="text-sm font-semibold text-stone-900">2. Produtos a Fabricar</h3>
              <Button onClick={addItem} size="sm" variant="outline" className="text-xs gap-1.5 h-8"><Plus className="w-3.5 h-3.5" /> Adicionar Produto</Button>
            </div>
            <div data-ev-id="ev_ac59b7835f" className="flex flex-col gap-2">
              {items.map((it) => {
                const p = products.find((pr) => pr.id === it.product_id);
                return (
                  <div data-ev-id="ev_5a362bc086" key={it.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-stone-50 border border-stone-200">
                    <select data-ev-id="ev_62f8d58f65" value={it.product_id} onChange={(e) => setItems(items.map((i) => i.id === it.id ? { ...i, product_id: e.target.value } : i))} className="flex-1 h-9 px-2 rounded-md border border-stone-200 bg-white text-sm">
                      {products.map((p) => <option data-ev-id="ev_4c0c703628" key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <Input type="number" value={it.qty} onChange={(e) => setItems(items.map((i) => i.id === it.id ? { ...i, qty: +e.target.value || 0 } : i))} className="w-24 h-9" />
                    <span data-ev-id="ev_11fda24660" className="text-xs text-stone-500 w-20">{p ? ((p.meters_per_unit || 0) * it.qty).toFixed(2) : 0}m</span>
                    <button data-ev-id="ev_b05840c84d" onClick={() => removeItem(it.id)} className="p-1.5 text-stone-400 hover:text-rose-700 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>);

              })}
            </div>
          </Card>
        </div>
        <Card className="p-6 bg-white border-stone-200/80 shadow-none h-fit sticky top-6">
          <div data-ev-id="ev_94567737ab" className="flex items-center gap-2 mb-4"><CalcIcon className="w-4 h-4 text-stone-700" /><h3 data-ev-id="ev_c70c79dc26" className="text-sm font-semibold text-stone-900">Resultado</h3></div>
          <div data-ev-id="ev_2b1733a3c0" className="flex flex-col gap-3 text-sm">
            <div data-ev-id="ev_e9edd1ed80"><div data-ev-id="ev_304112067e" className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Aproveitamento</div><div data-ev-id="ev_8cccfacb89" className="flex items-center gap-2 mt-1"><div data-ev-id="ev_1790f568fa" className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden"><div data-ev-id="ev_e93dd0f1d5" className="h-full bg-stone-900 rounded-full transition-all" style={{ width: `${efficiency}%` }} /></div><span data-ev-id="ev_6a6f0ba3b1" className="text-sm font-semibold text-stone-900">{efficiency}%</span></div></div>
            <div data-ev-id="ev_33ade6b66f" className="flex justify-between"><span data-ev-id="ev_cb25ba209b" className="text-stone-500">Metros usados</span><span data-ev-id="ev_c328d58003" className="font-medium">{consumed.toFixed(2)}m</span></div>
            <div data-ev-id="ev_e2ee321509" className="flex justify-between"><span data-ev-id="ev_1a1f51971f" className="text-stone-500">Metros úteis</span><span data-ev-id="ev_82c91a75c4" className="font-medium">{usableMeters.toFixed(2)}m</span></div>
            <div data-ev-id="ev_cc07a06049" className="flex justify-between"><span data-ev-id="ev_0ddb09d915" className="text-stone-500">Sobra</span><span data-ev-id="ev_6dd81688ab" className="font-medium">{Math.max(0, usableMeters - consumed).toFixed(2)}m</span></div>
            <div data-ev-id="ev_748d401478" className="pt-3 mt-3 border-t border-stone-100 flex flex-col gap-2">
              <div data-ev-id="ev_0eb3315c3d" className="flex justify-between"><span data-ev-id="ev_09d4205303" className="text-stone-500">Custo total</span><span data-ev-id="ev_6ead559fcf" className="font-medium text-stone-900">R$ {totalCost.toFixed(2)}</span></div>
              <div data-ev-id="ev_11da1ebe26" className="flex justify-between"><span data-ev-id="ev_1640d69baf" className="text-stone-500">Receita esperada</span><span data-ev-id="ev_61cc95c975" className="font-medium text-stone-900">R$ {totalRevenue.toFixed(2)}</span></div>
              <div data-ev-id="ev_233f01774a" className="flex justify-between text-base font-semibold pt-2 border-t border-stone-100"><span data-ev-id="ev_0d4b287312">Lucro</span><span data-ev-id="ev_b8685fc09d" className="text-emerald-700">R$ {(totalRevenue - totalCost).toFixed(2)}</span></div>
            </div>
          </div>
        </Card>
      </div>
    </div>);

}