import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, X as XIcon, Search as SearchIcon, Filter as FilterIcon, Plus as PlusIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export interface TicketsHeaderProps {
  error: string | null;
  onClearError: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: {
    status: string[];
    priority: string[];
    assigned_to: string[];
  };
  onFilterChange: (filterType: keyof TicketsHeaderProps['filters'], values: string[]) => void;
  onClearFilters: () => void;
  onNewTicket: () => void;
}

const TicketsHeader: React.FC<TicketsHeaderProps> = ({
  error,
  onClearError,
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  onNewTicket,
}) => (
  <>
    <div className="flex justify-between items-center mb-6">
      <div>
  <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
        <p className="text-gray-600">Manage customer support tickets</p>
      </div>
      <Button onClick={onNewTicket} className="bg-blue-600 hover:bg-blue-700">
        <PlusIcon className="w-4 h-4 mr-2" />
        New Ticket
      </Button>
    </div>

    {error && (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearError} className="text-red-600 hover:text-red-700">
            <XIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )}

    <div className="mb-6 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <FilterIcon className="w-4 h-4 mr-2" />
              Filters
              {(filters.status.length > 0 || filters.priority.length > 0 || filters.assigned_to.length > 0) && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {filters.status.length + filters.priority.length + filters.assigned_to.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="p-2">
              ...existing filter UI...
              <Button variant="outline" size="sm" onClick={onClearFilters} className="w-full mt-2">
                Clear Filters
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </>
);

export default TicketsHeader;
