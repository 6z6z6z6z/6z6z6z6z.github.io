'use client';
import { useState } from 'react';
import { PretextResearchNote } from './pretext-research-note';

export function Playground() {
  const [open, setOpen] = useState(false);
  return <section className="playground" aria-label="Little Loong’s playground">
    <button className="playground-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="loong-playground">
      <span className="loong-stamp" aria-hidden="true">龍</span>
      <span><span className="playground-eyebrow">A LITTLE SOMETHING JUST FOR FUN</span><strong>There’s a little dragon down here.</strong><small>{open ? 'Time for a nap? Close the playground.' : 'Wake up Little Loong and stay a while.'}</small></span>
      <span className="playground-plus" aria-hidden="true">{open ? '−' : '+'}</span>
    </button>
    <div id="loong-playground" hidden={!open}>{open && <PretextResearchNote />}</div>
  </section>;
}
