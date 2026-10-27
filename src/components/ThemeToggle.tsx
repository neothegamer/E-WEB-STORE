import { useTheme } from '@/store/theme';
import { Icon } from './Icon';

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  return (
    <button
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setMode(dark ? 'light' : 'dark')}
      className="grid h-11 w-11 place-items-center"
    >
      <Icon name={dark ? 'sun' : 'moon'} />
    </button>
  );
}
