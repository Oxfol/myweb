"use client";

import { m } from "motion/react";
import { DotField } from "./DotField";
import { MagneticLink } from "./MagneticLink";

const lines = ["把想法变成", "可运行的系统。"];

export function HomeHero() {
  return (
    <section className="home-hero">
      <DotField className="home-hero-dots" dotSpacing={18} cursorRadius={260} bulgeStrength={34} />
      <div className="hero-shade" aria-hidden="true" />
      <div className="site-container hero-inner">
        <m.div
          className="hero-copy"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } } }}
        >
          <m.p className="eyebrow" variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } }}>
            个人开发门户 / 2026
          </m.p>
          <h1 className="hero-title">
            {lines.map((line, index) => (
              <span key={line} className={index === 1 ? "hero-title-accent" : ""}>
                <m.span variants={{ hidden: { y: "110%" }, visible: { y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } } }}>
                  {line}
                </m.span>
              </span>
            ))}
          </h1>
          <m.p className="hero-description" variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}>
            我是 Flower ZC，持续构建 AI Agent、开发基础设施与自动化系统。这里记录真实项目、部署过程与每一次迭代。
          </m.p>
          <m.div className="hero-actions" variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}>
            <MagneticLink href="/projects">浏览项目</MagneticLink>
            <MagneticLink href="/logs" variant="secondary">阅读开发日志</MagneticLink>
          </m.div>
          <m.div className="hero-status" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8 } } }}>
            <span className="pulse-dot" />
            <span>运行稳定</span>
            <i />
            <span>Ubuntu 24.04</span>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
