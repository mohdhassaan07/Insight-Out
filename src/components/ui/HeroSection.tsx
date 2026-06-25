"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

interface HeroSectionProps {
  isAuthenticated: boolean;
}

// Animated floating particles
function Particles() {
  const [particles, setParticles] = useState<React.CSSProperties[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 30 }).map(() => ({
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 8}s`,
        animationDuration: `${Math.random() * 6 + 6}s`,
      }))
    );
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((style, i) => (
        <div key={i} className="hero-particle absolute rounded-full" style={style} />
      ))}
    </div>
  );
}

// Orbiting ring
function OrbitalRing({ size, duration, delay, opacity }: { size: number; duration: number; delay: number; opacity: number }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-500/10 dark:border-indigo-400/10 hero-orbital"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity,
      }}
    >
      {/* Orbiting dot */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-500/40 dark:bg-indigo-400/40 blur-[1px]"
      />
    </div>
  );
}

export default function HeroSection({ isAuthenticated }: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Staggered entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePos({ x, y });
    };

    const el = heroRef.current;
    el?.addEventListener("mousemove", handleMouseMove);
    return () => el?.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-24 px-6 overflow-hidden"
    >
      {/* Aurora gradient background - moves with mouse */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[120vw] h-[120vh] -top-[10vh] -left-[10vw] transition-transform duration-2000 ease-out"
          style={{ transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 15}px)` }}
        >
          <div className="absolute top-[10%] left-[30%] w-[50vw] h-[40vw] rounded-full bg-indigo-500/8 dark:bg-indigo-500/15 blur-[140px] hero-aurora-1" />
          <div className="absolute top-[40%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-purple-500/6 dark:bg-purple-400/12 blur-[120px] hero-aurora-2" />
          <div className="absolute bottom-[10%] left-[15%] w-[40vw] h-[30vw] rounded-full bg-indigo-400/4 dark:bg-indigo-400/8 blur-[100px] hero-aurora-3" />
        </div>
      </div>

      {/* Animated grid lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        {/* Animated scan line */}
        <div className="hero-scan-line absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />
      </div>

      {/* Floating particles */}
      <Particles />

      {/* Orbital rings */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <OrbitalRing size={500} duration={25} delay={0} opacity={0.3} />
        <OrbitalRing size={700} duration={35} delay={2} opacity={0.2} />
        <OrbitalRing size={900} duration={45} delay={4} opacity={0.1} />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-black/5 dark:border-white/8 bg-white/50 dark:bg-white/3 backdrop-blur-xl mb-10 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
          <span className="text-xs tracking-[0.2em] uppercase text-zinc-500 dark:text-zinc-400">
            Powered by AI
          </span>
        </div>

        {/* Heading with staggered reveal */}
        <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-serif tracking-tight leading-[1.02] mb-8">
          <span
            className={`block transition-all duration-1000 delay-200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            Transform Feedback
          </span>
          <span
            className={`block transition-all duration-1000 delay-400 relative ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <span className="hero-gradient-text text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-purple-500 to-zinc-500 dark:from-indigo-300 dark:via-purple-300 dark:to-zinc-400 font-sans font-light italic">
              Into Action
            </span>
          </span>
        </h1>

        {/* Subheading */}
        <p
          className={`text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed mb-14 transition-all duration-1000 delay-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          Analyze app and website feedback with AI. Automatically categorize product feedback, detect sentiment, and uncover actionable insights in seconds.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-5 transition-all duration-1000 delay-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
            <button className="group relative px-10 py-4.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full font-medium tracking-wide overflow-hidden transition-all hover:scale-[1.03] active:scale-[0.98] duration-300 shadow-2xl shadow-zinc-900/20 dark:shadow-zinc-300/10 hero-cta-glow">
              <span className="relative z-10 flex items-center gap-2.5">
                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                <svg
                  className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1.5 duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-200 dark:to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm tracking-[0.15em] uppercase text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors duration-300 px-6 py-4.5"
          >
            See How It Works
          </Link>
        </div>
      </div>

      {/* Floating dashboard preview with parallax */}
      <div
        className={`relative z-10 w-full max-w-5xl mx-auto mt-20 transition-all duration-1200 delay-900 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
          }`}
        style={{ transform: isLoaded ? `perspective(1200px) rotateX(${mousePos.y * 2}deg) rotateY(${mousePos.x * -2}deg)` : undefined }}
      >
        <div className="relative rounded-2xl border border-zinc-200/60 dark:border-white/8 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-2xl shadow-[0_40px_100px_-40px_rgba(67,56,202,0.25)] dark:shadow-[0_40px_100px_-40px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl hero-border-glow" />

          {/* Top bar accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Browser chrome */}
          <div className="relative flex items-center gap-2 px-5 py-3.5 border-b border-zinc-100 dark:border-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60 dark:bg-red-400/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60 dark:bg-amber-400/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60 dark:bg-emerald-400/30" />
            </div>
            <div className="flex-1 mx-4">
              <div className="max-w-xs mx-auto h-6 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center justify-center gap-1.5 px-3">
                <svg className="w-3 h-3 text-emerald-500/60" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">insight-out.app/dashboard</span>
              </div>
            </div>
          </div>

          {/* Dashboard mockup content */}
          <div className="relative p-6 sm:p-8">
            <div className="grid grid-cols-12 gap-4">
              {/* Sidebar skeleton */}
              <div className="col-span-3 hidden sm:flex flex-col gap-3 pr-4 border-r border-zinc-100 dark:border-white/5">
                <div className="w-full h-3 bg-zinc-200/60 dark:bg-white/8 rounded-full hero-skeleton-pulse" />
                <div className="w-3/4 h-3 bg-zinc-100/80 dark:bg-white/5 rounded-full hero-skeleton-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="w-5/6 h-3 bg-zinc-100/80 dark:bg-white/5 rounded-full hero-skeleton-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2/3 h-3 bg-zinc-100/80 dark:bg-white/5 rounded-full hero-skeleton-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="mt-4 w-full h-3 bg-indigo-100 dark:bg-indigo-500/15 rounded-full" />
                <div className="w-4/5 h-3 bg-zinc-100/80 dark:bg-white/5 rounded-full hero-skeleton-pulse" style={{ animationDelay: '0.4s' }} />
              </div>

              {/* Main content */}
              <div className="col-span-12 sm:col-span-9 space-y-4">
                {/* Metric cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total", value: "2,847", color: "text-zinc-800 dark:text-zinc-100" },
                    { label: "Positive", value: "68%", color: "text-emerald-600 dark:text-emerald-400" },
                    { label: "Categories", value: "12", color: "text-indigo-600 dark:text-indigo-400" },
                  ].map((card, i) => (
                    <div key={i} className="p-4 rounded-xl bg-zinc-50/80 dark:bg-white/3 border border-zinc-100 dark:border-white/5 group hover:border-zinc-300 dark:hover:border-white/10 transition-colors duration-300">
                      <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mb-2">{card.label}</div>
                      <div className={`text-xl font-serif ${card.color}`}>{card.value}</div>
                    </div>
                  ))}
                </div>

                {/* Animated chart */}
                <div className="rounded-xl bg-zinc-50/60 dark:bg-white/2 border border-zinc-100 dark:border-white/5 p-4 h-32">
                  <div className="flex items-end justify-between h-full gap-1.5">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-linear-to-t from-indigo-500/30 to-indigo-500/10 dark:from-indigo-400/25 dark:to-indigo-400/5 hero-bar-grow"
                        style={{ height: `${h}%`, animationDelay: `${1.2 + i * 0.08}s` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Feed items */}
                <div className="space-y-2">
                  {[
                    { label: "Feature Request", color: "bg-indigo-500", sentiment: "+87%" },
                    { label: "Bug Report", color: "bg-amber-500", sentiment: "-42%" },
                    { label: "UX Feedback", color: "bg-emerald-500", sentiment: "+93%" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-50/60 dark:bg-white/2 border border-zinc-100 dark:border-white/5"
                    >
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <div className="flex-1 h-2.5 bg-zinc-200/50 dark:bg-white/5 rounded-full" />
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{item.label}</span>
                      <span className={`text-[10px] font-mono ${item.sentiment.startsWith("+") ? "text-emerald-500" : "text-amber-500"}`}>
                        {item.sentiment}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glow underneath */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-indigo-500/15 dark:bg-indigo-500/20 blur-[60px] rounded-full" />
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 delay-1200 ${isLoaded ? "opacity-40 translate-y-0" : "opacity-0 translate-y-4"
          }`}
      >
        <div className="w-5 h-8 rounded-full border border-zinc-400 dark:border-zinc-600 flex items-start justify-center p-1.5">
          <div className="w-1 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
