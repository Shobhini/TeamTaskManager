type StatusType = 'TODO' | 'IN_PROGRESS' | 'DONE';
type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH';

const statusStyles: Record<StatusType, string> = {
  TODO: 'bg-zinc-800 text-zinc-400',
  IN_PROGRESS: 'bg-blue-500/15 text-blue-400',
  DONE: 'bg-emerald-500/15 text-emerald-400',
};

const priorityStyles: Record<PriorityType, string> = {
  HIGH: 'bg-red-500/15 text-red-400',
  MEDIUM: 'bg-amber-500/15 text-amber-400',
  LOW: 'bg-zinc-800 text-zinc-500',
};

const statusLabels: Record<StatusType, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

interface BadgeProps {
  type: 'status' | 'priority';
  value: string;
}

export default function Badge({ type, value }: BadgeProps) {
  const styles =
    type === 'status'
      ? statusStyles[value as StatusType] ?? 'bg-zinc-800 text-zinc-400'
      : priorityStyles[value as PriorityType] ?? 'bg-zinc-800 text-zinc-400';

  const label =
    type === 'status'
      ? statusLabels[value as StatusType] ?? value
      : value.charAt(0) + value.slice(1).toLowerCase();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-mono ${styles}`}>
      {label}
    </span>
  );
}
