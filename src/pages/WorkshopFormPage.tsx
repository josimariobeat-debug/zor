// @ts-nocheck - Cloud habilitado mas tabelas ainda não criadas; remova após gerar tipos.
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { X, Loader2 } from 'lucide-react';

interface Workshop {
  id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  price_per_piece: number;
  rating: number;
  status: string;
  in_progress: number;
}

export default function WorkshopFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { data: workshops, create, update, loading } = useSupabaseData<Workshop>('workshops');

  const [form, setForm] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    price_per_piece: 0,
    rating: 5,
    status: 'Ativa',
    in_progress: 0
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && workshops.length > 0) {
      const workshop = workshops.find((w) => w.id === id);
      if (workshop) {
        setForm({
          name: workshop.name || '',
          specialty: workshop.specialty || '',
          phone: workshop.phone || '',
          email: workshop.email || '',
          price_per_piece: workshop.price_per_piece || 0,
          rating: workshop.rating || 5,
          status: workshop.status || 'Ativa',
          in_progress: workshop.in_progress || 0
        });
      }
    }
  }, [isEditing, id, workshops]);

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
          toast({ title: 'Oficina atualizada', description: form.name });
          navigate('/oficinas');
        }
      } else {
        const result = await create(form);
        if (result) {
          toast({ title: 'Oficina cadastrada', description: form.name });
          navigate('/oficinas');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div data-ev-id="ev_48b16e30d0" className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>);

  }

  return (
    <div data-ev-id="ev_002c97b465" className="min-h-screen bg-white">
      <div data-ev-id="ev_61b89b69a6" className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div data-ev-id="ev_db2432a5b4" className="flex items-center justify-between mb-8">
          <h1 data-ev-id="ev_7c8085ee41" className="text-xl font-semibold text-stone-900">{isEditing ? 'Editar Oficina' : 'Nova Oficina'}</h1>
          <button data-ev-id="ev_f7614caa4e" onClick={() => navigate('/oficinas')} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Formulário */}
        <div data-ev-id="ev_091f32f85e" className="flex flex-col gap-6">
          <div data-ev-id="ev_738dae1743" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_3e69a31fa9">
              <label data-ev-id="ev_352d2b8699" className="block text-sm font-medium text-stone-900 mb-1.5">Nome *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da oficina" />
            </div>
            <div data-ev-id="ev_315955f344">
              <label data-ev-id="ev_7109594df0" className="block text-sm font-medium text-stone-900 mb-1.5">Especialidade</label>
              <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} placeholder="Ex: Vestidos e Saias" />
            </div>
          </div>

          <div data-ev-id="ev_76b6dd05f9" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_a3cf1d1209">
              <label data-ev-id="ev_37ee2c3ddb" className="block text-sm font-medium text-stone-900 mb-1.5">Telefone</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(00) 00000-0000" />
            </div>
            <div data-ev-id="ev_f89856acdf">
              <label data-ev-id="ev_9c2cafb3e0" className="block text-sm font-medium text-stone-900 mb-1.5">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@oficina.com" />
            </div>
          </div>

          <div data-ev-id="ev_056de0823a" className="grid grid-cols-3 gap-4">
            <div data-ev-id="ev_a285ed951a">
              <label data-ev-id="ev_9d09043a2d" className="block text-sm font-medium text-stone-900 mb-1.5">Preço por Peça (R$)</label>
              <Input type="number" step="0.01" value={form.price_per_piece} onChange={(e) => setForm({ ...form, price_per_piece: parseFloat(e.target.value) || 0 })} min={0} />
            </div>
            <div data-ev-id="ev_1335925c30">
              <label data-ev-id="ev_499250f8ce" className="block text-sm font-medium text-stone-900 mb-1.5">Avaliação</label>
              <Select value={String(form.rating)} onValueChange={(v) => setForm({ ...form, rating: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((r) => <SelectItem key={r} value={String(r)}>{r} estrelas</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div data-ev-id="ev_fcf9eb1c0c">
              <label data-ev-id="ev_dfd0db2c1e" className="block text-sm font-medium text-stone-900 mb-1.5">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativa">Ativa</SelectItem>
                  <SelectItem value="Inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões */}
          <div data-ev-id="ev_b05b36bd51" className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <Button variant="outline" onClick={() => navigate('/oficinas')}>
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