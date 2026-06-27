import ScissorsLoader, { PageLoader } from '@/components/ScissorsLoader';
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSupabaseData, useProductionOrders } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { X, Plus, Trash2, Loader2, Settings, AlertTriangle, Scissors } from 'lucide-react';
import { useCloseFormConfirm } from '@/hooks/useCloseFormConfirm';
import { getFabricUnitCost } from '@/lib/fabric-cost';



interface Product {
  id: string;
  name: string;
  image?: string;
  sizes: string[];
  colors: string[];
  sale_price: number;
  cost_price?: number;
  fabrics_cost?: number;
  trims_cost?: number;
  labor_cost?: number;
}
interface Fabric {id: string;name: string;stock: number;price_per_meter: number;operational_cost?: number | null;}
interface Workshop {id: string;name: string;price_per_piece: number;}

interface Variation {size: string;color: string;qty: number;meters_per_piece: number;}
interface OrderItem {product_id: string;product_name: string;product_image?: string;variations: Variation[];}

export default function ProductionOrderFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const handleClose = useCloseFormConfirm('/ordens');

  const { user } = useAuth();
  const { data: allOrders, create, update, loading: opLoading } = useProductionOrders();
  const { data: products } = useSupabaseData<Product>('products');
  const { data: fabrics } = useSupabaseData<Fabric>('fabrics');
  const { data: workshops } = useSupabaseData<Workshop>('workshops');

  const isEditing = Boolean(id);
  const existingOrder = isEditing ? allOrders.find((o) => o.id === id) : null;

  const [form, setForm] = useState({
    fabric_id: '',
    workshop_id: '',
    status: 'modelagem',
    priority: 'normal',
    start_date: new Date().toISOString().split('T')[0],
    deadline: '',
    observations: ''
  });

  const [items, setItems] = useState<OrderItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mapa: product_id -> total de metros cadastrados (soma de product_fabrics.meters_used)
  const [productMetersMap, setProductMetersMap] = useState<Record<string, number>>({});
  // Mapa: product_id -> aviamentos cadastrados [{trim_id, trim_name, quantity}]
  const [productTrimsMap, setProductTrimsMap] = useState<Record<string, Array<{ trim_id: string; trim_name: string; quantity: number }>>>({});

  useEffect(() => {
    if (!supabase || !user) return;
    (async () => {
      const [{ data: pf }, { data: pt }] = await Promise.all([
        supabase.from('product_fabrics').select('product_id, meters_used'),
        supabase.from('product_trims').select('product_id, trim_id, trim_name, quantity'),
      ]);
      const meters: Record<string, number> = {};
      (pf || []).forEach((r: any) => {
        meters[r.product_id] = (meters[r.product_id] || 0) + Number(r.meters_used || 0);
      });
      setProductMetersMap(meters);
      const trims: Record<string, Array<{ trim_id: string; trim_name: string; quantity: number }>> = {};
      (pt || []).forEach((r: any) => {
        if (!r.trim_id) return;
        (trims[r.product_id] = trims[r.product_id] || []).push({
          trim_id: r.trim_id,
          trim_name: r.trim_name || '',
          quantity: Number(r.quantity || 0),
        });
      });
      setProductTrimsMap(trims);
    })();
  }, [user]);

  // Carregar dados existentes ao editar
  useEffect(() => {
    if (isEditing && existingOrder && !loaded) {
      setForm({
        fabric_id: existingOrder.fabric_id || '',
        workshop_id: existingOrder.workshop_id || '',
        status: existingOrder.status || 'modelagem',
        priority: existingOrder.priority || 'normal',
        start_date: existingOrder.start_date || '',
        deadline: existingOrder.deadline || '',
        observations: existingOrder.observations || ''
      });

      // Carregar itens e variações
      const loadedItems: OrderItem[] = (existingOrder.items || []).map((item: any) => ({
        product_id: item.product_id || '',
        product_name: item.product_name || '',
        product_image: products.find((p) => p.id === item.product_id)?.image,
        variations: (item.variations || []).map((v: any) => ({
          size: v.size || '',
          color: v.color || '',
          qty: v.qty || 0,
          meters_per_piece: v.meters_per_piece || 0.8
        }))
      }));

      setItems(loadedItems);
      setLoaded(true);
    }
  }, [isEditing, existingOrder, loaded, products]);

  const selectedFabric = fabrics.find((f) => f.id === form.fabric_id);
  const selectedWorkshop = workshops.find((w) => w.id === form.workshop_id);

  // Calculate totals
  const totalQty = useMemo(() => {
    return items.reduce((sum, item) => sum + item.variations.reduce((s, v) => s + v.qty, 0), 0);
  }, [items]);

  const totalMeters = useMemo(() => {
    return items.reduce((sum, item) => sum + item.variations.reduce((s, v) => s + v.qty * v.meters_per_piece, 0), 0);
  }, [items]);

  const fabricUnitCost = getFabricUnitCost(selectedFabric);
  const fabricCost = selectedFabric ? totalMeters * fabricUnitCost : 0;

  // Calculate per-item costs - usando labor_cost do produto
  const getItemCosts = (item: OrderItem) => {
    const product = products.find((p) => p.id === item.product_id);
    const itemQty = item.variations.reduce((s, v) => s + v.qty, 0);
    const itemMeters = item.variations.reduce((s, v) => s + v.qty * v.meters_per_piece, 0);

    const fabricCostItem = selectedFabric ? itemMeters * fabricUnitCost : 0;

    const trimsCostItem = (product?.trims_cost || 0) * itemQty;

    // Usar labor_cost do produto se existir, senão usa o preço da oficina
    const laborCostPerPiece = product?.labor_cost || selectedWorkshop?.price_per_piece || 0;
    const laborCostItem = laborCostPerPiece * itemQty;

    const totalItem = fabricCostItem + trimsCostItem + laborCostItem;
    const unitCost = itemQty > 0 ? totalItem / itemQty : 0;

    return { unitCost, totalItem, fabricCostItem, trimsCostItem, laborCostItem, itemQty, laborCostPerPiece };
  };

  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => sum + getItemCosts(item).totalItem, 0);
  }, [items, selectedFabric, selectedWorkshop, products]);

  const totalRevenue = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id);
      const qty = item.variations.reduce((s, v) => s + v.qty, 0);
      return sum + qty * (product?.sale_price || 0);
    }, 0);
  }, [items, products]);

  // Aviamentos consolidados a partir dos produtos selecionados (mesma lógica do tecido)
  const trimsUsed = useMemo(() => {
    const agg: Record<string, { trim_id: string; trim_name: string; qty_per_piece: number; total_qty: number }> = {};
    items.forEach((item) => {
      const list = productTrimsMap[item.product_id] || [];
      const totalPieces = item.variations.reduce((s, v) => s + (Number(v.qty) || 0), 0);
      list.forEach((t) => {
        if (!agg[t.trim_id]) {
          agg[t.trim_id] = { trim_id: t.trim_id, trim_name: t.trim_name, qty_per_piece: t.quantity, total_qty: 0 };
        }
        agg[t.trim_id].total_qty += totalPieces * Number(t.quantity || 0);
      });
    });
    return Object.values(agg);
  }, [items, productTrimsMap]);

  // Aviso de estoque de tecido insuficiente
  const fabricStockExceeded = !!selectedFabric && totalMeters > 0 && totalMeters > Number(selectedFabric.stock || 0);


  // Add product
  const addProduct = () => {
    setItems([...items, { product_id: '', product_name: '', variations: [] }]);
  };

  const removeProduct = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const defaultMetersFor = (productId: string) => {
    const m = productMetersMap[productId];
    return m && m > 0 ? m : 0.8;
  };

  const updateProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const meters = defaultMetersFor(productId);
    const newItems = [...items];
    newItems[index] = {
      product_id: productId,
      product_name: product.name,
      product_image: product.image,
      variations: [{ size: '', color: '', qty: 1, meters_per_piece: meters }]
    };
    setItems(newItems);
  };

  const addVariation = (itemIndex: number) => {
    const newItems = [...items];
    const productId = newItems[itemIndex].product_id;
    newItems[itemIndex].variations.push({ size: '', color: '', qty: 1, meters_per_piece: defaultMetersFor(productId) });
    setItems(newItems);
  };

  const updateVariation = (itemIndex: number, varIndex: number, field: keyof Variation, value: any) => {
    const newItems = [...items];
    (newItems[itemIndex].variations[varIndex] as any)[field] = value;
    setItems(newItems);
  };

  const removeVariation = (itemIndex: number, varIndex: number) => {
    const newItems = [...items];
    newItems[itemIndex].variations = newItems[itemIndex].variations.filter((_, i) => i !== varIndex);
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (submitting) return; // Prevenir múltiplos cliques
    
    if (items.length === 0 || items.every((i) => i.variations.length === 0)) {
      toast({ title: 'Erro', description: 'Adicione pelo menos um produto com variações', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    
    try {
      const orderData = {
        fabric_id: form.fabric_id || null,
        fabric_name: selectedFabric?.name || '',
        fabric_meters_consumed: totalMeters,
        workshop_id: form.workshop_id || null,
        workshop_name: selectedWorkshop?.name || '',
        quantity: totalQty,
        status: form.status,
        priority: form.priority,
        start_date: form.start_date || null,
        deadline: form.deadline || null,
        observations: form.observations,
        total_cost: totalCost,
        total_revenue: totalRevenue,
        items,
        trims_used: trimsUsed
      };

      if (isEditing && id) {
        const result = await update(id, orderData);
        if (result) {
          toast({ title: 'OP atualizada', description: `${existingOrder?.number || 'OP'} atualizada com sucesso` });
          navigate('/ordens');
        }
      } else {
        const result = await create(orderData);
        if (result) {
          toast({ title: 'OP criada', description: `${result.number} criada com sucesso` });
          navigate('/ordens');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (opLoading && isEditing && !loaded) {
    return (
      <PageLoader />);

  }

  return (
    <div data-ev-id="ev_a7492ae355" className="min-h-screen bg-white">
      <div data-ev-id="ev_af48a5bd68" className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div data-ev-id="ev_c1bcfdd743" className="flex items-center justify-between mb-8">
          <h1 data-ev-id="ev_f4fff16b7a" className="text-xl font-semibold text-stone-900">
            {isEditing ? `Editar ${existingOrder?.number || 'OP'}` : 'Nova OP'}
          </h1>
          <button data-ev-id="ev_3aaafd071b" onClick={handleClose} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div data-ev-id="ev_bb96a84c4f" className="flex flex-col gap-8">
          {/* Tecido da Produção */}
          <Card className="p-5 border-stone-200">
            <div data-ev-id="ev_63264cf3e8" className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-stone-500" />
              <h2 data-ev-id="ev_c8043e4c0b" className="text-base font-semibold text-stone-900">Tecido da Produção</h2>
            </div>
            <div data-ev-id="ev_6770d58d45" className="grid grid-cols-2 gap-4">
              <div data-ev-id="ev_162cb0ad2b">
                <label data-ev-id="ev_749217a3e4" className="block text-sm font-medium text-stone-700 mb-1.5">Tecido cadastrado</label>
                <Select value={form.fabric_id} onValueChange={(v) => setForm({ ...form, fabric_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar tecido (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {fabrics.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div data-ev-id="ev_647bee5ddf">
                <label data-ev-id="ev_20bc81c440" className="block text-sm font-medium text-stone-700 mb-1.5">Saldo em estoque</label>
                <Input
                  value={selectedFabric ? `${Number(selectedFabric.stock).toFixed(2)} m` : ''}
                  disabled
                  className={`bg-stone-50 ${fabricStockExceeded ? 'border-rose-300 text-rose-700' : ''}`}
                />
              </div>
            </div>
            {selectedFabric && totalMeters > 0 && (
              <div className={`mt-3 flex items-start gap-2 rounded-md px-3 py-2 text-sm ${fabricStockExceeded ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-stone-50 text-stone-600 border border-stone-200'}`}>
                {fabricStockExceeded && <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <div>
                  <strong>{totalMeters.toFixed(2)} m</strong> serão separados de <strong>{Number(selectedFabric.stock).toFixed(2)} m</strong> em estoque.
                  {fabricStockExceeded && (
                    <span className="block mt-0.5 font-medium">
                      Quantidade excede o estoque disponível em {(totalMeters - Number(selectedFabric.stock)).toFixed(2)} m.
                    </span>
                  )}
                </div>
              </div>
            )}
          </Card>



          {/* Produtos da OP */}
          <div data-ev-id="ev_65197c520f">
            <div data-ev-id="ev_2c766b61df" className="flex items-center justify-between mb-4">
              <h2 data-ev-id="ev_f5cdc04f7e" className="text-base font-semibold text-stone-900">Produtos da OP</h2>
              <Button
                type="button"
                size="sm"
                onClick={addProduct}
                className="gap-1.5 text-sm bg-stone-900 hover:bg-stone-800 text-white shadow-sm hover:shadow-md transition-all">
                <Plus className="w-4 h-4" /> Adicionar Produto
              </Button>
            </div>

            <div data-ev-id="ev_5b0415dd1c" className="flex flex-col gap-4">
              {items.map((item, itemIdx) => {
                const product = products.find((p) => p.id === item.product_id);
                const costs = getItemCosts(item);

                return (
                  <Card key={itemIdx} className="p-5 border-stone-200">
                    <div data-ev-id="ev_1aaee57be8" className="flex items-start gap-3 mb-4">
                      {/* Product Image */}
                      <div data-ev-id="ev_aa350e622d" className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.product_image ?
                        <img data-ev-id="ev_962af517ba" src={item.product_image} alt="" className="w-full h-full object-cover" /> :

                        <div data-ev-id="ev_fb62a06608" className="w-full h-full bg-stone-200" />
                        }
                      </div>
                      <div data-ev-id="ev_e8e086020e" className="flex-1">
                        <label data-ev-id="ev_064aeca786" className="block text-sm font-medium text-stone-700 mb-1.5">Produto *</label>
                        <Select value={item.product_id} onValueChange={(v) => updateProduct(itemIdx, v)}>
                          <SelectTrigger><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
                          <SelectContent>
                            {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <button data-ev-id="ev_e8928d0efb" onClick={() => removeProduct(itemIdx)} className="p-2 text-stone-400 hover:text-rose-500 transition-colors mt-6">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {product &&
                    <>
                        {/* Info do produto - mostra o labor_cost */}
                        {product.labor_cost && product.labor_cost > 0 &&
                      <div data-ev-id="ev_18c6ca02b7" className="text-xs text-stone-500 mb-3 px-1">
                            Mão de obra cadastrada: <span data-ev-id="ev_457b9d09d4" className="font-medium text-stone-700">R$ {product.labor_cost.toFixed(2)}/pç</span>
                          </div>
                      }

                        {/* Variations Header */}
                        <div data-ev-id="ev_47e8423e72" className="grid grid-cols-[1fr_1fr_80px_80px_32px] gap-2 text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 px-1">
                          <span data-ev-id="ev_bc5d299b20">Tamanho</span>
                          <span data-ev-id="ev_a146eac984">Cor</span>
                          <span data-ev-id="ev_ce42915d5b">Qtd</span>
                          <span data-ev-id="ev_9cd090feac">Metros/pç</span>
                          <span data-ev-id="ev_41823eb9ca"></span>
                        </div>

                        {/* Variations */}
                        <div data-ev-id="ev_7297bd543c" className="flex flex-col gap-2 mb-3">
                          {item.variations.map((v, varIdx) =>
                        <div data-ev-id="ev_ab1cfdfab8" key={varIdx} className="grid grid-cols-[1fr_1fr_80px_80px_32px] gap-2 items-center">
                              <Select value={v.size} onValueChange={(val) => updateVariation(itemIdx, varIdx, 'size', val)}>
                                <SelectTrigger><SelectValue placeholder="Tam." /></SelectTrigger>
                                <SelectContent>
                                  {product.sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <Select value={v.color} onValueChange={(val) => updateVariation(itemIdx, varIdx, 'color', val)}>
                                <SelectTrigger><SelectValue placeholder="Cor" /></SelectTrigger>
                                <SelectContent>
                                  {product.colors.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <NumberInput value={v.qty} onChange={(val) => updateVariation(itemIdx, varIdx, 'qty', val ?? 0)} min={1} className="text-center" placeholder="0" />
                              <NumberInput step="0.1" value={v.meters_per_piece} onChange={(val) => updateVariation(itemIdx, varIdx, 'meters_per_piece', val ?? 0)} min={0} className="text-center" placeholder="0" />
                              <button data-ev-id="ev_c17b764b2a" onClick={() => removeVariation(itemIdx, varIdx)} className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                        )}
                        </div>

                        <button data-ev-id="ev_3d05afe929" onClick={() => addVariation(itemIdx)} className="text-sm text-stone-500 hover:text-stone-700 flex items-center gap-1 mb-4">
                          <Plus className="w-3 h-3" /> Adicionar variação
                        </button>

                        {/* Cost Summary Line */}
                        <div data-ev-id="ev_3d39f321d4" className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 pt-3 border-t border-stone-100">
                          <span data-ev-id="ev_197971bfe8">Custo unit.: <strong data-ev-id="ev_d1f50f707e" className="text-stone-900">R$ {costs.unitCost.toFixed(2)}</strong></span>
                          <span data-ev-id="ev_f30aadee86">Total ({costs.itemQty} pç): <strong data-ev-id="ev_549de1db8b" className="text-stone-900">R$ {costs.totalItem.toFixed(2)}</strong></span>
                          <span data-ev-id="ev_f44bbac207">Tecido: <strong data-ev-id="ev_7f11106f5e">R$ {costs.fabricCostItem.toFixed(2)}</strong></span>
                          <span data-ev-id="ev_7ef873edae">Aviamentos: <strong data-ev-id="ev_7db64a518c">R$ {costs.trimsCostItem.toFixed(2)}</strong></span>
                          <span data-ev-id="ev_85b9fca974">M.O: <strong data-ev-id="ev_82e1f9e5bf">R$ {costs.laborCostItem.toFixed(2)}</strong></span>
                        </div>
                      </>
                    }
                  </Card>);

              })}
            </div>
          </div>

          {/* Oficina / Fábrica */}
          <div data-ev-id="ev_c9264d3c78">
            <label data-ev-id="ev_176b5e6aaa" className="block text-sm font-semibold text-stone-900 mb-1.5">Oficina / Fábrica</label>
            <Select value={form.workshop_id} onValueChange={(v) => setForm({ ...form, workshop_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecionar oficina" /></SelectTrigger>
              <SelectContent>
                {workshops.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedWorkshop &&
            <p data-ev-id="ev_3c78d55b4d" className="text-xs text-stone-500 mt-1">Preço padrão da oficina: R$ {selectedWorkshop.price_per_piece.toFixed(2)}/pç (usado quando o produto não tem M.O cadastrada)</p>
            }
          </div>

          {/* Datas */}
          <div data-ev-id="ev_4d5a26a353" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_2e48ecc76b">
              <label data-ev-id="ev_9696116e88" className="block text-sm font-semibold text-stone-900 mb-1.5">Data Início</label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div data-ev-id="ev_275ae11130">
              <label data-ev-id="ev_5ca63c0c5d" className="block text-sm font-semibold text-stone-900 mb-1.5">Prazo</label>
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>

          {/* Status e Prioridade */}
          <div data-ev-id="ev_d252741a3e" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_6c09ab7b71">
              <label data-ev-id="ev_8513d21b27" className="block text-sm font-semibold text-stone-900 mb-1.5">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="modelagem">Modelagem</SelectItem>
                  <SelectItem value="corte">Corte</SelectItem>
                  <SelectItem value="costura">Costura</SelectItem>
                  <SelectItem value="acabamento">Acabamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div data-ev-id="ev_d0f96404d6">
              <label data-ev-id="ev_cfc9fc945f" className="block text-sm font-semibold text-stone-900 mb-1.5">Prioridade</label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div data-ev-id="ev_7f573253a2">
            <label data-ev-id="ev_5c4b51d077" className="block text-sm font-semibold text-stone-900 mb-1.5">Observações</label>
            <Textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} rows={3} />
          </div>

          {/* Resumo */}
          <div data-ev-id="ev_119bade057" className="p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div data-ev-id="ev_12509a12f4" className="flex flex-col gap-2 text-sm">
              <div data-ev-id="ev_998b8d5418" className="flex justify-between">
                <span data-ev-id="ev_180fc48b0b" className="text-stone-600">Total de peças:</span>
                <span data-ev-id="ev_afc30b5ce3" className="font-semibold text-stone-900">{totalQty}</span>
              </div>
              <div data-ev-id="ev_a00ac3f98f" className="flex justify-between">
                <span data-ev-id="ev_422b0330ef" className="text-stone-600">Custo total:</span>
                <span data-ev-id="ev_e8f76e9ac8" className="font-semibold text-stone-900">R$ {totalCost.toFixed(2)}</span>
              </div>
              <div data-ev-id="ev_4ce77937e2" className="flex justify-between">
                <span data-ev-id="ev_2e69e231f8" className="text-stone-600">Receita estimada:</span>
                <span data-ev-id="ev_8d8aa54b3b" className="font-semibold text-stone-900">R$ {totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div data-ev-id="ev_166070a0ba" className="flex justify-end pt-4">
            <Button onClick={handleSubmit} disabled={submitting || items.length === 0 || items.every((i) => i.variations.length === 0)} className="px-6 gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Criar OP'}
            </Button>
          </div>
        </div>
      </div>
    </div>);

}