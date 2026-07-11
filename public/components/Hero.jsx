const { motion: heroMotion } = Motion;
const heroEntrance = { initial: { filter: "blur(10px)", opacity: 0, y: 20 }, animate: { filter: "blur(0px)", opacity: 1, y: 0 } };

function StatCard({ icon, value, label }) {
  return (
    <div className="liquid-glass flex w-[220px] flex-col rounded-[1.25rem] p-5 text-left">
      {icon}
      <div className="mt-7 font-heading text-4xl italic leading-none tracking-[-1px] text-white">{value}</div>
      <div className="mt-2 font-body text-xs font-light text-white">{label}</div>
    </div>
  );
}

function Hero() {
  return (
    <section id="home" className="relative flex min-h-screen overflow-hidden bg-black">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="absolute left-1/2 top-0 z-0 -translate-x-1/2 object-cover object-top"
        style={{ width: "120%", height: "120%" }}
      />
      <Navbar />
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col items-center justify-center px-4 pt-24 text-center">
          <heroMotion.div {...heroEntrance} transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }} className="liquid-glass flex items-center gap-3 rounded-full py-1 pl-1">
            <span className="rounded-full bg-white px-3 py-1 font-body text-xs font-semibold text-black">New</span>
            <span className="pr-3 font-body text-sm text-white/90">Maiden Crewed Voyage to Mars Arrives 2026</span>
          </heroMotion.div>

          <BlurText text="Venture Past Our Sky Across the Universe" className="mt-6 max-w-2xl justify-center font-heading text-6xl italic leading-[0.8] tracking-[-4px] text-white md:text-7xl lg:text-[5.5rem]" />

          <heroMotion.p {...heroEntrance} transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }} className="mt-4 max-w-2xl font-body text-sm font-light leading-tight text-white md:text-base">
            Discover the universe in ways once unimaginable. Our pioneering vessels and breakthrough engineering bring deep-space exploration within reach—secure and extraordinary.
          </heroMotion.p>

          <heroMotion.div {...heroEntrance} transition={{ duration: 0.7, delay: 1.1, ease: "easeOut" }} className="mt-6 flex items-center gap-6">
            <a href="#capabilities" className="liquid-glass-strong flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-sm font-medium text-white">
              Start Your Voyage <ArrowUpRight className="h-5 w-5" />
            </a>
            <a href="#capabilities" className="flex items-center gap-2 font-body text-sm font-medium text-white">
              View Liftoff <PlayIcon className="h-4 w-4" />
            </a>
          </heroMotion.div>

          <heroMotion.div {...heroEntrance} transition={{ duration: 0.7, delay: 1.3, ease: "easeOut" }} className="hero-stats mt-8 flex items-stretch gap-4">
            <StatCard icon={<ClockIcon />} value="34.5 Min" label="Average Videos Watch Time" />
            <StatCard icon={<GlobeIcon />} value="2.8B+" label="Users Across the Globe" />
          </heroMotion.div>
        </main>

        <heroMotion.div {...heroEntrance} transition={{ duration: 0.7, delay: 1.4, ease: "easeOut" }} className="flex flex-col items-center gap-4 pb-8">
          <div className="liquid-glass rounded-full px-3.5 py-1 font-body text-xs font-medium text-white">Collaborating with top aerospace pioneers globally</div>
          <div className="partner-names flex gap-12 font-heading text-2xl italic tracking-tight text-white md:gap-16 md:text-3xl">
            {["Aeon", "Vela", "Apex", "Orbit", "Zeno"].map((name) => <span key={name}>{name}</span>)}
          </div>
        </heroMotion.div>
      </div>
    </section>
  );
}

window.Hero = Hero;
