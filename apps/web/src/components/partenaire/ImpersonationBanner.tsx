'use client';

import { useEffect, useState } from 'react';
import { Shield, X } from 'lucide-react';
import { clearImpersonation } from '@/lib/impersonation';

function getAdminBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_ADMIN_URL) {
    return process.env.NEXT_PUBLIC_ADMIN_URL;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    // Production : dev.mycambo.net → admin.mycambo.net
    if (host === 'dev.mycambo.net' || host === 'mycambo.net') {
      return 'https://admin.mycambo.net';
    }

    // GitHub Codespaces : -3000 → -3001
    if (host.includes('github.dev')) {
      return window.location.origin.replace('-3000.', '-3001.');
    }
  }

  return 'http://localhost:3001';
}

export default function ImpersonationBanner() {
  const [visible, setVisible] = useState(false);
  const [tenantName, setTenantName] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('mycambo_impersonate_token');
    if (!token) return;

    (async () => {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data } = await supabase
        .from('impersonation_tokens')
        .select('tenants(name)')
        .eq('token', token)
        .maybeSingle();
      if (data?.tenants) {
        setTenantName((data.tenants as any).name);
      }
      setVisible(true);
    })();
  }, []);

  if (!visible) return null;

  const handleQuit = () => {
    clearImpersonation();
    const adminUrl = getAdminBaseUrl();
    window.location.href = `${adminUrl}/tenants`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-purple-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2 text-xs font-bold">
        <Shield size={14} />
        MODE SUPERADMIN — Vous êtes dans : {tenantName || 'ce tenant'}
      </div>
      <button
        onClick={handleQuit}
        className="flex items-center gap-1 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full"
      >
        <X size={12} /> Quitter
      </button>
    </div>
  );
}