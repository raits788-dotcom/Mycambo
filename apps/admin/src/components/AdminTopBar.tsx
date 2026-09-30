'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, ChevronDown, ExternalLink, Loader2 } from 'lucide-react';
import { getCurrentAdmin, getInitials, getDisplayName } from '@/lib/auth';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  initials: string;
}

export default function AdminTopBar() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const current = await getCurrentAdmin();
      setUser(current);
      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    const { signOutAdmin } = await import('@/lib/auth');
    await signOutAdmin();
    router.push('/connexion');
  };

  const displayName = user ? getDisplayName(user.email) : 'Admin';
  const initials = user ? getInitials(user.email) : 'AD';

  return (
    <header className="bg-white border-b border-gris-ligne sticky top-0 z-40">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Titre contextuel */}
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-marine">
            Console d&apos;administration
          </h1>
          <span className="text-[10px] uppercase tracking-widest text-gris-doux bg-gris-fond px-2 py-0.5 rounded-full">
            Environnement : production
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href="https://mycambo-web-worker.raits788.workers.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-gris-texte hover:text-marine transition-colors px-3 py-1.5 rounded-lg hover:bg-gris-fond"
          >
            <ExternalLink size={12} />
            Voir le site
          </a>

          <button
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center transition-colors"
          >
            <Bell size={15} className="text-gris-texte" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
          </button>

          {/* Profil - DYNAMIQUE */}
          <div className="flex items-center gap-2 pl-3 border-l border-gris-ligne">
            {loading ? (
              <Loader2 size={16} className="animate-spin text-gris-doux" />
            ) : (
              <>
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-marine truncate max-w-[160px]">
                    {displayName}
                  </div>
                  <div className="text-[10px] text-gris-doux truncate max-w-[160px]">
                    {user?.email || 'Non connecté'}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                  {initials}
                </div>
                <ChevronDown size={14} className="text-gris-doux hidden md:block" />
              </>
            )}
          </div>

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            aria-label="Se déconnecter"
            title="Se déconnecter"
            className="w-9 h-9 rounded-full bg-gris-fond hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors text-gris-texte"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}