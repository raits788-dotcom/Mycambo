'use client';

import { useState, useEffect, type FormEvent } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  Eye,
  Check,
  X,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredEstablishment } from '@/lib/establishment-storage';
import {
  getJobOffersForBusiness,
  createJobOffer,
  toggleJobOffer,
  deleteJobOffer,
  getApplicationsForBusiness,
  setApplicationStatus,
} from '@/lib/services';

interface JobsTabProps {
  establishment: StoredEstablishment;
  onUpdate: () => void;
}

type JobOffer = {
  id: string;
  title: string;
  description: string | null;
  contract_type: string | null;
  location: string | null;
  salary: string | null;
  is_active: boolean;
};

type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected';

type Application = {
  id: string;
  candidate_name: string | null;
  candidate_email: string | null;
  candidate_phone: string | null;
  message: string | null;
  status: ApplicationStatus | null;
  created_at: string | null;
  job_offers: { title: string } | null;
};

const CONTRACT_TYPES = ['CDI', 'CDD', 'Stage', 'Saisonnier'];

const EMPTY_FORM = {
  title: '',
  contract_type: 'CDI',
  location: '',
  salary: '',
  description: '',
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'En attente',
  reviewed: 'Vu',
  accepted: 'Accepté',
  rejected: 'Refusé',
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: 'bg-gris-fond text-gris-texte',
  reviewed: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

function formatDate(value: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function JobsTab({ establishment, onUpdate }: JobsTabProps) {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const reload = async () => {
    setLoading(true);
    try {
      const [jobsData, appsData] = await Promise.all([
        getJobOffersForBusiness(establishment.id),
        getApplicationsForBusiness(establishment.id),
      ]);
      setJobs((jobsData as JobOffer[]) || []);
      setApplications((appsData as Application[]) || []);
    } catch {
      setJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [establishment.id]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await createJobOffer({
        business_id: establishment.id,
        tenant_id: establishment.tenant_id,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        contract_type: form.contract_type || undefined,
        location: form.location.trim() || undefined,
        salary: form.salary.trim() || undefined,
      });
      setForm(EMPTY_FORM);
      await reload();
      onUpdate();
    } catch {
      alert("Impossible de créer l'offre d'emploi.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleJob = async (job: JobOffer) => {
    try {
      await toggleJobOffer(job.id, !job.is_active);
      await reload();
      onUpdate();
    } catch {
      alert("Impossible de modifier l'offre d'emploi.");
    }
  };

  const handleDeleteJob = async (job: JobOffer) => {
    if (!confirm(`Supprimer l'offre d'emploi « ${job.title} » ?`)) return;
    try {
      await deleteJobOffer(job.id);
      await reload();
      onUpdate();
    } catch {
      alert("Impossible de supprimer l'offre d'emploi.");
    }
  };

  const handleStatus = async (app: Application, status: ApplicationStatus) => {
    try {
      await setApplicationStatus(app.id, status);
      await reload();
      onUpdate();
    } catch {
      alert('Impossible de mettre à jour la candidature.');
    }
  };

  return (
    <div className="space-y-10">
      {/* ===== Section 1 : Offres d'emploi ===== */}
      <section>
        <div className="mb-6">
          <h2 className="font-extrabold text-marine text-base mb-1">
            Mes offres d&apos;emploi
          </h2>
          <p className="text-xs text-gris-texte">
            Publiez vos offres d&apos;emploi sur votre fiche publique.
          </p>
        </div>

        {/* Formulaire d'ajout */}
        <form
          onSubmit={handleCreate}
          className="mb-6 border border-gris-ligne rounded-xl p-5 bg-gris-fond"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Briefcase size={18} />
            </div>
            <h3 className="font-bold text-marine text-sm">
              Nouvelle offre d&apos;emploi
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-marine mb-1">
                Titre du poste <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex : Serveur / Serveuse"
                className="w-full text-sm border border-gris-ligne rounded-lg px-3 py-2 focus:outline-none focus:border-marine"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-marine mb-1">
                Type de contrat
              </label>
              <select
                value={form.contract_type}
                onChange={(e) =>
                  setForm({ ...form, contract_type: e.target.value })
                }
                className="w-full text-sm border border-gris-ligne rounded-lg px-3 py-2 focus:outline-none focus:border-marine bg-white"
              >
                {CONTRACT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-marine mb-1">
                Lieu
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                placeholder="Ex : Phnom Penh"
                className="w-full text-sm border border-gris-ligne rounded-lg px-3 py-2 focus:outline-none focus:border-marine"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-marine mb-1">
                Salaire
              </label>
              <input
                type="text"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="Ex : 500 $/mois"
                className="w-full text-sm border border-gris-ligne rounded-lg px-3 py-2 focus:outline-none focus:border-marine"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-marine mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                placeholder="Missions, profil recherché..."
                className="w-full text-sm border border-gris-ligne rounded-lg px-3 py-2 focus:outline-none focus:border-marine resize-none"
              />
            </div>
          </div>

          <div className="pt-4 mt-4 flex justify-end border-t border-gris-ligne">
            <button
              type="submit"
              disabled={saving || !form.title.trim()}
              className="inline-flex items-center gap-2 text-xs font-bold bg-marine text-white px-5 py-2.5 rounded-full hover:bg-marine-dark transition-colors disabled:opacity-60"
            >
              <Plus size={14} />
              {saving ? 'Ajout...' : "Publier l'offre"}
            </button>
          </div>
        </form>

        {/* Liste des offres */}
        {loading ? (
          <div className="text-center py-12 bg-gris-fond rounded-lg">
            <p className="text-sm text-gris-texte">Chargement...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-gris-fond rounded-lg">
            <Briefcase size={40} className="text-gris-ligne mx-auto mb-3" />
            <p className="text-sm text-gris-texte">
              Aucune offre d&apos;emploi publiée.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={cn(
                  'flex items-start gap-4 p-5 rounded-xl border-2 transition-all',
                  job.is_active
                    ? 'border-marine bg-marine/5'
                    : 'border-gris-ligne'
                )}
              >
                <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-marine text-sm">
                      {job.title}
                    </span>
                    {job.contract_type && (
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {job.contract_type}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gris-texte space-x-2">
                    {job.location && <span>{job.location}</span>}
                    {job.salary && <span>· {job.salary}</span>}
                  </div>
                  {job.description && (
                    <p className="text-xs text-gris-texte mt-1">
                      {job.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleJob(job)}
                    role="switch"
                    aria-checked={job.is_active}
                    title={job.is_active ? 'Désactiver' : 'Activer'}
                    className={cn(
                      'relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
                      job.is_active ? 'bg-marine' : 'bg-gris-ligne'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform',
                        job.is_active && 'translate-x-4'
                      )}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteJob(job)}
                    title="Supprimer"
                    className="text-gris-texte hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== Section 2 : Candidatures reçues ===== */}
      <section>
        <div className="mb-6">
          <h2 className="font-extrabold text-marine text-base mb-1">
            Candidatures reçues
          </h2>
          <p className="text-xs text-gris-texte">
            Consultez et traitez les candidatures envoyées pour vos offres.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-gris-fond rounded-lg">
            <p className="text-sm text-gris-texte">Chargement...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 bg-gris-fond rounded-lg">
            <User size={40} className="text-gris-ligne mx-auto mb-3" />
            <p className="text-sm text-gris-texte">
              Aucune candidature pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const status = (app.status || 'pending') as ApplicationStatus;
              return (
                <div
                  key={app.id}
                  className="p-5 rounded-xl border border-gris-ligne"
                >
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-marine/10 text-marine flex items-center justify-center flex-shrink-0">
                        <User size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-marine text-sm">
                          {app.candidate_name || 'Candidat inconnu'}
                        </div>
                        {app.job_offers?.title && (
                          <div className="text-xs text-gris-texte">
                            Pour : {app.job_offers.title}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-full',
                          STATUS_STYLES[status]
                        )}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                      {app.created_at && (
                        <span className="text-xs text-gris-texte">
                          {formatDate(app.created_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gris-texte space-y-1 mb-3 pl-11">
                    {app.candidate_email && (
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="flex-shrink-0" />
                        <span className="truncate">{app.candidate_email}</span>
                      </div>
                    )}
                    {app.candidate_phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="flex-shrink-0" />
                        <span>{app.candidate_phone}</span>
                      </div>
                    )}
                    {app.message && (
                      <p className="pt-1 text-gris-texte leading-relaxed">
                        {app.message}
                      </p>
                    )}
                  </div>

                  {/* Boutons de statut */}
                  <div className="flex items-center gap-2 pl-11 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleStatus(app, 'reviewed')}
                      disabled={status === 'reviewed'}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      <Eye size={13} /> Vu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatus(app, 'accepted')}
                      disabled={status === 'accepted'}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      <Check size={13} /> Accepté
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatus(app, 'rejected')}
                      disabled={status === 'rejected'}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <X size={13} /> Refusé
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Les candidats ne sont pas notifiés automatiquement du changement de
            statut.
          </p>
        </div>
      </section>
    </div>
  );
}
