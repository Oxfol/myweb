"use client";

import { CheckIcon, CopyIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function ArticleActions() {
  const [copied, setCopied] = useState(false);
  async function copyLink() { await navigator.clipboard?.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
  async function share() { if (navigator.share) await navigator.share({ title: document.title, url: window.location.href }); else await copyLink(); }
  return <div className="article-actions"><button type="button" onClick={share}><ShareNetworkIcon size={16} />分享</button><button type="button" onClick={copyLink}>{copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}{copied ? "已复制" : "复制链接"}</button></div>;
}
