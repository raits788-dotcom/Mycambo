import type { AssociationValue } from '@/lib/mock-data';

interface AssociationValuesProps {
  values: AssociationValue[];
}

export default function AssociationValues({ values }: AssociationValuesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {values.map((v, i) => (
        <div key={i} className="bg-gris-fond rounded-lg p-5">
          <div className="text-3xl mb-3">{v.icon}</div>
          <h3 className="font-extrabold text-marine text-base mb-2">
            {v.title}
          </h3>
          <p className="text-sm text-gris-texte leading-relaxed">
            {v.description}
          </p>
        </div>
      ))}
    </div>
  );
}
