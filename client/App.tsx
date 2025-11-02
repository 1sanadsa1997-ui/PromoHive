import "./global.css";
import "../src/i18n";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";

// Invoices
import InvoicesIn from "./pages/invoices/InvoicesIn";
import InvoicesOut from "./pages/invoices/InvoicesOut";
import InvoiceForm from "./pages/invoices/InvoiceForm";

// Inventory
import Inventory from "./pages/inventory/Inventory";
import Products from "./pages/inventory/Products";
import StockMovements from "./pages/inventory/StockMovements";

// Employees
import Employees from "./pages/employees/Employees";
import Payroll from "./pages/employees/Payroll";

// Partners
import Partners from "./pages/partners/Partners";

// Reports
import Reports from "./pages/reports/Reports";

// Settings
import Settings from "./pages/Settings";
import Subscription from "./pages/Subscription";

// Layout
import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";

// Providers
import { AuthProvider } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SubscriptionProvider>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                </Route>

                {/* Protected App Routes */}
                <Route element={<AppLayout />}>
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={<Dashboard />} />

                  {/* Invoices */}
                  <Route path="invoices">
                    <Route path="in" element={<InvoicesIn />} />
                    <Route path="out" element={<InvoicesOut />} />
                    <Route path="in/new" element={<InvoiceForm type="in" />} />
                    <Route path="out/new" element={<InvoiceForm type="out" />} />
                    <Route path="in/edit/:id" element={<InvoiceForm type="in" />} />
                    <Route path="out/edit/:id" element={<InvoiceForm type="out" />} />
                  </Route>

                  {/* Inventory */}
                  <Route path="inventory">
                    <Route index element={<Inventory />} />
                    <Route path="products" element={<Products />} />
                    <Route path="movements" element={<StockMovements />} />
                  </Route>

                  {/* Employees */}
                  <Route path="employees">
                    <Route index element={<Employees />} />
                    <Route path="payroll" element={<Payroll />} />
                  </Route>

                  {/* Partners */}
                  <Route path="partners" element={<Partners />} />

                  {/* Reports */}
                  <Route path="reports" element={<Reports />} />

                  {/* Settings */}
                  <Route path="settings" element={<Settings />} />
                  <Route path="subscription" element={<Subscription />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
