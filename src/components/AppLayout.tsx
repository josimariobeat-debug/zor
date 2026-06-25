import { Outlet } from 'react-router';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div data-ev-id="ev_8478c35583" className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <main data-ev-id="ev_211d447310" className="flex-1 min-w-0">
        <div data-ev-id="ev_47d54341c7" className="max-w-[1440px] mx-auto px-6 lg:px-10 py-8 fade-in">
          <Outlet />
        </div>
      </main>
    </div>);

}