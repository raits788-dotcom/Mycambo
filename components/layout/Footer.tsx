import Link from 'next/link';
import Image from 'next/image';

const COLUMNS = [
  {
    title: 'Découvrir',
    links: [
      { label: 'Le Cambodge', href: '/decouvrir' },
      { label: 'Régions', href: '/regions' },
      { label: 'Expériences', href: '/experiences' },
      { label: 'Savoir-faire', href: '/decouvrir#savoir-faire' },
    ],
  },
  {
    title: 'Annuaire',
    links: [
      { label: 'Hôtels', href: '/rubrique/hotel' },
      { label: 'Restaurants', href: '/rubrique/restaurant' },
      { label: 'Associations', href: '/rubrique/association' },
      { label: "Tout l'annuaire", href: '/annuaire' },
    ],
  },
  {
    title: 'Partenaires',
    links: [
      { label: 'Devenir partenaire', href: '/devenir-partenaire' },
      { label: 'Espace partenaire', href: '/connexion' },
      { label: 'Nos formules', href: '/devenir-partenaire#formules' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'CGU', href: '/legal/cgu' },
      { label: 'Confidentialité', href: '/legal/confidentialite' },
      { label: 'Cookies', href: '/legal/cookies' },
      { label: 'Mentions légales', href: '/legal/mentions' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-20">
      <div className="max-w-wrap mx-auto px-4 md:px-8 lg:px-12 xl:px-20 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Image
              src="/logo-cambo.png"
              alt="myCAMBO"
              width={160}
              height={70}
              className="h-12 w-auto object-contain mb-5 brightness-0 invert"
            />
            <p className="text-sm leading-relaxed text-white/60 max-w-xs">
              Tout le Cambodge dans votre poche. Annuaire, culture, vie locale,
              artisans et savoir-faire.
            </p>
          </div>

          {/* Colonnes */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bas de footer */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} myCAMBO. Tous droits réservés.
          </p>
          <div className="flex items-center gap-5 text-white/50">
            <a
              href="#"
              aria-label="Facebook"
              className="hover:text-white transition-colors"
            >
              <i className="fab fa-facebook text-lg" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="hover:text-white transition-colors"
            >
              <i className="fab fa-instagram text-lg" />
            </a>
            <a
              href="#"
              aria-label="TikTok"
              className="hover:text-white transition-colors"
            >
              <i className="fab fa-tiktok text-lg" />
            </a>
          </div>
          <p className="text-xs text-white/40">
            Fait avec ❤️ entre le Cambodge et le monde
          </p>
        </div>
      </div>
    </footer>
  );
}
