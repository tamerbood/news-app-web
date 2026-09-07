'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useEffect, useRef } from 'react';

export type ButtonVariant = 'primary' | 'soft' | 'ghost' | 'danger' | 'success';

export function Button({ variant='primary', icon, className='', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; icon?: ReactNode }) {
  return <button className={`mada-btn mada-btn-${variant} ${className}`} {...props}>{icon}{children}</button>;
}

export function IconButton({ label, children, className='', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button aria-label={label} title={label} className={`mada-icon-btn mada-btn-icon ${className}`} {...props}>{children}</button>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`mada-input ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`mada-select ${props.className ?? ''}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`mada-textarea ${props.className ?? ''}`} />;
}

export function Field({ label, help, children }: { label?: string; help?: string; children: ReactNode }) {
  return <label className="mada-field">{label && <span className="mada-field-label">{label}</span>}{children}{help && <span className="mada-field-help">{help}</span>}</label>;
}

export function SearchInput({ value, onChange, placeholder='ابحث…', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <div className="mada-search"><span className="mada-search-icon" aria-hidden="true">⌕</span><input {...props} value={value} onChange={onChange} type="search" placeholder={placeholder} className={`mada-input ${props.className ?? ''}`} /></div>;
}

export function Card({ children, interactive=false, className='' }: { children: ReactNode; interactive?: boolean; className?: string }) {
  return <div className={`mada-ui-card ${interactive ? 'mada-ui-card-interactive' : ''} ${className}`}>{children}</div>;
}

export function Badge({ tone='neutral', live=false, children }: { tone?: 'neutral'|'info'|'success'|'warning'|'danger'; live?: boolean; children: ReactNode }) {
  return <span className={`mada-ui-badge mada-ui-badge-${tone} ${live ? 'mada-ui-badge-live' : ''}`}>{children}</span>;
}

export function SectionHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="mada-ui-section-head"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

export function Tabs({ items, value, onChange }: { items: { id:string; label:string }[]; value:string; onChange:(id:string)=>void }) {
  return <div className="mada-ui-tabs" role="tablist">{items.map(item => <button key={item.id} type="button" role="tab" aria-selected={value===item.id} className={`mada-ui-tab ${value===item.id ? 'mada-ui-tab-active' : ''}`} onClick={()=>onChange(item.id)}>{item.label}</button>)}</div>;
}

export function Divider() { return <div className="mada-ui-divider" aria-hidden="true" />; }

export function Skeleton({ className='' }: { className?: string }) {
  return <div className={`mada-skeleton ${className}`} aria-hidden="true"><div className="mada-skeleton-body"><div className="mada-skeleton-line"/><div className="mada-skeleton-line short"/><div className="mada-skeleton-line"/></div></div>;
}

export function LoadingState({ label='جارٍ التحميل…' }: { label?: string }) { return <div className="mada-loading" role="status"><p className="mada-subtitle">{label}</p></div>; }
export function EmptyState({ title='لا توجد بيانات', description }: { title?: string; description?: string }) { return <div className="mada-empty"><strong>{title}</strong>{description && <p className="mada-subtitle">{description}</p>}</div>; }
export function ErrorState({ title='حدث خطأ', description }: { title?: string; description?: string }) { return <div className="mada-error" role="alert"><strong>{title}</strong>{description && <span className="block mt-1">{description}</span>}</div>; }

export function Pagination({ page, totalPages, onChange }: { page:number; totalPages:number; onChange:(page:number)=>void }) {
  if (totalPages <= 1) return null;
  const items: (number|'ellipsis')[] = totalPages <= 7 ? Array.from({length:totalPages},(_,i)=>i+1) : [1, ...(page>4?['ellipsis' as const]:[]), ...Array.from({length:Math.max(0,Math.min(totalPages-1,page+1)-Math.max(2,page-1)+1)},(_,i)=>Math.max(2,page-1)+i), ...(page<totalPages-3?['ellipsis' as const]:[]), totalPages];
  return <nav className="mada-pagination" aria-label="التنقل بين الصفحات"><button className="mada-page-btn" disabled={page===1} onClick={()=>onChange(page-1)}>السابق</button>{items.map((item,i)=>item==='ellipsis'?<span key={`e-${i}`} className="mada-page-btn" aria-hidden="true">…</span>:<button key={item} className={`mada-page-btn ${item===page?'active':''}`} aria-current={item===page?'page':undefined} onClick={()=>onChange(item)}>{item}</button>)}<button className="mada-page-btn" disabled={page===totalPages} onClick={()=>onChange(page+1)}>التالي</button></nav>;
}

export function DataTable({ columns, rows, rowKey }: { columns:{key:string; label:string}[]; rows:Record<string, ReactNode>[]; rowKey?:string }) {
  return <div className="mada-ui-table-wrap"><table className="mada-ui-table"><thead><tr>{columns.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((row,index)=><tr key={String(row[rowKey ?? 'id'] ?? index)}>{columns.map(c=><td key={c.key}>{row[c.key]}</td>)}</tr>)}</tbody></table></div>;
}

export function StatCard({ label, value, sub, icon }: { label:string; value:ReactNode; sub?:string; icon?:ReactNode }) {
  return <Card className="mada-ui-stat"><div className="flex items-start justify-between gap-3"><span className="mada-ui-stat-label">{label}</span>{icon}</div><div className="mada-ui-stat-value">{value}</div>{sub && <div className="mada-ui-stat-sub">{sub}</div>}</Card>;
}

export function Modal({ open, title, onClose, children }: { open:boolean; title:string; onClose:()=>void; children:ReactNode }) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const titleId = 'mada-modal-title';
  useEffect(() => {
    if (!open) return;
    const previousActive = document.activeElement as HTMLElement | null;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return; }
      if (event.key !== 'Tab' || !modalRef.current) return;
      const selector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(selector));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handler);
    requestAnimationFrame(() => {
      modalRef.current?.querySelector<HTMLElement>('button:not([disabled]), input, select, textarea, a[href]')?.focus();
    });
    return () => {
      document.removeEventListener('keydown', handler);
      previousActive?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return <><div className="mada-ui-overlay" onClick={onClose} aria-hidden="true"/><div className="mada-ui-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={modalRef}><div className="mada-ui-modal-panel"><div className="mada-ui-modal-head"><h2 id={titleId} className="m-0 text-base font-black">{title}</h2><IconButton label="إغلاق" onClick={onClose}>✕</IconButton></div><div className="mada-ui-modal-body">{children}</div></div></div></>;
}

export function Toast({ tone='success', children }: { tone?:'success'|'error'; children:ReactNode }) { return <div className={`mada-ui-toast mada-ui-toast-${tone}`} role="status">{children}</div>; }
