import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import BrandLockup from "./brand/BrandLockup";
import { Button, Card, FormField, Icon, Input, useToast } from "./ui";

export default function PasswordRecovery({ onComplete }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors = {};
    if (password.length < 8) nextErrors.password = "Use at least eight characters.";
    if (confirmPassword !== password) nextErrors.confirmPassword = "The passwords do not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      window.history.replaceState({}, document.title, window.location.pathname);
      showToast({
        title: "Password updated",
        message: "Your new password is ready to use.",
        variant: "success",
      });
      onComplete?.();
    } catch (error) {
      showToast({
        title: "Password not updated",
        message: error?.message || "Please request a new reset link and try again.",
        variant: "error",
        duration: 7000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginScreen onboardingScreen">
      <Card className="onboardingCard authCard">
        <div className="authBrand"><BrandLockup /></div>
        <div className="authIntro">
          <p className="section-eyebrow">Secure account recovery</p>
          <h1>Choose a new password</h1>
          <p>Use a password that is unique to AnyPetOS and at least eight characters long.</p>
        </div>

        <form className="authForm" onSubmit={handleSubmit} noValidate>
          <FormField label="New password" error={errors.password}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="password"
                autoComplete="new-password"
                value={password}
                error={Boolean(errors.password)}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({ ...current, password: undefined }));
                }}
              />
            )}
          </FormField>

          <FormField label="Confirm new password" error={errors.confirmPassword}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                error={Boolean(errors.confirmPassword)}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setErrors((current) => ({ ...current, confirmPassword: undefined }));
                }}
              />
            )}
          </FormField>

          <Button type="submit" fullWidth size="lg" loading={loading} leftIcon={<Icon name="shield" size={18} />}>
            Save new password
          </Button>
        </form>
      </Card>
    </div>
  );
}
