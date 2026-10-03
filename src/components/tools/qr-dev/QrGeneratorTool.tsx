import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode, Wifi, Link as LinkIcon, Mail, Phone, Type } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

type QrType = 'url' | 'text' | 'wifi' | 'email' | 'phone';

export const QrGeneratorTool: React.FC = () => {
  const { addToast } = useApp();
  const [qrType, setQrType] = useState<QrType>('url');

  // Input fields
  const [urlInput, setUrlInput] = useState('https://tovix.dev');
  const [textInput, setTextInput] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Styling options
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Compute final string to encode
  const getQrContent = (): string => {
    switch (qrType) {
      case 'url':
        return urlInput.trim();
      case 'text':
        return textInput.trim();
      case 'wifi':
        return `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPass};;`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}`;
      case 'phone':
        return `tel:${phoneNumber.trim()}`;
      default:
        return '';
    }
  };

  useEffect(() => {
    const content = getQrContent();
    if (!content) {
      setQrDataUrl('');
      return;
    }

    QRCode.toDataURL(content, {
      width: 512,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [qrType, urlInput, textInput, wifiSsid, wifiPass, wifiEncryption, emailTo, emailSubject, phoneNumber, fgColor, bgColor]);

  const copyToClipboard = () => {
    if (!qrDataUrl) return;
    navigator.clipboard.writeText(getQrContent());
    setCopied(true);
    addToast({
      type: 'success',
      message: 'QR content copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Type selection pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'url', label: 'Website URL', icon: LinkIcon },
          { id: 'text', label: 'Plain Text', icon: Type },
          { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
          { id: 'email', label: 'Email Address', icon: Mail },
          { id: 'phone', label: 'Phone Number', icon: Phone },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setQrType(tab.id as QrType)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                qrType === tab.id
                  ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                  : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-4">
          {qrType === 'url' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1.5">
                Target Website URL
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none"
              />
            </div>
          )}

          {qrType === 'text' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1.5">
                Text or Notes
              </label>
              <textarea
                rows={4}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text to encode into the QR code..."
                className="w-full px-4 py-2.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none"
              />
            </div>
          )}

          {qrType === 'wifi' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
                  Network SSID (Name)
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="My Home Wi-Fi"
                  className="w-full px-4 py-2.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
                  Wi-Fi Password
                </label>
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-2.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
                  Security Type
                </label>
                <select
                  value={wifiEncryption}
                  onChange={(e) => setWifiEncryption(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                  className="w-full px-3 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-xs text-light-text dark:text-dark-text focus:outline-none"
                >
                  <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (Open Network)</option>
                </select>
              </div>
            </div>
          )}

          {qrType === 'email' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
                  Default Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Meeting Request"
                  className="w-full px-4 py-2.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:outline-none"
                />
              </div>
            </div>
          )}

          {qrType === 'phone' && (
            <div>
              <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1.5">
                Telephone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full px-4 py-2.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:outline-none"
              />
            </div>
          )}

          {/* Color Customization */}
          <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-black/[0.01] dark:bg-white/[0.01] flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-light-muted">QR Color:</label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-light-border dark:border-dark-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-light-muted">Background:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-light-border dark:border-dark-border"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Preview & Actions */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm">
          {qrDataUrl ? (
            <div className="space-y-4 text-center">
              <div className="p-3 rounded-2xl bg-white shadow-md inline-block">
                <img src={qrDataUrl} alt="Generated QR code" className="w-48 h-48 rounded" />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <a
                  href={qrDataUrl}
                  download="tovix-qrcode.png"
                  className="px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG Image</span>
                </a>

                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 rounded-xl border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-light-text dark:text-dark-text flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Content Text'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-light-muted dark:text-dark-muted py-8">
              <QrCode className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Fill in inputs to generate code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
