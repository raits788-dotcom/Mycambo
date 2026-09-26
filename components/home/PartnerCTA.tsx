import Button from '@/components/ui/Button';

const plans = [
  { name: 'Découverte', price: 'Gratuit', detail: '1 commerce' },
  { name: 'Essentiel', price: '15 $', detail: '/ mois · 1 commerce' },
  { name: 'Pro', price: '39 $', detail: '/ mois · 3 commerces' },
  { name: 'Business', price: '79 $', detail: '/ mois · 10 commerces' },
];

export default function PartnerCTA() {
  return (
    <section className="py-24 bg-terra relative overflow-hidden">
      <div className="absolute inset-0 bg-kbach-pattern opacity-20" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center text-ivory">
        <div className="text-xs uppercase tracking-[0.4em] text-ivory/70 mb-4">
          Vous êtes un commerce ?
        </div>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
          Rejoignez{' '}
          <span className="italic text-gold-light">My Cambo</span>
        </h2>
        <p className="text-lg text-ivory/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          Faites découvrir votre établissement à des milliers de voyageurs et
          d&apos;habitants. Gagnez en visibilité, recevez des clients, rejoignez
          la communauté.
        </p>

        <Button
          href="/devenir-partenaire"
          size="lg"
          className="bg-ivory text-ink hover:bg-gold hover:text-ink"
        >
          Devenir partenaire
        </Button>

        <p className="mt-6 text-sm text-ivory/60">
          Sans engagement · Validation en 48h
        </p>

        {/* Grille des formules */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          {plans.map((p) => (
            <div
              key={p.name}
              className="bg-ivory/10 backdrop-blur-sm border border-ivory/20 rounded-lg p-5"
            >
              <div className="text-[10px] uppercase tracking-widest text-gold-light mb-2">
                {p.name}
              </div>
              <div className="font-serif text-2xl text-ivory mb-1">
                {p.price}
              </div>
              <div className="text-xs text-ivory/60">{p.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}