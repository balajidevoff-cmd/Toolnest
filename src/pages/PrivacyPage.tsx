import React from 'react';
import { ShieldCheck, HardDrive, Lock, AlertTriangle, EyeOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16 animate-in fade-in duration-200">
      <div className="space-y-3 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Privacy & Security Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-light-text dark:text-dark-text">
          Privacy Policy & Local Processing Guarantee
        </h1>
        <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">
          At TOVIX, we believe standard utilities should not compromise your privacy or harvest your documents. Here is a clear, transparent explanation of how our platform handles your data.
        </p>
      </div>

      {/* Grid of privacy tenets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-light-text dark:text-dark-text">
            1. Zero Cloud Uploads for Local Utilities
          </h3>
          <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">
            When you merge PDFs, split documents, crop photos, compress images, generate hashes, or calculate checksums, the entire operation executes locally inside your browser using client-side JavaScript, Web Workers, HTML5 Canvas, and WebAssembly. Even with large files up to 1024 MB (1 GB), your files are processed completely free in local device RAM and are never uploaded to our servers.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-light-text dark:text-dark-text">
            2. Minimal, Transparent LocalStorage
          </h3>
          <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">
            We store only non-sensitive configuration values on your device via browser LocalStorage:
          </p>
          <ul className="text-xs text-light-muted dark:text-dark-muted list-disc list-inside space-y-1">
            <li>Your theme preference (<code className="text-brand-purple">dark</code> or <code className="text-brand-purple">light</code>).</li>
            <li>Your bookmarked tool identifiers (e.g. <code className="text-brand-purple">pdf-merger</code>).</li>
            <li>The IDs of your last 20 opened utilities for fast access.</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-light-text dark:text-dark-text">
            3. Sensitive Text & Passwords Never Saved
          </h3>
          <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">
            TOVIX never saves passwords, passphrases, JSON documents, or financial calculations into LocalStorage, server logs, or telemetry. Once you close or reload the browser tab, in-memory states are discarded.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-brand-purple dark:text-brand-accentLight flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-light-text dark:text-dark-text">
            4. Realistic Boundaries & Limitations
          </h3>
          <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">
            We do not make misleading claims such as &quot;100% unbreakable security&quot;. Your security also depends on your local device environment, malicious browser extensions, screen recorders, and physical access.
          </p>
        </div>
      </div>

      {/* External Links Disclaimer */}
      <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border space-y-3 text-xs text-light-muted dark:text-dark-muted leading-relaxed">
        <h4 className="font-semibold text-sm text-light-text dark:text-dark-text">
          External Services & Independent Platform Notice
        </h4>
        <p>
          TOVIX is an independent utility suite. Any external trademarks or names referenced belong to their respective copyright holders. If you choose to follow an external link (such as navigating to a URL decoded from a QR code), you will be subject to that third-party website&apos;s terms and privacy policies.
        </p>
        <p>
          If you have questions or recommendations for improving client-side privacy, we encourage open discussion and transparent audits.
        </p>
      </div>
    </div>
  );
};
