import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUi } from '@/store/ui';
import { Icon } from './Icon';

/** Mobile page header: optional back button, title, and a search button (search is one tap from every page). */
export function PageHeader({ title, back, right }: { title: string; back?: boolean; right?: ReactNode }) {
  const navigate = useNavigate();
  const openSearch = useUi((s) => s.openSearch);
  return (
    <div className="sticky top-0 z-20 flex items-center gap-1 bg-bg/95 px-2 pb-1 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur lg:static">
      {back && (
        <button aria-label="Go back" onClick={() => navigate(-1)} className="grid h-11 w-11 place-items-center">
          <Icon name="back" />
        </button>
      )}
      {title ? <h1 className={`h2 flex-1 ${back ? '' : 'pl-2'}`}>{title}</h1> : <div className="flex-1" />}
      {right}
      <button aria-label="Search" onClick={openSearch} className="grid h-11 w-11 place-items-center lg:hidden">
        <Icon name="search" />
      </button>
    </div>
  );
}
