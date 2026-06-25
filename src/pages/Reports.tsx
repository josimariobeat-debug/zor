import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { mockProductionOrders, mockProducts } from '@/lib/mock-data';

export default function Reports() {
  const [orders] = useState(mockProductionOrders);
  const [products] = useState(mockProducts);

  const monthlyData = [
  { m: 'Jan', v: 45 }, { m: 'Fev', v: 62 }, { m: 'Mar', v: 78 }, { m: 'Abr', v: 55 },
  { m: 'Mai', v: 91 }, { m: 'Jun', v: 110 }, { m: 'Jul', v: 85 }, { m: 'Ago', v: 67 }];

  const max = Math.max(...monthlyData.map((d) => d.v));
  const totalRev = orders.reduce((s, o) => s + (o.total_revenue || 0), 0);
  const totalCost = orders.reduce((s, o) => s + (o.total_cost || 0), 0);
  const margin = totalRev > 0 ? Math.round((totalRev - totalCost) / totalRev * 100) : 0;

  return (
    <div data-ev-id="ev_82ccccdd67" className="flex flex-col gap-6">
      <header data-ev-id="ev_da6c9b583f" className="flex items-start justify-between">
        <div data-ev-id="ev_e898ddb0a0">
          <h1 data-ev-id="ev_a757effa1d" className="text-[26px] font-semibold text-stone-900 tracking-tight">Relatórios</h1>
          <p data-ev-id="ev_92af89acc3" className="text-sm text-stone-500 mt-1">Análise da sua produção e rentabilidade</p>
        </div>
        <Button variant="outline" className="rounded-lg gap-2"><Download className="w-4 h-4" /> Exportar PDF</Button>
      </header>
      <div data-ev-id="ev_1cbd682110" className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
        { l: 'Receita total', v: `R$ ${(totalRev / 1000).toFixed(1)}k`, s: 'Acumulado' },
        { l: 'Custos', v: `R$ ${(totalCost / 1000).toFixed(1)}k`, s: 'Produção' },
        { l: 'Lucro líquido', v: `R$ ${((totalRev - totalCost) / 1000).toFixed(1)}k`, s: 'Estimado' },
        { l: 'Margem média', v: `${margin}%`, s: 'Sobre receita' }].
        map((s, i) =>
        <Card key={i} className="p-5 bg-white border-stone-200/80 shadow-none">
            <div data-ev-id="ev_f579705953" className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">{s.l}</div>
            <div data-ev-id="ev_86dfa2bef1" className="text-2xl font-semibold text-stone-900 mt-2 tracking-tight">{s.v}</div>
            <div data-ev-id="ev_347e58b541" className="text-xs text-stone-500 mt-1">{s.s}</div>
          </Card>
        )}
      </div>
      <div data-ev-id="ev_f2757f8214" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 bg-white border-stone-200/80 shadow-none">
          <h3 data-ev-id="ev_a905769c85" className="text-base font-semibold text-stone-900 mb-1">Produção Mensal</h3>
          <p data-ev-id="ev_6072933c08" className="text-xs text-stone-500 mb-6">Peças produzidas por mês</p>
          <div data-ev-id="ev_bba04da61f" className="flex items-end gap-2 h-56">{monthlyData.map((d) =>
            <div data-ev-id="ev_40cdf58f45" key={d.m} className="flex-1 flex flex-col items-center gap-2">
              <div data-ev-id="ev_2216975a1c" className="text-[10px] font-medium text-stone-600">{d.v}</div>
              <div data-ev-id="ev_fc42b40815" className="w-full bg-stone-900 rounded-t-md hover:bg-stone-700 transition-colors" style={{ height: `${d.v / max * 100}%` }} />
              <div data-ev-id="ev_67107f82c9" className="text-[10px] text-stone-500">{d.m}</div>
            </div>
            )}</div>
        </Card>
        <Card className="p-6 bg-white border-stone-200/80 shadow-none">
          <h3 data-ev-id="ev_bf2d992197" className="text-base font-semibold text-stone-900 mb-1">Produtos Rentáveis</h3>
          <p data-ev-id="ev_3cd314e3e5" className="text-xs text-stone-500 mb-5">Top margem</p>
          <div data-ev-id="ev_3a3ae18bb9" className="flex flex-col gap-3">{[...products].sort((a, b) => (b.margin || 0) - (a.margin || 0)).slice(0, 8).map((p) =>
            <div data-ev-id="ev_95b117f329" key={p.id} className="flex items-center justify-between">
              <div data-ev-id="ev_511cade290" className="min-w-0"><div data-ev-id="ev_948d3d4963" className="text-sm font-medium text-stone-900 truncate">{p.name}</div><div data-ev-id="ev_468c3c2899" className="text-[11px] text-stone-500">{p.category}</div></div>
              <div data-ev-id="ev_5df6f2006f" className="text-sm font-semibold text-stone-900">{p.margin || 0}%</div>
            </div>
            )}</div>
        </Card>
      </div>
    </div>);

}