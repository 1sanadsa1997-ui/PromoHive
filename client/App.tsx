import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import TaskComplete from "./pages/TaskComplete";
import Admin from "./pages/admin/Admin";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Analytics from "./pages/Analytics";
import Earnings from "./pages/Earnings";
import { AuthProvider } from "./hooks/useAuth";
import { AdminProvider } from "./hooks/useAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AdminProvider>
            <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Public / user pages */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />

              <Route path="tasks" element={<Tasks />} />
              <Route path="tasks/:id" element={<TaskDetails />} />
              <Route path="complete/:id" element={<TaskComplete />} />

              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="earnings" element={<Earnings />} />

              {/* Admin */}
              <Route path="admin" element={<Admin />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
