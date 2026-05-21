interface EmptyStateProps {
  icon?: string;
  heading: string;
  subtext?: string;
}

export default function EmptyState({ icon = '○', heading, subtext }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl text-zinc-700 mb-4">{icon}</span>
      <p className="text-zinc-400 font-medium">{heading}</p>
      {subtext && <p className="text-zinc-600 text-sm mt-1">{subtext}</p>}
    </div>
  );
}
