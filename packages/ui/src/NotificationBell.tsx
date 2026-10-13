'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  priority: string;
  created_at: string;
  metadata: any;
}

interface Props {
  recipientType: 'superadmin' | 'tenant' | 'user';
  recipientId?: string;
  onViewAll?: () => void;
}

export function NotificationBell({ recipientType, recipientId, onViewAll }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const load = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_type', recipientType)
      .order('created_at', { ascending: false })
      .limit(20);

    if (recipientId) {
      query = query.eq('recipient_id', recipientId);
    }

    const { data } = await query;
    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [recipientType, recipientId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAsRead = async (id: string) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_type', recipientType)
      .eq('is_read', false);

    if (recipientId) query = query.eq('recipient_id', recipientId);

    await query;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleClickNotification = (n: Notification) => {
    markAsRead(n.id);
    if (n.link) {
      window.location.href = n.link;
    }
    setOpen(false);
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "à l'instant";
    if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `il y a ${Math.floor(seconds / 86400)} j`;
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const priorityColor = (priority: string) => {
    if (priority === 'urgent') return 'border-l-red-500';
    if (priority === 'high') return 'border-l-orange-500';
    return 'border-l-marine';
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} className="text-gris-texte" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gris-ligne rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gris-ligne bg-gris-fond">
            <div>
              <div className="font-bold text-marine text-sm">Notifications</div>
              <div className="text-[10px] text-gris-texte">
                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] text-marine font-bold hover:underline flex items-center gap-1"
              >
                <CheckCheck size={11} /> Tout marquer
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 size={20} className="text-marine animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gris-doux">
                Aucune notification
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClickNotification(n)}
                  className={
                    'w-full text-left px-4 py-3 border-b border-gris-ligne last:border-0 hover:bg-gris-fond transition-colors border-l-4 ' +
                    priorityColor(n.priority) +
                    (!n.is_read ? ' bg-blue-50/50' : '')
                  }
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={'font-bold text-xs ' + (!n.is_read ? 'text-marine' : 'text-gris-texte')}>
                          {n.title}
                        </span>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-gris-texte mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <div className="text-[10px] text-gris-doux mt-1">
                        {timeAgo(n.created_at)}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {onViewAll && (
            <div className="px-4 py-2 border-t border-gris-ligne bg-gris-fond text-center">
              <button
                onClick={() => { onViewAll(); setOpen(false); }}
                className="text-[11px] text-marine font-bold hover:underline"
              >
                Voir toutes les notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}