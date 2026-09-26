import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <section className="relative text-white overflow-hidden min-h-[calc(100vh-260px)]">
      <Image
        src="https://images.unsplash.com/photo-1565668314564-9d1bebb0a1db?q=85&w=2400&auto=format&fit=crop"
        alt=""
        fill
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-marine/95 via-marine/90 to-marine-dark/95" />

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-260px)] px-4">
        <div className="text-center max-w-xl">
          <div className="text-7xl md:text-9xl font-extrabold text-ic-or leading-none mb-4">
            404
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-3">
            Cette page s&apos;est perdue dans la jungle.
          </h1>
          <p className="text-white/75 leading-relaxed mb-8">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
            Reprenons le chemin ensemble.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-marine font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-colors text-sm"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/annuaire"
              className="inline-flex items-center gap-2 border-[1.5px] border-white/40 text-white font-bold px-6 py-3 rounded-full hover:bg-white/10 hover:border-white transition-colors text-sm"
            >
              Explorer l&apos;annuaire
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
