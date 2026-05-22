import type { LucideIcon } from 'lucide-react';
import { InboxIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  heading: string;
  subtext?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon = InboxIcon, heading, subtext, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-xl bg-[#2F3437] flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-[#454B4E]" />
      </div>
      <p className="text-[15px] font-medium text-[#9B9B9B]">{heading}</p>
      {subtext && <p className="text-[13px] text-[#6B6B6B] mt-1">{subtext}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
