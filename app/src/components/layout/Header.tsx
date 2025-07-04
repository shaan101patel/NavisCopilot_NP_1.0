import { UserProfile } from '../UserProfile';
import { ThemeToggle } from '../ThemeToggle';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
          aria-label={isSidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
        >
          {isSidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
        <div className="text-lg font-heading text-primary">Navis</div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Theme toggle for user preference */}
        <ThemeToggle />
        {/* Additional header items can be added here */}
        <UserProfile />
      </div>
    </header>
  );
}
