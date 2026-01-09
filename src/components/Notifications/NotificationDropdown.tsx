import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle, Inbox } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx } from 'clsx';
import { NotificationType } from '../../types';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-emerald-500" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-orange-500" />;
      case 'error':
        return <XCircle size={18} className="text-red-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  const getBackground = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-emerald-50';
      case 'warning': return 'bg-orange-50';
      case 'error': return 'bg-red-50';
      default: return 'bg-blue-50';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do Sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "relative rounded-full p-2 transition-all duration-200",
          isOpen ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-100"
        )}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-2xl border border-slate-100 bg-white shadow-xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
            <h3 className="font-semibold text-slate-800">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Check size={14} />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Inbox size={48} strokeWidth={1} className="mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={clsx(
                      "group relative flex gap-4 p-4 transition-colors hover:bg-slate-50",
                      !notification.isRead ? "bg-indigo-50/30" : "bg-white"
                    )}
                  >
                    {/* Ícone */}
                    <div className={clsx("mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full", getBackground(notification.type))}>
                      {getIcon(notification.type)}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 space-y-1" onClick={() => markAsRead(notification.id)}>
                      <div className="flex items-start justify-between gap-2">
                        <p className={clsx("text-sm font-medium", !notification.isRead ? "text-slate-900" : "text-slate-600")}>
                          {notification.title}
                        </p>
                        <span className="whitespace-nowrap text-xs text-slate-400">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {notification.description}
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col items-center justify-start gap-2">
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-indigo-500" title="Não lida"></span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Rodapé (Opcional) */}
          <div className="border-t border-slate-100 bg-slate-50 p-2 text-center">
            <button className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
              Ver histórico completo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
