import { UserProfile } from '../UserProfile';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-muted rounded-md transition-colors"
          aria-label={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
        >
          {isSidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
        <div className="text-lg font-heading text-primary">Navis</div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Add notifications or other header items here */}
        <UserProfile />
      </div>
    </header>
  );
}
