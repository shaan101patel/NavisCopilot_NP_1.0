import { Link, useLocation } from "react-router-dom";
import { Home, Phone, Ticket, BarChart2, Settings } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: <Home size={20} /> },
  { to: "/calls", label: "Calls", icon: <Phone size={20} /> },
  { to: "/tickets", label: "Tickets", icon: <Ticket size={20} /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart2 size={20} /> },
  { to: "/admin", label: "Admin", icon: <Settings size={20} /> },
];

export function Sidebar() {
  const location = useLocation();
  return (
    <aside className="h-screen w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 text-2xl font-heading text-primary">Navis</div>
      <nav className="flex-1">
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
