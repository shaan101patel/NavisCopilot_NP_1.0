import { UserProfile } from '../UserProfile';
import { ThemeToggle } from '../ThemeToggle';
import { LogoDisplay } from '../LogoDisplay';
import { Menu, X, Search, ArrowRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';

import { Home, Phone, Ticket, BarChart2, Settings, MessageSquare, FileText, TrendingUp } from 'lucide-react';

// Navigation items for search functionality
const navItems = [
  { to: "/", label: "Dashboard", icon: <Home size={16} />, keywords: ["dashboard", "home", "overview"] },
  { to: "/live-call", label: "Live Call", icon: <Phone size={16} />, keywords: ["call", "live", "phone", "conversation"] },
  { to: "/tickets", label: "Tickets", icon: <Ticket size={16} />, keywords: ["tickets", "support", "issues", "problems"] },
  { to: "/messages", label: "Messages", icon: <MessageSquare size={16} />, keywords: ["messages", "chat", "communication"] },
  { to: "/documents", label: "Documents", icon: <FileText size={16} />, keywords: ["documents", "files", "papers", "docs"] },
  { to: "/analytics", label: "Analytics", icon: <BarChart2 size={16} />, keywords: ["analytics", "reports", "data", "statistics", "metrics"] },
  { to: "/agent-improvement", label: "Agent Improvement", icon: <TrendingUp size={16} />, keywords: ["improvement", "training", "performance", "coaching", "development"] },
  { to: "/admin", label: "Admin", icon: <Settings size={16} />, keywords: ["admin", "settings", "configuration", "management"] },
];

interface HeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isSidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Filter navigation items based on search query
  const filteredItems = navItems.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(query) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  });

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchFocused || filteredItems.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          navigate(filteredItems[selectedIndex].to);
        } else if (filteredItems.length > 0) {
          navigate(filteredItems[0].to);
        }
        setSearchQuery('');
        setIsSearchFocused(false);
        searchRef.current?.blur();
        break;
      case 'Escape':
        setSearchQuery('');
        setIsSearchFocused(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  // Handle clicking on a search result
  const handleResultClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setIsSearchFocused(false);
    setSelectedIndex(-1);
    searchRef.current?.blur();
  };

  // Handle clicking outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        setIsSearchFocused(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  }, []);
  
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
        <div className="flex items-center">
          <LogoDisplay />
        </div>
        
        {/* Search Bar */}
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search pages... (Ctrl+K)"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-16 w-64 h-9"
            />
            {!isSearchFocused && !searchQuery && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">
                ⌘K
              </div>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <button
                    key={item.to}
                    onClick={() => handleResultClick(item.to)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors ${
                      index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    <span className="text-muted-foreground">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-muted-foreground text-sm">
                  No pages found
                </div>
              )}
            </div>
          )}
        </div>
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
