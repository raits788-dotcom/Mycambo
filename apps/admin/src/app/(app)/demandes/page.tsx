'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Inbox,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  X,
} from 'lucide-react';

interface PartnerRequest {
  id: string;
  company: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const MOCK_REQUESTS: PartnerRequest[] = [
  {
    id: 'r1',
    company: 'Koh Rong Diving Center',
    email: 'dive@kohrong-diving.com',
    phone: '+855 92 111 222',
    category: 'Activité',
    city: 'Koh Rong',
    message:
      "Bonjour, nous souhaitons rejoindre My Cambo pour promouvoir nos plongées autour de l'archipel de Koh Rong. Nous avons 3 sites et 5 instructeurs certifiés PADI.",
    status: 'pending',
    createdAt: '2025-01-14',
  },
  {
    id: 'r2',
    company: 'Battambang Bamboo Train',
    email: 'info@bamboo-train.kh',
    phone: '+855 92 333 444',
    category: 'Activité',
    city: 'Battambang',
    message:
      "Nous opérons le célèbre train de bambou de Battambang. Nous aimerions apparaître dans votre annuaire des activités.",
    status: 'pending',
    createdAt: '2025-01-13',
  },
  {
    id: 'r3',
    company: 'Malis Restaurant',
    email: 'reservation@malis-restaurant.com',
    phone: '+855 23 555 666',
    category: 'Restaurant',
    city: 'Phnom Penh',
    message:
      'Restaurant gastronomique khmer, 15 ans d\'existence, 2 adresses à Phnom Penh et Siem Reap.',
    status: 'approved',
    createdAt: '2025-01-10',
  },
  {
    id: 'r4',
    company: 'Friends International',
    email: 'contact@friends-international.org',
    phone: '+855 23 777 888',
    category: 'Association',
    city: 'Phnom Penh',
    message:
      'ONG internationale qui soutient les enfants et jeunes marginalisés au Cambodge. Nous souhaitons figurer dans votre section associations.',
    status: 'approved',
    createdAt: '2025-01-08',
  },
  {
    id: 'r5',
    company: 'Angkor Silk Farm',
    email: 'visit@angkor-silk.kh',
    phone: '+855 63 999 000',
    category: 'Shopping',
    city: 'Siem Reap',
    message: 'Ferme de soie proposant visites guidées et ateliers de tissage.',
    status: 'rejected',
    createdAt: '2025-01-05',
  },
];

const STATUS_STYLES = {
  pending: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Refusée',
};

export default function PartnerRequestsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PartnerRequest['status']>('all');
  const [selectedRequest, setSelectedRequest] = useState<PartnerRequest | null>(null);

