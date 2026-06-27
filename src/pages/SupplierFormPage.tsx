import ScissorsLoader, { PageLoader } from '@/components/ScissorsLoader';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { X, Loader2 } from 'lucide-react';
import { useCloseFormConfirm } from '@/hooks/useCloseFormConfirm';


interface Supplier {
  id: string;
  name: string;
  type: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  lead_time: number;
  rating: number;
  status: string;
}

export default function SupplierFormPage() {
  const navigate = useNavigate();
  const handleClose = useCloseFormConfirm('/fornecedores');

  const { id } = useParams();
  const isEditing = Boolean(id);
  const { data: suppliers, create, update, loading } = useSupabaseData<Supplier>('suppliers');

  const [form, setForm] = useState({
    name: '',
    type: 'Tecido',
    contact: '',
    phone: '',
    email: '',
    city: '',
    lead_time: 7,
    rating: 5,
    status: 'Ativo'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && suppliers.length > 0) {
      const supplier = suppliers.find((s) => s.id === id);
      if (supplier) {
        setForm({
          name: supplier.name || '',
          type: supplier.type || 'Tecido',
          contact: supplier.contact || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          city: supplier.city || '',
          lead_time: supplier.lead_time || 7,
          rating: supplier.rating || 5,
          status: supplier.status || 'Ativo'
        });
      }
    }
  }, [isEditing, id, suppliers]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        const result = await update(id!, form);
        if (result) {
          toast({ title: 'Fornecedor atualizado', description: form.name });
          navigate('/fornecedores');
        }
      } else {
        const result = await create(form);
        if (result) {
          toast({ title: 'Fornecedor cadastrado', description: form.name });
          navigate('/fornecedores');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEditing) {
    return (
      <PageLoader />);

  }

  return (
    <div data-ev-id="ev_a6f1fc65a3" className="min-h-screen bg-white">
      <div data-ev-id="ev_85dd57355a" className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div data-ev-id="ev_c4a3b704e9" className="flex items-center justify-between mb-8">
          <h1 data-ev-id="ev_e4c10ae899" className="text-xl font-semibold text-stone-900">{isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h1>
          <button data-ev-id="ev_23aa8ead17" onClick={handleClose} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Formulário */}
        <div data-ev-id="ev_1228eff16e" className="flex flex-col gap-6">
          <div data-ev-id="ev_26ff721ee0" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_ceb1113b87">
              <label data-ev-id="ev_726d14322b" className="block text-sm font-medium text-stone-900 mb-1.5">Nome *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do fornecedor" />
            </div>
            <div data-ev-id="ev_1bc71e2286">
              <label data-ev-id="ev_a96fed1971" className="block text-sm font-medium text-stone-900 mb-1.5">Tipo</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tecido">Tecido</SelectItem>
                  <SelectItem value="Aviamento">Aviamento</SelectItem>
                  <SelectItem value="Embalagem">Embalagem</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div data-ev-id="ev_2d5889e701" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_8360bdbf2f">
              <label data-ev-id="ev_af260e09cc" className="block text-sm font-medium text-stone-900 mb-1.5">Contato</label>
              <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Nome do contato" />
            </div>
            <div data-ev-id="ev_cb9e91bb0e">
              <label data-ev-id="ev_32d955d9da" className="block text-sm font-medium text-stone-900 mb-1.5">Telefone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
            </div>
          </div>

          <div data-ev-id="ev_2c73d24e90" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_4d79d4a15e">
              <label data-ev-id="ev_e1f951e941" className="block text-sm font-medium text-stone-900 mb-1.5">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@fornecedor.com" />
            </div>
            <div data-ev-id="ev_8fa23d8d76">
              <label data-ev-id="ev_50338efba6" className="block text-sm font-medium text-stone-900 mb-1.5">Cidade</label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Cidade/UF" />
            </div>
          </div>

          <div data-ev-id="ev_3ab9f1776a" className="grid grid-cols-3 gap-4">
            <div data-ev-id="ev_89e99be2b8">
              <label data-ev-id="ev_cd6284fb8f" className="block text-sm font-medium text-stone-900 mb-1.5">Prazo de Entrega (dias)</label>
              <Input type="number" value={form.lead_time} onChange={(e) => setForm({ ...form, lead_time: parseInt(e.target.value) || 0 })} min={0} />
            </div>
            <div data-ev-id="ev_91e40bb129">
              <label data-ev-id="ev_180a25cfc6" className="block text-sm font-medium text-stone-900 mb-1.5">Avaliação</label>
              <Select value={String(form.rating)} onValueChange={(v) => setForm({ ...form, rating: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((r) => <SelectItem key={r} value={String(r)}>{r} estrelas</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div data-ev-id="ev_0405dff759">
              <label data-ev-id="ev_9c11db0def" className="block text-sm font-medium text-stone-900 mb-1.5">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões */}
          <div data-ev-id="ev_697dd5b430" className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <Button variant="outline" onClick={() => navigate('/fornecedores')}>
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