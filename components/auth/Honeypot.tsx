'use client';

import { HONEYPOT_FIELD_NAME, HONEYPOT_STYLE } from '@/lib/spam-protection';

export default function Honeypot() {
  return (
    <div style={HONEYPOT_STYLE} aria-hidden="true">
      <label htmlFor={HONEYPOT_FIELD_NAME}>
        Ne pas remplir ce champ
      </label>
      <input
        type="text"
        id={HONEYPOT_FIELD_NAME}
        name={HONEYPOT_FIELD_NAME}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}