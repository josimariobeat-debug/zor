// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { X, Loader2, Plus, Trash2, Upload, ImageIcon, Layers, Scissors, Users } from 'lucide-react';

interface Fabric {id: string;name: string;price_per_meter: number;stock: number;}
interface Trim {id: string;name: string;price_per_unit: number;stock: number;unit: string;}
interface Workshop {id: string;name: string;price_per_piece: number;}
interface Collection {id: string;name: string;}

interface FabricUsed {id: string;fabric_id: string;fabric_name: string;meters_used: number;cost: number;}
interface TrimUsed {id: string;trim_id: string;trim_name: string;quantity: number;cost: number;}

const categories = ['Vestido', 'Saia', 'Blusa', 'Calça', 'Blazer', 'Cropped', 'Macacão', 'Camisa', 'Shorts', 'Outro'];

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { user } = useAuth();

  const { data: products, loading: loadingProducts } = useSupabaseData<any>('products');
  const { data: fabrics } = useSupabaseData<Fabric>('fabrics');
  const { data: trims } = useSupabaseData<Trim>('trims');
  const { data: workshops } = useSupabaseData<Workshop>('workshops');
  const { data: collections } = useSupabaseData<Collection>('collections');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    internal_code: '',
    category: 'Vestido',
    collection_id: '',
    colors: '',
    sizes: '',
    stock: 0,
    status: 'Rascunho',
    description: '',
    image: '',
    workshop_id: '',
    labor_cost: 0,
    operational_cost: 0,
    sale_price: 0
  });

  const [fabricsUsed, setFabricsUsed] = useState<FabricUsed[]>([]);
  const [trimsUsed, setTrimsUsed] = useState<TrimUsed[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erro', description: 'Por favor, selecione uma imagem válida.', variant: 'destructive' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Erro', description: 'A imagem deve ter no máximo 5MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // Bucket is private — generate a long-lived signed URL (1 year).
      const { data: signed, error: signedError } = await supabase.storage
        .from('product-images')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365);

      if (signedError || !signed?.signedUrl) throw signedError ?? new Error('Falha ao gerar URL da imagem');

      setForm((prev) => ({ ...prev, image: signed.signedUrl }));
      toast({ title: 'Sucesso', description: 'Imagem enviada com sucesso!' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Erro no upload', description: error.message || 'Não foi possível enviar a imagem.', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (isEditing && products.length > 0 && supabase) {
      const product = products.find((p: any) => p.id === id);
      if (product) {
        setForm({
          name: product.name || '',
          sku: product.sku || '',
          internal_code: product.internal_code || '',
          category: product.category || 'Vestido',
          collection_id: product.collection_id || '',
          colors: (product.colors || []).join(', '),
          sizes: (product.sizes || []).join(', '),
          stock: product.stock || 0,
          status: product.status || 'Rascunho',
          description: product.description || '',
          image: product.image || '',
          workshop_id: product.workshop_id || '',
          labor_cost: product.labor_cost || 0,
          operational_cost: product.operational_cost || 0,
          sale_price: product.sale_price || 0
        });

        supabase.from('product_fabrics').select('*').eq('product_id', id).then(({ data }) => {
          if (data) setFabricsUsed(data.map((f: any) => ({ ...f, id: f.id })));
        });

        supabase.from('product_trims').select('*').eq('product_id', id).then(({ data }) => {
          if (data) setTrimsUsed(data.map((t: any) => ({ ...t, id: t.id })));
        });
      }
    }
  }, [isEditing, id, products]);

  const totalFabricsCost = useMemo(() => fabricsUsed.reduce((sum, f) => sum + f.cost, 0), [fabricsUsed]);
  const totalTrimsCost = useMemo(() => trimsUsed.reduce((sum, t) => sum + t.cost, 0), [trimsUsed]);
  const totalCost = totalFabricsCost + totalTrimsCost + form.labor_cost + form.operational_cost;

  const addFabric = () => {
    setFabricsUsed([...fabricsUsed, { id: `new-${Date.now()}`, fabric_id: '', fabric_name: '', meters_used: 0, cost: 0 }]);
  };

  const updateFabric = (index: number, field: string, value: any) => {
    const newFabrics = [...fabricsUsed];
    if (field === 'fabric_id') {
      const fabric = fabrics.find((f) => f.id === value);
      newFabrics[index].fabric_id = value;
      newFabrics[index].fabric_name = fabric?.name || '';
      newFabrics[index].cost = newFabrics[index].meters_used * (fabric?.price_per_meter || 0);
    } else if (field === 'meters_used') {
      newFabrics[index].meters_used = value;
      const fabric = fabrics.find((f) => f.id === newFabrics[index].fabric_id);
      newFabrics[index].cost = value * (fabric?.price_per_meter || 0);
    }
    setFabricsUsed(newFabrics);
  };

  const removeFabric = (index: number) => {
    setFabricsUsed(fabricsUsed.filter((_, i) => i !== index));
  };

  const addTrim = () => {
    setTrimsUsed([...trimsUsed, { id: `new-${Date.now()}`, trim_id: '', trim_name: '', quantity: 0, cost: 0 }]);
  };

  const updateTrim = (index: number, field: string, value: any) => {
    const newTrims = [...trimsUsed];
    if (field === 'trim_id') {
      const trim = trims.find((t) => t.id === value);
      newTrims[index].trim_id = value;
      newTrims[index].trim_name = trim?.name || '';
      newTrims[index].cost = newTrims[index].quantity * (trim?.price_per_unit || 0);
    } else if (field === 'quantity') {
      newTrims[index].quantity = value;
      const trim = trims.find((t) => t.id === newTrims[index].trim_id);
      newTrims[index].cost = value * (trim?.price_per_unit || 0);
    }
    setTrimsUsed(newTrims);
  };

  const removeTrim = (index: number) => {
    setTrimsUsed(trimsUsed.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }
    if (!supabase || !user) return;

    setSaving(true);
    try {
      const margin = form.sale_price > 0 ? (form.sale_price - totalCost) / form.sale_price * 100 : 0;
      const productData = {
        user_id: user.id,
        name: form.name.trim(),
        sku: form.sku || null,
        internal_code: form.internal_code || null,
        category: form.category || null,
        collection_id: form.collection_id || null,
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean),
        status: form.status,
        description: form.description || null,
        image: form.image || null,
        workshop_id: form.workshop_id || null,
        labor_cost: form.labor_cost,
        operational_cost: form.operational_cost,
        sale_price: form.sale_price,
        cost_price: totalCost,
        fabrics_cost: totalFabricsCost,
        trims_cost: totalTrimsCost,
        margin: Math.round(margin * 100) / 100
      };

      let productId = id;

      if (isEditing) {
        const { error } = await supabase.from('products').update(productData).eq('id', id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('products').insert(productData).select().single();
        if (error) throw error;
        productId = data.id;
      }

      if (isEditing) {
        await supabase.from('product_fabrics').delete().eq('product_id', productId);
      }
      if (fabricsUsed.length > 0) {
        const fabricsData = fabricsUsed.filter((f) => f.fabric_id).map((f) => ({
          product_id: productId,
          fabric_id: f.fabric_id,
          fabric_name: f.fabric_name,
          meters_used: f.meters_used,
          cost: f.cost
        }));
        if (fabricsData.length > 0) {
          const { error } = await supabase.from('product_fabrics').insert(fabricsData);
          if (error) throw error;
        }
      }

      if (isEditing) {
        await supabase.from('product_trims').delete().eq('product_id', productId);
      }
      if (trimsUsed.length > 0) {
        const trimsData = trimsUsed.filter((t) => t.trim_id).map((t) => ({
          product_id: productId,
          trim_id: t.trim_id,
          trim_name: t.trim_name,
          quantity: t.quantity,
          cost: t.cost
        }));
        if (trimsData.length > 0) {
          const { error } = await supabase.from('product_trims').insert(trimsData);
          if (error) throw error;
        }
      }

      toast({ title: isEditing ? 'Produto atualizado' : 'Produto criado', description: form.name });
      navigate('/produtos');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loadingProducts && isEditing) {
    return (
      <div data-ev-id="ev_cf5c248879" className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>);

  }

  return (
    <div data-ev-id="ev_1c7b747c1f" className="min-h-screen bg-white">
      <div data-ev-id="ev_b6a8d86158" className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div data-ev-id="ev_f558749e4a" className="flex items-center justify-between mb-8">
          <h1 data-ev-id="ev_1107417e5b" className="text-xl font-semibold text-stone-900">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h1>
          <button data-ev-id="ev_fa5099126b" onClick={() => navigate('/produtos')} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Formulário */}
        <div data-ev-id="ev_e3b6d1c636" className="flex flex-col gap-8">
          {/* Informações Básicas */}
          <div data-ev-id="ev_a1321ddead" className="flex flex-col gap-4">
            <div data-ev-id="ev_aed83e6eb1" className="grid grid-cols-2 gap-4">
              <div data-ev-id="ev_6a841b9ee1">
                <label data-ev-id="ev_588e79985f" className="block text-sm font-medium text-stone-900 mb-1.5">Nome *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div data-ev-id="ev_2e2148e022">
                <label data-ev-id="ev_292dca234b" className="block text-sm font-medium text-stone-900 mb-1.5">SKU</label>
                <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
            </div>
            <div data-ev-id="ev_4b2ebfa5e8" className="grid grid-cols-2 gap-4">
              <div data-ev-id="ev_258b204162">
                <label data-ev-id="ev_d483fe0315" className="block text-sm font-medium text-stone-900 mb-1.5">Código Interno</label>
                <Input value={form.internal_code} onChange={(e) => setForm({ ...form, internal_code: e.target.value })} />
              </div>
              <div data-ev-id="ev_53180c2b9c">
                <label data-ev-id="ev_fa7c0738bb" className="block text-sm font-medium text-stone-900 mb-1.5">Categoria</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div data-ev-id="ev_25676adfe9" className="grid grid-cols-2 gap-4">
              <div data-ev-id="ev_6dcf0a0ff7">
                <label data-ev-id="ev_44b651a22b" className="block text-sm font-medium text-stone-900 mb-1.5">Cores disponíveis (separadas por vírgula)</label>
                <Input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Rosa, Preto, Branco" />
              </div>
              <div data-ev-id="ev_716f2c9369">
                <label data-ev-id="ev_d6049f4039" className="block text-sm font-medium text-stone-900 mb-1.5">Tamanhos (separados por vírgula)</label>
                <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="P, M, G, GG" />
              </div>
            </div>
            <div data-ev-id="ev_f646d0bd92" className="grid grid-cols-1 gap-4">
              <div data-ev-id="ev_8f822b5433">
                <label data-ev-id="ev_a52e319311" className="block text-sm font-medium text-stone-900 mb-1.5">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rascunho">Rascunho</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div data-ev-id="ev_c4e4b18ead">
              <label data-ev-id="ev_c63e6f0dae" className="block text-sm font-medium text-stone-900 mb-1.5">Descrição</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div data-ev-id="ev_394c4c2e6a">
              <label data-ev-id="ev_91c40195ea" className="block text-sm font-medium text-stone-900 mb-1.5">Foto do Produto</label>
              <div data-ev-id="ev_9f130ff469" className="flex flex-col gap-3">
                {/* Preview da imagem */}
                {form.image &&
                <div data-ev-id="ev_07a651efae" className="relative w-32 h-32 rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                    <img data-ev-id="ev_d58f36e35a" src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    <button data-ev-id="ev_29467d5d74"
                  type="button"
                  onClick={() => setForm({ ...form, image: '' })}
                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-full hover:bg-white transition-colors">

                      <X className="w-3 h-3 text-stone-600" />
                    </button>
                  </div>
                }
                
                {/* Upload controls */}
                <div data-ev-id="ev_c9989441d1" className="flex items-center gap-3">
                  <input data-ev-id="ev_1ee6bbd880"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden" />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}>

                    {uploading ?
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> :

                    <><Upload className="w-4 h-4" /> Upload</>
                    }
                  </Button>
                  <Input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="ou cole a URL da imagem"
                    className="flex-1" />

                </div>
                
                {/* Empty state */}
                {!form.image &&
                <div data-ev-id="ev_3ff97e4ed5" className="flex items-center gap-2 text-xs text-stone-400">
                    <ImageIcon className="w-4 h-4" />
                    <span data-ev-id="ev_4b812a60b1">Formatos: JPG, PNG, WebP. Máximo 5MB.</span>
                  </div>
                }
              </div>
            </div>
          </div>

          {/* Tecidos */}
          <div data-ev-id="ev_14141a846d" className="border-t border-stone-200 pt-6">
            <div data-ev-id="ev_437bdba534" className="flex items-center justify-between mb-4">
              <div data-ev-id="ev_251dcd3c87" className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-stone-500" />
                <h2 data-ev-id="ev_46ec7c45af" className="text-base font-semibold text-stone-900">Tecidos utilizados</h2>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addFabric} className="gap-1.5 text-sm">
                <Plus className="w-4 h-4" /> Adicionar Tecido
              </Button>
            </div>

            {fabricsUsed.length > 0 &&
            <div data-ev-id="ev_5b95d779c4" className="flex flex-col gap-2">
                <div data-ev-id="ev_4c10d3a1d0" className="grid grid-cols-[1fr_140px_120px_40px] gap-3 text-sm font-medium text-stone-600 px-1">
                  <span data-ev-id="ev_5d08752c91">Tecido</span>
                  <span data-ev-id="ev_1656eb452e">Metros usados</span>
                  <span data-ev-id="ev_0a860218d7">Custo</span>
                  <span data-ev-id="ev_137f6bf279"></span>
                </div>
                {fabricsUsed.map((f, idx) =>
              <div data-ev-id="ev_697ebcc9d0" key={f.id} className="grid grid-cols-[1fr_140px_120px_40px] gap-3 items-center">
                    <Select value={f.fabric_id} onValueChange={(v) => updateFabric(idx, 'fabric_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Selecionar tecido" /></SelectTrigger>
                      <SelectContent>
                        {fabrics.map((fab) => <SelectItem key={fab.id} value={fab.id}>{fab.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <NumberInput step="0.01" value={f.meters_used} onChange={(v) => updateFabric(idx, 'meters_used', v ?? 0)} min={0} placeholder="0,00" />
                    <Input value={`R$ ${f.cost.toFixed(2)}`} disabled className="bg-stone-50" />
                    <button data-ev-id="ev_bfb7613200" type="button" onClick={() => removeFabric(idx)} className="p-2 text-stone-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
              )}
              </div>
            }
          </div>

          {/* Aviamentos */}
          <div data-ev-id="ev_c970d032bb" className="border-t border-stone-200 pt-6">
            <div data-ev-id="ev_67616227c0" className="flex items-center justify-between mb-4">
              <div data-ev-id="ev_c751219c50" className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-stone-500" />
                <h2 data-ev-id="ev_3af804ee75" className="text-base font-semibold text-stone-900">Aviamentos utilizados</h2>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addTrim} className="gap-1.5 text-sm">
                <Plus className="w-4 h-4" /> Adicionar Aviamento
              </Button>
            </div>

            {trimsUsed.length > 0 &&
            <div data-ev-id="ev_8a5fde2506" className="flex flex-col gap-2">
                <div data-ev-id="ev_961aeebfa0" className="grid grid-cols-[1fr_140px_120px_40px] gap-3 text-sm font-medium text-stone-600 px-1">
                  <span data-ev-id="ev_7dbf69f3e3">Aviamento</span>
                  <span data-ev-id="ev_012f2d28de">Quantidade</span>
                  <span data-ev-id="ev_3709a10b62">Custo</span>
                  <span data-ev-id="ev_318d35cebe"></span>
                </div>
                {trimsUsed.map((t, idx) =>
              <div data-ev-id="ev_d2042a7a20" key={t.id} className="grid grid-cols-[1fr_140px_120px_40px] gap-3 items-center">
                    <Select value={t.trim_id} onValueChange={(v) => updateTrim(idx, 'trim_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Selecionar aviamento" /></SelectTrigger>
                      <SelectContent>
                        {trims.map((tr) => <SelectItem key={tr.id} value={tr.id}>{tr.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <NumberInput step="0.1" value={t.quantity} onChange={(v) => updateTrim(idx, 'quantity', v ?? 0)} min={0} placeholder="0" />
                    <Input value={`R$ ${t.cost.toFixed(2)}`} disabled className="bg-stone-50" />
                    <button data-ev-id="ev_ca167c495e" type="button" onClick={() => removeTrim(idx)} className="p-2 text-stone-400 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
              )}
              </div>
            }
          </div>

          {/* Fábrica e Custos */}
          <div data-ev-id="ev_668ed3e88d" className="border-t border-stone-200 pt-6">
            <div data-ev-id="ev_117d410b47" className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-stone-500" />
              <h2 data-ev-id="ev_0603cee13b" className="text-base font-semibold text-stone-900">Fábrica e Custos de Produção</h2>
            </div>

            <div data-ev-id="ev_890b7a9355" className="grid grid-cols-2 gap-4">
              <div data-ev-id="ev_aef28ee310">
                <label data-ev-id="ev_64421856f4" className="block text-sm font-medium text-stone-900 mb-1.5">Fábrica / Oficina responsável</label>
                <Select value={form.workshop_id} onValueChange={(v) => setForm({ ...form, workshop_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecionar oficina" /></SelectTrigger>
                  <SelectContent>
                    {workshops.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div data-ev-id="ev_123f4916d1">
                <label data-ev-id="ev_d6e4f7ff21" className="block text-sm font-medium text-stone-900 mb-1.5">Mão de Obra (R$)</label>
                <NumberInput variant="currency" value={form.labor_cost} onChange={(v) => setForm({ ...form, labor_cost: v ?? 0 })} />

              </div>
              <div data-ev-id="ev_34b833be49">
                <label data-ev-id="ev_b7ab667f94" className="block text-sm font-medium text-stone-900 mb-1.5">Custo Operacional (R$)</label>
                <NumberInput variant="currency" value={form.operational_cost} onChange={(v) => setForm({ ...form, operational_cost: v ?? 0 })} />
              </div>
              <div data-ev-id="ev_fd27755b6c">
                <label data-ev-id="ev_a629fcbd42" className="block text-sm font-medium text-stone-900 mb-1.5">Preço de Venda (R$)</label>
                <NumberInput variant="currency" value={form.sale_price} onChange={(v) => setForm({ ...form, sale_price: v ?? 0 })} />
              </div>
            </div>

            {/* Resumo */}
            <div data-ev-id="ev_4e430e3bb6" className="mt-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <div data-ev-id="ev_4402268071" className="flex flex-col gap-2 text-sm">
                <div data-ev-id="ev_de052273cc" className="flex justify-between">
                  <span data-ev-id="ev_1547c5dcf5" className="text-stone-600">Tecidos:</span>
                  <span data-ev-id="ev_1b15ca4bc3" className="font-medium">R$ {totalFabricsCost.toFixed(2)}</span>
                </div>
                <div data-ev-id="ev_5131186bb8" className="flex justify-between">
                  <span data-ev-id="ev_e03b480d33" className="text-stone-600">Aviamentos:</span>
                  <span data-ev-id="ev_5d81437119" className="font-medium">R$ {totalTrimsCost.toFixed(2)}</span>
                </div>
                <div data-ev-id="ev_e3aba40cba" className="flex justify-between">
                  <span data-ev-id="ev_a56ec2f5c4" className="text-stone-600">Mão de obra:</span>
                  <span data-ev-id="ev_c9469efff8" className="font-medium">R$ {form.labor_cost.toFixed(2)}</span>
                </div>
                <div data-ev-id="ev_25d222b89a" className="flex justify-between">
                  <span data-ev-id="ev_4d438942a2" className="text-stone-600">Operacional:</span>
                  <span data-ev-id="ev_76aa6c0ada" className="font-medium">R$ {form.operational_cost.toFixed(2)}</span>
                </div>
                <div data-ev-id="ev_93f2fe716d" className="flex justify-between pt-2 border-t border-stone-200 mt-1">
                  <span data-ev-id="ev_65dd17066b" className="font-semibold text-stone-900">Custo Total:</span>
                  <span data-ev-id="ev_b2f4224a03" className="font-semibold text-stone-900">R$ {totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botão Submit */}
          <div data-ev-id="ev_597b71bcca" className="flex justify-end pt-4">
            <Button onClick={handleSubmit} disabled={!form.name.trim() || saving} className="px-6">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {saving ? 'Salvando...' : isEditing ? 'Salvar Produto' : 'Criar Produto'}
            </Button>
          </div>
        </div>
      </div>
    </div>);

}