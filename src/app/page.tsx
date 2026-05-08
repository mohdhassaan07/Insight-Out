import Link from "next/link";
import { getServerSession } from "next-auth";
import Navbar from "@/src/components/layout/Navbar";
import AuthProvider from "@/src/components/providers/AuthProvider";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "AI-Powered Categorization",
    description: "Our advanced AI automatically categorizes feedback into meaningful categories like bugs, feature requests, UX issues, and more.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Sentiment Analysis",
    description: "Understand how your customers feel with automatic sentiment detection - positive, neutral, or negative.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
    title: "Bulk CSV Upload",
    description: "Upload thousands of feedback entries at once with our CSV import feature. Process feedback in bulk effortlessly.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Powerful Analytics",
    description: "Visualize feedback trends, category distributions, and sentiment patterns with beautiful interactive charts.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "AI Generated Summaries",
    description: "Automatically generate concise summaries from thousands of feedbacks to quickly grasp the big picture.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: "CSV Export",
    description: "Export your categorized and analyzed data to CSV format for external reporting or deeper integrations.",
  },
];

const stats = [
  { value: "10K+", label: "Feedbacks Processed" },
  { value: "99%", label: "Accuracy Rate" },
  { value: "50+", label: "Companies Trust Us" },
  { value: "24/7", label: "Support Available" },
];

