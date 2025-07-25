import React from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { userActions, callsActions, ticketsActions } from '../store';

/**
 * Example component demonstrating Redux store usage in Navis MVP
 * This component shows how to:
 * - Access state from different slices
 * - Dispatch actions to update state
 * - Use typed hooks for type safety
 */
const ReduxExample: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Access state from different slices
  const user = useAppSelector(state => state.user.user);
  const isAuthenticated = useAppSelector(state => state.user.isAuthenticated);
  const activeCalls = useAppSelector(state => state.calls.activeCalls);
  const tickets = useAppSelector(state => state.tickets.tickets);
  const ragMode = useAppSelector(state => state.calls.ragMode);

  // Example: Login user
  const handleLogin = () => {
    dispatch(userActions.setUser({
      id: '1',
      name: 'John Agent',
      phone_number: "333-333-3333",
      email: 'john@navis.com',
      role: 'agent'
    }));
  };

  // Example: Add a new ticket
  const handleCreateTicket = () => {
    dispatch(ticketsActions.addTicket({
      id: Date.now().toString(),
      title: 'Sample Ticket',
      description: 'This is a sample ticket created from Redux example',
      status: 'open',
      priority: 'medium',
      createdBy: user?.id || 'unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['sample', 'demo'],
    }));
  };

  // Example: Change RAG mode
  const handleRagModeChange = (mode: 'newbie' | 'intermediate' | 'experienced') => {
    dispatch(callsActions.setRagMode(mode));
  };

  // Example: Logout
  const handleLogout = () => {
    dispatch(userActions.logout());
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Redux Store Example</h1>
      
      {/* User Authentication State */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">User Authentication</h2>
        {isAuthenticated ? (
          <div>
            <p className="mb-2">Welcome, {user?.name}! ({user?.role})</p>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-2">Not authenticated</p>
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login as Agent
            </button>
          </div>
        )}
      </div>

      {/* Calls State */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Calls Management</h2>
        <p className="mb-2">Active Calls: {activeCalls.length}</p>
        <p className="mb-3">Current RAG Mode: <span className="font-semibold">{ragMode}</span></p>
        <div className="space-x-2">
          <button 
            onClick={() => handleRagModeChange('newbie')}
            className={`px-3 py-1 rounded ${ragMode === 'newbie' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Newbie
          </button>
          <button 
            onClick={() => handleRagModeChange('intermediate')}
            className={`px-3 py-1 rounded ${ragMode === 'intermediate' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Intermediate
          </button>
          <button 
            onClick={() => handleRagModeChange('experienced')}
            className={`px-3 py-1 rounded ${ragMode === 'experienced' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Experienced
          </button>
        </div>
      </div>

      {/* Tickets State */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Tickets Management</h2>
        <p className="mb-3">Total Tickets: {tickets.length}</p>
        <button 
          onClick={handleCreateTicket}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Create Sample Ticket
        </button>
        {tickets.length > 0 && (
          <div className="mt-3">
            <h3 className="font-semibold">Recent Tickets:</h3>
            <ul className="list-disc list-inside mt-2">
              {tickets.slice(0, 3).map(ticket => (
                <li key={ticket.id} className="text-sm">
                  {ticket.title} - <span className={`
                    ${ticket.status === 'open' ? 'text-red-600' : ''}
                    ${ticket.status === 'in-progress' ? 'text-yellow-600' : ''}
                    ${ticket.status === 'resolved' ? 'text-green-600' : ''}
                  `}>
                    {ticket.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Integration Status */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="text-xl font-semibold text-green-800 mb-2">✅ Redux Toolkit Integration Complete</h2>
        <p className="text-green-700">
          Redux store is successfully set up with all four slices (user, tickets, calls, analytics).
          The typed hooks are working, and state management is ready for the Navis MVP!
        </p>
      </div>
    </div>
  );
};

export default ReduxExample;
