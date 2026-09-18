import React, { useMemo, useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Field, Select } from './Input';

const LAYOUTS = [
  { value: 'grid', label: 'Grid' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'badge', label: 'Badge' },
];
const THEMES = [
  { value: 'minimal-light', label: 'Minimal Light' },
  { value: 'dark-slate', label: 'Dark Slate' },
  { value: 'gradient', label: 'Gradient' },
];

export default function EmbedGeneratorModal({ open, onClose, slug }) {
  const [layout, setLayout] = useState('grid');
  const [theme, setTheme] = useState('minimal-light');
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const wallUrl = `${origin}/wall/${slug}?layout=${layout}&theme=${theme}`;

  const snippet = useMemo(
    () =>
      `<iframe
  src="${wallUrl}"
  title="Testimonials"
  loading="lazy"
  style="width:100%; border:0; min-height:${layout === 'badge' ? '90px' : '600px'};"
></iframe>`,
    [wallUrl, layout]
  );

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Modal open={open} onClose={onClose} title="Embed your Wall of Love" size="lg">
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <Field label="Layout" htmlFor="layout">
          <Select id="layout" value={layout} onChange={(e) => setLayout(e.target.value)}>
            {LAYOUTS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Theme" htmlFor="theme">
          <Select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <p className="text-sm font-medium text-ink-900 mb-2">Copy this snippet into your site</p>
      <pre className="bg-ink-950 text-paper-100 text-xs rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">
        {snippet}
      </pre>
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={copy} variant={copied ? 'secondary' : 'primary'} size="sm">
          {copied ? 'Copied!' : 'Copy snippet'}
        </Button>
        <a href={wallUrl} target="_blank" rel="noreferrer" className="text-xs text-ink-600 underline">
          Preview wall page ↗
        </a>
      </div>
    </Modal>
  );
}