const testimonials = [
  {
    quote: "This tool completely transformed how we handle customer requests. The AI categorization is scarily accurate and saves us countless hours.",
    author: "Elena Rodriguez",
    role: "Head of Product, TechFlow",
  },
  {
    quote: "We used to spend hours manually tagging feedback. Now, it takes seconds. It’s an indispensable part of our daily workflow.",
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
      <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 selection:bg-indigo-500/30 overflow-hidden font-sans transition-colors duration-500">
        {/* Navbar Wrapper */}
        <div className="absolute top-0 w-full z-50">
          <Navbar />
        </div>

        <main className="relative">
          {/* HERO SECTION */}
          <section className="relative min-h-[95vh] flex items-center pt-32 pb-20 px-6 sm:px-12 lg:px-24">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-[30%] -right-[10%] w-[80vw] h-[80vw] rounded-full bg-linear-to-b from-indigo-500/5 dark:from-indigo-500/10 to-purple-500/5 blur-[120px] mix-blend-screen" />
              <div className="absolute bottom-[0%] -left-[20%] w-[60vw] h-[60vw] rounded-full bg-linear-to-tr from-zinc-200/50 dark:from-zinc-800/20 to-indigo-500/5 dark:to-indigo-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-black/2:dark:from-white/3transparent to-transparent" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              {/* Text Side */}
              <div className="col-span-1 lg:col-span-7 flex flex-col items-start text-left xl:pr-12">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-black/5 dark:border-white/5 bg-black/2 dark:bg-white/2 backdrop-blur-md mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                  <span className="text-xs font-medium tracking-[0.2em] uppercase text-zinc-600 dark:text-zinc-400">Powered by AI</span>
                </div>
                
                <h1 className="text-5xl sm:text-7xl xl:text-[5.5rem] font-serif tracking-tight leading-[1.05] mb-8">
                  Your Feedbacks, <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-zinc-900 via-indigo-600 to-zinc-500 dark:from-zinc-100 dark:via-indigo-200 dark:to-zinc-500 font-sans font-light italic pr-4">
                    Clearly Categorized
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 font-light max-w-xl leading-relaxed mb-12">
                  Transform unstructured customer feedback into actionable insights. 
                  Let AI automatically categorize, analyze sentiment, and help you understand what your customers really want.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Link href={session ? '/dashboard' : '/signup'}>
                    <button className="group relative px-8 py-4 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-full font-medium tracking-wide overflow-hidden transition-all hover:scale-[1.02] duration-300">
                      <span className="relative z-10 flex items-center gap-2">
                        {session ? 'Go to Dashboard' : 'Get Started Free'}
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-100 dark:to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </Link>
                  <Link href="#features">
                    <button className="text-sm tracking-widest uppercase font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors duration-300 px-8 py-4">
                      Learn More
                    </button>
                  </Link>
                </div>

                {/* Stats Integrated into Hero */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-8 mt-20 max-w-2xl opacity-70 border-t border-black/5 dark:border-white/5 pt-12">
                  {stats.map((stat, i) => (
                    <div key={i} className="flex flex-col items-start group cursor-default">
                        <div className="text-3xl font-serif mb-2 bg-linear-to-r from-indigo-600 to-zinc-900 dark:from-indigo-200 dark:to-zinc-100 bg-clip-text text-transparent transform group-hover:scale-110 transition-transform origin-left">{stat.value}</div>
                        <div className="text-xs tracking-widestuppercase text-zinc-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abstract Visual Presentation side */}
              <div className="col-span-1 lg:col-span-5 relative h-full min-h-125den lg:block">
                <div className="absolute inset-0 transition-transform duration-1000 group">
                  <div className="absolute top-[10%] right-[10%] w-[90%] h-[80%] rounded-3xl bg-linear-to-br from-indigo-500/5 dark:from-indigo-500/10 to-transparent border border-black/10 dark:border-white/5 backdrop-blur-3xl p-6 transform rotate-3 shadow-2xl">
                    <div className="w-full h-full rounded-2xl bg-white/80 dark:bg-zinc-950/80 border border-black/5 dark:border-white/5 p-6 flex flex-col gap-6 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[50px] mix-blend-multiply dark:mix-blend-screen" />
                       
                       {/* Mockup elements */}
                       <div className="flex justify-between items-center mb-4 border-b border-black/5 dark:border-white/5 pb-4">
                         <div className="flex gap-2">
                           <div className="w-2.5 h-2.5 rounded-full bg-black/20 dark:bg-white/20" />
                           <div className="w-2.5 h-2.5 rounded-full bg-black/10 dark:bg-white/10" />
                         </div>
                         <div className="text-[10px] font-mono tracking-widest text-zinc-400 dark:text-zinc-500">SYSTEM.LOG</div>
                       </div>
                       
                       <div className="space-y-4">
                         <div className="w-3/4 h-2 bg-black/10 dark:bg-white/10 rounded-full" />
                         <div className="w-1/2 h-2 bg-black/5 dark:bg-white/5 rounded-full" />
                         <div className="w-5/6 h-2 bg-black/5 dark:bg-white/5 rounded-full" />
                       </div>

                       <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5">
                         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                           SENTIMENT: POSITIVE (+92%)
                         </div>
                       </div>
                    </div>
                  </div>
                  
                  {/* Floating Glass Element */}
                  <div className="absolute top-1/2 left-0 w-48 p-4 rounded-2xl bg-white/70 dark:bg-white/3 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl transform -translate-y-1/2 -rotate-6">
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Insight Detected</div>
                    <div className="text-sm font-serif italic text-zinc-800 dark:text-zinc-200">"The new categorization is exceptionally smooth."</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ASYMMETRICAL FEATURES */}
          <section id="features" className="py-40 px-6 sm:px-12 lg:px-24 relative">
             <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-purple-500/5 blur-[150px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
             
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="mb-32 max-w-3xl">
                <h2 className="text-4xl sm:text-6xl font-serif leading-[1.1] mb-8 text-zinc-900 dark:text-white">
                  Everything you need to <br />
                  <span className="text-zinc-500 italic font-sans font-light">understand your customers.</span>
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 font-light">
                  Powerful features designed to help you collect, categorize, and act on customer feedback effectively.
                </p>
                <div className="w-12 h-px bg-zinc-300 dark:bg-zinc-700 mt-12" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, idx) => (
                  <div 
                    key={idx} 
                    className="group relative p-10 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-white/5 overflow-hidden hover:border-zinc-300 dark:hover:border-white/10 transition-all duration-500"
                  >
                    {/* Background noise and hover gradient */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] dark:opacity-[0.15] mix-blend-overlay pointer-events-none" />
                    <div className="absolute inset-0 bg-linear-to-brrom-indigo-500/5 dark:from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="w-14 h-14 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-700 dark:text-zinc-300 mb-10 group-hover:scale-110 transition-transform duration-700 shadow-xl shadow-zinc-200/50 dark:shadow-black/50">
                        {feature.icon}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mb-3 tracking-[0.2em] uppercase">
                         Capability 0{idx + 1}
                      </div>
                      
                      <h3 className="text-2xl font-serif mb-4 text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="py-32 px-6 sm:px-12 lg:px-24 relative border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#050505]">
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-zinc-50/50 dark:via-zinc-900/10 to-transparent pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-2xl">
                  <span className="text-xs font-mono tracking-[0.2em] text-zinc-500 uppercase mb-6 block">Testimonials</span>
                  <h2 className="text-4xl sm:text-5xl font-serif text-zinc-900 dark:text-zinc-100 leading-[1.1]">
                    Trusted by the best <br />
                    <span className="text-zinc-500 italic font-sans font-light">product teams.</span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, idx) => (
                  <div key={idx} className="flex flex-col p-8 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-white/5 backdrop-blur-sm relative group overflow-hidden hover:border-zinc-300 dark:hover:border-white/10 transition-colors duration-500">
                    <div className="absolute top-0 right-0 p-8 text-black/5 dark:text-white/5 group-hover:text-black/10 dark:group-hover:text-white/10 transition-colors duration-500">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-lg text-zinc-700 dark:text-zinc-300 font-serif leading-relaxed mb-8 relative z-10">
                        "{testimonial.quote}"
                      </p>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-white/10 relative z-10">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{testimonial.author}</div>
                      <div className="text-sm text-zinc-500 dark:text-zinc-500 font-light mt-1">{testimonial.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* EDITORIAL CTA */}
          <section id="CTA" className="py-40 px-6 relative border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
             <div className="absolute top-0 right-1/4 w-[30vw] h-[30vw] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />
             
             <div className="relative z-10 max-w-3xl mx-auto text-center">
               <span className="text-xs font-mono tracking-[0.2em] text-zinc-500 uppercase mb-8 block">Experience</span>
               <h2 className="text-5xl sm:text-7xl font-serif mb-10 leading-[1.1] text-zinc-900 dark:text-white">
                 Ready to transform your feedback?
               </h2>
               <p className="text-xl text-zinc-600 dark:text-zinc-400 font-light mb-14 leading-relaxed max-w-xl mx-auto">
                 Start categorizing your customer feedback today. No credit card required.
               </p>
               <Link href={session ? '/dashboard' : '/signup'}>
                  <button className="px-12 py-5 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white rounded-full font-medium tracking-wide transition-all duration-300 hover:scale-[1.03] shadow-xl shadow-zinc-900/10 dark:shadow-zinc-500/10 flex items-center gap-2 mx-auto">
                    {session ? 'Go to Dashboard' : 'Start Free Trial'}
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
               </Link>
             </div>
          </section>

          {/* MINIMAL PREMIUM FOOTER */}
          <footer className="py-20 px-6 sm:px-12 lg:px-24 bg-white dark:bg-[#030303] border-t border-zinc-200 dark:border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
                <div className="col-span-1 md:col-span-2 flex flex-col items-start">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-zinc-700 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-2xl font-serif italic text-zinc-900 dark:text-zinc-200">Insights</span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-500 font-light max-w-xs leading-relaxed">
                    Transforming unstructured customer feedback into actionable product decisions through artificial intelligence.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-mono tracking-widest text-zinc-900 dark:text-zinc-100 uppercase mb-6">Platform</h4>
                  <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-500 font-light">
                    <li><Link href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Features</Link></li>
                    <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Pricing</Link></li>
                    <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Changelog</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-[10px] font-mono tracking-widest text-zinc-900 dark:text-zinc-100 uppercase mb-6">Legal</h4>
                  <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-500 font-light">
                    <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Terms of Service</Link></li>
                    <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">Contact</Link></li>
                  </ul>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono tracking-widest uppercase">
                  © 2026 Insights. All rights reserved.
                </div>
                <div className="flex gap-5">
                  <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </a>
                  <a href="#" className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    <span className="sr-only">GitHub</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
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