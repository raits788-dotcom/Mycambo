'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell, Loader2, Check, CheckCheck, Trash2, Filter,
  Inbox, ShieldCheck, FileEdit, Star, CreditCard, AlertCircle,
} from 'lucide-react';
import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/lib/services';

type FilterType = 'all' | 'unread';

const TYPE_ICONS: Record<string, any> = {
  partner_request: Inbox,
  verification: ShieldCheck,
  modification: FileEdit,
  review: Star,
  subscription: CreditCard,
  system: AlertCircle,
};

const TYPE_LABELS: Record<string, string> = {
  partner_request: 'Demande partenaire',
  verification: 'Vérification',
  modification: 'Modification',
  review: 'Avis',
  subscription: 'Abonnement',
  system: 'Système',
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-500',
  normal: 'border-l-marine',
  low: 'border-l-gray-300',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const reload = async () => {
    setLoading(true);
    const data = await getAdminNotifications(filter);
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [filter]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!confirm('Marquer toutes les notifications comme lues ?')) return;
    await markAllNotificationsAsRead('superadmin');
    await reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette notification ?')) return;
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClick = (n: any) => {
    if (!n.is_read) handleMarkAsRead(n.id);
    if (n.link) window.location.href = n.link;
  };

  const filtered = typeFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === typeFilter);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "à l'instant";
    if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `il y a ${Math.floor(seconds / 86400)} j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
            Notifications
          </h1>
          <p className="text-sm text-gris-texte">
            {loading ? 'Chargement...' : `${notifications.length} notification${notifications.length > 1 ? 's' : ''} · ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 border border-gris-ligne text-marine font-bold text-sm px-4 py-2.5 rounded-full hover:border-marine"
          >
            <CheckCheck size={14} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-5 flex flex-wrap gap-3 items-center shadow-cb-sm">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gris-doux" />
          <button
            onClick={() => setFilter('all')}
            className={
              'px-3 py-1.5 rounded-full text-xs font-bold transition-colors ' +
              (filter === 'all' ? 'bg-marine text-white' : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne')
            }
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={
              'px-3 py-1.5 rounded-full text-xs font-bold transition-colors ' +
              (filter === 'unread' ? 'bg-marine text-white' : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne')
            }
          >
            Non lues {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        <div className="border-l border-gris-ligne pl-3 ml-1">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm rounded-lg border border-gris-ligne px-3 py-1.5"
          >
            <option value="all">Tous les types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="text-marine animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={32} className="text-gris-doux mx-auto mb-3" />
            <p className="text-sm text-gris-texte">
              {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gris-ligne">
            {filtered.map((n) => {
              const Icon = TYPE_ICONS[n.type] || Bell;
              return (
                <li
                  key={n.id}
                  className={
                    'flex items-start gap-3 p-4 hover:bg-gris-fond/50 border-l-4 transition-colors ' +
                    (PRIORITY_COLORS[n.priority] || 'border-l-marine') +
                    (!n.is_read ? ' bg-blue-50/30' : '')
                  }
                >
                  <button
                    onClick={() => handleClick(n)}
                    className="flex items-start gap-3 flex-1 text-left min-w-0"
                  >
                    <div className={
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ' +
                      (!n.is_read ? 'bg-marine text-white' : 'bg-gris-fond text-gris-texte')
                    }>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={'font-bold text-sm ' + (!n.is_read ? 'text-marine' : 'text-gris-texte')}>
                          {n.title}
                        </span>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                        <span className="text-[10px] uppercase tracking-wider text-gris-doux">
                          {TYPE_LABELS[n.type] || n.type}
                        </span>
                      </div>
                      <p className="text-xs text-gris-texte mt-1 line-clamp-2">{n.message}</p>
                      <div className="text-[10px] text-gris-doux mt-1">
                        {timeAgo(n.created_at)}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-green-100 hover:text-green-700"
                        title="Marquer comme lu"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-red-100 hover:text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}