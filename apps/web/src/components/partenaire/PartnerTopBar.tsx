'use client';

import Link from 'next/link';
import { Bell, LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useCurrentTenant } from '@/lib/use-current-tenant';

function getInitials(name: string): string {
  if (!name) return '??';
  return name.split(/\s+/).map((w) => w[0]).join('').substring(0, 2).toUpperCase();
}

export default function PartnerTopBar() {
  const router = useRouter();
  const { tenant, loading } = useCurrentTenant();

  const initials = tenant ? getInitials(tenant.name) : '??';

  const handleLogout = async () => {
    if (!confirm('Se déconnecter ?')) return;
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/espace-partenaire/connexion');
  };

  return (
    <header className="bg-marine text-white px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="text-lg font-extrabold">my CAMBO</span>
        <span className="text-[10px] uppercase tracking-widest text-white/60 border-l border-white/20 pl-3">
          Espace partenaire
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <Bell size={15} />
        </button>

        {loading ? (
          <Loader2 size={16} className="animate-spin text-white/60" />
        ) : tenant ? (
          <div className="flex items-center gap-2 pl-3 border-l border-white/20">
            <span className="text-sm font-bold truncate max-w-[160px]">{tenant.name}</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
              {initials}
            </div>
          </div>
        ) : null}

        <button
          onClick={handleLogout}
          aria-label="Se déconnecter"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}