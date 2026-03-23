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
    // Sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Listener de autenticação
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
        {/* HOME (LOGIN OU DASHBOARD DIRETO) */}
        <Route
          path="/"
          element={
            session ? <Index /> : <Login onLoginSuccess={() => {}} />
          }
        />

        {/* RESET PASSWORD */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* QUALQUER OUTRA ROTA REDIRECIONA PRA HOME */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
}