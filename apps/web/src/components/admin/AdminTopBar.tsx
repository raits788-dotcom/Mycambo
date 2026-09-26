'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, Bell } from 'lucide-react';
import { logoutAdmin, getCurrentAdmin } from '@/lib/admin-mock';

export default function AdminTopBar() {
  const router = useRouter();
  const admin = getCurrentAdmin();

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/connexion');
  };

  return (
    <header className="bg-ink text-white sticky top-0 z-40 border-b-2 border-red-600">
      <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-3 flex items-center justify-between gap-4">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
            <Shield size={18} />
          </div>
          <div>
            <div className="font-extrabold text-sm">myCAMBO · Console</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest">
              Administration
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>

          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-white/20">
            <span className="text-xs text-white/70 max-w-[140px] truncate">
              {admin?.name || 'Admin'}
            </span>
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs">
              {admin?.initials || 'AD'}
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