  const filtered = MOCK_REQUESTS.filter((r) => {
    const matchSearch =
      r.company.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: MOCK_REQUESTS.length,
    pending: MOCK_REQUESTS.filter((r) => r.status === 'pending').length,
    approved: MOCK_REQUESTS.filter((r) => r.status === 'approved').length,
    rejected: MOCK_REQUESTS.filter((r) => r.status === 'rejected').length,
  };

  const handleApprove = (id: string) => {
    alert(
      'Approuver la demande ' + id + ' ?\n\n' +
      'Un tenant sera créé et les identifiants envoyés par email au partenaire.'
    );
    setSelectedRequest(null);
  };

  const handleReject = (id: string) => {
    const reason = prompt('Raison du refus (optionnel) :');
    if (reason !== null) {
      alert('Demande ' + id + ' refusée.' + (reason ? '\n\nRaison : ' + reason : ''));
      setSelectedRequest(null);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-marine mb-1">
          Demandes partenaires
        </h1>
        <p className="text-sm text-gris-texte">
          {counts.total} demandes · {counts.pending} en attente de validation
        </p>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">Total</div>
          <div className="text-2xl font-extrabold text-marine">{counts.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">En attente</div>
          <div className="text-2xl font-extrabold text-orange-600">{counts.pending}</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">Approuvées</div>
          <div className="text-2xl font-extrabold text-green-600">{counts.approved}</div>
        </div>
        <div className="bg-white rounded-xl border border-gris-ligne p-4">
          <div className="text-xs text-gris-texte mb-1">Refusées</div>
          <div className="text-2xl font-extrabold text-red-600">{counts.rejected}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gris-ligne p-4 mb-5 flex flex-wrap gap-3 items-center shadow-cb-sm">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-doux" />
          <input
            type="text"
            placeholder="Rechercher par entreprise, email, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gris-ligne focus:border-marine focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gris-doux" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="text-sm rounded-lg border border-gris-ligne px-3 py-2.5 focus:border-marine focus:outline-none"
          >
            <option value="all">Tous statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Refusées</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gris-ligne overflow-hidden shadow-cb-sm">
        <table className="w-full text-sm">
          <thead className="bg-gris-fond text-gris-texte text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-5 py-3 font-bold">Entreprise</th>
              <th className="text-left px-3 py-3 font-bold">Catégorie</th>
              <th className="text-left px-3 py-3 font-bold">Ville</th>
              <th className="text-left px-3 py-3 font-bold">Date</th>
              <th className="text-left px-3 py-3 font-bold">Statut</th>
              <th className="text-right px-5 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gris-ligne">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gris-texte">
                  Aucune demande ne correspond à ces filtres.
                </td>
              </tr>
            ) : (
              filtered.map((req) => (
                <tr key={req.id} className="hover:bg-gris-fond/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-marine/10 text-marine flex items-center justify-center flex-shrink-0">
                        <Briefcase size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-marine truncate">{req.company}</div>
                        <div className="text-xs text-gris-texte truncate flex items-center gap-1">
                          <Mail size={10} />
                          {req.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-gris-texte text-xs">{req.category}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1 text-gris-texte text-xs">
                      <MapPin size={11} />
                      {req.city}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-xs text-gris-texte">{req.createdAt}</td>
                  <td className="px-3 py-4">
                    <span className={'inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ' + STATUS_STYLES[req.status]}>
                      {STATUS_LABELS[req.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-marine/10 hover:text-marine transition-colors"
                        title="Voir le détail"
                      >
                        <Eye size={14} />
                      </button>
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors"
                            title="Approuver"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                            title="Refuser"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gris-texte hover:bg-gris-fond transition-colors"
                        title="Plus"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de détail */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="flex items-start justify-between p-6 border-b border-gris-ligne">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-marine/10 text-marine flex items-center justify-center flex-shrink-0">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-marine">
                    {selectedRequest.company}
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-gris-texte mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail size={11} />
                      {selectedRequest.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {selectedRequest.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {selectedRequest.createdAt}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-lg hover:bg-gris-fond flex items-center justify-center text-gris-texte"
              >
                <X size={16} />
              </button>
            </div>

            {/* Corps */}
            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                  Catégorie
                </div>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-marine/10 text-marine">
                  {selectedRequest.category}
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                  Téléphone
                </div>
                <div className="text-sm text-marine">{selectedRequest.phone}</div>
              </div>

              <div>
                <div className="text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                  Message
                </div>
                <div className="text-sm text-gris-texte bg-gris-fond rounded-lg p-4 leading-relaxed">
                  {selectedRequest.message}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-gris-texte uppercase tracking-wider mb-2">
                  Statut actuel
                </div>
                <span className={'inline-flex px-3 py-1 rounded-full text-xs font-bold ' + STATUS_STYLES[selectedRequest.status]}>
                  {STATUS_LABELS[selectedRequest.status]}
                </span>
              </div>
            </div>

            {/* Footer modal */}
            {selectedRequest.status === 'pending' && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gris-ligne bg-gris-fond">
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <XCircle size={14} />
                  Refuser
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 size={14} />
                  Approuver et créer le tenant
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}