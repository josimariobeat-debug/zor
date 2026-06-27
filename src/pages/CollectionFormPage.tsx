import ScissorsLoader from '@/components/ScissorsLoader';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { toast } from '@/hooks/use-toast';
import { X, Loader2 } from 'lucide-react';
import { useCloseFormConfirm } from '@/hooks/useCloseFormConfirm';


interface Collection {
  id: string;
  name: string;
  season: string | null;
  launch_date: string | null;
  goal: number;
  status: string;
  description: string | null;
  image: string | null;
}

export default function CollectionFormPage() {
  const navigate = useNavigate();
  const handleClose = useCloseFormConfirm('/colecoes');

  const { id } = useParams();
  const isEditing = Boolean(id);
  const { data: collections, create, update, loading } = useSupabaseData<Collection>('collections');

  const [form, setForm] = useState({
    name: '',
    season: '',
    launch_date: '',
    goal: 0,
    status: 'Planejamento',
    description: '',
    image: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && collections.length > 0) {
      const collection = collections.find((c) => c.id === id);
      if (collection) {
        setForm({
          name: collection.name || '',
          season: collection.season || '',
          launch_date: collection.launch_date || '',
          goal: collection.goal || 0,
          status: collection.status || 'Planejamento',
          description: collection.description || '',
          image: collection.image || ''
        });
      }
    }
  }, [isEditing, id, collections]);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...form,
        launch_date: form.launch_date || null,
        image: form.image || null
      };

      if (isEditing) {
        const result = await update(id!, data);
        if (result) {
          toast({ title: 'Coleção atualizada', description: form.name });
          navigate('/colecoes');
        }
      } else {
        const result = await create(data);
        if (result) {
          toast({ title: 'Coleção cadastrada', description: form.name });
          navigate('/colecoes');
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div data-ev-id="ev_a0df882b7f" className="flex items-center justify-center h-64">
        <ScissorsLoader />
      </div>);

  }

  return (
    <div data-ev-id="ev_204c37ed00" className="min-h-screen bg-white">
      <div data-ev-id="ev_0f17d20ed0" className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div data-ev-id="ev_0cfbacdf53" className="flex items-center justify-between mb-8">
          <h1 data-ev-id="ev_2279576e62" className="text-xl font-semibold text-stone-900">{isEditing ? 'Editar Coleção' : 'Nova Coleção'}</h1>
          <button data-ev-id="ev_9c366550ce" onClick={handleClose} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        {/* Formulário */}
        <div data-ev-id="ev_6d7ce59926" className="flex flex-col gap-6">
          <div data-ev-id="ev_3574158db7" className="grid grid-cols-2 gap-4">
            <div data-ev-id="ev_73deedd0d3">
              <label data-ev-id="ev_295cf6286c" className="block text-sm font-medium text-stone-900 mb-1.5">Nome *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da coleção" />
            </div>
            <div data-ev-id="ev_92d8c32650">
              <label data-ev-id="ev_1f95367c4f" className="block text-sm font-medium text-stone-900 mb-1.5">Estação</label>
              <Select value={form.season} onValueChange={(v) => setForm({ ...form, season: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar estação" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primavera/Verão">Primavera/Verão</SelectItem>
                  <SelectItem value="Outono/Inverno">Outono/Inverno</SelectItem>
                  <SelectItem value="Alto Verão">Alto Verão</SelectItem>
                  <SelectItem value="Cápsula">Cápsula</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div data-ev-id="ev_d6719893a0" className="grid grid-cols-3 gap-4">
            <div data-ev-id="ev_c934960113">
              <label data-ev-id="ev_ec811aca1b" className="block text-sm font-medium text-stone-900 mb-1.5">Data de Lançamento</label>
              <Input type="date" value={form.launch_date} onChange={(e) => setForm({ ...form, launch_date: e.target.value })} />
            </div>
            <div data-ev-id="ev_52759fbeda">
              <label data-ev-id="ev_df86fb7103" className="block text-sm font-medium text-stone-900 mb-1.5">Meta de Vendas (R$)</label>
              <NumberInput variant="currency" value={form.goal} onChange={(v) => setForm({ ...form, goal: v ?? 0 })} />
            </div>
            <div data-ev-id="ev_d7c619b0a6">
              <label data-ev-id="ev_c1cbe2ab58" className="block text-sm font-medium text-stone-900 mb-1.5">Status</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planejamento">Planejamento</SelectItem>
                  <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="Produção">Produção</SelectItem>
                  <SelectItem value="Ativa">Ativa</SelectItem>
                  <SelectItem value="Encerrada">Encerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div data-ev-id="ev_ef04aa68ff">
            <label data-ev-id="ev_7378fa99de" className="block text-sm font-medium text-stone-900 mb-1.5">Descrição</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição da coleção" rows={3} />
          </div>

          <div data-ev-id="ev_01a4a52cb8">
            <label data-ev-id="ev_0117a8f890" className="block text-sm font-medium text-stone-900 mb-1.5">URL da Imagem</label>
            <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            {form.image &&
            <div data-ev-id="ev_574bd599a3" className="mt-3">
                <img data-ev-id="ev_ff883a264a" src={form.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-stone-200" />
              </div>
            }
          </div>

          {/* Botões */}
          <div data-ev-id="ev_51c23b7e90" className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <Button variant="outline" onClick={() => navigate('/colecoes')}>
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