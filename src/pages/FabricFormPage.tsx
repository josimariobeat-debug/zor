import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { X, Loader2 } from 'lucide-react';
import { fabricTypes } from '@/lib/constants';

interface Fabric {
  id: string;
  name: string;
  type: string | null;
  color: string | null;
  supplier_id: string | null;
  width: number;
  gramatura: number;
  stock: number;
  price_per_meter: number;
  operational_cost: number | null;
  location: string | null;
  min_stock: number | null;
}

interface Supplier {
  id: string;
  name: string;
}

export default function FabricFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { data: fabrics, create, update, loading } = useSupabaseData<Fabric>('fabrics');
  const { data: suppliers } = useSupabaseData<Supplier>('suppliers');

  const [form, setForm] = useState({
    name: '',
    type: '',
    color: '',
    supplier_id: '',
    width: 150,
    gramatura: 0,
    stock: 0,
    price_per_meter: 0,
    operational_cost: 0,
    location: '',
    min_stock: 5
  });

  const [operationalCostInput, setOperationalCostInput] = useState('0,00');
  const [operationalCostError, setOperationalCostError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const formatBRL = (n: number) =>
    n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const validateOperationalCost = (raw: string): { valid: boolean; value: number; error: string | null } => {
    const trimmed = raw.trim();
    if (trimmed === '') return { valid: true, value: 0, error: null };
    const normalized = trimmed.replace(/\./g, '').replace(',', '.');
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      return { valid: false, value: 0, error: 'Informe um valor numérico válido (ex: 25,50).' };
    }
    const num = parseFloat(normalized);
    if (!isFinite(num)) return { valid: false, value: 0, error: 'Valor inválido.' };
    if (num < 0) return { valid: false, value: 0, error: 'O valor não pode ser negativo.' };
    if (num > 9_999_999.99) return { valid: false, value: 0, error: 'Valor máximo excedido.' };
    return { valid: true, value: num, error: null };
  };


  useEffect(() => {
    if (isEditing && fabrics.length > 0) {
      const fabric = fabrics.find((f) => f.id === id);
      if (fabric) {
        setForm({
          name: fabric.name || '',
          type: fabric.type || '',
          color: fabric.color || '',
          supplier_id: fabric.supplier_id || '',
          width: fabric.width ? fabric.width * 100 : 150,
          gramatura: fabric.gramatura || 0,
          stock: fabric.stock || 0,
          price_per_meter: fabric.price_per_meter || 0,
          operational_cost: fabric.operational_cost || 0,
          location: fabric.location || '',
          min_stock: fabric.min_stock || 5
        });
        setOperationalCostInput(formatBRL(fabric.operational_cost || 0));
      }
    }
  }, [isEditing, id, fabrics]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }
    const opCheck = validateOperationalCost(operationalCostInput);
    if (!opCheck.valid) {
      setOperationalCostError(opCheck.error);
      toast({ title: 'Erro', description: opCheck.error ?? 'Custo operacional inválido', variant: 'destructive' });
      return;
    }
    setOperationalCostError(null);

    setSaving(true);
    try {
      const data = {
        ...form,
        operational_cost: opCheck.value,
        width: form.width / 100,
        supplier_id: form.supplier_id || null
      };


      if (isEditing) {
        const result = await update(id!, data);
        if (result) {
          toast({ title: 'Tecido atualizado', description: form.name });
          navigate('/tecidos');
        }
      } else {
        const result = await create(data);
        if (result) {
          toast({ title: 'Tecido cadastrado', description: form.name });
          navigate('/tecidos');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div data-ev-id="ev_a10b7a9806" className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>);

  }

  return (
    <div data-ev-id="ev_dc64211fe7" className="min-h-screen bg-white">
      <div data-ev-id="ev_e1f267774d" className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div data-ev-id="ev_9f38884e73" className="flex items-center justify-between mb-8">
          <h1 data-ev-id="ev_bf7838de03" className="text-xl font-semibold text-stone-900">{isEditing ? 'Editar Tecido' : 'Novo Tecido'}</h1>
          <button data-ev-id="ev_cb62fdc14f" onClick={() => navigate('/tecidos')} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Formulário */}
        <div data-ev-id="ev_1f5696bc14" className="flex flex-col gap-6">
          <div data-ev-id="ev_b0160e1109" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_39eb2fbd23">
              <label data-ev-id="ev_da8dbbb778" className="block text-sm font-medium text-stone-900 mb-1.5">Nome *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Alfaiataria Premium" />
            </div>
            <div data-ev-id="ev_4c2374ce30">
              <label data-ev-id="ev_ddfd4547d3" className="block text-sm font-medium text-stone-900 mb-1.5">Tipo</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                <SelectContent>
                  {fabricTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div data-ev-id="ev_ac00a64cce">
            <label data-ev-id="ev_0d1da97039" className="block text-sm font-medium text-stone-900 mb-1.5">Cor</label>
            <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Preto" />
          </div>

          <div data-ev-id="ev_9d636a81c2">
            <label data-ev-id="ev_e7de0a3abb" className="block text-sm font-medium text-stone-900 mb-1.5">Fornecedor</label>
            <Select value={form.supplier_id} onValueChange={(v) => setForm({ ...form, supplier_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecionar fornecedor" /></SelectTrigger>
              <SelectContent>
                {suppliers.filter((s) => s.name).map((s) =>
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div data-ev-id="ev_2284431774" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_64e017681c">
              <label data-ev-id="ev_aaf7a4ee40" className="block text-sm font-medium text-stone-900 mb-1.5">Valor/metro (R$)</label>
              <NumberInput variant="currency" value={form.price_per_meter} onChange={(v) => setForm({ ...form, price_per_meter: v ?? 0 })} />
            </div>
            <div data-ev-id="ev_771fad0c81">
              <label data-ev-id="ev_4d757ba4a7" className="block text-sm font-medium text-stone-900 mb-1.5">Largura (cm)</label>
              <NumberInput step="1" value={form.width} onChange={(v) => setForm({ ...form, width: v ?? 0 })} min={0} placeholder="150" />
            </div>
          </div>

          <div data-ev-id="ev_df081891db" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_28338a01bd">
              <label data-ev-id="ev_1f8a48552d" className="block text-sm font-medium text-stone-900 mb-1.5">Gramatura (g/m²)</label>
              <NumberInput value={form.gramatura} onChange={(v) => setForm({ ...form, gramatura: v ?? 0 })} min={0} placeholder="0" />
            </div>
            <div data-ev-id="ev_47934e0717">
              <label data-ev-id="ev_578d988d6c" className="block text-sm font-medium text-stone-900 mb-1.5">Quantidade (metros)</label>
              <NumberInput step="0.1" value={form.stock} onChange={(v) => setForm({ ...form, stock: v ?? 0 })} min={0} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-900 mb-1.5">Estoque mínimo (m)</label>
              <NumberInput step="0.1" value={form.min_stock} onChange={(v) => setForm({ ...form, min_stock: v ?? 0 })} min={0} placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-900 mb-1.5">Custo operacional (R$)</label>
              <NumberInput
                variant="currency"
                value={form.operational_cost}
                onChange={(v) => {
                  const next = v ?? 0;
                  setForm({ ...form, operational_cost: next });
                  setOperationalCostInput(formatBRL(next));
                  setOperationalCostError(next < 0 ? 'O valor não pode ser negativo.' : null);
                }}
                aria-invalid={!!operationalCostError}
                className={operationalCostError ? 'border-rose-500 focus-visible:ring-rose-400' : ''}
              />
              {operationalCostError && (
                <p className="mt-1 text-xs text-rose-600">{operationalCostError}</p>
              )}
            </div>

          </div>

          <div data-ev-id="ev_d949f5870e">
            <label data-ev-id="ev_7cbdabd8c3" className="block text-sm font-medium text-stone-900 mb-1.5">Localização</label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ex: Prateleira A1" />
          </div>

          {/* Botões */}
          <div data-ev-id="ev_cc244fb37a" className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <Button variant="outline" onClick={() => navigate('/tecidos')}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name.trim() || saving}
              className="bg-stone-900 hover:bg-stone-800 text-white gap-2">

              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </div>
      </div>
    </div>);

}