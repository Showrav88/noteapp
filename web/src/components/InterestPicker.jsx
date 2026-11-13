'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function InterestPicker({ value, onChange, label = 'Interests', required = false }) {
  const [options, setOptions] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api('/interests/options')
      .then((data) => setOptions(data.items ?? []))
      .catch((err) => setLoadError(err.message));
  }, []);

  function toggle(interestValue) {
    const selected = new Set(value);
    if (selected.has(interestValue)) {
      selected.delete(interestValue);
    } else {
      selected.add(interestValue);
    }
    onChange([...selected]);
  }

  return (
    <div>
      <p className="mb-2 block text-sm font-medium text-brand-navy">
        {label}
        {required && value.length === 0 ? (
          <span className="ml-1 font-normal text-brand-ink">— pick at least one</span>
        ) : null}
      </p>
      {loadError ? <p className="mb-2 text-xs text-brand-orange">{loadError}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan ${
                active
                  ? 'border-brand-cyan bg-brand-cyan/15 text-brand-navy'
                  : 'border-brand-border bg-white text-brand-ink hover:border-brand-cyan/50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
