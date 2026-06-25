import Link from "next/link";
import { getServerSession } from "next-auth";
import Navbar from "@/src/components/layout/Navbar";
import AuthProvider from "@/src/components/providers/AuthProvider";
import HeroSection from "@/src/components/ui/HeroSection";
import ScrollReveal from "@/src/components/ui/ScrollReveal";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI-Powered Categorization",
    description: "Our advanced AI automatically categorizes feedback into meaningful categories like bugs, feature requests, UX issues, and more.",
    span: "md:col-span-2",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Sentiment Analysis",
    description: "Understand how your customers feel with automatic sentiment detection — positive, neutral, or negative.",
    span: "md:col-span-1",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    title: "Bulk CSV Upload",
    description: "Upload thousands of feedback entries at once. Process feedback in bulk effortlessly.",
    span: "md:col-span-1",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Powerful Analytics",
    description: "Visualize feedback trends, category distributions, and sentiment patterns with beautiful interactive charts.",
    span: "md:col-span-2",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "AI Generated Summaries",
    description: "Automatically generate concise summaries from thousands of feedbacks to quickly grasp the big picture.",
    span: "md:col-span-1",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: "CSV Export",
    description: "Export your categorized and analyzed data to CSV for external reporting or deeper integrations.",
    span: "md:col-span-1",
  },
];

const stats = [
  { value: "10K+", label: "Feedbacks Processed" },
  { value: "99%", label: "Accuracy Rate" },
  { value: "50+", label: "Companies Trust Us" },
  { value: "24/7", label: "Support Available" },
];

const steps = [
  {
    number: "01",
    title: "Upload Feedback",
    description: "Drop your CSV files or paste feedback directly. We support bulk imports of any size.",
  },
  {
    number: "02",
    title: "AI Categorizes",
    description: "Our AI engine processes each entry, assigning categories and sentiment scores in real-time.",
  },
  {
    number: "03",
    title: "Get Insights",
    description: "Explore interactive dashboards, generate summaries, and export data to drive decisions.",
  },
];

const testimonials = [
  {
    quote: "This tool completely transformed how we handle customer requests. The AI categorization is scarily accurate and saves us countless hours.",
    author: "Elena Rodriguez",
    role: "Head of Product, TechFlow",
  },
  {
    quote: "We used to spend hours manually tagging feedback. Now, it takes seconds. It's an indispensable part of our daily workflow.",
    author: "Marcus Chen",
    role: "UX Researcher, Innovate HQ",
  },
  {
    quote: "The interface is gorgeous and the insights we're getting have directly driven our last three major feature releases.",
    author: "Sarah Jenkins",
    role: "Founder, Loop Studio",
  },
];

