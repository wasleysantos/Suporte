import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

import Index from "@/pages/Index";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";

import { Toaster } from "sonner";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // pega sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // escuta mudanças de login/logout/reset
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/"
          element={
            session ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLoginSuccess={() => {}} />
            )
          }
        />

        {/* DASHBOARD (PROTEGIDO) */}
        <Route
          path="/dashboard"
          element={session ? <Index /> : <Navigate to="/" />}
        />

        {/* RESET PASSWORD */}
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}