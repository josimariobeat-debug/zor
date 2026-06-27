// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseData, useProductionOrders } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Scissors, Layers, ClipboardList, Loader2, CheckCircle2, Bell, X, ExternalLink, Check, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

interface FinishedDispatch {
  id: string;
  op_number: string;
  workshop_name: string | null;
  finished_at: string;
  total_pieces: number;
}

const STORAGE_KEY = 'read_op_notifications';

function getReadNotifications(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function markAsRead(id: string) {
  const read = getReadNotifications();
  if (!read.includes(id)) {
    read.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(read));
  }
}

function markAsUnread(id: string) {
  const read = getReadNotifications();
  const updated = read.filter((r) => r !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: products, loading: loadingProducts } = useSupabaseData<any>('products');
  const { data: fabrics, loading: loadingFabrics } = useSupabaseData<any>('fabrics');
  const { data: trims, loading: loadingTrims } = useSupabaseData<any>('trims');
  const { data: orders, loading: loadingOrders } = useProductionOrders();
  const [finishedDispatches, setFinishedDispatches] = useState<FinishedDispatch[]>([]);
  const [readIds, setReadIds] = useState<string[]>(getReadNotifications());
  const [showRead, setShowRead] = useState(false);

  const loading = loadingProducts || loadingFabrics || loadingTrims || loadingOrders;

  // Carregar OPs finalizadas recentemente (últimas 72h para ter histórico)
  useEffect(() => {
    const loadFinished = async () => {
      if (!supabase || !user) return;

      const threeDaysAgo = new Date();
      threeDaysAgo.setHours(threeDaysAgo.getHours() - 72);

      const { data } = await supabase.
      from('op_dispatches').
      select('id, op_number, workshop_name, finished_at, total_pieces').
      eq('status', 'finalizado').
      gte('finished_at', threeDaysAgo.toISOString()).
      order('finished_at', { ascending: false });

      setFinishedDispatches(data || []);
    };

    loadFinished();
    const interval = setInterval(loadFinished, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    setReadIds((prev) => [...prev, id]);
  };

  const handleMarkAsUnread = (id: string) => {
    markAsUnread(id);
    setReadIds((prev) => prev.filter((r) => r !== id));
  };

  const handleMarkAllAsRead = () => {
    unreadNotifications.forEach((d) => markAsRead(d.id));
    setReadIds((prev) => [...prev, ...unreadNotifications.map((d) => d.id)]);
  };

  const unreadNotifications = finishedDispatches.filter((d) => !readIds.includes(d.id));
  const readNotifications = finishedDispatches.filter((d) => readIds.includes(d.id));

  const activeOrders = orders.filter((o) => !['cancelado', 'finalizado'].includes(o.status));
  const lowStockFabrics = fabrics.filter((f: any) => f.stock < (f.min_stock || 15));
  const lowStockTrims = trims.filter((t: any) => t.stock < (t.min_stock || 10));

  const stats = [
  { label: 'Produtos', value: products.length, icon: Package },
  { label: 'Tecidos', value: fabrics.length, icon: Layers },
  { label: 'Aviamentos', value: trims.length, icon: Scissors },
  { label: 'OPs Ativas', value: activeOrders.length, icon: ClipboardList }];


  if (loading) {
    return (
      <div data-ev-id="ev_a52287126a" className="flex items-center justify-center h-64">
        <ScissorsLoader />
      </div>);

  }

  return (
    <div data-ev-id="ev_402c6127ab" className="flex flex-col gap-6">
      <header data-ev-id="ev_05e9d6b324">
        <h1 data-ev-id="ev_ba8953a941" className="text-[26px] font-semibold text-stone-900 tracking-tight">Dashboard</h1>
        <p data-ev-id="ev_00166edb3c" className="text-sm text-stone-500 mt-1">Visão geral do sistema</p>
      </header>

      {/* Notificações de OPs finalizadas */}
      {finishedDispatches.length > 0 &&
      <Card className="p-4 bg-white border-stone-200/80 shadow-none">
          <div data-ev-id="ev_db3d777ce7" className="flex items-center justify-between mb-4">
            <div data-ev-id="ev_bc4e19b3e5" className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-stone-500" />
              <h2 data-ev-id="ev_192c3c754e" className="font-medium text-stone-900">OPs Finalizadas pela Oficina</h2>
              {unreadNotifications.length > 0 &&
            <span data-ev-id="ev_f314cc1e17" className="bg-emerald-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadNotifications.length} nova{unreadNotifications.length > 1 ? 's' : ''}
                </span>
            }
            </div>
            {unreadNotifications.length > 0 &&
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs text-stone-500 hover:text-stone-700 h-7 gap-1">

                <Check className="w-3.5 h-3.5" /> Marcar todas como lidas
              </Button>
          }
          </div>

          {/* Não lidas */}
          {unreadNotifications.length > 0 ?
        <div data-ev-id="ev_6cf93d4130" className="flex flex-col gap-2 mb-4">
              <div data-ev-id="ev_3cc96fe6ba" className="flex items-center gap-2 mb-1">
                <EyeOff className="w-3.5 h-3.5 text-emerald-600" />
                <span data-ev-id="ev_05be08bd92" className="text-xs font-medium text-emerald-700">Não lidas ({unreadNotifications.length})</span>
              </div>
              {unreadNotifications.map((d) =>
          <div data-ev-id="ev_2ca2335301" key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div data-ev-id="ev_45b075dbc0" className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div data-ev-id="ev_0b80c14038" className="flex-1 min-w-0">
                    <p data-ev-id="ev_80fa1b257b" className="text-sm text-emerald-900">
                      <span data-ev-id="ev_dcb661b3da" className="font-semibold">{d.op_number}</span>
                      {d.workshop_name && <span data-ev-id="ev_ae8f08b9a7" className="text-emerald-700"> • {d.workshop_name}</span>}
                      <span data-ev-id="ev_e96f182d71" className="text-emerald-600"> • {d.total_pieces} peças</span>
                    </p>
                    <p data-ev-id="ev_0963d59e15" className="text-xs text-emerald-600 mt-0.5">
                      {d.finished_at ? new Date(d.finished_at).toLocaleString('pt-BR') : ''}
                    </p>
                  </div>
                  <div data-ev-id="ev_de19f71d17" className="flex items-center gap-1 flex-shrink-0">
                    <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/ops-enviadas')}
                className="text-xs h-7 px-2 text-emerald-700 hover:bg-emerald-100">

                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                size="sm"
                variant="ghost"
                onClick={() => handleMarkAsRead(d.id)}
                className="text-xs h-7 px-2 text-emerald-600 hover:bg-emerald-100"
                title="Marcar como lida">

                      <Check className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
          )}
            </div> :

        <p data-ev-id="ev_9f0c5eee6a" className="text-sm text-stone-500 mb-4">Nenhuma notificação não lida.</p>
        }

          {/* Já lidas (expansível) */}
          {readNotifications.length > 0 &&
        <div data-ev-id="ev_337991b5b9" className="border-t border-stone-200 pt-3">
              <button data-ev-id="ev_178676b672"
          onClick={() => setShowRead(!showRead)}
          className="flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-700 w-full">

                <Eye className="w-3.5 h-3.5" />
                <span data-ev-id="ev_6286bf8d97">Já lidas ({readNotifications.length})</span>
                {showRead ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
              </button>
              
              {showRead &&
          <div data-ev-id="ev_755bbb5c2d" className="flex flex-col gap-2 mt-3">
                  {readNotifications.map((d) =>
            <div data-ev-id="ev_78116fe26d" key={d.id} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 border border-stone-200">
                      <div data-ev-id="ev_6d10d1bcd0" className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-stone-400" />
                      </div>
                      <div data-ev-id="ev_dc80038932" className="flex-1 min-w-0">
                        <p data-ev-id="ev_cebb882439" className="text-sm text-stone-600">
                          <span data-ev-id="ev_a9abe6e275" className="font-medium">{d.op_number}</span>
                          {d.workshop_name && <span data-ev-id="ev_2f06e7ed8e" className="text-stone-500"> • {d.workshop_name}</span>}
                          <span data-ev-id="ev_c5d4e8d272" className="text-stone-400"> • {d.total_pieces} peças</span>
                        </p>
                        <p data-ev-id="ev_12c03d7da1" className="text-xs text-stone-400 mt-0.5">
                          {d.finished_at ? new Date(d.finished_at).toLocaleString('pt-BR') : ''}
                        </p>
                      </div>
                      <div data-ev-id="ev_c235bbbf93" className="flex items-center gap-1 flex-shrink-0">
                        <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/ops-enviadas')}
                  className="text-xs h-7 px-2 text-stone-500 hover:bg-stone-100">

                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMarkAsUnread(d.id)}
                  className="text-xs h-7 px-2 text-stone-400 hover:bg-stone-100"
                  title="Marcar como não lida">

                          <EyeOff className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
            )}
                </div>
          }
            </div>
        }
        </Card>
      }

      <div data-ev-id="ev_1eeb1be935" className="grid grid-cols-4 gap-4">
        {stats.map((stat) =>
        <Card key={stat.label} className="p-5 bg-white border-stone-200/80 shadow-none">
            <div data-ev-id="ev_fd91e517e4" className="flex items-center justify-between">
              <div data-ev-id="ev_d090308fdb">
                <p data-ev-id="ev_c7b2a84721" className="text-sm text-stone-500">{stat.label}</p>
                <p data-ev-id="ev_32179f8dd9" className="text-2xl font-semibold text-stone-900 mt-1">{stat.value}</p>
              </div>
              <div data-ev-id="ev_d162ff216d" className="w-10 h-10 rounded-lg flex items-center justify-center bg-stone-100">
                <stat.icon className="w-5 h-5 text-stone-500" />
              </div>
            </div>
          </Card>
        )}
      </div>

      <div data-ev-id="ev_db69b98af2" className="grid grid-cols-2 gap-6">
        <Card className="p-5 bg-white border-stone-200/80 shadow-none">
          <div data-ev-id="ev_961a296384" className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-stone-500" />
            <h2 data-ev-id="ev_3b2a997c44" className="font-medium text-stone-900">Tecidos com Estoque Baixo</h2>
          </div>
          {lowStockFabrics.length === 0 ?
          <p data-ev-id="ev_c4a376a678" className="text-sm text-stone-500">Nenhum tecido com estoque baixo.</p> :

          <div data-ev-id="ev_af51513a59" className="flex flex-col gap-2">
              {lowStockFabrics.slice(0, 5).map((f: any) =>
            <div data-ev-id="ev_7bc7151b23" key={f.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                  <span data-ev-id="ev_fd6858d0a3" className="text-sm text-stone-700">{f.name}</span>
                  <span data-ev-id="ev_5a6d36f2fc" className="text-sm font-medium text-amber-700">{f.stock}m</span>
                </div>
            )}
            </div>
          }
        </Card>

        <Card className="p-5 bg-white border-stone-200/80 shadow-none">
          <div data-ev-id="ev_21d0893670" className="flex items-center gap-2 mb-4">
            <Scissors className="w-4 h-4 text-stone-500" />
            <h2 data-ev-id="ev_e252bfa1fe" className="font-medium text-stone-900">Aviamentos com Estoque Baixo</h2>
          </div>
          {lowStockTrims.length === 0 ?
          <p data-ev-id="ev_8ee857a498" className="text-sm text-stone-500">Nenhum aviamento com estoque baixo.</p> :

          <div data-ev-id="ev_99ac08a2c2" className="flex flex-col gap-2">
              {lowStockTrims.slice(0, 5).map((t: any) =>
            <div data-ev-id="ev_4c9f9bbecd" key={t.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                  <span data-ev-id="ev_8e8926ab3a" className="text-sm text-stone-700">{t.name}</span>
                  <span data-ev-id="ev_1f95f5cc7e" className="text-sm font-medium text-amber-700">{t.stock} {t.unit}</span>
                </div>
            )}
            </div>
          }
        </Card>
      </div>

      <Card className="p-5 bg-white border-stone-200/80 shadow-none">
        <div data-ev-id="ev_c8b6efb48e" className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-4 h-4 text-stone-500" />
          <h2 data-ev-id="ev_c2f7f200dc" className="font-medium text-stone-900">Ordens em Produção</h2>
        </div>
        {activeOrders.length === 0 ?
        <p data-ev-id="ev_8c0ffdc642" className="text-sm text-stone-500">Nenhuma ordem em produção no momento.</p> :

        <div data-ev-id="ev_6fe874ffeb" className="flex flex-col gap-2">
            {activeOrders.slice(0, 5).map((o: any) =>
          <div data-ev-id="ev_649b4579c8" key={o.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div data-ev-id="ev_928b2cbc94">
                  <span data-ev-id="ev_381df43935" className="text-sm font-medium text-stone-900">{o.number}</span>
                  <span data-ev-id="ev_2d6ece3ece" className="text-sm text-stone-500 ml-2">{o.fabric_name}</span>
                </div>
                <div data-ev-id="ev_cc32bd76c8" className="flex items-center gap-3">
                  <span data-ev-id="ev_e8bdb571e5" className="text-sm text-stone-600">{o.quantity} peças</span>
                  <span data-ev-id="ev_fde94493c2" className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">{o.status}</span>
                </div>
              </div>
          )}
          </div>
        }
      </Card>
    </div>);

}