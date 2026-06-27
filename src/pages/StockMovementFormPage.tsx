/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FormPageShell, FormSection, FormGrid, FormField } from '@/components/forms/FormPageShell';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Fabric {
  id: string;
  name: string;
  stock: number;
}

interface Trim {
  id: string;
  name: string;
  stock: number;
  unit: string;
}

export default function StockMovementFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: fabrics, update: updateFabric } = useSupabaseData<Fabric>('fabrics');
  const { data: trims, update: updateTrim } = useSupabaseData<Trim>('trims');

  const [form, setForm] = useState({
    type: 'Entrada',
    category: 'Tecido',
    item_id: '',
    qty: 0,
    reason: ''
  });

  const items = form.category === 'Tecido' ? fabrics : trims;
  const selectedItem = items.find((i) => i.id === form.item_id);
  const unit = form.category === 'Tecido' ? 'metro' : (selectedItem as Trim)?.unit || 'unidade';

  const handleSubmit = async () => {
    if (!form.item_id) {
      toast({ title: 'Erro', description: 'Selecione um item', variant: 'destructive' });
      return;
    }
    if (form.qty <= 0) {
      toast({ title: 'Erro', description: 'Quantidade deve ser maior que zero', variant: 'destructive' });
      return;
    }

    if (!supabase || !user) return;

    try {
      // Create movement
      await supabase.from('stock_movements').insert({
        user_id: user.id,
        type: form.type,
        category: form.category,
        item_id: form.item_id,
        item_name: selectedItem?.name || '',
        qty: form.qty,
        unit,
        reason: form.reason || null
      });

      // Update stock
      const currentStock = selectedItem?.stock || 0;
      const newStock = form.type === 'Entrada' ?
      currentStock + form.qty :
      Math.max(0, currentStock - form.qty);

      if (form.category === 'Tecido') {
        await updateFabric(form.item_id, { stock: newStock });
      } else {
        await updateTrim(form.item_id, { stock: newStock });
      }

      toast({
        title: 'Movimentação registrada',
        description: `${form.type} de ${form.qty} ${unit} de ${selectedItem?.name}`
      });
      navigate('/estoque');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <FormPageShell
      title="Nova Movimentação"
      subtitle="Registre entrada ou saída de estoque"
      backTo="/estoque"
      onSubmit={handleSubmit}
      submitLabel="Registrar"
      isValid={!!form.item_id && form.qty > 0}>

      <FormSection title="Tipo de Movimentação">
        <FormGrid cols={2}>
          <FormField label="Tipo">
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Saida">Saída</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Categoria">
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v, item_id: '' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tecido">Tecido</SelectItem>
                <SelectItem value="Aviamento">Aviamento</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Item">
        <FormGrid cols={2}>
          <FormField label="Selecionar Item" required>
            <Select value={form.item_id} onValueChange={(v) => setForm({ ...form, item_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>
                {items.map((item) =>
                <SelectItem key={item.id} value={item.id}>
                    {item.name} (estoque: {item.stock})
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label={`Quantidade (${unit})`}>
            <Input
              type="number"
              step="0.1"
              value={form.qty}
              onChange={(e) => setForm({ ...form, qty: parseFloat(e.target.value) || 0 })}
              min={0} />

          </FormField>
        </FormGrid>
        {selectedItem &&
        <div data-ev-id="ev_405cc67814" className="mt-2 p-3 bg-stone-50 rounded-lg">
            <p data-ev-id="ev_22e053324a" className="text-sm text-stone-600">
              Estoque atual: <strong data-ev-id="ev_585a9cd680">{selectedItem.stock} {unit}</strong>
              {' → '}
              Novo estoque: <strong data-ev-id="ev_9f41df4083">
                {form.type === 'Entrada' ?
              selectedItem.stock + form.qty :
              Math.max(0, selectedItem.stock - form.qty)} {unit}
              </strong>
            </p>
          </div>
        }
      </FormSection>

      <FormSection title="Observações">
        <FormField label="Motivo">
          <Textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Ex: Compra de fornecedor, Ajuste de inventário, Uso em produção..."
            rows={3} />

        </FormField>
      </FormSection>
    </FormPageShell>);

}