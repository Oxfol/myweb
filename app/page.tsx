import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Astral — Venture Past Our Sky",
  description:
    "Pioneering vessels and breakthrough engineering for extraordinary deep-space travel.",
};

const liquidGlassCss = `
* { box-sizing: border-box; }
html { scroll-behavior: smooth; background: #000; }
body { margin: 0; background: #000; color: #fff; overflow-x: hidden; }
button, a { -webkit-tap-highlight-color: transparent; }
.liquid-glass {
  background: rgba(255,255,255,0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%,
    rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%,
    rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%,
    rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
.liquid-glass-strong {
  background: rgba(255,255,255,0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  border: none;
  box-shadow: 4px 4px 4px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.15);
  position: relative;
  overflow: hidden;
}
.liquid-glass-strong::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.5) 0%,
    rgba(255,255,255,0.2) 20%,
    rgba(255,255,255,0) 40%,
    rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.2) 80%,
    rgba(255,255,255,0.5) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
@media (max-width: 767px) {
  .hero-stats { transform: scale(.82); transform-origin: top center; margin-bottom: -28px; }
  .partner-names { gap: 1.25rem !important; font-size: 1.35rem !important; }
}
`;

export default function Home() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: liquidGlassCss }} />
      <div id="root" />
      <script
        dangerouslySetInnerHTML={{
          __html: `tailwind.config = { theme: { extend: { fontFamily: { heading: ['Instrument Serif', 'serif'], body: ['Barlow', 'sans-serif'] }, borderRadius: { DEFAULT: '9999px' } } } };`,
        }}
      />
      <script src="https://cdn.tailwindcss.com" />
      <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossOrigin="anonymous" />
      <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossOrigin="anonymous" />
      <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossOrigin="anonymous" />
      <script src="https://unpkg.com/framer-motion@11.11.17/dist/framer-motion.js" />
      <script dangerouslySetInnerHTML={{ __html: "window.Motion = window.FramerMotion;" }} />
      <script type="text/babel" src="/components/Icons.jsx" />
      <script type="text/babel" src="/components/FadingVideo.jsx" />
      <script type="text/babel" src="/components/BlurText.jsx" />
      <script type="text/babel" src="/components/Navbar.jsx" />
      <script type="text/babel" src="/components/Hero.jsx" />
      <script type="text/babel" src="/components/Capabilities.jsx" />
      <script type="text/babel" src="/components/App.jsx" />
    </>
  );
}
