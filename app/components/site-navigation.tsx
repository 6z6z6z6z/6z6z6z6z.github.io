'use client';

import { useEffect, useState } from 'react';

const items = [['About', 'about'], ['Projects', 'projects'], ['Experience', 'experience'], ['Education', 'education']];

export function SiteNavigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('about');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-15% 0px -60% 0px' });
    items.forEach(([, id]) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); reveals.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.project-entry, .timeline article, .education-grid, .tagline span').forEach(el => {
      el.classList.add('will-reveal'); reveals.observe(el);
    });
    return () => { observer.disconnect(); reveals.disconnect(); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => {
      const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
      if (event.key === 'Escape') { setOpen(false); toggle?.focus(); }
      if (event.key === 'Tab') {
        const links = [...document.querySelectorAll<HTMLElement>('.navigation a'), toggle].filter(Boolean) as HTMLElement[];
        const index = links.indexOf(document.activeElement as HTMLElement);
        const next = event.shiftKey ? (index <= 0 ? links.length - 1 : index - 1) : (index + 1) % links.length;
        event.preventDefault(); links[next]?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => { document.body.style.overflow = before; document.removeEventListener('keydown', close); };
  }, [open]);
  return <header className="site-header">
    <a className="wordmark" href="#top" aria-label="Zhuang Zhang, back to top">z<span>.</span></a>
    <nav className={open ? 'navigation is-open' : 'navigation'} aria-label="Primary navigation">
      {items.map(([label, id], i) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setOpen(false)} style={{ '--item': i } as React.CSSProperties}>{label}</a>)}
      <a className="mobile-contact" href="mailto:zz6666@mail.ustc.edu.cn">Get in touch ↗</a>
    </nav>
    <a className="header-link" href="mailto:zz6666@mail.ustc.edu.cn">Let’s talk <span aria-hidden="true">↗</span></a>
    <button className={`menu-toggle ${open ? 'is-open' : ''}`} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}><span /><span /></button>
  </header>;
}
