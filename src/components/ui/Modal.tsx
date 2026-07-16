import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className







}: {open: boolean;onClose: () => void;title?: string;description?: string;children: React.ReactNode;className?: string;}) {
  return <AnimatePresence>
      {open && <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div className="absolute inset-0 bg-slate-900/40" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.15
      }} onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" className={cn('relative z-10 w-full max-w-lg rounded-lg border border-border bg-card shadow-lg', className)} initial={{
        opacity: 0,
        scale: 0.98,
        y: 8
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.98,
        y: 8
      }} transition={{
        duration: 0.18
      }}>
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                {title && <h2 className="text-[15px] tracking-wide text-foreground">
                    {title}
                  </h2>}
                {description && <p className="mt-0.5 text-sm text-muted-foreground">
                    {description}
                  </p>}
              </div>
              <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors" aria-label="Close">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </div>}
    </AnimatePresence>;
}
export function Sheet({
  open,
  onClose,
  title,
  children,
  side = 'right',
  className







}: {open: boolean;onClose: () => void;title?: string;children: React.ReactNode;side?: 'right' | 'left';className?: string;}) {
  return <AnimatePresence>
      {open && <div className="fixed inset-0 z-50">
          <motion.div className="absolute inset-0 bg-slate-900/40" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.15
      }} onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" className={cn('absolute top-0 bottom-0 w-full max-w-md border-border bg-card shadow-lg flex flex-col', side === 'right' ? 'right-0 border-l' : 'left-0 border-r', className)} initial={{
        x: side === 'right' ? '100%' : '-100%'
      }} animate={{
        x: 0
      }} exit={{
        x: side === 'right' ? '100%' : '-100%'
      }} transition={{
        duration: 0.2,
        ease: 'easeOut'
      }}>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              {title && <h2 className="text-[15px] tracking-wide text-foreground">
                  {title}
                </h2>}
              <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors" aria-label="Close">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </div>}
    </AnimatePresence>;
}