import Link from "next/link";
import { ArrowUpRightIcon, TerminalWindowIcon } from "@phosphor-icons/react/ssr";
import { HomeHero } from "./components/HomeHero";
import { LogCard } from "./components/LogCard";
import { Reveal } from "./components/Reveal";
import { Container, StatusBadge, TechBadge } from "./components/SiteShell";
import { SpotlightPanel } from "./components/SpotlightPanel";
import { logs } from "./data/logs";
import { projects } from "./data/projects";

export default function Home() {
  const project = projects[0];
  return (
    <>
      <HomeHero />
      <section className="home-section">
        <Container>
          <Reveal className="section-intro-row">
            <div><p className="eyebrow">正在运行</p><h2>一个核心项目，持续向前。</h2></div>
            <Link href="/projects">全部项目 <ArrowUpRightIcon size={17} /></Link>
          </Reveal>
          <Reveal>
            <SpotlightPanel className="featured-project">
              <article>
                <div className="featured-project-copy">
                  <div className="featured-project-kicker"><span>{project.number}</span><StatusBadge status={project.status} /></div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tags">{project.stack.map(item => <TechBadge key={item}>{item}</TechBadge>)}</div>
                  <Link href={`/projects/${project.slug}`} className="featured-project-link">查看项目详情 <ArrowUpRightIcon size={18} /></Link>
                </div>
                <div className="featured-project-visual" aria-hidden="true">
                  <div className="terminal-orbit"><TerminalWindowIcon size={36} weight="thin" /></div>
                  <span>AGENT ONLINE</span>
                  <i />
                  <small>Gateway · Tasks · Tools</small>
                </div>
              </article>
            </SpotlightPanel>
          </Reveal>
        </Container>
      </section>
      <section className="home-section home-logs-section">
        <Container>
          <Reveal className="section-intro-row">
            <div><p className="eyebrow">最新记录</p><h2>把过程留下来。</h2></div>
            <Link href="/logs">全部日志 <ArrowUpRightIcon size={17} /></Link>
          </Reveal>
          <div className="log-timeline">{logs.slice(0, 2).map(log => <Reveal key={log.slug}><LogCard log={log} /></Reveal>)}</div>
        </Container>
      </section>
    </>
  );
}
