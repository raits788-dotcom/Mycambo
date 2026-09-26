'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';
import { logoutMock, getCurrentPartnerMock } from '@/lib/auth-mock';

export default function PartnerTopBar() {
  const router = useRouter();
  const partner = getCurrentPartnerMock();

  const handleLogout = () => {
    logoutMock();
    router.push('/espace-partenaire/connexion');
  };

  const initials = partner?.initials || 'PA';
  const name = partner?.name || 'Partenaire';

  return (
    <header className="bg-marine text-white sticky top-0 z-40">
      <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-black">my</span>
            <span className="text-xl md:text-2xl font-black">CAMBO</span>
          </div>
          <span className="hidden md:block text-[10px] uppercase tracking-[0.2em] text-white/50 border-l border-white/20 pl-3">
            Espace partenaire
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <NotificationsDropdown />

          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-white/20">
            <span className="text-xs text-white/70 max-w-[140px] truncate">
              {name}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
          </div>

          <button
            onClick={handleLogout}
            aria-label="Se déconnecter"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}