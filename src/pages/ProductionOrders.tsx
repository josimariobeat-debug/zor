/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Printer, MoreVertical, XCircle, Loader2, Send } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useProductionOrders } from '@/hooks/useSupabaseData';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/loose';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

interface Workshop {
  id: string;
  name: string;
  phone: string | null;
}

const STATUS_MAP: Record<string, {label: string;color: string;}> = {
  modelagem: { label: 'Modelagem', color: 'bg-violet-50 text-violet-700' },
  corte: { label: 'Corte', color: 'bg-blue-50 text-blue-700' },
  costura: { label: 'Costura', color: 'bg-amber-50 text-amber-700' },
  acabamento: { label: 'Acabamento', color: 'bg-cyan-50 text-cyan-700' },
  finalizado: { label: 'Finalizado', color: 'bg-emerald-50 text-emerald-700' },
  cancelado: { label: 'Cancelado', color: 'bg-rose-50 text-rose-700' }
};

export default function ProductionOrders() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  const { data: orders, loading, cancel, remove, refetch } = useProductionOrders();
  const { data: workshops } = useSupabaseData<Workshop>('workshops');

  // Atualizar dados a cada 15 segundos para refletir mudanças da oficina
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  const list = orders.filter((op) =>
  (op.number || '').toLowerCase().includes(q.toLowerCase()) ||
  (op.fabric_name || '').toLowerCase().includes(q.toLowerCase())
  );

  const handleCancel = async (op: any) => {
    const confirmed = await confirm({
      title: `Cancelar ${op.number}?`,
      description: 'O estoque de tecido e aviamentos será devolvido.',
      level: 'medium',
      confirmText: 'Cancelar OP',
      context: [
      { label: 'Tecido', value: op.fabric_name || '-' },
      { label: 'Quantidade', value: `${op.quantity} peças` }],

      itemType: 'Ordem de Produção'
    });
    if (!confirmed) return;

    const success = await cancel(op.id);
    if (success) {
      toast({ title: 'OP cancelada', description: `${op.number} foi cancelada e o estoque devolvido.` });
    }
  };

  const handleDelete = async (op: any) => {
    const confirmed = await confirm({
      title: `Excluir ${op.number}?`,
      description: 'A ordem de produção será removida permanentemente.',
      level: 'critical',
      confirmText: 'Excluir permanentemente',
      context: [
      { label: 'Status', value: STATUS_MAP[op.status]?.label || op.status },
      { label: 'Quantidade', value: `${op.quantity} peças` }],

      itemType: 'Ordem de Produção'
    });
    if (!confirmed) return;

    const success = await remove(op.id);
    if (success) {
      toast({ title: 'OP excluída', description: op.number });
    }
  };

  const handlePrint = (op: any, detailed: boolean) => {
    const items = op.items || [];
    const trims = op.trims_used || [];

    let html = `
      <html><head><title>${op.number}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 20px; }
        h1 { font-size: 18px; margin-bottom: 10px; }
        h2 { font-size: 14px; margin-top: 20px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; font-size: 12px; }
        th { background: #f5f5f5; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
        .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px; }
        .meta-item { background: #f9f9f9; padding: 10px; border-radius: 6px; }
        .meta-label { font-size: 11px; color: #666; }
        .meta-value { font-size: 14px; font-weight: 600; }
      </style></head><body>
      <h1>${op.number}</h1>
      <div class="meta">
        <div class="meta-item"><div class="meta-label">Status</div><div class="meta-value">${STATUS_MAP[op.status]?.label || op.status}</div></div>
        <div class="meta-item"><div class="meta-label">Quantidade</div><div class="meta-value">${op.quantity} peças</div></div>
        <div class="meta-item"><div class="meta-label">Prazo</div><div class="meta-value">${op.deadline ? new Date(op.deadline).toLocaleDateString('pt-BR') : '-'}</div></div>
        <div class="meta-item"><div class="meta-label">Tecido</div><div class="meta-value">${op.fabric_name || '-'}</div></div>
        <div class="meta-item"><div class="meta-label">Metros</div><div class="meta-value">${op.fabric_meters_consumed}m</div></div>
        <div class="meta-item"><div class="meta-label">Oficina</div><div class="meta-value">${op.workshop_name || '-'}</div></div>
      </div>
    `;

    if (items.length > 0) {
      html += `<h2>Produtos</h2><table><thead><tr><th>Produto</th><th>Tamanho</th><th>Cor</th><th>Qtd</th></tr></thead><tbody>`;
      items.forEach((item: any) => {
        (item.variations || []).forEach((v: any) => {
          html += `<tr><td>${item.product_name}</td><td>${v.size || '-'}</td><td>${v.color || '-'}</td><td>${v.qty}</td></tr>`;
        });
      });
      html += `</tbody></table>`;
    }

    if (trims.length > 0) {
      html += `<h2>Aviamentos</h2><table><thead><tr><th>Aviamento</th><th>Por Peça</th><th>Total</th></tr></thead><tbody>`;
      trims.forEach((t: any) => {
        html += `<tr><td>${t.trim_name}</td><td>${t.qty_per_piece}</td><td>${t.total_qty}</td></tr>`;
      });
      html += `</tbody></table>`;
    }

    if (detailed) {
      html += `
        <h2>Custos</h2>
        <div class="meta">
          <div class="meta-item"><div class="meta-label">Custo Total</div><div class="meta-value">R$ ${(op.total_cost || 0).toFixed(2)}</div></div>
          <div class="meta-item"><div class="meta-label">Receita Prevista</div><div class="meta-value">R$ ${(op.total_revenue || 0).toFixed(2)}</div></div>
          <div class="meta-item"><div class="meta-label">Margem</div><div class="meta-value">${op.total_revenue > 0 ? ((op.total_revenue - op.total_cost) / op.total_revenue * 100).toFixed(1) : 0}%</div></div>
        </div>
      `;
    }

    if (op.observations) {
      html += `<h2>Observações</h2><p style="font-size: 12px; color: #666;">${op.observations}</p>`;
    }

    html += `</body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  };

  const handleSendToWorkshop = async (op: any) => {
    if (!supabase || !user) return;

    const workshop = workshops.find((w) => w.id === op.workshop_id);

    setSending(op.id);
    try {
      // Calcular total de peças
      const items = op.items || [];
      let totalPieces = 0;
      const dispatchItems: any[] = [];

      items.forEach((item: any) => {
        (item.variations || []).forEach((v: any) => {
          totalPieces += v.qty || 0;
          dispatchItems.push({
            variation_id: v.id,
            product_name: item.product_name,
            size: v.size,
            color: v.color,
            qty: v.qty || 0
          });
        });
      });

      // Criar dispatch
      const { data: dispatch, error: dispatchError } = await supabase.
      from('op_dispatches').
      insert({
        user_id: user.id,
        production_order_id: op.id,
        op_number: op.number,
        workshop_id: op.workshop_id,
        workshop_name: workshop?.name || null,
        workshop_phone: workshop?.phone || null,
        total_pieces: totalPieces,
        completed_pieces: 0
      }).
      select().
      single();

      if (dispatchError) throw dispatchError;

      // Criar itens do dispatch
      if (dispatchItems.length > 0) {
        await supabase.
        from('op_dispatch_items').
        insert(dispatchItems.map((item) => ({
          ...item,
          dispatch_id: dispatch.id
        })));
      }

      // Gerar link e abrir WhatsApp
      const link = `${window.location.origin}/op/${dispatch.access_token}`;

      if (workshop?.phone) {
        const msg = `Olá! Segue o link para acompanhar a *${op.number}*:\n\n${link}\n\nClique no link para ver os itens e marcar o que for finalizando.`;
        const phone = workshop.phone.replace(/\D/g, '');
        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`, '_blank');
      } else {
        // Copiar link
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      toast({
        title: 'OP enviada!',
        description: workshop?.phone ? 'Link enviado via WhatsApp' : 'Link copiado para a área de transferência'
      });
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' });
    } finally {
      setSending(null);
    }
  };

  if (loading) {
    return (
      <div data-ev-id="ev_05bc27740e" className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>);

  }

  return (
    <div data-ev-id="ev_3da7f77deb" className="flex flex-col gap-6">
      <header data-ev-id="ev_48726ee9c3" className="flex items-start justify-between">
        <div data-ev-id="ev_67df87d079">
          <h1 data-ev-id="ev_f7f95e099c" className="text-[26px] font-semibold text-stone-900 tracking-tight">Ordens de Produção</h1>
          <p data-ev-id="ev_6f24ee5ab2" className="text-sm text-stone-500 mt-1">{orders.length} ordens cadastradas</p>
        </div>
        <Button onClick={() => navigate('/ordens/nova')} className="bg-stone-900 hover:bg-stone-800 text-white rounded-lg gap-2">
          <Plus className="w-4 h-4" /> Nova OP
        </Button>
      </header>

      <div data-ev-id="ev_c41f06ba03" className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input placeholder="Buscar OP..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-white border-stone-200 rounded-lg h-10" />
      </div>

      {list.length === 0 ?
      <Card className="p-12 text-center bg-white border-stone-200/80 shadow-none">
          <p data-ev-id="ev_d394ea2a64" className="text-stone-500">{orders.length === 0 ? 'Nenhuma OP cadastrada.' : 'Nenhuma OP encontrada.'}</p>
        </Card> :

      <Card className="bg-white border-stone-200/80 shadow-none overflow-hidden">
          <table data-ev-id="ev_d3d9bc6898" className="w-full">
            <thead data-ev-id="ev_2a6c4b6986">
              <tr data-ev-id="ev_9fe3b8b3df" className="border-b border-stone-200 bg-stone-50/50">
                {['Número da OP', 'Tecido', 'Oficina', 'Qtd', 'Prazo', 'Status', ''].map((h) =>
              <th data-ev-id="ev_f652507f06" key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                    {h}
                  </th>
              )}
              </tr>
            </thead>
            <tbody data-ev-id="ev_baf1780b46">
              {list.map((op) => {
              const status = STATUS_MAP[op.status] || { label: op.status, color: 'bg-stone-100 text-stone-600' };
              const canCancel = !['cancelado', 'finalizado'].includes(op.status);

              return (
                <tr data-ev-id="ev_c1b171b26a" key={op.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                    <td data-ev-id="ev_e47b1e29af" className="px-5 py-4">
                      <div data-ev-id="ev_db2e2941b5" className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button data-ev-id="ev_11e71111b5" className="text-stone-400 hover:text-stone-600 p-1">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {canCancel &&
                          <DropdownMenuItem onClick={() => handleCancel(op)} className="text-rose-600">
                                <XCircle className="w-4 h-4 mr-2" /> Cancelar OP
                              </DropdownMenuItem>
                          }
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <span data-ev-id="ev_13b9b6a66e" className="text-sm font-medium text-stone-900">{op.number}</span>
                      </div>
                    </td>
                    <td data-ev-id="ev_247e6d1a8d" className="px-5 py-4 text-sm text-stone-600">{op.fabric_name || '-'}</td>
                    <td data-ev-id="ev_f30b604b7a" className="px-5 py-4 text-sm text-stone-600">{op.workshop_name || '-'}</td>
                    <td data-ev-id="ev_b23b8ec6fd" className="px-5 py-4 text-sm text-stone-900 font-medium">{op.quantity}</td>
                    <td data-ev-id="ev_4f3a9203cb" className="px-5 py-4 text-sm text-stone-600">
                      {op.deadline ? new Date(op.deadline).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td data-ev-id="ev_fcf09bac70" className="px-5 py-4">
                      <span data-ev-id="ev_336a2b9667" className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td data-ev-id="ev_9e0ba5061c" className="px-5 py-4">
                      <div data-ev-id="ev_eeef908ca8" className="flex items-center gap-1 justify-end">
                        <button data-ev-id="ev_150feb7c31" onClick={() => navigate(`/ordens/${op.id}/editar`)} className="text-stone-400 hover:text-stone-900 p-1">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button data-ev-id="ev_7df16468ce" onClick={() => handleDelete(op)} className="text-stone-400 hover:text-rose-700 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button data-ev-id="ev_ee4875b312" className="text-stone-400 hover:text-stone-900 p-1">
                              <Printer className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePrint(op, false)}>Resumido (sem custos)</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrint(op, true)}>Detalhado (com custos)</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <button data-ev-id="ev_c14a9c0b83"
                      onClick={() => handleSendToWorkshop(op)}
                      disabled={sending === op.id}
                      className="text-stone-400 hover:text-blue-600 p-1 disabled:opacity-50"
                      title="Enviar para Oficina">

                          {sending === op.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>);

            })}
            </tbody>
          </table>
        </Card>
      }
    </div>);

}