'use client';

import { useEffect, useState } from 'react';
import { Target, Heart, X, Check, Lock } from 'lucide-react';
import { getPublicProjects, type AssociationProject } from '@/lib/projects';
import { submitContribution } from '@/lib/associations';

interface Props {
  businessId: string;
  associationSlug: string;
  associationName: string;
}

export default function ProjectsSection({
  businessId,
  associationSlug,
  associationName,
}: Props) {
  const [projects, setProjects] = useState<AssociationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [contribFor, setContribFor] = useState<AssociationProject | null>(null);

  useEffect(() => {
    (async () => {
      setProjects(await getPublicProjects(businessId));
      setLoading(false);
    })();
  }, [businessId]);

  if (loading) return null;
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gris-texte">
        Aucun projet en cours pour le moment.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-marine" />
        <h3 className="font-extrabold text-marine text-base">Nos projets</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => {
          const pct =
            p.goal_amount && p.goal_amount > 0
              ? Math.min(100, Math.round((p.raised_amount / p.goal_amount) * 100))
              : null;
          return (
            <div
              key={p.id}
              className="border border-gris-ligne rounded-xl p-5 flex flex-col"
            >
              <div className="font-bold text-marine text-sm mb-1">{p.title}</div>
              {p.description && (
                <p className="text-xs text-gris-texte leading-relaxed mb-3 flex-1">
                  {p.description}
                </p>
              )}

              {pct !== null && (
                <div className="mb-3">
                  <div className="h-2 bg-gris-fond rounded-full overflow-hidden">
                    <div
                      className="h-full bg-khmer rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gris-doux mt-1">
                    <span>
                      {p.raised_amount} / {p.goal_amount} {p.currency}
                    </span>
                    <span>{pct}%</span>
                  </div>
                </div>
              )}

              {p.deadline && (
                <div className="text-[11px] text-gris-doux mb-3">
                  Échéance : {new Date(p.deadline).toLocaleDateString('fr-FR')}
                </div>
              )}

              <button
                onClick={() => setContribFor(p)}
                className="mt-auto inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-khmer text-white px-4 py-2.5 rounded-full hover:bg-khmer/90 transition-colors"
              >
                <Heart size={14} /> Soutenir ce projet
              </button>
            </div>
          );
        })}
      </div>

      {contribFor && (
        <ContributionModal
          project={contribFor}
          associationSlug={associationSlug}
          businessId={businessId}
          associationName={associationName}
          onClose={() => setContribFor(null)}
        />
      )}
    </div>
  );
}

function ContributionModal({
  project,
  associationSlug,
  businessId,
  associationName,
  onClose,
}: {
  project: AssociationProject;
  associationSlug: string;
  businessId: string;
  associationName: string;
  onClose: () => void;
}) {
  const AMOUNTS = [10, 25, 50, 100];
  const [amount, setAmount] = useState<number | 'custom'>(25);
  const [custom, setCustom] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const finalAmount = amount === 'custom' ? Number(custom) || 0 : amount;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContribution({
        association_slug: associationSlug,
        business_id: businessId,
        project_title: project.title,
        amount: finalAmount,
        name: anonymous ? 'Anonyme' : name,
        email,
        message: message || undefined,
        anonymous,
      });
      setSent(true);
    } catch (err) {
      console.error('contribution:', err);
      alert("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gris-fond hover:bg-gris-ligne flex items-center justify-center z-10"
        >
          <X size={18} className="text-marine" />
        </button>

        {!sent ? (
          <form onSubmit={submit} className="p-8">
            <div className="w-14 h-14 rounded-full bg-khmer/15 flex items-center justify-center mb-5">
              <Heart size={26} className="fill-khmer text-khmer" />
            </div>
            <h3 className="text-xl font-extrabold text-marine mb-1">
              Soutenir « {project.title} »
            </h3>
            <p className="text-sm text-gris-texte mb-6">
              {associationName} vous contactera pour finaliser votre don fléché
              sur ce projet.
            </p>

            <label className="block text-xs font-bold text-ink mb-2 uppercase tracking-wider">
              Montant envisagé *
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold ${
                    amount === a ? 'bg-marine text-white' : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne'
                  }`}
                >
                  {a} $
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('custom')}
                className={`px-4 py-2.5 rounded-lg text-sm font-bold ${
                  amount === 'custom' ? 'bg-marine text-white' : 'bg-gris-fond text-gris-texte hover:bg-gris-ligne'
                }`}
              >
                Autre
              </button>
            </div>
            {amount === 'custom' && (
              <input
                type="number"
                min="1"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Montant en $"
                required
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm mb-4 focus:border-marine outline-none"
              />
            )}

            <div className="space-y-3 mb-4">
              {!anonymous && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom *"
                  required
                  className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine outline-none"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email *"
                required
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine outline-none"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message (optionnel)"
                rows={2}
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine outline-none resize-none"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-gris-texte cursor-pointer mb-5">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 accent-marine"
              />
              Rester anonyme
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-khmer text-white font-bold py-3 rounded-full hover:bg-khmer/90 transition-colors text-sm disabled:opacity-60"
            >
              {loading ? 'Envoi…' : 'Envoyer ma promesse de don'}
            </button>
            <div className="mt-4 text-center text-[11px] text-gris-doux flex items-center justify-center gap-2">
              <Lock size={11} />
              Aucun paiement sur myCAMBO — mise en relation uniquement
            </div>
          </form>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-ic-vert/15 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-ic-vert" />
            </div>
            <h3 className="text-xl font-extrabold text-marine mb-2">
              Promesse envoyée !
            </h3>
            <p className="text-sm text-gris-texte mb-6">
              Merci. <b className="text-marine">{associationName}</b> vous
              contactera pour finaliser votre don sur « {project.title} ».
            </p>
            <button
              onClick={onClose}
              className="bg-marine text-white font-bold px-8 py-3 rounded-full hover:bg-marine-dark text-sm"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
