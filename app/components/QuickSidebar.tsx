"use client";

import Link from "next/link";
import { ArrowUpRightIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useState } from "react";

type SidebarItem = { label: string; href?: string; value?: string };

export function QuickSidebar({ title = "Quick Navigation", items, active }: { title?: string; items: SidebarItem[]; active?: string }) {
  const [pointerY, setPointerY] = useState<number | null>(null);
  return <aside className="quick-sidebar quick-sidebar-line" onMouseLeave={() => setPointerY(null)} onMouseMove={event => { const rect = event.currentTarget.getBoundingClientRect(); setPointerY(event.clientY - rect.top); }}><div className="quick-sidebar-head"><span>{title}</span><ArrowUpRightIcon size={17} /></div><nav>{items.map((item, index) => { const center = 72 + index * 43; const distance = pointerY === null ? 999 : Math.abs(pointerY - center); const proximity = Math.max(0, 1 - distance / 110); const shift = proximity * 20; const className = `${active === item.label ? "quick-link-active " : ""}line-sidebar-item`; const content = <><span className="line-sidebar-marker" style={{ transform: `scaleX(${.45 + proximity * .55})`, opacity: .35 + proximity * .65 }} /><span className="line-sidebar-index">{String(index + 1).padStart(2, "0")}</span><span className="line-sidebar-label" style={{ transform: `translateX(${shift}px)`, color: active === item.label ? "var(--ink)" : undefined }}>{item.label}</span>{item.value ? <strong className="line-sidebar-value">{item.value}</strong> : <CaretRightIcon className="line-sidebar-arrow" size={14} />}</>; return item.href ? <Link key={item.label} href={item.href} className={className}>{content}</Link> : <div key={item.label} className={className}>{content}</div>; })}</nav></aside>;
}
