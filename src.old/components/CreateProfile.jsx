import { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { USER_ROLES } from "../constants/roles";
import {
  Button,
  Card,
  FormField,
  Icon,
  Input,
  useToast,
} from "./ui";

export default function CreateProfile({ session }) {
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    role: "owner",
    avatarUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();

  const createProfile = async (event) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors = {};
    if (!form.displayName.trim()) nextErrors.displayName = "Enter a display name.";
    if (!form.username.trim()) nextErrors.username = "Choose a username.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const cleanUsername = form.username.trim().toLowerCase().replace(/\s+/g, "");

    try {
      setLoading(true);
      const { error } = await supabase.from("profiles").insert({
        id: session.user.id,
        display_name: form.displayName.trim(),
        username: cleanUsername,
        role: form.role,
        avatar_url: form.avatarUrl.trim() || null,
      });
      if (error) throw error;

      showToast({
        title: "Workspace created",
        message: "Your PetPassport profile is ready.",
        variant: "success",
      });
      window.location.reload();
    } catch (error) {
      showToast({
        title: "Workspace not created",
        message: error?.message || "Please check your details and try again.",
        variant: "error",
        duration: 6500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginScreen onboardingScreen">
      <Card className="onboardingCard createProfileCard">
        <div className="authBrand">
          <span className="authBrandMark" aria-hidden="true">
            <Icon name="scan" size={25} />
          </span>
          <div>
            <p className="authBrandName">PetPassport</p>
            <p className="authBrandTagline">Set up your care workspace</p>
          </div>
        </div>

        <div className="authIntro">
          <p className="section-eyebrow">Profile setup</p>
          <h1>Create your workspace</h1>
          <p>Choose the workspace that best matches how you care for animals.</p>
        </div>

        <form className="profileSetupForm" onSubmit={createProfile} noValidate>
          <div className="formGrid">
            <FormField label="Display name" error={errors.displayName}>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  placeholder="For example, Morgan"
                  value={form.displayName}
                  error={Boolean(errors.displayName)}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, displayName: event.target.value }));
                    setErrors((current) => ({ ...current, displayName: undefined }));
                  }}
                />
              )}
            </FormField>

            <FormField label="Username" error={errors.username}>
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  placeholder="For example, senpaimorgan"
                  value={form.username}
                  error={Boolean(errors.username)}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, username: event.target.value }));
                    setErrors((current) => ({ ...current, username: undefined }));
                  }}
                />
              )}
            </FormField>
          </div>

          <fieldset className="workspaceFieldset">
            <legend>Choose your workspace</legend>
            <div className="roleGrid">
              {USER_ROLES.map((role) => {
                const selected = form.role === role.id;
                return (
                  <button
                    key={role.id}
                    className={`roleCard${selected ? " selectedRoleCard" : ""}`}
                    aria-pressed={selected}
                    onClick={() => setForm((current) => ({ ...current, role: role.id }))}
                    type="button"
                  >
                    <span className="roleCardIcon" aria-hidden="true">
                      <Icon name={role.icon} size={21} />
                    </span>
                    <span className="roleCardCopy">
                      <strong>{role.label}</strong>
                      <small>{role.description}</small>
                    </span>
                    {selected && <Icon name="check" size={18} className="roleCardCheck" />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <FormField label="Avatar image URL" optional hint="You can add or change this later.">
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={form.avatarUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, avatarUrl: event.target.value }))
                }
              />
            )}
          </FormField>

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            leftIcon={<Icon name="check" size={18} />}
          >
            Create workspace
          </Button>
        </form>
      </Card>
    </div>
  );
}
