import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, FileText, Image, QrCode, Calculator, Type, Shield } from 'lucide-react';
import { CATEGORIES } from '../../data/tools';

interface ShowcaseCard {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string;
  tag: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  tagClass: string;
  accentClass: string;
  icon: React.ReactNode;
}

const SHOWCASE_CARDS: ShowcaseCard[] = [
  {
    id: 'pdf-suite',
    categoryId: 'pdf-documents',
    title: 'PDF & Document\nStudio',
    subtitle: 'Merge, split, compress, and inspect files locally with zero cloud upload.',
    tag: 'Client-Side Engine',
    bgClass: 'bg-[#18363c]',
    borderClass: 'border-[#26555f]',
    textClass: 'text-[#a5f3fc]',
    tagClass: 'bg-[#0f2529] text-[#5eead4] border-[#1d454d]',
    accentClass: 'hover:border-[#5eead4]/60',
    icon: <FileText className="w-5 h-5 text-[#5eead4]" />,
  },
  {
    id: 'image-studio',
    categoryId: 'image-studio',
    title: 'Image & Media\nProcessing',
    subtitle: 'Resize, compress, convert WebP/PNG, crop, and inspect EXIF metadata.',
    tag: 'HTML5 Canvas',
    bgClass: 'bg-[#3b1f33]',
    borderClass: 'border-[#5e3252]',
    textClass: 'text-[#fbcfe8]',
    tagClass: 'bg-[#261421] text-[#f472b6] border-[#47263e]',
    accentClass: 'hover:border-[#f472b6]/60',
    icon: <Image className="w-5 h-5 text-[#f472b6]" />,
  },
  {
    id: 'dev-code',
    categoryId: 'qr-code',
    title: 'Developer &\nCode Utilities',
    subtitle: 'Generate QR codes, format JSON, test regex, SHA-256, UUIDs, & Base64.',
    tag: 'Web Crypto & APIs',
    bgClass: 'bg-[#29173a]',
    borderClass: 'border-[#472765]',
    textClass: 'text-[#edd5ff]',
    tagClass: 'bg-[#1a0e26] text-[#c084fc] border-[#381f4f]',
    accentClass: 'hover:border-[#c084fc]/60',
    icon: <QrCode className="w-5 h-5 text-[#c084fc]" />,
  },
  {
    id: 'calculators',
    categoryId: 'calculators',
    title: 'Calculators &\nMath Engine',
    subtitle: 'Scientific calculations, college CGPA, GST rates, age, & unit conversion.',
    tag: 'Instant Precision',
    bgClass: 'bg-[#382b12]',
    borderClass: 'border-[#59441c]',
    textClass: 'text-[#fef08a]',
    tagClass: 'bg-[#241b0b] text-[#facc15] border-[#443415]',
    accentClass: 'hover:border-[#facc15]/60',
    icon: <Calculator className="w-5 h-5 text-[#facc15]" />,
  },
  {
    id: 'text-writing',
    categoryId: 'text-writing',
    title: 'Text & Writing\nWorkflows',
    subtitle: 'Live word & char counters, case formatting, slugifier, and markdown preview.',
    tag: 'Clean Typography',
    bgClass: 'bg-[#1b3323]',
    borderClass: 'border-[#2d543a]',
    textClass: 'text-[#bbf7d0]',
    tagClass: 'bg-[#112117] text-[#86efac] border-[#223f2c]',
    accentClass: 'hover:border-[#86efac]/60',
    icon: <Type className="w-5 h-5 text-[#86efac]" />,
  },
  {
    id: 'privacy-sec',
    categoryId: 'privacy-security',
    title: 'Privacy &\nSecurity Guard',
    subtitle: 'High-entropy password & passphrase generators, strength meter, & checksums.',
    tag: 'Zero-Knowledge',
    bgClass: 'bg-[#18233d]',
    borderClass: 'border-[#273a64]',
    textClass: 'text-[#c7d2fe]',
    tagClass: 'bg-[#101729] text-[#93c5fd] border-[#1e2c4d]',
    accentClass: 'hover:border-[#93c5fd]/60',
    icon: <Shield className="w-5 h-5 text-[#93c5fd]" />,
  },
];

export const ShowcaseCardRow: React.FC = () => {
  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-editorial-yellow animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
            Featured Tool Suites
          </span>
        </div>
        <Link
          to="/tools"
          className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1 group"
        >
          View all 40 utilities
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Horizontal Scrollable Row / Grid matching user screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar">
        {SHOWCASE_CARDS.map((card) => (
          <Link
            key={card.id}
            to={`/categories/${card.categoryId}`}
            className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl ${card.bgClass} border ${card.borderClass} ${card.accentClass} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden min-h-[220px] select-none`}
          >
            {/* Subtle ornamental mandala / topographic line watermark in bottom right */}
            <div className="absolute right-[-20px] bottom-[-20px] w-36 h-36 opacity-15 pointer-events-none group-hover:opacity-25 transition-opacity duration-300">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" className={card.textClass}>
                <circle cx="50" cy="50" r="45" strokeWidth="0.8" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="35" strokeWidth="0.8" />
                <circle cx="50" cy="50" r="25" strokeWidth="0.8" strokeDasharray="2 2" />
                <path d="M50 5 Q75 50 50 95 Q25 50 50 5" strokeWidth="0.8" />
                <path d="M5 50 Q50 75 95 50 Q50 25 5 50" strokeWidth="0.8" />
                <circle cx="50" cy="50" r="12" strokeWidth="1" />
              </svg>
            </div>

            {/* Top row: Pill badge & icon */}
            <div className="relative z-10 flex items-start justify-between gap-2">
              <span className={`inline-block text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border ${card.tagClass}`}>
                {card.tag}
              </span>
              <div className="p-1.5 rounded-lg bg-black/20 backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
                {card.icon}
              </div>
            </div>

            {/* Main Title (2 lines bold, exactly like screenshot) */}
            <div className="relative z-10 my-4">
              <h3 className={`text-lg sm:text-xl font-bold tracking-tight whitespace-pre-line leading-snug ${card.textClass}`}>
                {card.title}
              </h3>
              <p className="text-xs text-white/70 line-clamp-2 mt-2 leading-relaxed font-normal">
                {card.subtitle}
              </p>
            </div>

            {/* Bottom action link */}
            <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-white/90 group-hover:text-white">
              <span>Explore Suite</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
