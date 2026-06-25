import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Package, ClipboardList, Send, Calendar, Layers, Scissors,
  Users, Truck, Sparkles, FileText, Calculator, Boxes, BarChart3, Settings, Plus, History, LogOut } from
'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavDivider {
  type: 'divider';
  label: string;
}

interface NavLink {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

type NavItem = NavDivider | NavLink;

const isDivider = (item: NavItem): item is NavDivider => 'type' in item && item.type === 'divider';

const navItems: NavItem[] = [
  { to: '/', label: 'Painel', icon: LayoutDashboard },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/ordens', label: 'Ordens de Produção', icon: ClipboardList },
  { to: '/ops-enviadas', label: 'OPs Enviadas', icon: Send },
  { to: '/calendario', label: 'Calendário de Produção', icon: Calendar },
  { type: 'divider', label: 'Cadastros' },
  { to: '/tecidos', label: 'Tecidos', icon: Layers },
  { to: '/aviamentos', label: 'Aviamentos', icon: Scissors },
  { to: '/oficinas', label: 'Oficinas', icon: Users },
  { to: '/fornecedores', label: 'Fornecedores', icon: Truck },
  { to: '/colecoes', label: 'Coleções', icon: Sparkles },
  { type: 'divider', label: 'Operações' },
  { to: '/fichas-tecnicas', label: 'Fichas Técnicas', icon: FileText },
  { to: '/calculadora', label: 'Calculadora de Tecido', icon: Calculator },
  { to: '/estoque', label: 'Estoque', icon: Boxes },
  { to: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { type: 'divider', label: 'Sistema' },
  { to: '/historico-exclusoes', label: 'Histórico de Exclusões', icon: History },
  { to: '/configuracoes', label: 'Configurações', icon: Settings }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [brand] = useState({ name: 'ZOR', slogan: 'Controle de Produção' });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside data-ev-id="ev_c7ff7f369c" className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-stone-200/80">
      <div data-ev-id="ev_b322cb1473" className="px-6 py-6 border-b border-stone-200/80">
        <button data-ev-id="ev_56e1a43c29" onClick={() => navigate('/')} className="flex items-center gap-2.5 group">
          <div data-ev-id="ev_7a9da98699" className="w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center text-white font-semibold text-sm tracking-wider">
            {(brand.name || 'Z').charAt(0)}
          </div>
          <div data-ev-id="ev_dd3e9fc6e3" className="text-left">
            <div data-ev-id="ev_24db96805d" className="text-[15px] font-semibold text-stone-900 tracking-tight">{brand.name}</div>
            <div data-ev-id="ev_337603a3d6" className="text-[11px] text-stone-500 -mt-0.5">{brand.slogan}</div>
          </div>
        </button>
      </div>

      <nav data-ev-id="ev_44f80b6396" className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        {navItems.map((item, idx) => {
          if (isDivider(item)) {
            return (
              <div data-ev-id="ev_6be69b9e83" key={idx} className="px-3 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
                {item.label}
              </div>);

          }
          const navItem = item as NavLink;
          const Icon = navItem.icon;
          return (
            <NavLink
              key={navItem.to}
              to={navItem.to}
              end={navItem.to === '/'}
              className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${
              isActive ?
              'bg-stone-900 text-white font-medium' :
              'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`

              }>
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              <span data-ev-id="ev_f4cead67df">{navItem.label}</span>
            </NavLink>);

        })}
      </nav>

      <div data-ev-id="ev_9d98cdfd9e" className="p-3 border-t border-stone-200/80 flex flex-col gap-2">
        <button data-ev-id="ev_0aff0876b0" onClick={() => navigate('/ordens/nova')} className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" strokeWidth={2} />
          Nova OP
        </button>
        {user &&
        <button data-ev-id="ev_3d065a3aab" onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-stone-500 hover:text-stone-700 text-sm py-2 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        }
      </div>
    </aside>);

}