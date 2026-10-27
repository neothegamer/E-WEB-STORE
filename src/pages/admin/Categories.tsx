import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import { useUi } from '@/store/ui';
import type { Category } from '@/types';
import { Field } from '@/components/AuthLayout';
import { Icon } from '@/components/Icon';
import { AdminHeader, ConfirmDialog, SelectField, Sheet, StatusChip } from '@/components/admin/ui';
import { EmptyState, ErrorState, Skeleton } from '@/components/States';

export default function Categories() {
  const qc = useQueryClient();
  const toast = useUi((s) => s.toast);
  const list = useQuery({ queryKey: ['categories'], queryFn: api.listCategories });
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<Category['type']>('book');
  const [error, setError] = useState('');

  const open = (c: Category | 'new') => { setEditing(c); setError(''); setName(c === 'new' ? '' : c.name); setType(c === 'new' ? 'book' : c.type); };
  const done = (msg: string) => { qc.invalidateQueries({ queryKey: ['categories'] }); setEditing(null); setDeleting(null); toast(msg); };
  const fail = (e: unknown) => toast(e instanceof Error ? e.message : 'Something went wrong.', 'error');

  const save = useMutation({
    mutationFn: () => (editing === 'new' ? api.createCategory({ name: name.trim(), type }) : api.updateCategory((editing as Category).id, { name: name.trim(), type })),
    onSuccess: () => done('Category saved'), onError: fail,
  });
  const del = useMutation({ mutationFn: () => api.deleteCategory(deleting!.id), onSuccess: () => done('Category deleted'), onError: (e) => { setDeleting(null); fail(e); } });
  const submit = (e: FormEvent) => { e.preventDefault(); if (name.trim().length < 2) return setError('Enter a name.'); save.mutate(); };

  return (
    <div className="pb-10">
      <AdminHeader title="Categories" right={<button aria-label="Add category" className="btn btn-primary min-h-11 w-11 px-0" onClick={() => open('new')}><Icon name="plus" /></button>} />
      <div className="px-4">
        {list.isError ? <ErrorState onRetry={() => list.refetch()} /> : list.isLoading ? <Skeleton className="h-40" /> : list.data!.length === 0 ? (
          <EmptyState title="No categories" message="Add one so products can be filed." />
        ) : (
          <ul className="card divide-y divide-border px-4">
            {list.data!.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-2">
                <div className="flex-1"><p className="text-sm font-semibold">{c.name}</p><StatusChip>{c.type === 'both' ? 'Books and music' : c.type === 'book' ? 'Books' : 'Music'}</StatusChip></div>
                <button className="min-h-11 px-3 text-sm font-bold text-accent" onClick={() => open(c)}>Edit</button>
                <button aria-label={`Delete ${c.name}`} className="grid h-11 w-11 place-items-center text-muted" onClick={() => setDeleting(c)}><Icon name="x" className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add category' : 'Edit category'}>
        <form onSubmit={submit} noValidate>
          <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} error={error} autoFocus />
          <SelectField label="For" value={type} onChange={(v) => setType(v as Category['type'])}>
            <option value="book">Books</option><option value="music">Music</option><option value="both">Books and music</option>
          </SelectField>
          <button className="btn btn-primary w-full" disabled={save.isPending}>{save.isPending ? 'Saving...' : 'Save'}</button>
        </form>
      </Sheet>
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete category?" message={`"${deleting?.name}" will be removed. Categories in use by products cannot be deleted.`} confirmLabel="Delete" busy={del.isPending} onConfirm={() => del.mutate()} />
    </div>
  );
}
