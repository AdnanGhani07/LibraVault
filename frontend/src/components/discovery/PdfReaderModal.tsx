'use client';

import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Download, Maximize2, Minimize2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
  arxivId?: string;
}

export function PdfReaderModal({
  isOpen,
  onClose,
  title,
  pdfUrl,
  arxivId,
}: PdfReaderModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className={cn(
          'relative w-full glass-panel rounded-2xl shadow-2xl border border-white/15 z-10 flex flex-col transition-all duration-300 overflow-hidden',
          isFullscreen
            ? 'h-[96vh] max-w-[96vw]'
            : 'h-[85vh] max-w-5xl'
        )}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-rose-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                  {arxivId ? `arXiv:${arxivId}` : 'Document'}
                </span>
                <span className="text-xs font-semibold text-emerald-400 hidden sm:inline">
                  • Open Access
                </span>
              </div>
              <h2 className="text-sm font-semibold text-white truncate max-w-lg" title={title}>
                {title}
              </h2>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Open in new window"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:block"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Embedded View */}
        <div className="flex-1 w-full bg-slate-950 relative">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full border-0"
            title={title}
          />
        </div>

        {/* Footer with direct fallback */}
        <div className="px-4 py-2 border-t border-white/10 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Streaming full-text via open-access CDN</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            PDF not rendering? Open directly &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
