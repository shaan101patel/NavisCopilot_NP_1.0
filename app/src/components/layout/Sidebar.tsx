import { Link, useLocation } from "react-router-dom";
import { Home, Phone, Ticket, BarChart2, Settings, MessageSquare, FileText, TrendingUp } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: <Home size={20} /> },
  { to: "/live-call", label: "Live Call", icon: <Phone size={20} /> },
  { to: "/tickets", label: "Tickets", icon: <Ticket size={20} /> },
  { to: "/messages", label: "Messages", icon: <MessageSquare size={20} /> },
  { to: "/documents", label: "Documents", icon: <FileText size={20} /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart2 size={20} /> },
  { to: "/agent-improvement", label: "Agent Improvement", icon: <TrendingUp size={20} /> },
  { to: "/admin", label: "Admin", icon: <Settings size={20} /> },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const location = useLocation();
  
  return (
    <aside className={clsx(
      "h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
      "dark:bg-card dark:border-border", // Enhanced dark mode support
      isCollapsed ? "w-0" : "w-64"
    )}>
      <div className="flex items-center p-6 min-w-64">
        <div className="text-2xl font-heading text-primary">Navis</div>
      </div>
      <nav className="flex-1 min-w-64 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.to 
                    ? "bg-accent text-accent-foreground font-medium" 
                    : "text-muted-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
