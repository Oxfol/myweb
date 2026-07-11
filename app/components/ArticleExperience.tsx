"use client";

import { m, useScroll, useSpring } from "motion/react";
import { useEffect, type ReactNode } from "react";

export type ArticleHeading = { id: string; label: string; level: 2 | 3 };

export function ArticleExperience({ children, headings }: { children: ReactNode; headings: ArticleHeading[] }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.25 });

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".article-body h2, .article-body h3");
    nodes.forEach((node, index) => { if (headings[index]) node.id = headings[index].id; });
  }, [headings]);

  return (
    <>
      <m.div className="reading-progress" style={{ scaleX }} aria-hidden="true" />
      <div className="article-layout">
        <article className="article-body">{children}</article>
        {headings.length > 0 && (
          <aside className="article-toc" aria-label="文章目录">
            <p>本页目录</p>
            <nav>{headings.map(item => <a key={item.id} href={`#${item.id}`} className={item.level === 3 ? "toc-level-three" : ""}>{item.label}</a>)}</nav>
          </aside>
        )}
      </div>
    </>
  );
}
