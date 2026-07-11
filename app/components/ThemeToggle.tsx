"use client";

import { MoonStarsIcon, SunIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function ThemeToggle() {
  const [muted, setMuted] = useState(false);
  function toggle() {
    const next = !muted;
    setMuted(next);
    document.documentElement.dataset.theme = next ? "muted" : "dark";
  }
  return <button className="header-icon-button" type="button" aria-label={muted ? "切换深色主题" : "切换柔和主题"} onClick={toggle}>{muted ? <SunIcon size={16} /> : <MoonStarsIcon size={16} />}</button>;
}
