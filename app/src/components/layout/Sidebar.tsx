import { Link, useLocation } from "react-router-dom";
import { Home, Phone, Ticket, BarChart2, Settings, MessageSquare, FileText, TrendingUp, MessageCircle, ChevronDown, ChevronRight, Cable } from "lucide-react";
import clsx from "clsx";
import { useTheme } from '../../hooks/useTheme';

import { useState } from 'react';
import NavisLogoLight from '../../assets/NavisLogo_LightMode-removebg-preview.png';
import NavisLogoDark from '../../assets/NavisLogo_DarkMode-removebg-preview.png';

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
  { to: "/live-call", label: "Live Calls", icon: <Phone size={20} /> },
  { to: "/tickets", label: "Tickets", icon: <Ticket size={20} /> },
  { to: "/documents", label: "Documents", icon: <FileText size={20} /> },
  { to: "/settings", label: "Settings", icon: <Settings size={20} /> },
];

const comingSoonItems = [
  { to: "/messages", label: "Messages", icon: <MessageSquare size={20} /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart2 size={20} /> },
  { to: "/agent-improvement", label: "Agent Improvement", icon: <TrendingUp size={20} /> },
  { to: "/external-connections", label: "External Connections", icon: <Cable size={20} /> },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const location = useLocation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [isComingSoonExpanded, setIsComingSoonExpanded] = useState(false);
  
  // Check if any coming soon item is active
  const isComingSoonActive = comingSoonItems.some(item => location.pathname === item.to);
  
  return (
    <aside className={clsx(
      "h-full bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
      "dark:bg-card dark:border-border", // Enhanced dark mode support
      isCollapsed ? "w-0" : "w-64"
    )}>
      <div className="flex items-center p-6 min-w-64">
        <div className="flex items-center">
          <img 
            src={isDark ? NavisLogoDark : NavisLogoLight} 
            alt="Navis Logo" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              console.error('Sidebar logo failed to load:', e.currentTarget.src);
            }}
            onLoad={() => {
              console.log('Sidebar logo loaded successfully:', isDark ? 'Dark' : 'Light', 'Theme:', resolvedTheme);
            }}
          />
        </div>
      </div>
      <nav className="flex-1 min-w-64 px-3 flex flex-col">
        <div className="flex-1">
          <ul className="space-y-1">
            {/* Regular Navigation Items */}
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
            
            {/* Coming Soon Dropdown Section */}
            <li>
              <button
                onClick={() => setIsComingSoonExpanded(!isComingSoonExpanded)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isComingSoonActive || isComingSoonExpanded
                    ? "bg-accent text-accent-foreground font-medium" 
                    : "text-muted-foreground"
                )}
                aria-expanded={isComingSoonExpanded}
                aria-label="Toggle coming soon features"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                  <span>Coming Soon</span>
                </div>
                {isComingSoonExpanded ? (
                  <ChevronDown size={16} className="transition-transform" />
                ) : (
                  <ChevronRight size={16} className="transition-transform" />
                )}
              </button>
              
              {/* Dropdown Items */}
              {isComingSoonExpanded && (
                <ul className="mt-1 ml-6 space-y-1">
                  {comingSoonItems.map((item) => (
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
                        <span>{item.label}</span>
                        <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">
                          Beta
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
        
        {/* Feedback link and temporary simulation button positioned at bottom */}
        <div className="mt-auto pb-3">
          <div className="border-t border-border pt-3 space-y-1">
            <Link
              to="/feedback"
              className={clsx(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                location.pathname === "/feedback" 
                  ? "bg-accent text-accent-foreground font-medium" 
                  : "text-muted-foreground"
              )}
              aria-label="Provide feedback"
            >
              <MessageCircle size={20} />
              Feedback
            </Link>
            

          </div>
        </div>
      </nav>
    </aside>
  );
}
