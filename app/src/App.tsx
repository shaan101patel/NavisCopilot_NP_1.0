import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store';
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { AgentProvider } from "@/contexts/AgentContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Login from "@/pages/Login";
import CreateAccount from "@/pages/CreateAccount";
import Dashboard from "@/pages/Dashboard";
import LiveCall from "@/pages/LiveCall";
import Tickets from "@/pages/Tickets";
import Analytics from "@/pages/Analytics";
import AgentImprovement from "@/pages/AgentImprovement";
import Messages from "@/pages/Messages";
import Documents from "@/pages/Documents";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Feedback from "@/pages/Feedback";
import ExternalConnections from "@/pages/ExternalConnections";
import Admin from "@/pages/Admin";
import Today from "@/pages/Today";
import Notifications from "@/pages/Notifications";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AgentProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/" element={<Login />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/today"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Today />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/live-call"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <LiveCall />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Tickets />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Analytics />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent-improvement"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <AgentImprovement />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Messages />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Documents />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Profile />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/feedback"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Feedback />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/external-connections"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <ExternalConnections />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Notifications />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Only Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <MainLayout>
                      <Admin />
                    </MainLayout>
                  </AdminRoute>
                }
              />
            </Routes>
          </Router>
        </AgentProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
