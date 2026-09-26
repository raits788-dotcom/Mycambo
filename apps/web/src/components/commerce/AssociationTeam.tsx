import Image from 'next/image';
import type { AssociationTeamMember } from '@/lib/mock-data';

interface AssociationTeamProps {
  team: AssociationTeamMember[];
}

const ROLE_CONFIG = {
  bureau: { label: 'Bureau', icon: '🏛️' },
  terrain: { label: 'Équipe terrain', icon: '💼' },
  benevole: { label: 'Bénévoles', icon: '🙋' },
};

export default function AssociationTeam({ team }: AssociationTeamProps) {
  const groups = {
    bureau: team.filter((t) => t.role === 'bureau'),
    terrain: team.filter((t) => t.role === 'terrain'),
    benevole: team.filter((t) => t.role === 'benevole'),
  };

  return (
    <div className="space-y-10">
      {(['bureau', 'terrain', 'benevole'] as const).map((role) => {
        const members = groups[role];
        if (members.length === 0) return null;
        const config = ROLE_CONFIG[role];

        return (
          <div key={role}>
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">{config.icon}</span>
              <h3 className="text-lg font-extrabold text-marine">
                {config.label}
              </h3>
              <span className="text-xs text-gris-doux">
                ({members.length})
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="text-center bg-white border border-gris-ligne rounded-lg p-4 hover:shadow-cb-sm transition-shadow"
                >
                  <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-gris-fond">
                    {m.photo ? (
                      <Image
                        src={m.photo}
                        alt={m.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-extrabold text-marine">
                        {m.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-marine text-sm mb-0.5">
                    {m.name}
                  </div>
                  <div className="text-[11px] text-gris-doux">
                    {m.position}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}