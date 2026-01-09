import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Settings, PieChart, LogOut, Wallet, CreditCard } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { signOut } = useAuth();
  
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Receipt, label: 'Transações', path: '/transactions' },
    { icon: CreditCard, label: 'Cartões', path: '/cards' },
    { icon: PieChart, label: 'Relatórios', path: '/reports' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 px-6 py-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Finanças</h1>
              <p className="text-xs text-slate-400">Gerenciador Pro</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => clsx(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-800 p-4">
            <button 
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
