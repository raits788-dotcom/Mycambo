'use client';

import { useRef } from 'react';
import { Upload, FileText, Trash2, Shield, Image as ImageIcon, Info } from 'lucide-react';
import PhotoUploadSlot from '../PhotoUploadSlot';
import {
  PHOTO_SLOTS,
  type WizardData,
  type UploadedFile,
} from '@/lib/establishment-wizard';

interface WizardStep4LegalProps {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
}

export default function WizardStep4Legal({
  data,
  onChange,
}: WizardStep4LegalProps) {
  const docInputRef = useRef<HTMLInputElement>(null);

  const handleDocAdd = async (files: FileList) => {
    const validFiles: UploadedFile[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} dépasse 5 Mo.`);
        continue;
      }
      const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowed.includes(file.type)) {
        alert(`${file.name} : format non supporté (PDF, JPG, PNG).`);
        continue;
      }

      const url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      validFiles.push({
        name: file.name,
        size: file.size,
        url,
        type: file.type,
      });
    }

    onChange({ documents: [...data.documents, ...validFiles] });
  };

  const removeDoc = (index: number) => {
    onChange({
      documents: data.documents.filter((_, i) => i !== index),
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' Ko';
    return (bytes / (1024 * 1024)).toFixed(1) + ' Mo';
  };

  return (
    <div className="space-y-8">
      {/* ===== Légal ===== */}
      <div>
        <h2 className="text-xl font-extrabold text-marine mb-1 flex items-center gap-2">
          <Shield size={18} className="text-marine" />
          Informations légales
        </h2>
        <p className="text-xs text-gris-texte mb-6">
          Ces informations permettent de valider votre établissement.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
              Numéro d&apos;enregistrement *
            </label>
            <input
              type="text"
              value={data.registrationNumber}
              onChange={(e) =>
                onChange({ registrationNumber: e.target.value })
              }
              placeholder="Ex : MoI-NGO-2012-0847"
              className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
            />
            <p className="text-[10px] text-gris-doux mt-1 flex items-center gap-1">
              <Shield size={10} className="text-green-600" />
              Ce numéro sera vérifié par notre équipe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
                Représentant légal *
              </label>
              <input
                type="text"
                value={data.legalRepresentative}
                onChange={(e) =>
                  onChange({ legalRepresentative: e.target.value })
                }
                placeholder="Prénom Nom"
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wider">
                Fonction
              </label>
              <input
                type="text"
                value={data.legalFunction}
                onChange={(e) => onChange({ legalFunction: e.target.value })}
                placeholder="Ex : Fondateur, Directeur"
                className="w-full border border-gris-ligne rounded-lg px-4 py-3 text-sm focus:border-marine focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">
              Documents justificatifs *
            </label>
            <div
              className="border-2 border-dashed border-gris-ligne rounded-lg p-6 text-center cursor-pointer hover:border-marine transition-colors"
              onClick={() => docInputRef.current?.click()}
            >
              <Upload size={20} className="text-gris-doux mx-auto mb-2" />
              <div className="text-sm text-marine font-bold mb-1">
                Cliquez pour ajouter des documents
              </div>
              <div className="text-[10px] text-gris-doux">
                PDF, JPG, PNG · 5 Mo max par fichier
              </div>
            </div>
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleDocAdd(e.target.files);
                e.target.value = '';
              }}
            />

            {data.documents.length > 0 && (
              <div className="space-y-2 mt-3">
                {data.documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-gris-fond rounded-lg p-3"
                  >
                    <FileText
                      size={16}
                      className={
                        doc.type === 'application/pdf'
                          ? 'text-red-500'
                          : 'text-blue-500'
                      }
                    />
                    <span className="text-xs text-marine flex-1 truncate">
                      {doc.name}
                    </span>
                    <span className="text-[10px] text-gris-doux">
                      {formatSize(doc.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDoc(i)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Photos ===== */}
      <div className="pt-8 border-t border-gris-ligne">
        <h2 className="text-xl font-extrabold text-marine mb-1 flex items-center gap-2">
          <ImageIcon size={18} className="text-marine" />
          Photos de l&apos;établissement
        </h2>
        <p className="text-xs text-gris-texte mb-2">
          Jusqu&apos;à 5 photos. La première sera la photo principale.
        </p>
        <p className="text-xs text-ic-or font-bold mb-6">
          Les 2 premières sont obligatoires (devanture + intérieur).
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PHOTO_SLOTS.map((slot, i) => (
            <PhotoUploadSlot
              key={slot.id}
              slot={slot}
              photo={data.photos[slot.id]}
              isMain={i === 0}
              onChange={(file) =>
                onChange({
                  photos: { ...data.photos, [slot.id]: file },
                })
              }
            />
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 flex items-start gap-2">
          <Info size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-800 leading-relaxed">
            <b>Conseil :</b> les fiches avec 5 photos reçoivent{' '}
            <b>3× plus de vues</b>. Utilisez des photos nettes, lumineuses et
            sans texte incrusté.
          </p>
        </div>
      </div>

      {/* ===== Certifications ===== */}
      <div className="pt-8 border-t border-gris-ligne space-y-3">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={data.certifyAccuracy}
            onChange={(e) => onChange({ certifyAccuracy: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-marine"
          />
          <span className="text-xs text-gris-texte leading-relaxed">
            Je certifie que les informations sont exactes et que je dispose
            des droits nécessaires sur les photos fournies. *
          </span>
        </label>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={data.acceptTerms}
            onChange={(e) => onChange({ acceptTerms: e.target.checked })}
            className="mt-0.5 w-4 h-4 accent-marine"
          />
          <span className="text-xs text-gris-texte leading-relaxed">
            J&apos;accepte les{' '}
            <a
              href="/legal/cgu"
              target="_blank"
              className="text-marine underline font-bold"
            >
              CGU partenaires
            </a>{' '}
            et la{' '}
            <a
              href="/legal/confidentialite"
              target="_blank"
              className="text-marine underline font-bold"
            >
              politique de confidentialité
            </a>
            . *
          </span>
        </label>
      </div>
    </div>
  );
}