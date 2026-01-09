import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Menu, User, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { NotificationDropdown } from '../Notifications/NotificationDropdown';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { currentProfile, switchProfile } = useFinance();
  const { profile, user } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={24} />
        </button>
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-slate-800">
            Olá, {profile?.full_name?.split(' ')[0] || 'Visitante'}
          </h2>
          <p className="text-xs text-slate-500">Visão Geral Financeira</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Profile Switcher */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => switchProfile('personal')}
            className={clsx(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              currentProfile === 'personal'
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <User size={16} />
            <span className="hidden sm:inline">Pessoa Física</span>
          </button>
          <button
            onClick={() => switchProfile('business')}
            className={clsx(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              currentProfile === 'business'
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Building2 size={16} />
            <span className="hidden sm:inline">Empresa</span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

        {/* Sistema de Notificações */}
        <NotificationDropdown />
        
        {/* Avatar do Usuário */}
        <div className="relative group cursor-pointer">
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm transition-all hover:ring-indigo-200"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-sm font-bold text-white ring-2 ring-white shadow-sm transition-all hover:ring-indigo-200">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
