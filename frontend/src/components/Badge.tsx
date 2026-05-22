type StatusType = 'TODO' | 'IN_PROGRESS' | 'DONE';
type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH';

const statusConfig: Record<StatusType, { dot: string; text: string; bg: string; label: string }> = {
  TODO:        { dot: 'bg-[#9B9B9B]', text: 'text-[#9B9B9B]', bg: 'bg-[#9B9B9B]/12', label: 'Todo' },
  IN_PROGRESS: { dot: 'bg-[#447ACB]', text: 'text-[#447ACB]', bg: 'bg-[#447ACB]/15', label: 'In Progress' },
  DONE:        { dot: 'bg-[#2D9964]', text: 'text-[#2D9964]', bg: 'bg-[#2D9964]/15', label: 'Done' },
};

const priorityConfig: Record<PriorityType, { text: string; bg: string; label: string }> = {
  HIGH:   { text: 'text-[#CD4945]', bg: 'bg-[#CD4945]/12', label: 'High' },
  MEDIUM: { text: 'text-[#CA8E1B]', bg: 'bg-[#CA8E1B]/12', label: 'Medium' },
  LOW:    { text: 'text-[#6B6B6B]', bg: 'bg-[#6B6B6B]/12', label: 'Low' },
};

interface BadgeProps {
  type: 'status' | 'priority';
  value: string;
}

export default function Badge({ type, value }: BadgeProps) {
  if (type === 'status') {
    const cfg = statusConfig[value as StatusType] ?? statusConfig.TODO;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }

  const cfg = priorityConfig[value as PriorityType] ?? priorityConfig.LOW;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}
