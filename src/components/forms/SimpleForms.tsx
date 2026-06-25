/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { FormShell, Field } from './FormShell';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import type { Fabric, Trim, Workshop, Supplier, Collection, StockMovement } from '@/lib/types';
import { fabricTypes, trimTypes, trimUnits, supplierTypes, collectionStatuses, workshopStatuses } from '@/lib/constants';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FabricForm({ open, onOpenChange, onSave, suppliers = [], initial = null, onAddSupplier
}: {open: boolean;onOpenChange: (v: boolean) => void;onSave: (d: Partial<Fabric>) => void;suppliers?: Supplier[];initial?: Fabric | null;onAddSupplier?: () => void;}) {
  const empty = { name: '', type: '', color: '', supplier_id: '', width: 150, gramatura: 0, stock: 0, price_per_meter: 0, location: '', min_stock: 5 };
  const [f, setF] = useState(empty);
  useEffect(() => {if (open) setF(initial ? { ...empty, ...initial, width: initial.width ? initial.width * 100 : 150 } : empty);}, [open, initial]);
  const set = (k: string, v: string | number) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {if (!f.name) return;onSave({ ...f, stock: Number(f.stock), price_per_meter: Number(f.price_per_meter), width: Number(f.width) / 100, gramatura: Number(f.gramatura), min_stock: Number(f.min_stock) });onOpenChange(false);};
  return (
    <FormShell open={open} onOpenChange={onOpenChange} title={initial ? 'Editar Tecido' : 'Novo Tecido'} onSubmit={submit} submitLabel={initial ? 'Salvar' : 'Cadastrar'}>
      <div data-ev-id="ev_de4481d9bf" className="flex flex-col gap-4">
        <div data-ev-id="ev_f91c5affb7" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome *"><Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Alfaiataria Premium" /></Field>
          <Field label="Tipo">
            <Select value={f.type || ''} onValueChange={(v) => set('type', v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
              <SelectContent>{fabricTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Cor" full><Input value={f.color} onChange={(e) => set('color', e.target.value)} placeholder="Preto" /></Field>
        <Field label="Fornecedor" full>
          <div data-ev-id="ev_17af72ddb5" className="flex gap-2">
            <Select value={f.supplier_id || ''} onValueChange={(v) => set('supplier_id', v)}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Selecionar fornecedor" /></SelectTrigger>
              <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
            {onAddSupplier && <Button type="button" variant="outline" size="icon" onClick={onAddSupplier} className="shrink-0"><Plus className="w-4 h-4" /></Button>}
          </div>
        </Field>
        <div data-ev-id="ev_a0182d69e8" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Valor/metro (R$)"><Input type="number" step="0.01" value={f.price_per_meter} onChange={(e) => set('price_per_meter', e.target.value)} /></Field>
          <Field label="Largura (cm)"><Input type="number" step="1" value={f.width} onChange={(e) => set('width', e.target.value)} /></Field>
        </div>
        <div data-ev-id="ev_bd107735a9" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Gramatura (g/m²)"><Input type="number" value={f.gramatura} onChange={(e) => set('gramatura', e.target.value)} /></Field>
          <Field label="Quantidade (metros)"><Input type="number" step="0.1" value={f.stock} onChange={(e) => set('stock', e.target.value)} /></Field>
        </div>
        <Field label="Estoque mínimo (m)" full><Input type="number" step="0.1" value={f.min_stock} onChange={(e) => set('min_stock', e.target.value)} /></Field>
        <Field label="Localização" full><Input value={f.location} onChange={(e) => set('location', e.target.value)} placeholder="Prateleira A1" /></Field>
      </div>
    </FormShell>);

}

export function TrimForm({ open, onOpenChange, onSave, suppliers = [], initial = null

}: {open: boolean;onOpenChange: (v: boolean) => void;onSave: (d: Partial<Trim>) => void;suppliers?: Supplier[];initial?: Trim | null;}) {
  const empty = { name: '', type: '', supplier_id: '', stock: 0, unit: 'unidade', price_per_unit: 0, min_stock: 10 };
  const [f, setF] = useState(empty);
  useEffect(() => {if (open) setF(initial ? { ...empty, ...initial } : empty);}, [open, initial]);
  const set = (k: string, v: string | number) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {if (!f.name) return;onSave({ ...f, stock: Number(f.stock), price_per_unit: Number(f.price_per_unit), min_stock: Number(f.min_stock) });onOpenChange(false);};
  return (
    <FormShell open={open} onOpenChange={onOpenChange} title={initial ? 'Editar Aviamento' : 'Novo Aviamento'} onSubmit={submit} submitLabel={initial ? 'Salvar' : 'Criar Aviamento'}>
      <div data-ev-id="ev_bb6ef91967" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome *"><Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Zíper invisível 20cm" /></Field>
        <Field label="Tipo">
          <Select value={f.type} onValueChange={(v) => set('type', v)}>
            <SelectTrigger><SelectValue placeholder="Selecionar tipo" /></SelectTrigger>
            <SelectContent>{trimTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Fornecedor">
          <Select value={f.supplier_id || ''} onValueChange={(v) => set('supplier_id', v)}>
            <SelectTrigger><SelectValue placeholder="Selecionar fornecedor" /></SelectTrigger>
            <SelectContent>{suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Unidade">
          <Select value={f.unit} onValueChange={(v) => set('unit', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{trimUnits.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Estoque"><Input type="number" value={f.stock} onChange={(e) => set('stock', e.target.value)} /></Field>
        <Field label="Custo Unit. (R$)"><Input type="number" step="0.01" value={f.price_per_unit} onChange={(e) => set('price_per_unit', e.target.value)} /></Field>
        <Field label="Estoque Mínimo" full><Input type="number" value={f.min_stock} onChange={(e) => set('min_stock', e.target.value)} /></Field>
      </div>
    </FormShell>);

}

export function WorkshopForm({ open, onOpenChange, onSave, initial = null

}: {open: boolean;onOpenChange: (v: boolean) => void;onSave: (d: Partial<Workshop>) => void;initial?: Workshop | null;}) {
  const empty = { name: '', specialty: 'Geral', phone: '', email: '', price_per_piece: 0, rating: 5, status: 'Ativa', in_progress: 0 };
  const [f, setF] = useState(empty);
  useEffect(() => {if (open) setF(initial ? { ...empty, ...initial } : empty);}, [open, initial]);
  const set = (k: string, v: string | number) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {if (!f.name) return;onSave({ ...f, price_per_piece: Number(f.price_per_piece), rating: Number(f.rating), in_progress: Number(f.in_progress) });onOpenChange(false);};
  return (
    <FormShell open={open} onOpenChange={onOpenChange} title={initial ? 'Editar Oficina' : 'Nova Oficina'} onSubmit={submit} submitLabel={initial ? 'Salvar' : 'Criar Oficina'}>
      <div data-ev-id="ev_2b85ad3649" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome *"><Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Atelier Milena" /></Field>
        <Field label="Especialidade"><Input value={f.specialty} onChange={(e) => set('specialty', e.target.value)} placeholder="Vestidos, Alfaiataria..." /></Field>
        <Field label="Telefone (WhatsApp)"><Input value={f.phone || ''} onChange={(e) => set('phone', e.target.value)} placeholder="+5579998830502" /></Field>
        <Field label="E-mail"><Input type="email" value={f.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="contato@oficina.com" /></Field>
        <Field label="R$ por peça"><Input type="number" step="0.01" value={f.price_per_piece} onChange={(e) => set('price_per_piece', e.target.value)} /></Field>
        <Field label="Avaliação (1-5)">
          <Select value={String(f.rating)} onValueChange={(v) => set('rating', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n} estrela{n > 1 ? 's' : ''}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Status" full>
          <Select value={f.status} onValueChange={(v) => set('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{workshopStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
    </FormShell>);

}

export function SupplierForm({ open, onOpenChange, onSave, initial = null

}: {open: boolean;onOpenChange: (v: boolean) => void;onSave: (d: Partial<Supplier>) => void;initial?: Supplier | null;}) {
  const empty = { name: '', type: 'Tecido', contact: '', phone: '', email: '', city: '', lead_time: 1, rating: 5, status: 'Ativo' };
  const [f, setF] = useState(empty);
  useEffect(() => {if (open) setF(initial ? { ...empty, ...initial } : empty);}, [open, initial]);
  const set = (k: string, v: string | number) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {if (!f.name) return;onSave({ ...f, lead_time: Number(f.lead_time), rating: Number(f.rating) });onOpenChange(false);};
  return (
    <FormShell open={open} onOpenChange={onOpenChange} title={initial ? 'Editar Fornecedor' : 'Novo Fornecedor'} onSubmit={submit} submitLabel={initial ? 'Salvar' : 'Criar Fornecedor'}>
      <div data-ev-id="ev_bf33840263" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome *"><Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: MultiMalhas" /></Field>
        <Field label="Tipo">
          <Select value={f.type} onValueChange={(v) => set('type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{supplierTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Contato (nome)"><Input value={f.contact || ''} onChange={(e) => set('contact', e.target.value)} /></Field>
        <Field label="Telefone"><Input value={f.phone || ''} onChange={(e) => set('phone', e.target.value)} /></Field>
        <Field label="E-mail"><Input type="email" value={f.email || ''} onChange={(e) => set('email', e.target.value)} /></Field>
        <Field label="Cidade/Estado"><Input value={f.city || ''} onChange={(e) => set('city', e.target.value)} placeholder="São Paulo/SP" /></Field>
        <Field label="Prazo médio (dias)"><Input type="number" value={f.lead_time} onChange={(e) => set('lead_time', e.target.value)} /></Field>
        <Field label="Avaliação (1-5)">
          <Select value={String(f.rating)} onValueChange={(v) => set('rating', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n} estrela{n > 1 ? 's' : ''}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Status" full>
          <Select value={f.status} onValueChange={(v) => set('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{['Ativo', 'Inativo'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
    </FormShell>);

}

export function CollectionForm({ open, onOpenChange, onSave, initial = null

}: {open: boolean;onOpenChange: (v: boolean) => void;onSave: (d: Partial<Collection>) => void;initial?: Collection | null;}) {
  const empty = { name: '', season: '', launch_date: '', goal: 0, status: 'Planejamento', products: 0, image: '', description: '' };
  const [f, setF] = useState(empty);
  useEffect(() => {if (open) setF(initial ? { ...empty, ...initial } : empty);}, [open, initial]);
  const set = (k: string, v: string | number) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {if (!f.name) return;onSave({ ...f, goal: Number(f.goal), products: Number(f.products), image: f.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop' });onOpenChange(false);};
  return (
    <FormShell open={open} onOpenChange={onOpenChange} title={initial ? 'Editar Coleção' : 'Nova Coleção'} onSubmit={submit} submitLabel={initial ? 'Salvar' : 'Criar Coleção'}>
      <div data-ev-id="ev_31e4393ccb" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome *" full><Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: Verão Encantado 2026" /></Field>
        <Field label="Temporada"><Input value={f.season || ''} onChange={(e) => set('season', e.target.value)} placeholder="Primavera/Verão 2026" /></Field>
        <Field label="Data de Lançamento"><Input type="date" value={f.launch_date || ''} onChange={(e) => set('launch_date', e.target.value)} /></Field>
        <Field label="Meta financeira (R$)"><Input type="number" value={f.goal} onChange={(e) => set('goal', e.target.value)} /></Field>
        <Field label="Status">
          <Select value={f.status} onValueChange={(v) => set('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{collectionStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Descrição / Referências" full><Textarea value={f.description || ''} onChange={(e) => set('description', e.target.value)} className="min-h-[80px]" /></Field>
      </div>
    </FormShell>);

}

export function StockMovementForm({ open, onOpenChange, onSave, fabrics = [], trims = [], initial = null

}: {open: boolean;onOpenChange: (v: boolean) => void;onSave: (d: Partial<StockMovement>) => void;fabrics?: {id: string;name: string;}[];trims?: {id: string;name: string;unit?: string;}[];initial?: StockMovement | null;}) {
  const empty = { type: 'Entrada' as const, category: 'Tecido' as const, item_id: '', item: '', qty: 0, unit: 'metros', reason: '' };
  const [f, setF] = useState(empty);
  useEffect(() => {if (open) setF(initial ? { type: initial.type as 'Entrada', category: initial.category as 'Tecido', item_id: '', item: initial.item || '', qty: initial.qty || 0, unit: initial.unit || 'metros', reason: initial.reason || '' } : empty);}, [open, initial]);
  const set = (k: string, v: string | number) => setF((p) => ({ ...p, [k]: v }));
  const itemList = f.category === 'Tecido' ? fabrics : trims;
  const submit = () => {
    if (!f.item_id && !initial) return;
    const item = itemList.find((x) => x.id === f.item_id);
    onSave({
      type: f.type as 'Entrada' | 'Saida', category: f.category as 'Tecido' | 'Aviamento', item: item?.name || f.item || '',
      qty: Number(f.qty), unit: f.category === 'Tecido' ? 'metros' : (item as {unit?: string;})?.unit || 'unidade',
      reason: f.reason, date: initial?.date || new Date().toISOString()
    });
    onOpenChange(false);
  };
  return (
    <FormShell open={open} onOpenChange={onOpenChange} title={initial ? 'Editar Movimentação' : 'Nova Movimentação de Estoque'} onSubmit={submit} submitLabel={initial ? 'Salvar' : 'Registrar'}>
      <div data-ev-id="ev_e34886ce4b" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Tipo">
          <Select value={f.type} onValueChange={(v) => set('type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{['Entrada', 'Saida'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Categoria">
          <Select value={f.category} onValueChange={(v) => {set('category', v);set('item_id', '');}}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{['Tecido', 'Aviamento'].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Item *" full>
          <Select value={f.item_id} onValueChange={(v) => set('item_id', v)}>
            <SelectTrigger><SelectValue placeholder={f.item || 'Selecionar item'} /></SelectTrigger>
            <SelectContent>{itemList.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label={f.category === 'Tecido' ? 'Quantidade (metros)' : 'Quantidade'}><Input type="number" step="0.1" value={f.qty} onChange={(e) => set('qty', e.target.value)} /></Field>
        <Field label="Motivo"><Input value={f.reason} onChange={(e) => set('reason', e.target.value)} placeholder="Compra, OP, Devolução..." /></Field>
      </div>
    </FormShell>);

}