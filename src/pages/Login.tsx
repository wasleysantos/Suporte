import { useState, type FormEvent } from "react";
import {
  Mail,
  Lock,
  LogIn,
  Database,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import backgroundImage from "@/assets/background.png";

type LoginProps = {
  onLoginSuccess: () => void;
};

type AuthMode = "login" | "signup";

export default function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const normalizeEmail = (value: string) => value.trim().toLowerCase();

  const isAllowedEmail = (value: string) => {
    return normalizeEmail(value).endsWith("@pmenos.com.br");
  };

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const resetSignupFields = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !password.trim()) {
      const msg = "Preencha e-mail e senha.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!isAllowedEmail(email)) {
      const msg = "Apenas e-mails com final @pmenos.com.br são permitidos.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });

      if (error) throw error;

      const msg = "Login realizado com sucesso!";
      setSuccessMessage(msg);
      toast.success(msg);
      onLoginSuccess();
    } catch (error: any) {
      console.error("Erro no login:", error);
      const msg = error?.message || "Não foi possível entrar.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      const msg = "Preencha e-mail, senha e confirmação.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!isAllowedEmail(email)) {
      const msg = "Só é permitido criar conta com e-mail @pmenos.com.br.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = "A senha deve ter pelo menos 6 caracteres.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = "As senhas não conferem.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizeEmail(email),
        password,
      });

      if (error) throw error;

      const needsEmailConfirmation =
        !data.session && data.user && !data.user.email_confirmed_at;

      const msg = needsEmailConfirmation
        ? "Usuário criado com sucesso! Verifique seu e-mail para confirmar a conta."
        : "Usuário criado com sucesso! Agora você já pode entrar.";

      setSuccessMessage(msg);
      toast.success(msg);

      setMode("login");
      resetSignupFields();
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      const msg = error?.message || "Não foi possível criar o usuário.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!resetEmail.trim()) {
      const msg = "Informe seu e-mail.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!isAllowedEmail(resetEmail)) {
      const msg = "Use um e-mail @pmenos.com.br.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizeEmail(resetEmail),
        {
          redirectTo: "http://localhost:5173/reset-password",
        },
      );

      if (error) throw error;

      const msg =
        "Enviamos o link de recuperação para seu e-mail.";
      setSuccessMessage(msg);
      toast.success(msg);
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Erro ao enviar recuperação:", error);
      const msg = error?.message || "Não foi possível enviar o e-mail de recuperação.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md border-white/20 bg-white/10 text-white backdrop-blur-md shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/90 shadow-lg">
              <Database className="h-7 w-7 text-white" />
            </div>

            <div>
              <CardTitle className="text-2xl font-bold">Suporte TI</CardTitle>
              <p className="mt-1 text-sm text-white/70">
                {mode === "login"
                  ? "Acesse a base de conhecimento"
                  : "Crie seu usuário corporativo"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-1">
              <Button
                type="button"
                variant={mode === "login" ? "default" : "ghost"}
                onClick={() => {
                  setMode("login");
                  clearMessages();
                }}
                className="w-full"
              >
                Entrar
              </Button>

              <Button
                type="button"
                variant={mode === "signup" ? "default" : "ghost"}
                onClick={() => {
                  setMode("signup");
                  clearMessages();
                }}
                className="w-full"
              >
                Criar usuário
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={mode === "login" ? handleLogin : handleSignUp}
              className="space-y-4"
            >
              {errorMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-2 text-sm text-red-100">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-green-400/30 bg-green-500/15 px-3 py-2 text-sm text-green-100">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  <Input
                    type="email"
                    placeholder="seunome@pmenos.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50"
                  />
                </div>
                <p className="text-xs text-white/60">
                  Apenas e-mails corporativos @pmenos.com.br
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  <Input
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              {mode === "signup" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmar senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                    <Input
                      type="password"
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/50"
                    />
                  </div>
                </div>
              )}

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(!showForgotPassword);
                    clearMessages();
                    setResetEmail(email);
                  }}
                  className="text-sm text-white/80 underline-offset-4 hover:text-white hover:underline"
                >
                  Esqueci minha senha
                </button>
              )}

              {showForgotPassword && mode === "login" && (
                <div className="space-y-3 rounded-xl border border-white/15 bg-white/10 p-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      E-mail para recuperação
                    </label>
                    <Input
                      type="email"
                      placeholder="seunome@pmenos.com.br"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="w-full"
                  >
                    {resetLoading ? "Enviando..." : "Enviar link de recuperação"}
                  </Button>
                </div>
              )}

              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {mode === "login" ? (
                  <>
                    <LogIn className="h-4 w-4" />
                    {loading ? "Entrando..." : "Entrar"}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {loading ? "Criando..." : "Criar usuário"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}