export default async function Home() {
  const session = await getServerSession();

  return (
    <AuthProvider>
      <div className="min-h-screen rmv-scrollbar bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 selection:bg-indigo-500/30 overflow-hidden font-sans transition-colors duration-500">
        {/* Navbar */}
        <div className="absolute top-0 w-full z-50">
          <Navbar />
        </div>

        <main className="relative ">
          {/* ═══════════════════════════════════════════════
              HERO — Futuristic, animated
          ═══════════════════════════════════════════════ */}
          <HeroSection isAuthenticated={!!session} />

          {/* ═══════════════════════════════════════════════
              STATS — Cinematic horizontal strip
          ═══════════════════════════════════════════════ */}
          <section className="relative py-20 px-6 border-y border-zinc-100 dark:border-white/5">
            <div className="absolute inset-0 bg-zinc-50/50 dark:bg-zinc-950/50" />
            <div className="relative z-10 max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-zinc-200/70 dark:divide-white/5">
                {stats.map((stat, i) => (
                  <ScrollReveal key={i} delay={i * 120} direction="up" distance={30}>
                    <div className="flex flex-col items-center text-center px-8 group cursor-default">
                      <div className="text-4xl sm:text-5xl font-serif mb-3 text-transparent bg-clip-text bg-linear-to-b from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400 group-hover:from-indigo-600 group-hover:to-purple-600 dark:group-hover:from-indigo-300 dark:group-hover:to-purple-300 transition-all duration-500">
                        {stat.value}
                      </div>
                      <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">
                        {stat.label}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════
              HOW IT WORKS — Three-step flow
          ═══════════════════════════════════════════════ */}
          <section id="how-it-works" className="relative py-32 sm:py-40 px-6 sm:px-12 lg:px-24">
            <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/4 dark:bg-purple-400/6 blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
              <ScrollReveal>
                <div className="text-center mb-24">
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 mb-5 block">Process</span>
                  <h2 className="text-4xl sm:text-6xl font-serif leading-[1.1] text-zinc-900 dark:text-white mb-6">
                    Three simple steps to{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-500 dark:from-indigo-300 dark:to-purple-300 italic font-sans font-light">clarity</span>
                  </h2>
                  <div className="w-12 h-px bg-zinc-300 dark:bg-zinc-700 mx-auto" />
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
                {steps.map((step, i) => (
                  <ScrollReveal key={i} delay={i * 200} direction="up" distance={50}>
                    <div className="relative group">
                      {/* Connector line */}
                      {i < steps.length - 1 && (
                        <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-linear-to-r from-zinc-300 dark:from-zinc-700 to-transparent" />
                      )}

                      <div className="relative p-8 md:p-10">
                        <div className="text-7xl font-serif text-zinc-100 dark:text-zinc-800/70 mb-6 group-hover:text-indigo-100 dark:group-hover:text-indigo-900/30 transition-colors duration-700 leading-none">
                          {step.number}
                        </div>
                        <h3 className="text-xl font-serif text-zinc-900 dark:text-zinc-100 mb-3">
                          {step.title}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════
              FEATURES — Bento grid
          ═══════════════════════════════════════════════ */}
          <section id="features" className="relative py-32 sm:py-40 px-6 sm:px-12 lg:px-24 bg-zinc-50/50 dark:bg-zinc-950/50 border-y border-zinc-100 dark:border-white/5">
            <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-indigo-500/3 dark:bg-indigo-500/5 blur-[150px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
              <ScrollReveal>
                <div className="text-center mb-20">
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 mb-5 block">Capabilities</span>
                  <h2 className="text-4xl sm:text-6xl font-serif leading-[1.1] mb-6 text-zinc-900 dark:text-white">
                    Everything you need to{" "}
                    <br className="hidden sm:block" />
                    <span className="text-zinc-400 dark:text-zinc-500 italic font-sans font-light">understand your customers.</span>
                  </h2>
                  <div className="w-12 h-px bg-zinc-300 dark:bg-zinc-700 mx-auto" />
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {features.map((feature, idx) => (
                  <ScrollReveal key={idx} delay={idx * 100} direction="up" distance={40}>
                    <div
                      className={`group relative p-8 sm:p-10 rounded-2xl bg-white/80 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200/70 dark:border-white/5 overflow-hidden hover:border-zinc-300 dark:hover:border-white/10 transition-all duration-500 h-full ${feature.span}`}
                    >
                      {/* Hover gradient */}
                      <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 dark:from-indigo-500/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200/80 dark:border-white/8 flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-8 group-hover:scale-110 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/20 transition-all duration-500 shadow-sm">
                          {feature.icon}
                        </div>

                        <h3 className="text-xl font-serif mb-3 text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════
              TESTIMONIALS — Featured + grid
          ═══════════════════════════════════════════════ */}
          <section className="relative py-32 sm:py-40 px-6 sm:px-12 lg:px-24">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/3 dark:bg-purple-400/5 blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
              <ScrollReveal>
                <div className="text-center mb-20">
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 mb-5 block">Testimonials</span>
                  <h2 className="text-4xl sm:text-5xl font-serif text-zinc-900 dark:text-zinc-100 leading-[1.1]">
                    Trusted by the best{" "}
                    <br className="hidden sm:block" />
                    <span className="text-zinc-400 dark:text-zinc-500 italic font-sans font-light">product teams.</span>
                  </h2>
                </div>
              </ScrollReveal>

              {/* Featured testimonial */}
              <ScrollReveal direction="up" distance={50}>
                <div className="mb-8 p-10 sm:p-14 rounded-3xl bg-zinc-50/80 dark:bg-zinc-900/30 border border-zinc-200/70 dark:border-white/5 relative overflow-hidden">
                  <div className="absolute top-6 right-8 text-zinc-200/80 dark:text-zinc-800/50">
                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-2xl sm:text-3xl font-serif text-zinc-800 dark:text-zinc-200 leading-relaxed mb-10 max-w-3xl relative z-10">
                    &ldquo;{testimonials[0].quote}&rdquo;
                  </p>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                      {testimonials[0].author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{testimonials[0].author}</div>
                      <div className="text-sm text-zinc-500 font-light">{testimonials[0].role}</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Smaller testimonials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.slice(1).map((testimonial, idx) => (
                  <ScrollReveal key={idx} delay={idx * 150} direction={idx === 0 ? "left" : "right"} distance={40}>
                    <div className="p-8 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-100 dark:border-white/5 relative group hover:border-zinc-300 dark:hover:border-white/10 transition-colors duration-500 h-full">
                      <p className="text-lg font-serif text-zinc-700 dark:text-zinc-300 leading-relaxed mb-8">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-3 pt-6 border-t border-zinc-200/70 dark:border-white/5">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-zinc-300 to-zinc-400 dark:from-zinc-600 dark:to-zinc-700 flex items-center justify-center text-white dark:text-zinc-300 text-xs font-medium">
                          {testimonial.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{testimonial.author}</div>
                          <div className="text-xs text-zinc-500 font-light">{testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════
              PRICING SECTION
          ═══════════════════════════════════════════════ */}
          <section id="pricing" className="relative py-32 sm:py-40 px-6 sm:px-12 lg:px-24 bg-zinc-50/50 dark:bg-zinc-950/50 border-y border-zinc-100 dark:border-white/5">
            <div className="absolute top-[10%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-indigo-500/4 dark:bg-indigo-400/6 blur-[120px] pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
              <ScrollReveal>
                <div className="text-center mb-20">
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 mb-5 block">Pricing</span>
                  <h2 className="text-4xl sm:text-6xl font-serif leading-[1.1] mb-6 text-zinc-900 dark:text-white">
                    Simple, transparent{" "}
                    <br className="hidden sm:block" />
                    <span className="text-zinc-400 dark:text-zinc-500 italic font-sans font-light">pricing.</span>
                  </h2>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free */}
                <ScrollReveal delay={0} direction="up" distance={50}>
                  <div className="p-8 rounded-2xl bg-white/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-white/5 flex flex-col h-full">
                    <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-2">Starter</div>
                    <div className="text-4xl font-serif text-zinc-900 dark:text-white mb-1">Free</div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light mb-8">Perfect for trying things out</p>
                    <ul className="space-y-3 mb-10 flex-1">
                      {["100 feedbacks/month", "Basic categorization", "CSV upload", "Email support"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400 font-light">
                          <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link href={session ? "/dashboard" : "/signup"}>
                      <button className="w-full py-3.5 rounded-xl border border-zinc-200 dark:border-white/10 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white transition-all duration-300">
                        Get Started
                      </button>
                    </Link>
                  </div>
                </ScrollReveal>

                {/* Pro — highlighted */}
                <ScrollReveal delay={150} direction="up" distance={50}>
                  <div className="relative p-8 rounded-2xl bg-white/80 dark:bg-white/5 border border-zinc-800 dark:border-white/10 flex flex-col overflow-hidden h-full">
                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/60 to-transparent" />
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full" />

                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400">Pro</div>
                        <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">Popular</span>
                      </div>
                      <div className="text-4xl font-serif text-white mb-1">$29<span className="text-lg text-zinc-500 font-sans">/mo</span></div>
                      <p className="text-sm text-zinc-400 font-light mb-8">For growing teams</p>
                      <ul className="space-y-3 mb-10 flex-1">
                        {["5,000 feedbacks/month", "Advanced AI categorization", "Sentiment analysis", "AI summaries", "Priority support"].map((item, i) => (
                          <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-300 font-light">
                            <svg className="w-4 h-4 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link href={session ? "/dashboard" : "/signup"}>
                        <button className="w-full py-3.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-sm font-medium text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25">
                          Start Free Trial
                        </button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Enterprise */}
                <ScrollReveal delay={300} direction="up" distance={50}>
                  <div className="p-8 rounded-2xl bg-white/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-white/5 flex flex-col h-full">
                    <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 mb-2">Enterprise</div>
                    <div className="text-4xl font-serif text-zinc-900 dark:text-white mb-1">Custom</div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light mb-8">For large organizations</p>
                    <ul className="space-y-3 mb-10 flex-1">
                      {["Unlimited feedbacks", "Custom AI models", "API access", "SSO & SAML", "Dedicated support"].map((item, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400 font-light">
                          <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link href={session ? "/dashboard" : "/signup"}>
                      <button className="w-full py-3.5 rounded-xl border border-zinc-200 dark:border-white/10 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-white/20 hover:text-zinc-900 dark:hover:text-white transition-all duration-300">
                        Contact Sales
                      </button>
                    </Link>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════
              CTA — Final call to action
          ═══════════════════════════════════════════════ */}
          <section id="CTA" className="relative py-32 sm:py-40 px-6">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full bg-linear-to-br from-indigo-500/5 dark:from-indigo-500/10 to-purple-500/5 dark:to-purple-500/10 blur-[120px]" />
            </div>

            <ScrollReveal direction="up" distance={60}>
              <div className="relative z-10 max-w-4xl mx-auto">
                <div className="rounded-3xl border border-zinc-200/70 dark:border-white/5 bg-white/60 dark:bg-zinc-900/30 backdrop-blur-2xl p-12 sm:p-20 text-center overflow-hidden relative">
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent" />
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-indigo-500/8 dark:bg-indigo-500/12 blur-[80px] rounded-full pointer-events-none" />

                  <div className="relative z-10">
                    <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500 mb-8 block">Get Started</span>
                    <h2 className="text-4xl sm:text-6xl font-serif mb-8 leading-[1.1] text-zinc-900 dark:text-white">
                      Ready to transform <br className="hidden sm:block" />your feedback?
                    </h2>
                    <p className="text-lg text-zinc-500 dark:text-zinc-400 font-light mb-12 max-w-lg mx-auto leading-relaxed">
                      Start categorizing your customer feedback today. No credit card required.
                    </p>
                    <Link href={session ? "/dashboard" : "/signup"}>
                      <button className="group relative px-12 py-5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full font-medium tracking-wide overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 shadow-2xl shadow-zinc-900/15 dark:shadow-zinc-300/10 hero-cta-glow">
                        <span className="relative z-10 flex items-center gap-2.5">
                          {session ? "Go to Dashboard" : "Start Free Trial"}
                          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                        <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-200 dark:to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* ═══════════════════════════════════════════════
              FOOTER
          ═══════════════════════════════════════════════ */}
          <footer className="py-20 px-6 sm:px-12 lg:px-24 bg-white dark:bg-[#030303] border-t border-zinc-200/70 dark:border-white/5">
            <div className="max-w-6xl mx-auto">
              <ScrollReveal direction="up" distance={30}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
                  <div className="col-span-1 md:col-span-2 flex flex-col items-start">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-2xl font-serif italic text-zinc-900 dark:text-zinc-200">Insight-Out</span>
                    </div>
                    <p className="text-sm text-zinc-500 font-light max-w-xs leading-relaxed">
                      Transforming unstructured customer feedback into actionable product decisions through artificial intelligence.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-mono tracking-widest text-zinc-900 dark:text-zinc-100 uppercase mb-6">Platform</h4>
                    <ul className="space-y-4 text-sm text-zinc-500 font-light">
                      <li><Link href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Features</Link></li>
                      <li><Link href="#pricing" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Pricing</Link></li>
                      <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Changelog</Link></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-mono tracking-widest text-zinc-900 dark:text-zinc-100 uppercase mb-6">Legal</h4>
                    <ul className="space-y-4 text-sm text-zinc-500 font-light">
                      <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Privacy Policy</Link></li>
                      <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Terms of Service</Link></li>
                      <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Contact</Link></li>
                    </ul>
                  </div>
                </div>
              </ScrollReveal>

              <div className="pt-8 border-t border-zinc-200/70 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono tracking-widest uppercase">
                  © 2026 Insight-Out. All rights reserved.
                </div>
                <div className="flex gap-5">
                  <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                  </a>
                  <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    <span className="sr-only">GitHub</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </AuthProvider>
  );
}