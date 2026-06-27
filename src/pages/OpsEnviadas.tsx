import ScissorsLoader from '@/components/ScissorsLoader';
// @ts-nocheck
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash2, ExternalLink, MessageCircle, Loader2, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface Dispatch {
  id: string;
  op_number: string;
  workshop_name: string | null;
  workshop_phone: string | null;
  access_token: string;
  status: string | null;
  total_pieces: number | null;
  completed_pieces: number | null;
  sent_at: string;
  finished_at: string | null;
}

export default function OpsEnviadas() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDispatches();

    // Atualizar a cada 30 segundos
    const interval = setInterval(loadDispatches, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const loadDispatches = async () => {
    if (!supabase || !user) return;

    const { data } = await supabase.
    from('op_dispatches').
    select('*').
    order('sent_at', { ascending: false });

    setDispatches(data || []);
    setLoading(false);
  };

  const handleDelete = async (d: Dispatch) => {
    const confirmed = await confirm({
      title: `Excluir envio de ${d.op_number}?`,
      description: 'O link de acompanhamento será desativado.',
      level: 'medium',
      confirmText: 'Excluir',
      itemType: 'Envio'
    });
    if (!confirmed || !supabase) return;

    await supabase.from('op_dispatches').delete().eq('id', d.id);
    setDispatches((prev) => prev.filter((x) => x.id !== d.id));
    toast({ title: 'Envio excluído' });
  };

  const handleCopyLink = (d: Dispatch) => {
    const url = `${window.location.origin}/op/${d.access_token}`;
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    toast({ title: 'Link copiado!' });
  };

  const handleWhatsApp = (d: Dispatch) => {
    if (!d.workshop_phone) {
      toast({ title: 'Sem telefone', description: 'A oficina não tem telefone cadastrado.', variant: 'destructive' });
      return;
    }

    const url = `${window.location.origin}/op/${d.access_token}`;
    const msg = `Olá! Segue o link para acompanhar a *${d.op_number}*:\n\n${url}\n\nClique no link para ver os itens e marcar o que for finalizando.`;
    const phone = d.workshop_phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getStatusBadge = (d: Dispatch) => {
    if (d.status === 'finalizado') {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] gap-1"><CheckCircle2 className="w-3 h-3" /> Finalizado</Badge>;
    }
    return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] gap-1"><Clock className="w-3 h-3" /> Em produção</Badge>;
  };

  if (loading) {
    return (
      <div data-ev-id="ev_48637d8715" className="flex items-center justify-center min-h-[70vh]">
        <ScissorsLoader />
      </div>);

  }

  const finishedCount = dispatches.filter((d) => d.status === 'finalizado').length;
  const activeCount = dispatches.filter((d) => d.status === 'em_producao').length;

  return (
    <div data-ev-id="ev_b1d8094c7b" className="flex flex-col gap-6">
      <header data-ev-id="ev_e34443b9fd" className="flex items-start justify-between">
        <div data-ev-id="ev_cc7cfaa80a">
          <h1 data-ev-id="ev_706bf1016f" className="text-[26px] font-semibold text-stone-900 tracking-tight">OPs Enviadas</h1>
          <p data-ev-id="ev_2322f0b555" className="text-sm text-stone-500 mt-1">
            {dispatches.length} envios · {activeCount} em produção · {finishedCount} finalizados
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDispatches} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </Button>
      </header>

      {dispatches.length === 0 ?
      <Card className="p-12 text-center bg-white border-stone-200/80 shadow-none">
          <p data-ev-id="ev_41f3c3ab3a" className="text-stone-500">Nenhuma OP enviada ainda.</p>
          <p data-ev-id="ev_558e38072c" className="text-sm text-stone-400 mt-2">Use o botão "Enviar para Oficina" nas OPs.</p>
        </Card> :

      <div data-ev-id="ev_b8d4fba5d7" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {dispatches.map((d) => {
          const total = d.total_pieces ?? 0;
          const completed = d.completed_pieces ?? 0;
          const pct = total > 0 ? Math.round(completed / total * 100) : 0;
          const isNew = d.status === 'finalizado' && d.finished_at &&
          new Date().getTime() - new Date(d.finished_at).getTime() < 3600000; // Última hora

          return (
            <Card key={d.id} className={`p-5 bg-white border-stone-200/80 shadow-none ${isNew ? 'ring-2 ring-emerald-500' : ''}`}>
                <div data-ev-id="ev_2b9e37f5f4" className="flex items-start justify-between mb-4">
                  <div data-ev-id="ev_cba4cc854b">
                    <div data-ev-id="ev_705e31aa09" className="text-sm font-semibold text-stone-900">{d.op_number}</div>
                    <div data-ev-id="ev_37636a558c" className="text-xs text-stone-500 mt-0.5">{d.workshop_name || 'Sem oficina'}</div>
                    <div data-ev-id="ev_042d8ef9c4" className="text-[11px] text-stone-400 mt-1">
                      Enviada em {new Date(d.sent_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {getStatusBadge(d)}
                </div>

                <div data-ev-id="ev_35128a5939" className="flex flex-col gap-2">
                  <div data-ev-id="ev_8ec74125e0" className="flex items-center justify-between text-xs">
                    <span data-ev-id="ev_367723ef77" className="text-stone-600">{completed} de {total} peças</span>
                    <span data-ev-id="ev_c9f611beba" className="font-semibold text-stone-900">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>

                <div data-ev-id="ev_66561261a0" className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
                  <Button size="sm" variant="outline" onClick={() => handleCopyLink(d)} className="text-xs gap-1.5 h-8">
                    <ExternalLink className="w-3.5 h-3.5" /> Copiar link
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleWhatsApp(d)} className="text-xs gap-1.5 h-8">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </Button>
                  <Button onClick={() => handleDelete(d)} size="sm" variant="ghost" className="text-xs gap-1.5 h-8 ml-auto text-stone-500 hover:text-rose-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>);

        })}
        </div>
      }
    </div>);

}