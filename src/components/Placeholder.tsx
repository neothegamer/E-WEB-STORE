import { PageHeader } from './PageHeader';

export function Placeholder({ title, note }: { title: string; note?: string }) {
  return (
    <div>
      <PageHeader title={title} back />
      <div className="card mx-4 mt-4 p-6 text-sm text-muted">{note ?? 'This screen is built in a later step. The design is on the canvas.'}</div>
    </div>
  );
}
