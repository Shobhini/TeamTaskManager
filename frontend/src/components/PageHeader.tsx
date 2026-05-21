import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  breadcrumb?: string;
  action?: ReactNode;
  meta?: ReactNode;
}

export default function PageHeader({ title, breadcrumb, action, meta }: PageHeaderProps) {
  return (
    <div className="px-8 py-5 border-b border-[#2A2A2A] flex items-center justify-between">
      <div>
        {breadcrumb && (
          <p className="text-xs text-zinc-500 mb-1">{breadcrumb}</p>
        )}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-[#F5F5F5]">{title}</h1>
          {meta && <div className="flex items-center gap-2">{meta}</div>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
