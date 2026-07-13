import { useEffect, useMemo, useRef, useState } from "react";
import {
  getRememberMePreference,
  setRememberMePreference,
  supabase,
} from "../services/supabaseClient";
import BrandLockup from "./brand/BrandLockup";
import {
  Button,
  Card,
  FormField,
  Icon,
  Input,
  useToast,
} from "./ui";

const WORKSPACES = [
  {
    id: "owner",
    label: "Pet Owner",
    icon: "paw",
    headline: "Every animal's story, organized for life.",
    copy: "Keep daily care, health records, medications, milestones, photos, and important documents together in one secure passport.",
    features: [
      "Digital animal passports",
      "Feeding and care logs",
      "Medication schedules",
      "Calendar and reminders",
      "Weight and growth history",
      "Secure files and transfers",
    ],
  },
  {
    id: "breeder",
    label: "Breeder",
    icon: "dna",
    headline: "Built for breeding programs and busy expo days.",
    copy: "Manage animals, customer records, agreements, care history, and ownership transfers from one professional workspace.",
    features: [
      "Expo Mode and QR transfers",
      "Reusable sales agreements",
      "Animal and lineage records",
      "Customer transfer history",
      "Medication and care tracking",
      "Founding Breeder badge",
    ],
  },
  {
    id: "rescue",
    label: "Rescue",
    icon: "heartPulse",
    headline: "Carry the full story from intake to adoption.",
    copy: "Organize health history, treatment, documents, behavior notes, and adoption records without scattering information across systems.",
    features: [
      "Intake and animal records",
      "Medication treatment plans",
      "Adoption agreements",
      "Transfer-ready documents",
      "Care and behavior notes",
      "Permanent adoption history",
    ],
  },
  {
    id: "veterinary",
    label: "Veterinary",
    icon: "stethoscope",
    headline: "A clearer view of each patient's ongoing care.",
    copy: "Review organized animal records, treatment history, files, medications, and owner-shared information in one place.",
    features: [
      "Patient care records",
      "Medication history",
      "Visit and appointment notes",
      "Health document storage",
      "Owner-shared passports",
      "Multi-species support",
    ],
  },
  {
    id: "education",
    label: "Education & Zoo",
    icon: "graduationCap",
    headline: "Coordinate care across collections and teams.",
    copy: "Keep husbandry, health, schedules, documents, and animal histories accessible for education programs and managed collections.",
    features: [
      "Collection-wide passports",
      "Team-ready care records",
      "Health and husbandry logs",
      "Files and permits",
      "Calendar planning",
      "Multi-species organization",
    ],
  },
  {
    id: "sitter",
    label: "Pet Sitter",
    icon: "users",
    headline: "The right care instructions, wherever the owner is.",
    copy: "Access shared routines, medication instructions, emergency details, and daily care notes for every animal in your care.",
    features: [
      "Shared care instructions",
      "Medication directions",
      "Daily task tracking",
      "Emergency information",
      "Multi-pet schedules",
      "Owner communication records",
    ],
  },
];

const FEATURES = [
  {
    id: "passports",
    icon: "book",
    title: "Digital Passports",
    summary: "A lifelong home for identity, care, health, photos, and milestones.",
    detail: "Each animal receives an organized digital passport that can grow with them and travel securely when ownership changes.",
  },
  {
    id: "medication",
    icon: "pill",
    title: "Medication Tracking",
    summary: "Plan, record, and review treatment without calendar math.",
    detail: "Create dose-based or day-based courses, record actual administration times, and view past, current, and future doses on one calendar.",
  },
  {
    id: "calendar",
    icon: "calendar",
    title: "Smart Calendar",
    summary: "See medications, appointments, and care schedules together.",
    detail: "A shared scheduling engine keeps upcoming care visible across the dashboard, calendar, and animal records.",
  },
  {
    id: "documents",
    icon: "file",
    title: "Documents",
    summary: "Store records, agreements, permits, receipts, and care sheets securely.",
    detail: "Build a reusable document library, link files to the correct animal, and attach selected agreements during transfers.",
  },
  {
    id: "expo",
    icon: "scan",
    title: "Expo Mode",
    summary: "Move from conversation to completed transfer in minutes.",
    detail: "Attach an agreement, let the recipient review and accept it, and transfer the animal's passport through a secure QR-powered flow.",
  },
  {
    id: "care",
    icon: "activity",
    title: "Care History",
    summary: "Track feedings, sheds, weight, behavior, and everyday care.",
    detail: "Turn scattered notes into a clear timeline that helps owners and professionals understand each animal over time.",
  },
];

