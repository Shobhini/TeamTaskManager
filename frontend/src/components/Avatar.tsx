const COLORS = [
  'bg-blue-500/20 text-blue-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-violet-500/20 text-violet-300',
  'bg-amber-500/20 text-amber-300',
  'bg-pink-500/20 text-pink-300',
  'bg-cyan-500/20 text-cyan-300',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ name, size = 'sm' }: AvatarProps) {
  const sizeClass =
    size === 'sm' ? 'w-6 h-6 text-[10px]' :
    size === 'md' ? 'w-8 h-8 text-xs' :
    'w-10 h-10 text-sm';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium shrink-0 ${sizeClass} ${getColor(name)}`}
      title={name}
    >
      {getInitials(name)}
    </span>
  );
}
