'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Star,
  Heart,
  AlertCircle,
  CreditCard,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOCK_PARTNER_NOTIFICATIONS,
  getUnreadNotificationsCount,
  type PartnerNotification,
} from '@/lib/partner-mock';
import { timeAgo } from '@/lib/user-mock';

const TYPE_ICONS: Record<PartnerNotification['type'], typeof Star> = {
  review: Star,
  request: Heart,
  system: AlertCircle,
  subscription: CreditCard,
};

const TYPE_COLORS: Record<PartnerNotification['type'], string> = {
  review: 'text-ic-or',
  request: 'text-red-500',
  system: 'text-marine',
  subscription: 'text-purple-600',
};

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_PARTNER_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Ferme au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-[380px] bg-white rounded-lg shadow-2xl border border-gris-ligne overflow-hidden z-50">
          {/* En-tête */}
          <div className="px-4 py-3 border-b border-gris-ligne flex items-center justify-between">
            <div className="font-bold text-marine text-sm">
              Notifications
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-marine hover:underline flex items-center gap-1"
              >
                <Check size={11} />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const Icon = TYPE_ICONS[notif.type];
                const colorClass = TYPE_COLORS[notif.type];
                const Wrapper = notif.link ? Link : 'div';

                return (
                  <Wrapper
                    key={notif.id}
                    // @ts-ignore
                    href={notif.link || '#'}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b border-gris-ligne last:border-0 transition-colors',
                      notif.link && 'hover:bg-gris-fond cursor-pointer',
                      !notif.isRead && 'bg-blue-50/50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-gris-fond',
                        colorClass
                      )}
                    >
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="text-sm font-bold text-marine leading-tight flex-1">
                          {notif.title}
                        </div>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <div className="text-xs text-gris-texte leading-relaxed mt-0.5 line-clamp-2">
                        {notif.description}
                      </div>
                      <div className="text-[10px] text-gris-doux mt-1">
                        {timeAgo(notif.createdAt)}
                      </div>
                    </div>
                  </Wrapper>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-xs text-gris-doux">
                Aucune notification
              </div>
            )}
          </div>

          {/* Pied */}
          <div className="px-4 py-2 border-t border-gris-ligne bg-gris-fond text-center">
            <button
              onClick={() => setOpen(false)}
              className="text-[11px] font-bold text-marine hover:underline"
            >
              Voir toutes les notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}