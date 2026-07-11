"use client";

import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function AnimatedFilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  return <div className={`animated-filter ${open ? "is-open" : ""}`} ref={ref}>
    <button type="button" className="animated-filter-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(current => !current)}><span><small>{label}</small><strong>{value}</strong></span><CaretDownIcon size={15} weight="bold" /></button>
    <AnimatePresence>{open && <m.div className="animated-filter-menu" role="listbox" initial={{ opacity: 0, y: -6, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: .98 }} transition={{ duration: .16 }}>
      {options.map((option, index) => <m.button type="button" role="option" aria-selected={option === value} key={option} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .025, duration: .14 }} onClick={() => { onChange(option); setOpen(false); }}><span>{option}</span>{option === value && <CheckIcon size={14} />}</m.button>)}
    </m.div>}</AnimatePresence>
  </div>;
}
