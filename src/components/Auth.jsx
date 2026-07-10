import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import BrandLockup from "./brand/BrandLockup";
import {
  Button,
  Card,
  FormField,
  Icon,
  Input,
  useToast,
} from "./ui";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorDescription = params.get("error_description");
    if (errorDescription) {
      showToast({
        title: "Email link could not be completed",
        message: errorDescription,
        variant: "error",
        duration: 8000,
      });
    }
  }, [showToast]);

  const handleAuth = async (event) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Enter your email address.";
    if (!password) nextErrors.password = "Enter your password.";
    if (password && password.length < 6) {
      nextErrors.password = "Use at least six characters.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setLoading(true);
      const authAction =
        mode === "signup"
          ? supabase.auth.signUp({
              email: email.trim(),
              password,
              options: { emailRedirectTo: `${window.location.origin}/` },
            })
          : supabase.auth.signInWithPassword({ email: email.trim(), password });

      const { error } = await authAction;
      if (error) throw error;

      if (mode === "signup") {
        showToast({
          title: "Account created",
          message: "Check your email to confirm your AnyPetOS account.",
          variant: "success",
          duration: 7000,
        });
      }
    } catch (error) {
      showToast({
        title: mode === "signup" ? "Account not created" : "Sign in failed",
        message: error?.message || "Please check your details and try again.",
        variant: "error",
        duration: 6500,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((current) => (current === "signup" ? "login" : "signup"));
    setErrors({});
  };

  return (
    <div className="loginScreen onboardingScreen">
      <Card className="onboardingCard authCard">
        <div className="authBrand">
          <BrandLockup />
        </div>

        <div className="authIntro">
          <p className="section-eyebrow">
            {mode === "signup" ? "Create your workspace" : "Secure sign in"}
          </p>
          <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <p>
            {mode === "signup"
              ? "Create one lifelong care record that stays ready wherever your animal goes."
              : "Return to your animals, care plans, records, and trusted workspaces."}
          </p>
        </div>

        <form className="authForm" onSubmit={handleAuth} noValidate>
          <FormField label="Email address" error={errors.email}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                error={Boolean(errors.email)}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((current) => ({ ...current, email: undefined }));
                }}
              />
            )}
          </FormField>

          <FormField label="Password" error={errors.password}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="At least six characters"
                value={password}
                error={Boolean(errors.password)}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({ ...current, password: undefined }));
                }}
              />
            )}
          </FormField>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            leftIcon={<Icon name={mode === "signup" ? "plus" : "shield"} size={18} />}
          >
            {mode === "signup" ? "Create account" : "Sign in"}
          </Button>

          <Button type="button" variant="ghost" fullWidth onClick={toggleMode}>
            {mode === "signup"
              ? "Already have an account? Sign in"
              : "New to AnyPetOS? Create an account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
