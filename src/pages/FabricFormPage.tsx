import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input } from '@/components/ui/input';
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

  const [saving, setSaving] = useState(false);

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
          location: fabric.location || '',
          min_stock: fabric.min_stock || 5
        });
      }
    }
  }, [isEditing, id, fabrics]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...form,
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
              <Input type="number" step="0.01" value={form.price_per_meter} onChange={(e) => setForm({ ...form, price_per_meter: parseFloat(e.target.value) || 0 })} min={0} />
            </div>
            <div data-ev-id="ev_771fad0c81">
              <label data-ev-id="ev_4d757ba4a7" className="block text-sm font-medium text-stone-900 mb-1.5">Largura (cm)</label>
              <Input type="number" step="1" value={form.width} onChange={(e) => setForm({ ...form, width: parseFloat(e.target.value) || 0 })} min={0} />
            </div>
          </div>

          <div data-ev-id="ev_df081891db" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_28338a01bd">
              <label data-ev-id="ev_1f8a48552d" className="block text-sm font-medium text-stone-900 mb-1.5">Gramatura (g/m²)</label>
              <Input type="number" value={form.gramatura} onChange={(e) => setForm({ ...form, gramatura: parseInt(e.target.value) || 0 })} min={0} />
            </div>
            <div data-ev-id="ev_47934e0717">
              <label data-ev-id="ev_578d988d6c" className="block text-sm font-medium text-stone-900 mb-1.5">Quantidade (metros)</label>
              <Input type="number" step="0.1" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })} min={0} />
            </div>
          </div>

          <div data-ev-id="ev_265aa7c67a">
            <label data-ev-id="ev_5825dce775" className="block text-sm font-medium text-stone-900 mb-1.5">Estoque mínimo (m)</label>
            <Input type="number" step="0.1" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })} min={0} />
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