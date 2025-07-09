import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useInitializeUser } from "@/hooks";
import Login from "@/pages/Login";
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

function App() {
  // Initialize user data on app startup
  useInitializeUser();

  return (
    <Router>
      <Routes>
        {/* Login Page - Main Entry Point */}
        <Route path="/" element={<Login />} />
        
        {/* Protected Routes with MainLayout */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/live-call"
          element={
            <MainLayout>
              <LiveCall />
            </MainLayout>
          }
        />
        <Route
          path="/tickets"
          element={
            <MainLayout>
              <Tickets />
            </MainLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <MainLayout>
              <Analytics />
            </MainLayout>
          }
        />
        <Route
          path="/agent-improvement"
          element={
            <MainLayout>
              <AgentImprovement />
            </MainLayout>
          }
        />
        <Route
          path="/messages"
          element={
            <MainLayout>
              <Messages />
            </MainLayout>
          }
        />
        <Route
          path="/documents"
          element={
            <MainLayout>
              <Documents />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <MainLayout>
              <Profile />
            </MainLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <MainLayout>
              <Settings />
            </MainLayout>
          }
        />
        <Route
          path="/feedback"
          element={
            <MainLayout>
              <Feedback />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
