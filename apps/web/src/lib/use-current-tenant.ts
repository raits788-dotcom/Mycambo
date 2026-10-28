'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getImpersonatedTenant } from './impersonation';

export interface CurrentTenant {
  id: string;
  name: string;
  email: string;
  city?: string;
  slug?: string;
  logo_url?: string;
  isImpersonating: boolean;
}

export function useCurrentTenant() {
  const [tenant, setTenant] = useState<CurrentTenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1. Impersonation en priorité
      const impersonated = await getImpersonatedTenant();
      if (impersonated) {
        setTenant({ ...impersonated, isImpersonating: true });
        setLoading(false);
        return;
      }

      // 2. Sinon, tenant du user connecté
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('tenant_users')
        .select('tenants(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);

      const row = Array.isArray(data) ? data[0] : null;
      if (row?.tenants) {
        setTenant({ ...(row.tenants as any), isImpersonating: false });
      }
      setLoading(false);
    })();
  }, []);

  return { tenant, loading };
}