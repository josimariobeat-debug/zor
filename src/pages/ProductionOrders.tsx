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
import { supabase } from '@/integrations/supabase/client';
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

  // Realtime: atualiza em segundo plano sem disparar loading global
  useEffect(() => {
    const silentRefetch = () => refetch({ silent: true });
    const channel = supabase
      .channel('production_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'production_orders' }, silentRefetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'op_dispatches' }, silentRefetch)
      .subscribe();
    // Fallback de polling silencioso para casos em que o realtime estiver indisponível
    const interval = setInterval(silentRefetch, 30000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
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

  const handlePrint = async (op: any, detailed: boolean) => {
    const items = op.items || [];
    const trims = op.trims_used || [];
    const brl = (n: number) => `R$ ${(n || 0).toFixed(2)}`;

    // Buscar imagens dos produtos
    const productIds = Array.from(new Set(items.map((i: any) => i.product_id).filter(Boolean))) as string[];
    const imageMap: Record<string, string> = {};
    if (productIds.length > 0 && supabase) {
      const { data: prods } = await supabase.from('products').select('id, image').in('id', productIds);
      (prods || []).forEach((p: any) => { if (p.image) imageMap[p.id] = p.image; });
    }

    const totalQty = items.reduce(
      (acc: number, it: any) => acc + (it.variations || []).reduce((s: number, v: any) => s + (v.qty || 0), 0),
      0
    );
    const totalCost = op.total_cost || 0;
    const totalRevenue = op.total_revenue || 0;
    const margin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
    const profit = totalRevenue - totalCost;

    let html = `
      <html><head><title>${op.number}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; padding: 24px; color: #1c1917; }
        h1 { font-size: 22px; margin: 0 0 4px; }
        h2 { font-size: 14px; margin: 24px 0 8px; color: #57534e; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e7e5e4; padding-bottom: 6px; }
        .sub { color: #78716c; font-size: 12px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #f5f5f4; font-size: 12px; }
        th { background: #fafaf9; font-weight: 600; color: #44403c; }
        td.num, th.num { text-align: right; }
        .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
        .meta-item { background: #fafaf9; padding: 10px 12px; border-radius: 6px; border: 1px solid #f5f5f4; }
        .meta-label { font-size: 10px; color: #78716c; text-transform: uppercase; letter-spacing: 0.05em; }
        .meta-value { font-size: 14px; font-weight: 600; margin-top: 2px; }
        .product-card { display: flex; gap: 14px; padding: 14px; border: 1px solid #e7e5e4; border-radius: 10px; margin-top: 10px; page-break-inside: avoid; }
        .product-photo { width: 110px; height: 110px; border-radius: 8px; background: #f5f5f4; object-fit: cover; flex-shrink: 0; border: 1px solid #e7e5e4; }
        .product-photo.empty { display: flex; align-items: center; justify-content: center; color: #a8a29e; font-size: 11px; }
        .product-body { flex: 1; min-width: 0; }
        .product-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .product-meta { font-size: 11px; color: #78716c; margin-bottom: 8px; }
        .var-table { margin-top: 6px; }
        .totals { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 8px; }
        .obs { background: #fffbeb; border: 1px solid #fde68a; padding: 10px 12px; border-radius: 6px; font-size: 12px; color: #78350f; }
        @media print { body { padding: 12px; } }
      </style></head><body>
      <h1>${op.number}</h1>
      <div class="sub">${detailed ? 'Relatório detalhado' : 'Resumo de produção'} · gerado em ${new Date().toLocaleString('pt-BR')}</div>

      <div class="meta">
        <div class="meta-item"><div class="meta-label">Status</div><div class="meta-value">${STATUS_MAP[op.status]?.label || op.status}</div></div>
        <div class="meta-item"><div class="meta-label">Quantidade</div><div class="meta-value">${totalQty || op.quantity} peças</div></div>
        <div class="meta-item"><div class="meta-label">Prazo</div><div class="meta-value">${op.deadline ? new Date(op.deadline).toLocaleDateString('pt-BR') : '-'}</div></div>
        <div class="meta-item"><div class="meta-label">Oficina</div><div class="meta-value">${op.workshop_name || '-'}</div></div>
        <div class="meta-item"><div class="meta-label">Tecido</div><div class="meta-value">${op.fabric_name || '-'}</div></div>
        <div class="meta-item"><div class="meta-label">Metros consumidos</div><div class="meta-value">${op.fabric_meters_consumed || 0}m</div></div>
      </div>
    `;

    if (detailed) {
      html += `
        <div class="meta" style="margin-top:10px;">
          <div class="meta-item"><div class="meta-label">Prioridade</div><div class="meta-value">${op.priority || '-'}</div></div>
          <div class="meta-item"><div class="meta-label">Início</div><div class="meta-value">${op.start_date ? new Date(op.start_date).toLocaleDateString('pt-BR') : '-'}</div></div>
          <div class="meta-item"><div class="meta-label">Criada em</div><div class="meta-value">${op.created_at ? new Date(op.created_at).toLocaleDateString('pt-BR') : '-'}</div></div>
        </div>
      `;
    }

    if (items.length > 0) {
      html += `<h2>Produtos</h2>`;
      items.forEach((item: any) => {
        const img = imageMap[item.product_id];
        const itemQty = (item.variations || []).reduce((s: number, v: any) => s + (v.qty || 0), 0);
        html += `<div class="product-card">
          ${img ? `<img class="product-photo" src="${img}" />` : `<div class="product-photo empty">sem foto</div>`}
          <div class="product-body">
            <div class="product-title">${item.product_name}</div>
            <div class="product-meta">${itemQty} peças${detailed && item.unit_cost ? ` · custo unitário ${brl(item.unit_cost)}` : ''}</div>
            <table class="var-table"><thead><tr><th>Tamanho</th><th>Cor</th><th class="num">Qtd</th>${detailed ? '<th class="num">Metros/peça</th>' : ''}</tr></thead><tbody>`;
        (item.variations || []).forEach((v: any) => {
          html += `<tr><td>${v.size || '-'}</td><td>${v.color || '-'}</td><td class="num">${v.qty}</td>${detailed ? `<td class="num">${v.meters_per_piece || 0}m</td>` : ''}</tr>`;
        });
        html += `</tbody></table>`;
        if (detailed) {
          html += `<div class="totals" style="margin-top:10px;">
            <div class="meta-item"><div class="meta-label">Tecido</div><div class="meta-value">${brl(item.fabric_cost)}</div></div>
            <div class="meta-item"><div class="meta-label">Aviamentos</div><div class="meta-value">${brl(item.trim_cost)}</div></div>
            <div class="meta-item"><div class="meta-label">Mão de obra</div><div class="meta-value">${brl(item.labor_cost)}</div></div>
            <div class="meta-item"><div class="meta-label">Total item</div><div class="meta-value">${brl(item.total_cost)}</div></div>
          </div>`;
        }
        html += `</div></div>`;
      });
    }

    if (trims.length > 0) {
      html += `<h2>Aviamentos</h2><table><thead><tr><th>Aviamento</th><th class="num">Por peça</th><th class="num">Total</th></tr></thead><tbody>`;
      trims.forEach((t: any) => {
        html += `<tr><td>${t.trim_name}</td><td class="num">${t.qty_per_piece}</td><td class="num">${t.total_qty}</td></tr>`;
      });
      html += `</tbody></table>`;
    }

    if (detailed) {
      html += `<h2>Custos & receita</h2>
        <div class="totals">
          <div class="meta-item"><div class="meta-label">Custo total</div><div class="meta-value">${brl(totalCost)}</div></div>
          <div class="meta-item"><div class="meta-label">Receita prevista</div><div class="meta-value">${brl(totalRevenue)}</div></div>
          <div class="meta-item"><div class="meta-label">Lucro</div><div class="meta-value">${brl(profit)}</div></div>
          <div class="meta-item"><div class="meta-label">Margem</div><div class="meta-value">${margin.toFixed(1)}%</div></div>
        </div>
        <div class="meta" style="margin-top:10px;">
          <div class="meta-item"><div class="meta-label">Custo médio/peça</div><div class="meta-value">${brl(totalQty > 0 ? totalCost / totalQty : 0)}</div></div>
          <div class="meta-item"><div class="meta-label">Receita média/peça</div><div class="meta-value">${brl(totalQty > 0 ? totalRevenue / totalQty : 0)}</div></div>
          <div class="meta-item"><div class="meta-label">Lucro/peça</div><div class="meta-value">${brl(totalQty > 0 ? profit / totalQty : 0)}</div></div>
        </div>`;
    }

    if (op.observations) {
      html += `<h2>Observações</h2><div class="obs">${op.observations}</div>`;
    }

    html += `</body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      // Aguarda imagens carregarem antes de imprimir
      win.onload = () => setTimeout(() => win.print(), 300);
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