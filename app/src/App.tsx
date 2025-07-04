import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useInitializeUser } from "@/hooks";
import Dashboard from "@/pages/Dashboard";
import LiveCall from "@/pages/LiveCall";
import Tickets from "@/pages/Tickets";
import Analytics from "@/pages/Analytics";
import Admin from "@/pages/Admin";
import Messages from "@/pages/Messages";
import Documents from "@/pages/Documents";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";

function App() {
  // Initialize user data on app startup
  useInitializeUser();

  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/live-call" element={<LiveCall />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
