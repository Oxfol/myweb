import Link from "next/link";
import { ArrowUpRightIcon, CaretRightIcon } from "@phosphor-icons/react/ssr";

type SidebarItem = { label: string; href?: string; value?: string };

export function QuickSidebar({ title = "Quick Navigation", items, active }: { title?: string; items: SidebarItem[]; active?: string }) {
  return <aside className="quick-sidebar quick-sidebar-line"><div className="quick-sidebar-head"><span>{title}</span><ArrowUpRightIcon size={17} /></div><nav>{items.map(item => item.href ? <Link key={item.label} href={item.href} className={active === item.label ? "quick-link-active" : ""}><span>{item.label}</span><CaretRightIcon size={14} /></Link> : <div key={item.label} className="quick-stat"><span>{item.label}</span><strong>{item.value}</strong></div>)}</nav></aside>;
}
