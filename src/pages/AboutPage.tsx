import React from 'react';
import { Layers, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="text-center space-y-4 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-editorial-yellow" />
          <span>Our Vision & Philosophy</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-light-text dark:text-white leading-[1.25] sm:leading-[1.18]">
          Crafted for{' '}
          <span className="editorial-pill align-middle mx-1 py-1 px-4 text-xl sm:text-3xl md:text-4xl font-medium tracking-tight">
            digital efficiency
          </span>{' '}
          — built to respect your privacy{' '}
          <span className="text-editorial-yellow font-black">...</span>
        </h1>

        <p className="text-sm sm:text-base text-light-muted dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Every tool you need. One nest. 40 free, client-side utilities engineered for students, developers, designers, and creators worldwide.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="p-8 rounded-3xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
          <span>The Problem We Solved</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-white">
          Why did we build TOVIX?
        </h2>
        <p className="text-sm text-light-muted dark:text-neutral-300 leading-relaxed">
          Every day, millions of people jump between cluttered websites just to compress a single PDF, format JSON, resize a screenshot, calculate semester CGPA, or generate a safe password. Many of these websites are packed with intrusive ads, force signups, or secretly upload private files to remote cloud servers.
        </p>
        <p className="text-sm text-light-muted dark:text-neutral-300 leading-relaxed">
          <strong className="text-light-text dark:text-white">TOVIX</strong> was created to solve this once and for all. We bring together essential everyday utilities into one elegant, fast, and privacy-conscious web suite where your data stays on your machine.
        </p>
      </div>

      {/* Target Audiences */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-light-text dark:text-white">
          Engineered for Everyday Creators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/[0.08] hover:border-purple-500/30 transition-all">
            <h3 className="font-bold text-sm text-light-text dark:text-white mb-2">
              🎓 College Students
            </h3>
            <p className="text-xs text-light-muted dark:text-neutral-400 leading-relaxed">
              Calculate semester SGPA and cumulative CGPA, merge presentation PDFs, extract page excerpts, and convert images into assignment PDFs in seconds.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/[0.08] hover:border-teal-500/30 transition-all">
            <h3 className="font-bold text-sm text-light-text dark:text-white mb-2">
              💻 Software Engineers
            </h3>
            <p className="text-xs text-light-muted dark:text-neutral-400 leading-relaxed">
              Format and minify JSON, test regular expressions, generate UUID v4s, compute SHA-256 hashes, diff code snippets, and encode URLs securely.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/[0.08] hover:border-pink-500/30 transition-all">
            <h3 className="font-bold text-sm text-light-text dark:text-white mb-2">
              🎨 Designers & Marketers
            </h3>
            <p className="text-xs text-light-muted dark:text-neutral-400 leading-relaxed">
              Resize photos, optimize PNG/JPEG/WebP images, pick palette colors, inspect image dimensions, and generate custom QR codes.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/[0.08] hover:border-amber-500/30 transition-all">
            <h3 className="font-bold text-sm text-light-text dark:text-white mb-2">
              ✍️ Writers & Freelancers
            </h3>
            <p className="text-xs text-light-muted dark:text-neutral-400 leading-relaxed">
              Count words and characters, preview formatted Markdown, convert casing conventions, generate clean URL slugs, and estimate invoice GST.
            </p>
          </div>
        </div>
      </div>

      {/* Our Commitments */}
      <div className="p-8 rounded-3xl bg-purple-100/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-editorial-yellow" />
          The TOVIX Standards
        </h2>
        <ul className="space-y-3 text-sm text-slate-700 dark:text-neutral-300">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-900 dark:text-white">Zero Account Requirements:</strong> Jump in and get your work done immediately without creating an account or logging in.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-900 dark:text-white">Local Execution:</strong> We prioritize browser-native APIs (Web Crypto, HTML5 Canvas, PDF-lib) so your documents don&apos;t get transmitted across third-party networks.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-900 dark:text-white">Real Computation:</strong> No dummy buttons, fake progress bars, or placeholder mockups. Every tool performs real computation.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-900 dark:text-white">Generous 1024 MB (1 GB) Free Limit:</strong> Unlike conventional online converters that restrict free users to 10 MB or 25 MB to force paid subscriptions, TOVIX provides free client-side processing for files up to 1024 MB without paywalls.</span>
          </li>
        </ul>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#fde047] hover:bg-[#facc15] text-[#121214] font-bold text-sm shadow-xl transition-all"
        >
          <span>Explore All 40 Utilities</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
