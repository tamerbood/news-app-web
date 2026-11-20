'use client';
import { use, useEffect, useState } from 'react';
import AdminShell from '../../components/AdminShell';
import { get, patch, post } from '../../lib';

type Article = {
  id:string; title:string; description?:string|null; content?:string|null; slug?:string|null;
  seoTitle?:string|null; seoDescription?:string|null; imageUrl?:string|null; status:string;
  categoryId?:string|null; category?:{name:string}|null;
  originalMeta?:{section?:string;topic?:string;sources?:Array<{source:string;title:string;url:string}>;sourceNotes?:string[]}|null;
};

export default function EditOriginal({params}:{params:Promise<{id:string}>}) {
  const {id}=use(params);
  const [article,setArticle]=useState<Article|null>(null);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [reviewConfirmed,setReviewConfirmed]=useState(false);

  useEffect(()=>{
    get(`/original-content/${id}`)
      .then(a=>setArticle(a))
      .catch(e=>setMessage(e instanceof Error?e.message:'تعذر التحميل'));
  },[id]);

  function set<K extends keyof Article>(key:K,value:Article[K]) { setReviewConfirmed(false); setArticle(a=>a?{...a,[key]:value}:a); }
  async function save(){if(!article)return;setBusy(true);setMessage('');try{const result=await patch(`/original-content/${id}`,{title:article.title,description:article.description||'',content:article.content||'',slug:article.slug||'',seoTitle:article.seoTitle||'',seoDescription:article.seoDescription||'',imageUrl:article.imageUrl||undefined});setArticle(result);setMessage('تم حفظ المسودة.');}catch(e){setMessage(e instanceof Error?e.message:'فشل الحفظ');}finally{setBusy(false)}}
  const readyToPublish=Boolean(article?.title.trim()&&article.description?.trim()&&article.content?.trim());
  async function publish(){
    if(!article||!reviewConfirmed||!readyToPublish||!confirm('سيتم حفظ هذه النسخة ثم نشرها. هل راجعت الوقائع والمصادر والروابط وأزلت أي صياغة منقولة؟'))return;
    setBusy(true);setMessage('');
    try{
      const saved=await patch(`/original-content/${id}`,{title:article.title,description:article.description||'',content:article.content||'',slug:article.slug||'',seoTitle:article.seoTitle||'',seoDescription:article.seoDescription||'',imageUrl:article.imageUrl||undefined});
      setArticle(saved);
      const result=await post(`/original-content/${id}/publish`,{reviewConfirmed:true});
      setArticle(result);setReviewConfirmed(false);setMessage('تم النشر بنجاح.');
    }catch(e){setMessage(e instanceof Error?e.message:'فشل النشر');}
    finally{setBusy(false)}
  }

  if(!article)return <AdminShell title="خاص مدى العالم"><p>{message||'جارِ التحميل...'}</p></AdminShell>;
  const field='w-full rounded-xl border border-slate-200 p-3';
  return <AdminShell title="تحرير مادة خاصة">
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <section className="space-y-4 rounded-2xl border bg-white p-5">
        <label className="block text-sm font-bold">العنوان<input className={`${field} mt-2`} value={article.title} onChange={e=>set('title',e.target.value)}/></label>
        <label className="block text-sm font-bold">Slug<input className={`${field} mt-2`} value={article.slug||''} onChange={e=>set('slug',e.target.value)}/></label>
        <label className="block text-sm font-bold">الوصف<textarea className={`${field} mt-2`} rows={3} value={article.description||''} onChange={e=>set('description',e.target.value)}/></label>
        <label className="block text-sm font-bold">المحتوى<textarea className={`${field} mt-2 min-h-96 leading-8`} value={article.content||''} onChange={e=>set('content',e.target.value)}/></label>
        {article.content&&<div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="mb-3 text-xs font-bold text-slate-500">معاينة التنسيق</p><div className="text-base leading-8 text-slate-800">{article.content.replace(/\r\n/g,'\n').split(/\n\s*\n/).map(v=>v.trim()).filter(Boolean).map((block,i)=>block.startsWith('## ')?<h3 key={i} className="mb-2 mt-5 text-lg font-black text-slate-950 first:mt-0">{block.slice(3).trim()}</h3>:<p key={i} className="mb-4 last:mb-0">{block}</p>)}</div></div>}
        <label className="block text-sm font-bold">القسم<input className={`${field} mt-2 bg-slate-50`} value={article.category?.name||'خاص مدى العالم'} readOnly/></label>
        <label className="block text-sm font-bold">رابط الصورة<input className={`${field} mt-2`} value={article.imageUrl||''} onChange={e=>set('imageUrl',e.target.value)}/></label>
        <label className="block text-sm font-bold">SEO Title<input className={`${field} mt-2`} value={article.seoTitle||''} onChange={e=>set('seoTitle',e.target.value)}/></label>
        <label className="block text-sm font-bold">SEO Description<textarea className={`${field} mt-2`} rows={3} value={article.seoDescription||''} onChange={e=>set('seoDescription',e.target.value)}/></label>
        {article.status==='DRAFT'&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950"><p className="font-black">المسودة أُنشئت بمساعدة آلية وتحتاج مراجعة بشرية كاملة قبل النشر.</p><label className="mt-3 flex items-start gap-3 font-medium"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-blue-700" checked={reviewConfirmed} onChange={e=>setReviewConfirmed(e.target.checked)}/><span>أؤكد أنني راجعت هذه النسخة بعد آخر تعديل، وتحققت من الوقائع والمصادر والروابط، وعالجت أي تعارض أو معلومة غير مسندة، وتأكدت من أن الصياغة أصلية وغير منقولة، وأوافق على نشرها باسم هيئة تحرير مدى العالم.</span></label></div>}
        <div className="flex flex-wrap gap-3">
          <button disabled={busy||article.status!=='DRAFT'} onClick={save} className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-40">حفظ</button>
          <button disabled={busy||article.status!=='DRAFT'||!reviewConfirmed||!readyToPublish} onClick={publish} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-40">نشر بعد المراجعة</button>
          {article.status==='PUBLISHED'&&<a target="_blank" href={`/articles/${article.id}`} className="rounded-xl border px-5 py-3 font-bold">فتح المقال المنشور</a>}
        </div>
        {message&&<p className="rounded-xl bg-slate-50 p-3 text-sm">{message}</p>}
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl border bg-white p-5"><p className="text-xs text-slate-500">الحالة</p><p className="font-black">{article.status==='DRAFT'?'مسودة':'منشور'}</p><p className="mt-3 text-xs text-slate-500">القسم</p><p className="font-bold">{article.category?.name||'—'}</p><p className="mt-3 text-xs text-slate-500">التخصص</p><p className="font-bold">{article.originalMeta?.section||'—'}</p><p className="mt-3 text-xs text-slate-500">الموضوع</p><p className="font-bold">{article.originalMeta?.topic||'—'}</p></div>
        <div className="rounded-2xl border bg-white p-5"><h2 className="font-black">المصادر المستخدمة</h2><div className="mt-3 space-y-3">{article.originalMeta?.sources?.map((s,i)=><a key={i} href={s.url} target="_blank" rel="noreferrer" className="block rounded-xl bg-slate-50 p-3 text-sm"><b>{s.source}</b><span className="mt-1 block text-slate-600">{s.title}</span></a>)}</div></div>
        {Array.isArray(article.originalMeta?.sourceNotes)&&article.originalMeta!.sourceNotes!.length>0&&<div className="rounded-2xl border bg-white p-5"><h2 className="font-black">ملاحظات المصادر</h2><ul className="mt-3 list-disc space-y-2 pr-5 text-sm text-slate-600">{article.originalMeta!.sourceNotes!.map((n,i)=><li key={i}>{n}</li>)}</ul></div>}
      </aside>
    </div>
  </AdminShell>;
}