const SPECIES = [
  "Snakes",
  "Lizards",
  "Turtles",
  "Birds",
  "Dogs",
  "Cats",
  "Fish",
  "Invertebrates",
  "Small Mammals",
  "Livestock",
];

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(getRememberMePreference);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedWorkspace, setSelectedWorkspace] = useState("breeder");
  const [selectedFeature, setSelectedFeature] = useState(null);
  const authRef = useRef(null);
  const featuresRef = useRef(null);
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

  const activeWorkspace = useMemo(
    () => WORKSPACES.find((workspace) => workspace.id === selectedWorkspace) || WORKSPACES[0],
    [selectedWorkspace]
  );

  const scrollToAuth = (nextMode = mode) => {
    setMode(nextMode);
    setErrors({});
    setPassword("");
    window.requestAnimationFrame(() => {
      authRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Enter your email address.";
    if (mode !== "forgot" && !password) nextErrors.password = "Enter your password.";
    if (mode !== "forgot" && password && password.length < 6) {
      nextErrors.password = "Use at least six characters.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setLoading(true);

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/`,
        });
        if (error) throw error;

        showToast({
          title: "Reset email sent",
          message: "Check your inbox for the secure password-reset link.",
          variant: "success",
          duration: 7000,
        });
        setMode("login");
        return;
      }

      setRememberMePreference(rememberMe);

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
      const title =
        mode === "signup"
          ? "Account not created"
          : mode === "forgot"
            ? "Reset email not sent"
            : "Sign in failed";

      showToast({
        title,
        message: error?.message || "Please check your details and try again.",
        variant: "error",
        duration: 6500,
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setPassword("");
  };

  const isForgot = mode === "forgot";
  const authTitle =
    mode === "signup"
      ? "Create your account"
      : isForgot
        ? "Reset your password"
        : "Sign in to AnyPetOS";

  return (
    <div className="publicLanding">
      <div className="publicAnnouncement">
        <Icon name="star" size={16} />
        <span><strong>Founding Beta is open.</strong> The first 150 members in each workspace receive a permanent numbered badge.</span>
        <button type="button" onClick={() => scrollToAuth("signup")}>Claim your place</button>
      </div>

      <header className="publicHeader">
        <BrandLockup />
        <nav aria-label="Public navigation">
          <button type="button" onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth" })}>Features</button>
          <button type="button" onClick={() => document.getElementById("workspace-preview")?.scrollIntoView({ behavior: "smooth" })}>Workspaces</button>
          <button type="button" className="publicHeaderSignIn" onClick={() => scrollToAuth("login")}>Sign in</button>
        </nav>
      </header>

      <main>
        <section className="publicHero">
          <div className="publicHeroCopy">
            <p className="publicEyebrow">One platform. Every species. Every stage of care.</p>
            <h1>Welcome to AnyPetOS</h1>
            <p className="publicMotto">Any time. Any place. Any pet.</p>
            <p className="publicHeroLead">
              Manage every animal, every record, every transfer, and every milestone from one secure digital home.
            </p>
            <div className="publicHeroActions">
              <Button size="lg" onClick={() => scrollToAuth("signup")} leftIcon={<Icon name="plus" size={18} />}>
                Create free account
              </Button>
              <Button size="lg" variant="secondary" onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth" })} leftIcon={<Icon name="sparkles" size={18} />}>
                Explore features
              </Button>
            </div>
            <div className="publicTrustRow" aria-label="AnyPetOS highlights">
              <span><Icon name="shield" size={16} /> Secure records</span>
              <span><Icon name="scan" size={16} /> Expo-ready transfers</span>
              <span><Icon name="paw" size={16} /> Built for every animal</span>
            </div>
          </div>

          <div className="publicHeroPreview" aria-label="AnyPetOS product preview">
            <div className="previewWindowBar">
              <span /> <span /> <span />
              <strong>AnyPetOS workspace</strong>
            </div>
            <div className="previewStats">
              <article><small>Care due today</small><strong>4</strong><span>Across 9 animals</span></article>
              <article><small>Upcoming doses</small><strong>7</strong><span>Next 14 days</span></article>
              <article><small>Transfer-ready</small><strong>3</strong><span>Documents attached</span></article>
            </div>
            <div className="previewTimeline">
              <div><Icon name="pill" size={18} /><span><strong>Medication due</strong><small>Big Mama · 8:00 PM</small></span><b>Today</b></div>
              <div><Icon name="calendar" size={18} /><span><strong>Feeding scheduled</strong><small>Legolas · Tomorrow</small></span><b>Upcoming</b></div>
              <div><Icon name="scan" size={18} /><span><strong>Expo transfer ready</strong><small>Agreement attached</small></span><b>Ready</b></div>
            </div>
          </div>
        </section>

        <section className="publicSection" id="workspace-preview">
          <div className="publicSectionHeading">
            <p className="publicEyebrow">Built around the way you work</p>
            <h2>Choose a workspace. See what AnyPetOS can do for you.</h2>
            <p>Explore role-specific tools before creating an account.</p>
          </div>

          <div className="workspaceTabs" role="tablist" aria-label="AnyPetOS workspaces">
            {WORKSPACES.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                role="tab"
                aria-selected={workspace.id === selectedWorkspace}
                className={workspace.id === selectedWorkspace ? "is-active" : ""}
                onClick={() => setSelectedWorkspace(workspace.id)}
              >
                <Icon name={workspace.icon} size={20} />
                <span>{workspace.label}</span>
              </button>
            ))}
          </div>

          <div className="workspaceDetail" role="tabpanel">
            <div>
              <span className="workspaceDetailIcon"><Icon name={activeWorkspace.icon} size={28} /></span>
              <p className="publicEyebrow">{activeWorkspace.label} workspace</p>
              <h3>{activeWorkspace.headline}</h3>
              <p>{activeWorkspace.copy}</p>
              <Button onClick={() => scrollToAuth("signup")} leftIcon={<Icon name="plus" size={17} />}>
                Join as a {activeWorkspace.label}
              </Button>
            </div>
            <ul>
              {activeWorkspace.features.map((feature) => (
                <li key={feature}><Icon name="check" size={17} /> {feature}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="publicSection publicFeatureSection" ref={featuresRef}>
          <div className="publicSectionHeading">
            <p className="publicEyebrow">Explore AnyPetOS</p>
            <h2>Everything important, finally in one place.</h2>
            <p>Click any feature to see how it helps.</p>
          </div>
          <div className="publicFeatureGrid">
            {FEATURES.map((feature) => (
              <button key={feature.id} type="button" onClick={() => setSelectedFeature(feature)}>
                <span><Icon name={feature.icon} size={23} /></span>
                <strong>{feature.title}</strong>
                <p>{feature.summary}</p>
                <small>View feature <Icon name="chevronRight" size={14} /></small>
              </button>
            ))}
          </div>
        </section>

        <section className="publicExpoSection">
          <div className="publicExpoCopy">
            <p className="publicEyebrow">Feature spotlight</p>
            <h2>Expo Mode turns paperwork into a smooth handoff.</h2>
            <p>Designed for breeders, rescues, and live animal events where speed matters but records still need to be complete.</p>
            <Button variant="secondary" onClick={() => setSelectedFeature(FEATURES.find((feature) => feature.id === "expo"))} leftIcon={<Icon name="scan" size={18} />}>
              Explore Expo Mode
            </Button>
          </div>
          <ol className="expoFlow" aria-label="Expo Mode flow">
            <li><span>1</span><div><strong>Choose the animal</strong><small>Open the correct digital passport.</small></div></li>
            <li><span>2</span><div><strong>Attach agreements</strong><small>Select reusable sales or adoption documents.</small></div></li>
            <li><span>3</span><div><strong>Customer scans</strong><small>Share a secure QR-powered transfer link.</small></div></li>
            <li><span>4</span><div><strong>Review and accept</strong><small>Recipient confirms the required documents.</small></div></li>
            <li><span>5</span><div><strong>Passport transfers</strong><small>Records move with the animal.</small></div></li>
          </ol>
        </section>

        <section className="publicSection publicComparisonSection">
          <div className="publicSectionHeading">
            <p className="publicEyebrow">Why AnyPetOS?</p>
            <h2>Less searching. Less guessing. Better continuity of care.</h2>
          </div>
          <div className="comparisonGrid">
            <article>
              <p>Scattered systems</p>
              <ul>
                <li><Icon name="close" size={16} /> Paper notebooks and sticky notes</li>
                <li><Icon name="close" size={16} /> Agreements buried in folders</li>
                <li><Icon name="close" size={16} /> Medication math done manually</li>
                <li><Icon name="close" size={16} /> Records lost during transfers</li>
              </ul>
            </article>
            <article className="is-anypetos">
              <p>With AnyPetOS</p>
              <ul>
                <li><Icon name="check" size={16} /> One secure animal passport</li>
                <li><Icon name="check" size={16} /> Organized, reusable documents</li>
                <li><Icon name="check" size={16} /> Scheduled doses and care reminders</li>
                <li><Icon name="check" size={16} /> QR-powered ownership transfers</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="publicFoundingSection">
          <div className="foundingBadgePreview"><Icon name="star" size={38} /><strong>FOUNDING 150</strong><span>Beta Tester · #001</span></div>
          <div>
            <p className="publicEyebrow">Join the founding community</p>
            <h2>Be remembered as one of the first.</h2>
            <p>The first 150 members in each workspace receive a permanent, numbered Founding Beta Tester badge displayed on their profile.</p>
            <Button size="lg" onClick={() => scrollToAuth("signup")} leftIcon={<Icon name="star" size={18} />}>
              Claim a founding place
            </Button>
          </div>
        </section>

        <section className="publicSection speciesSection">
          <div className="publicSectionHeading">
            <p className="publicEyebrow">Not another one-species app</p>
            <h2>Built for every animal you care for.</h2>
          </div>
          <div className="speciesCloud">
            {SPECIES.map((species) => <span key={species}>{species}</span>)}
            <span>And more</span>
          </div>
        </section>

        <section className="publicFounderSection">
          <div className="founderMark"><Icon name="paw" size={34} /></div>
          <div>
            <p className="publicEyebrow">Why I built AnyPetOS</p>
            <h2>Created from real animal-care problems, not a generic software checklist.</h2>
            <p>After managing reptiles and other animals, I saw how quickly medication schedules, paperwork, care notes, and ownership records could become scattered. AnyPetOS was built to bring those pieces together for every species and every role.</p>
            <p className="founderSignature">Morgan Mendoza · Founder, AnyPetOS</p>
          </div>
        </section>

        <section className="publicAuthSection" ref={authRef}>
          <div className="publicAuthPitch">
            <p className="publicEyebrow">Ready when you are</p>
            <h2>{mode === "login" ? "Welcome to AnyPetOS" : mode === "signup" ? "Start your AnyPetOS workspace" : "Get back into your account"}</h2>
            <p className="publicMotto">Any time. Any place. Any pet.</p>
            <p>{mode === "login" ? "Sign in to continue, or create your free account and explore a workspace built around the way you care for animals." : "Your first workspace takes only a moment to create."}</p>
          </div>

          <Card className="onboardingCard authCard publicAuthCard">
            <div className="authBrand"><BrandLockup /></div>
            <div className="authIntro">
              <p className="section-eyebrow">
                {mode === "signup" ? "Create your workspace" : isForgot ? "Account recovery" : "Secure sign in"}
              </p>
              <h2>{authTitle}</h2>
              <p>
                {mode === "signup"
                  ? "Create one lifelong care record that stays ready wherever your animal goes."
                  : isForgot
                    ? "Enter your email and AnyPetOS will send a secure reset link."
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

              {!isForgot && (
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
              )}

              {mode === "login" && (
                <label className="authRememberRow">
                  <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                  <span>
                    <strong>Remember me</strong>
                    <small>{rememberMe ? "Stay signed in on this device." : "Sign out when this browser session ends."}</small>
                  </span>
                </label>
              )}

              <Button type="submit" fullWidth size="lg" loading={loading} leftIcon={<Icon name={isForgot ? "mail" : mode === "signup" ? "plus" : "shield"} size={18} />}>
                {isForgot ? "Send reset link" : mode === "signup" ? "Create account" : "Sign in"}
              </Button>

              {mode === "login" && (
                <Button type="button" variant="ghost" fullWidth onClick={() => switchMode("forgot")}>Forgot your password?</Button>
              )}

              <Button type="button" variant="ghost" fullWidth onClick={() => switchMode(mode === "signup" ? "login" : mode === "login" ? "signup" : "login")}>
                {mode === "signup" ? "Already have an account? Sign in" : mode === "login" ? "New to AnyPetOS? Create an account" : "Back to sign in"}
              </Button>
            </form>
          </Card>
        </section>
      </main>

      <footer className="publicFooter">
        <BrandLockup />
        <p>Any time. Any place. Any pet.</p>
        <span>Private beta · Built for every species and every role.</span>
      </footer>

      {selectedFeature && (
        <div className="featureDialogBackdrop" role="presentation" onMouseDown={() => setSelectedFeature(null)}>
          <section className="featureDialog" role="dialog" aria-modal="true" aria-labelledby="feature-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="featureDialogClose" type="button" aria-label="Close feature details" onClick={() => setSelectedFeature(null)}><Icon name="close" size={20} /></button>
            <span className="featureDialogIcon"><Icon name={selectedFeature.icon} size={30} /></span>
            <p className="publicEyebrow">Feature preview</p>
            <h2 id="feature-dialog-title">{selectedFeature.title}</h2>
            <p>{selectedFeature.detail}</p>
            <div className="featureDialogMock">
              <Icon name={selectedFeature.icon} size={28} />
              <div><strong>{selectedFeature.summary}</strong><small>Available inside your AnyPetOS workspace.</small></div>
            </div>
            <Button fullWidth size="lg" onClick={() => { setSelectedFeature(null); scrollToAuth("signup"); }} leftIcon={<Icon name="plus" size={18} />}>
              Create free account
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}
