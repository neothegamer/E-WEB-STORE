import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { useUi } from '@/store/ui';
import { cn } from '@/lib/utils';
import type { FileKind, ProductType } from '@/types';
import { Field } from '@/components/AuthLayout';
import { Icon } from '@/components/Icon';
import { AdminHeader, ConfirmDialog, FileField, StatusChip, Switch } from '@/components/admin/ui';
import { SummaryReview } from '@/components/admin/SummaryReview';
import { ErrorState, Skeleton } from '@/components/States';

export default function ProductForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useUi((s) => s.toast);

  const prod = useQuery({
    queryKey: ['admin', 'product', id], queryFn: () => api.getAdminProduct(id!), enabled: !isNew,
    refetchInterval: (q) => (q.state.data?.summaryAdmin?.status === 'pending' ? 2500 : false),
  });
  const cats = useQuery({ queryKey: ['categories'], queryFn: api.listCategories });

  const [type, setType] = useState<ProductType>('book');
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [description, setDescription] = useState('');
  const [naira, setNaira] = useState('');
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ title?: string; creator?: string; price?: string }>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fill the form once when the product loads
  useEffect(() => {
    const p = prod.data;
    if (!p) return;
    setType(p.type); setTitle(p.title); setCreator(p.creator); setDescription(p.description);
    setNaira(String(p.price / 100)); setCategoryIds(p.categoryIds);
  }, [prod.data?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'product', id] });
    qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
  };
  const fail = (e: unknown) => toast(e instanceof Error ? e.message : 'Something went wrong. Try again.', 'error');

  const save = useMutation({
    mutationFn: () => api.saveProduct(id ?? null, { type, title: title.trim(), creator: creator.trim(), description: description.trim(), price: Math.round(parseFloat(naira) * 100), categoryIds }),
    onSuccess: (p) => {
      refresh();
      if (isNew) { toast('Draft created. Now upload the files.'); navigate(`/admin/products/${p.id}`, { replace: true }); }
      else toast('Saved');
    },
    onError: fail,
  });
  const publish = useMutation({ mutationFn: (v: boolean) => api.setProductStatus(id!, v ? 'published' : 'draft'), onSuccess: (p) => { refresh(); toast(p.status === 'published' ? 'Published to the store' : 'Moved back to drafts'); }, onError: fail });
  const remove = useMutation({ mutationFn: () => api.deleteProduct(id!), onSuccess: () => { refresh(); toast('Product deleted'); navigate('/admin/products', { replace: true }); }, onError: fail });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const f: typeof errors = {};
    if (!title.trim()) f.title = 'Enter a title.';
    if (!creator.trim()) f.creator = 'Enter the author or artist.';
    const n = parseFloat(naira);
    if (!isFinite(n) || n < 0) f.price = 'Enter a price in naira, like 2500.';
    setErrors(f);
    if (!Object.keys(f).length) save.mutate();
  };

  const upload = (kind: FileKind) => async (file: File, onProgress: (n: number) => void) => {
    await api.uploadFile(id!, kind, file, onProgress);
    refresh();
    toast(kind === 'file' && type === 'book' ? 'Uploaded. Writing the summary now...' : 'Uploaded');
  };

  if (!isNew && prod.isLoading) return <div className="space-y-3 p-4"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-64" /></div>;
  if (!isNew && (prod.isError || !prod.data)) return <ErrorState message="We could not load this product." onRetry={() => prod.refetch()} />;

  const p = prod.data;
  const visibleCats = (cats.data ?? []).filter((c) => c.type === 'both' || c.type === type);
  const toggleCat = (cid: string) => setCategoryIds((cur) => (cur.includes(cid) ? cur.filter((x) => x !== cid) : [...cur, cid]));

  // What stops this product from going live?
  let blocker = '';
  if (p) {
    if (!p.files.file) blocker = 'Upload the full file first.';
    else if (p.type === 'music' && !p.files.preview) blocker = 'Upload a preview clip first.';
    else if (p.type === 'book' && p.summaryAdmin?.status !== 'published') blocker = 'Approve the summary first.';
  }

  return (
    <div className="pb-12">
      <AdminHeader title={isNew ? 'New product' : 'Edit product'} right={p && <StatusChip tone={p.status === 'published' ? 'ok' : 'muted'}>{p.status === 'published' ? 'Published' : 'Draft'}</StatusChip>} />

      <form onSubmit={submit} noValidate className="px-4">
        <div className="mb-4 flex gap-2" role="group" aria-label="Product type">
          {(['book', 'music'] as const).map((t) => (
            <button key={t} type="button" className="chip flex-1 justify-center" aria-pressed={type === t} disabled={!isNew} onClick={() => { setType(t); setCategoryIds([]); }}>{t === 'book' ? 'Book' : 'Music'}</button>
          ))}
        </div>
        <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
        <Field label={type === 'book' ? 'Author' : 'Artist'} value={creator} onChange={(e) => setCreator(e.target.value)} error={errors.creator} />
        <div className="mb-4">
          <label htmlFor="desc" className="mb-1.5 block text-xs font-semibold text-muted">Description</label>
          <textarea id="desc" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input h-auto py-3" />
        </div>
        <Field label="Price (naira)" inputMode="decimal" value={naira} onChange={(e) => setNaira(e.target.value)} error={errors.price} />
        <div className="mb-5">
          <p className="mb-1.5 text-xs font-semibold text-muted">Categories</p>
          <div className="flex flex-wrap gap-2">
            {visibleCats.map((c) => <button key={c.id} type="button" className="chip" aria-pressed={categoryIds.includes(c.id)} onClick={() => toggleCat(c.id)}>{c.name}</button>)}
          </div>
        </div>
        <button className="btn btn-primary w-full" disabled={save.isPending}>{save.isPending ? 'Saving...' : isNew ? 'Create draft' : 'Save changes'}</button>
      </form>

      {p ? (
        <>
          <h2 className="h2 mb-3 mt-8 px-4">Files</h2>
          <div className="px-4">
            <FileField label="Cover image" accept="image/*" hint="JPG or PNG" current={p.files.cover} onUpload={upload('cover')} />
            <FileField label={type === 'book' ? 'Full book file' : 'Full track'} accept={type === 'book' ? 'application/pdf' : 'audio/mpeg'}
              hint={type === 'book' ? 'PDF only. A summary is written automatically.' : 'MP3 only. A 30-second preview is cut automatically.'} current={p.files.file} onUpload={upload('file')} />
            {type === 'music' && <FileField label="Custom preview clip (optional)" accept="audio/mpeg" hint="MP3, about 30 seconds" current={p.files.preview} onUpload={upload('preview')} />}
          </div>

          {type === 'book' && p.summaryAdmin && <div className="mt-2"><SummaryReview product={p} /></div>}

          <section className="card mx-4 mb-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1"><p className="text-sm font-bold">Publish to store</p>
                <p className={cn('text-xs', blocker ? 'text-warn' : 'text-muted')}>{blocker || (p.status === 'published' ? 'Customers can see and buy this.' : 'Ready to go live.')}</p></div>
              <Switch label="Publish to store" checked={p.status === 'published'} disabled={(!!blocker && p.status !== 'published') || publish.isPending} onChange={(v) => publish.mutate(v)} />
            </div>
          </section>

          <div className="px-4">
            <button className="btn btn-ghost w-full text-bad" onClick={() => setConfirmDelete(true)}><Icon name="x" className="h-4 w-4" /> Delete product</button>
          </div>
          <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this product?" message="It will be removed from the store. People who already bought it keep their copy." confirmLabel="Delete" busy={remove.isPending} onConfirm={() => remove.mutate()} />
        </>
      ) : (
        <p className="mx-4 mt-6 text-sm text-muted">Save the draft first, then you can upload the files.</p>
      )}
    </div>
  );
}
