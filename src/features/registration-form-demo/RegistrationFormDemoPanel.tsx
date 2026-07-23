import { useState, type FormEvent } from "react";
import {
  NysTextinput,
  NysTextarea,
  NysCombobox,
  NysDatepicker,
  NysCheckbox,
  NysButton,
  NysAlert,
  NysDivider,
} from "@nysds/components/react";

/**
 * RegistrationFormDemoPanel — a real, submittable NYS-style form built ENTIRELY
 * from NYSDS form-associated custom elements.
 *
 * What this demonstrates (all shipped in @nysds/components 1.19.x):
 *  1. Form participation via ElementInternals: every nys-* control has a `name`
 *     and is form-associated, so `new FormData(formEl)` reads their values
 *     natively — no per-field wiring, no manual value plumbing on submit.
 *  2. Label + error association across the shadow boundary: each control's
 *     built-in label and its `errorMessage` (shown via `showError`) are
 *     associated with the real inner <input> so screen readers announce both.
 *  3. nys-combobox — accessible type-to-filter autocomplete (native <option>s).
 *  4. nys-datepicker — accessible date field with a min-date constraint.
 *
 * Verify it: Chrome DevTools → Accessibility pane (each field's computed Name =
 * its label; errors appear in the a11y tree) and an axe scan (0 name/role/value
 * violations).
 */

const FACILITIES = [
  { value: "minnewaska", label: "Minnewaska State Park Preserve" },
  { value: "letchworth", label: "Letchworth State Park" },
  { value: "niagara", label: "Niagara Falls State Park" },
  { value: "watkins-glen", label: "Watkins Glen State Park" },
  { value: "bear-mountain", label: "Bear Mountain State Park" },
  { value: "montauk", label: "Montauk Point State Park" },
  { value: "adirondack", label: "Adirondack Forest Preserve" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s().+-]{7,}$/;

type Errors = Record<string, string>;


export default function RegistrationFormDemoPanel() {
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<[string, string][] | null>(null);

  // Datepicker min = today (browser runtime), so past dates can't be chosen.
  const todayISO = new Date().toISOString().slice(0, 10);

  const clearError = (field: string) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const validate = (data: FormData): Errors => {
    const next: Errors = {};
    const str = (k: string) => (data.get(k) ?? "").toString().trim();

    if (!str("fullName")) next.fullName = "Enter your full name.";

    const email = str("email");
    if (!email) next.email = "Enter your email address.";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";

    const phone = str("phone"); // optional
    if (phone && !PHONE_RE.test(phone))
      next.phone = "Enter a valid phone number, or leave it blank.";

    if (!str("facility")) next.facility = "Choose a facility.";

    const date = str("visitDate");
    if (!date) next.visitDate = "Choose a visit date.";
    else if (date < todayISO) next.visitDate = "Choose today or a future date.";

    const size = str("groupSize");
    if (!size) next.groupSize = "Enter your group size.";
    else if (!/^\d+$/.test(size) || Number(size) < 1)
      next.groupSize = "Group size must be 1 or more.";

    if (data.get("consent") === null)
      next.consent = "You must acknowledge the guidelines to register.";

    return next;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Proof of form participation: FormData reads the custom elements by `name`.
    const data = new FormData(e.currentTarget);
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setResult(null);
      return;
    }
    setResult(
      Array.from(data.entries()).map(
        ([k, v]) => [k, v.toString()] as [string, string],
      ),
    );
  };

  const handleReset = () => {
    setErrors({});
    setResult(null);
  };

  return (
    <section aria-labelledby="reg-heading">
      <h2 id="reg-heading">Program Registration</h2>
      <p>
        Every field below is a NYSDS form-associated custom element. On submit,
        the browser&apos;s native <code>FormData</code> reads their values by{" "}
        <code>name</code> — the same way it would for plain HTML inputs.
      </p>

      <NysDivider />

      <form onSubmit={handleSubmit} onReset={handleReset} noValidate>
        <div className="component-grid">
          <NysTextinput
            name="fullName"
            label="Full name"
            required
            width="lg"
            showError={!!errors.fullName}
            errorMessage={errors.fullName}
            onNysInput={() => clearError("fullName")}
          />

          <NysTextinput
            name="email"
            type="email"
            label="Email"
            description="We'll send your confirmation here."
            required
            width="lg"
            showError={!!errors.email}
            errorMessage={errors.email}
            onNysInput={() => clearError("email")}
          />

          <NysTextinput
            name="phone"
            type="tel"
            label="Phone"
            optional
            width="md"
            showError={!!errors.phone}
            errorMessage={errors.phone}
            onNysInput={() => clearError("phone")}
          />

          <NysCombobox
            name="facility"
            label="Preferred facility"
            description="Type to filter the list."
            required
            width="lg"
            showError={!!errors.facility}
            errorMessage={errors.facility}
            onNysChange={() => clearError("facility")}
            onNysInput={() => clearError("facility")}
          >
            {FACILITIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </NysCombobox>

          <NysDatepicker
            name="visitDate"
            label="Visit date"
            required
            width="md"
            minDate={todayISO}
            showError={!!errors.visitDate}
            errorMessage={errors.visitDate}
            onNysInput={() => clearError("visitDate")}
          />

          <NysTextinput
            name="groupSize"
            type="number"
            label="Group size"
            min={1}
            required
            width="sm"
            showError={!!errors.groupSize}
            errorMessage={errors.groupSize}
            onNysInput={() => clearError("groupSize")}
          />

          <NysTextarea
            name="comments"
            label="Comments"
            optional
            width="lg"
            maxlength={500}
            rows={3}
          />

          <NysCheckbox
            name="consent"
            value="yes"
            label="I have read the facility guidelines and agree to follow them."
            required
            showError={!!errors.consent}
            errorMessage={errors.consent}
            onNysChange={() => clearError("consent")}
          />
        </div>

        <br />
        <div className="component-row">
          <NysButton type="submit" label="Register" />
          <NysButton type="reset" variant="outline" label="Clear" />
        </div>
      </form>

      <div aria-live="polite">
        {result && (
          <>
            <br />
            <NysAlert
              type="success"
              heading="Registration received"
              dismissible
            >
              <p>The form submitted these values (read via native FormData):</p>
              <dl className="reg-summary">
                {result.map(([k, v]) => (
                  <div key={k} className="reg-summary__row">
                    <dt>{k}</dt>
                    <dd>{v || "—"}</dd>
                  </div>
                ))}
              </dl>
            </NysAlert>
          </>
        )}
      </div>
    </section>
  );
}
