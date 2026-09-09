import { cn } from '../lib/utils';

interface StatusBadgeProps {
  exists: boolean;
  path: string;
}

export function StatusBadge({ exists, path }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', exists ? 'bg-green-500' : 'bg-red-500')} />
      <span className="text-xs text-gray-500 font-mono truncate" title={path}>
        {path}
      </span>
      <span className={cn('text-xs flex-shrink-0', exists ? 'text-green-400' : 'text-red-400')}>
        {exists ? '已找到' : '未找到'}
      </span>
    </div>
  );
}
