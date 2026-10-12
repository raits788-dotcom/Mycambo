'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Heart, Users, Mail, Target, Clock, CheckCircle2, Eye, XCircle, Info, Loader2,
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import {
  getUserRequests,
  timeAgo,
  type UserRequest,
  type UserRequestType,
} from '@/lib/user';

const TYPE_CONFIG: Record<
  UserRequestType,
  { icon: typeof Heart; color: string; bg: string; label: string }
> = {
  donation: { icon: Heart, color: 'text-red-500', bg: 'bg-red-100', label: 'Promesse de don' },
  volunteer: { icon: Users, color: 'text-green-600', bg: 'bg-green-100', label: 'Candidature bénévole' },
  contact: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Message de contact' },
  contribution: { icon: Target, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Contribution projet' },
};

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'En attente', color: 'bg-orange-100 text-orange-700', icon: Clock },
  accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  declined: { label: 'Refusée', color: 'bg-red-100 text-red-700', icon: XCircle },
  completed: { label: 'Terminée', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
};

export default function DemandesPage() {
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }
      const data = await getUserRequests(session.user.email || '');
      setRequests(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 size={24} className="text-marine animate-spin mx-auto" />
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Mes demandes
        </h1>
        <p className="text-sm text-gris-texte">
          {requests.length} demande{requests.length > 1 ? 's' : ''} envoyée{requests.length > 1 ? 's' : ''}
          {pendingCount > 0 && (
            <>
              {' · '}
              <span className="text-orange-600 font-bold">
                {pendingCount} en attente
              </span>
            </>
          )}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Ces demandes ont été <b>envoyées par vous</b>. L&apos;association
          vous contactera directement pour les finaliser.
        </p>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((req) => {
            const typeConfig = TYPE_CONFIG[req.type] || TYPE_CONFIG.contact;
            const statusConfig = STATUS_LABELS[req.status] || STATUS_LABELS.pending;
            const TypeIcon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <div key={req.id} className="bg-white rounded-lg border border-gris-ligne p-5">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${typeConfig.bg}`}>
                    <TypeIcon size={20} className={typeConfig.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <div className="min-w-0">
                        <div className="font-bold text-marine text-sm">
                          {typeConfig.label}
                        </div>
                        {req.business_slug ? (
                          <Link
                            href={`/commerce/${req.business_slug}`}
                            className="text-xs text-gris-texte hover:text-marine transition-colors"
                          >
                            {req.business_name}
                          </Link>
                        ) : (
                          <span className="text-xs text-gris-texte">{req.business_name}</span>
                        )}
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${statusConfig.color} flex-shrink-0`}>
                        <StatusIcon size={11} />
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="text-xs text-gris-texte mt-2 font-medium line-clamp-3">
                      {req.message}
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gris-ligne flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] text-gris-doux flex items-center gap-1">
                    <Clock size={10} />
                    {timeAgo(req.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gris-ligne p-12 text-center">
          <Mail size={40} className="text-gris-ligne mx-auto mb-4" />
          <h2 className="text-lg font-bold text-marine mb-2">
            Aucune demande pour le moment
          </h2>
          <p className="text-sm text-gris-texte mb-6">
            Vos promesses de don, candidatures bénévole ou messages apparaîtront ici.
          </p>
          <Link
            href="/rubrique/association"
            className="inline-flex items-center gap-2 bg-marine text-white font-bold px-6 py-3 rounded-full hover:bg-marine-dark transition-colors text-sm"
          >
            Découvrir les associations
          </Link>
        </div>
      )}
    </>
  );
}