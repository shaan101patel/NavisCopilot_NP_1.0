import { Link, useLocation } from "react-router-dom";
import { Home, Phone, Ticket, BarChart2, Settings, MessageSquare, FileText } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: <Home size={20} /> },
  { to: "/live-call", label: "Live Call", icon: <Phone size={20} /> },
  { to: "/tickets", label: "Tickets", icon: <Ticket size={20} /> },
  { to: "/messages", label: "Messages", icon: <MessageSquare size={20} /> },
  { to: "/documents", label: "Documents", icon: <FileText size={20} /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart2 size={20} /> },
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
      isCollapsed ? "w-0" : "w-64"
    )}>
      <div className="flex items-center p-6 min-w-64">
        <div className="text-2xl font-heading text-primary">Navis</div>
      </div>
      <nav className="flex-1 min-w-64">
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={clsx(
                  "flex items-center gap-3 px-6 py-3 hover:bg-muted transition-colors rounded-md",
                  location.pathname === item.to && "bg-muted font-semibold"
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
