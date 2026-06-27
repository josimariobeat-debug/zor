import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { X, Loader2 } from 'lucide-react';
import { useCloseFormConfirm } from '@/hooks/useCloseFormConfirm';

import { trimTypes } from '@/lib/constants';

interface Trim {
  id: string;
  name: string;
  type: string | null;
  supplier_id: string | null;
  stock: number;
  unit: string;
  price_per_unit: number;
  min_stock: number;
}

interface Supplier {
  id: string;
  name: string;
}

export default function TrimFormPage() {
  const navigate = useNavigate();
  const handleClose = useCloseFormConfirm('/aviamentos');

  const { id } = useParams();
  const isEditing = Boolean(id);
  const { data: trims, create, update, loading } = useSupabaseData<Trim>('trims');
  const { data: suppliers } = useSupabaseData<Supplier>('suppliers');

  const [form, setForm] = useState({
    name: '',
    type: '',
    supplier_id: '',
    stock: 0,
    unit: 'unidade',
    price_per_unit: 0,
    min_stock: 10
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && trims.length > 0) {
      const trim = trims.find((t) => t.id === id);
      if (trim) {
        setForm({
          name: trim.name || '',
          type: trim.type || '',
          supplier_id: trim.supplier_id || '',
          stock: trim.stock || 0,
          unit: trim.unit || 'unidade',
          price_per_unit: trim.price_per_unit || 0,
          min_stock: trim.min_stock || 10
        });
      }
    }
  }, [isEditing, id, trims]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...form,
        supplier_id: form.supplier_id || null
      };

      if (isEditing) {
        const result = await update(id!, data);
        if (result) {
          toast({ title: 'Aviamento atualizado', description: form.name });
          navigate('/aviamentos');
        }
      } else {
        const result = await create(data);
        if (result) {
          toast({ title: 'Aviamento cadastrado', description: form.name });
          navigate('/aviamentos');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div data-ev-id="ev_2e48e744f2" className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>);

  }

  return (
    <div data-ev-id="ev_9fb2a255be" className="min-h-screen bg-white">
      <div data-ev-id="ev_8791aada48" className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div data-ev-id="ev_d8e90b2a1a" className="flex items-center justify-between mb-8">
          <h1 data-ev-id="ev_3f46b308f6" className="text-xl font-semibold text-stone-900">{isEditing ? 'Editar Aviamento' : 'Novo Aviamento'}</h1>
          <button data-ev-id="ev_f08837101e" onClick={handleClose} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Formulário */}
        <div data-ev-id="ev_52b520386e" className="flex flex-col gap-6">
          <div data-ev-id="ev_2c8f75579b" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_edbb9f9e9f">
              <label data-ev-id="ev_815619f1b9" className="block text-sm font-medium text-stone-900 mb-1.5">Nome *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Zíper invisível 20cm" />
            </div>
            <div data-ev-id="ev_90e99544ce">
              <label data-ev-id="ev_f25a06b742" className="block text-sm font-medium text-stone-900 mb-1.5">Tipo</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
                <SelectContent>
                  {trimTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div data-ev-id="ev_9306d6ba37" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_728c839b89">
              <label data-ev-id="ev_6419214e50" className="block text-sm font-medium text-stone-900 mb-1.5">Fornecedor</label>
              <Select value={form.supplier_id} onValueChange={(v) => setForm({ ...form, supplier_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar fornecedor" /></SelectTrigger>
                <SelectContent>
                  {suppliers.filter((s) => s.name).map((s) =>
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div data-ev-id="ev_e203327e58">
              <label data-ev-id="ev_9dc86d6a69" className="block text-sm font-medium text-stone-900 mb-1.5">Unidade</label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unidade">Unidade</SelectItem>
                  <SelectItem value="metro">Metro</SelectItem>
                  <SelectItem value="pacote">Pacote</SelectItem>
                  <SelectItem value="rolo">Rolo</SelectItem>
                  <SelectItem value="caixa">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div data-ev-id="ev_ce56660158" className="grid grid-cols-3 gap-4">
            <div data-ev-id="ev_0afb977968">
              <label data-ev-id="ev_ab087fc1ce" className="block text-sm font-medium text-stone-900 mb-1.5">Estoque Atual</label>
              <NumberInput step="0.1" value={form.stock} onChange={(v) => setForm({ ...form, stock: v ?? 0 })} min={0} placeholder="0" />
            </div>
            <div data-ev-id="ev_a2639feafb">
              <label data-ev-id="ev_074b197967" className="block text-sm font-medium text-stone-900 mb-1.5">Estoque Mínimo</label>
              <NumberInput step="0.1" value={form.min_stock} onChange={(v) => setForm({ ...form, min_stock: v ?? 0 })} min={0} placeholder="0" />
            </div>
            <div data-ev-id="ev_fc1afc0370">
              <label data-ev-id="ev_4be7786ff2" className="block text-sm font-medium text-stone-900 mb-1.5">Preço Unit. (R$)</label>
              <NumberInput variant="currency" value={form.price_per_unit} onChange={(v) => setForm({ ...form, price_per_unit: v ?? 0 })} />
            </div>
          </div>

          {/* Botões */}
          <div data-ev-id="ev_c651a05fd7" className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <Button variant="outline" onClick={() => navigate('/aviamentos')}>
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