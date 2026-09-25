"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import DashboardShell from "@/src/modules/dashboard/components/DashboardShell";
import {
  changePassword,
  updateProfile,
} from "@/src/modules/auth/services/authServices";
import { useAdminSettings } from "@/src/modules/settings/hooks/useAdminSettings";
import { updateAdminSettings } from "@/src/modules/settings/services/admin-settings";
import { useAppDispatch, useAppSelector } from "@/src/store/hook";
import { signInSucceeded } from "@/src/store/slices/authSlice";
import type { AdminSettings } from "@/src/modules/settings/types/settings";

type SectionKey =
  | "profile"
  | "security"
  | "users"
  | "properties"
  | "notifications"
  | "system";

const defaults: AdminSettings = {
  ownerApprovalRequired: true,
  emailVerificationRequired: true,
  userRegistrationEnabled: true,
  ownerRegistrationEnabled: true,
  propertyApprovalRequired: false,
  propertyListingEnabled: true,
  newOwnerRegistrationAlerts: true,
  ownerApprovalEmails: true,
  platformName: "SpotNest",
  supportEmail: "",
  supportPhone: "",
  currency: "INR",
  timezone: "Asia/Kolkata",
  defaultPaginationLimit: 10,
  maintenanceMode: false,
};

function Section({
  title,
  description,
  editing,
  onEdit,
  onCancel,
  onSave,
  saving,
  children,
}: {
  title: string;
  description: string;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e1e3e4] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.035)] sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-[#eef0f1] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#191c1d]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#75777e]">
            {description}
          </p>
        </div>

        {!editing && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 rounded-lg border border-[#c5c6cd] px-3.5 py-2 text-sm font-bold text-[#44474d] transition hover:border-[#00696b] hover:text-[#00696b]"
          >
            Edit
          </button>
        )}
      </div>

      <div className="pt-5">{children}</div>

      {editing && (
        <div className="mt-5 flex justify-end gap-2 border-t border-[#eef0f1] pt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-lg border border-[#c5c6cd] px-4 py-2.5 text-sm font-bold text-[#44474d] hover:bg-[#f3f4f5] disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-[#00696b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#004f51] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </section>
  );
}

function Toggle({
  label,
  description,
  checked,
  editing,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  editing: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-2">
      <span>
        <span className="block text-sm font-semibold text-[#191c1d]">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-[#75777e]">
          {description}
        </span>
      </span>

      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full ${
          checked ? "bg-[#00696b]" : "bg-[#c5c6cd]"
        }`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={!editing}
          onChange={(event) => onChange(event.target.checked)}
        />

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  editing = false,
}: {
  label: string;
  value: string | number;
  onChange?: (value: string) => void;
  type?: string;
  editing?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#75777e]">
        {label}
      </span>

      <input
        type={type}
        readOnly={!editing}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className={`mt-2 h-11 w-full rounded-lg border border-[#c5c6cd] px-3 text-sm text-[#191c1d] outline-none ${
          editing
            ? "bg-white focus:border-[#00696b] focus:ring-2 focus:ring-[#d9f4f3]"
            : "bg-[#f3f4f5]"
        }`}
      />
    </label>
  );
}

export default function SettingsPage() {
  const { user, isInitialized } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const settingsQuery = useAdminSettings();

  /*
   * Server state is the source of truth.
   * No effect is needed to copy React Query data into local state.
   */
  const saved = settingsQuery.data ?? defaults;

  const [draft, setDraft] = useState<AdminSettings>(defaults);

  const profile = {
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  };

  const [profileDraft, setProfileDraft] = useState({
    name: "",
    phone: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [editing, setEditing] = useState<Record<SectionKey, boolean>>({
    profile: false,
    security: false,
    users: false,
    properties: false,
    notifications: false,
    system: false,
  });

  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const setEdit = (key: SectionKey, value: boolean) => {
    setEditing((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const setSetting = <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K]
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const beginSettings = (
    key: Exclude<SectionKey, "profile" | "security">
  ) => {
    setDraft(saved);
    setEdit(key, true);
    setFeedback("");
    setError("");
  };

  const cancelSettings = (
    key: Exclude<SectionKey, "profile" | "security">
  ) => {
    setDraft(saved);
    setEdit(key, false);
  };

  const settingsMutation = useMutation({
    mutationFn: updateAdminSettings,

    onSuccess: (data) => {
      queryClient.setQueryData(["admin-settings"], data);

      setDraft(data);
      setFeedback("Settings saved successfully.");
      setError("");
    },

    onError: (err) => {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? "Unable to save settings."
          : "Unable to save settings."
      );
    },
  });

  const profileMutation = useMutation({
    mutationFn: updateProfile,

    onSuccess: (data) => {
      if (user) {
        dispatch(
          signInSucceeded({
            ...user,
            ...data,
          })
        );
      }

      setProfileDraft({
        name: data.name,
        phone: data.phone ?? "",
      });

      setEdit("profile", false);
      setFeedback("Profile updated successfully.");
      setError("");
    },

    onError: () => {
      setError("Unable to update profile.");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,

    onSuccess: (data) => {
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setEdit("security", false);
      setFeedback(data.message);
      setError("");
    },

    onError: (err) => {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? "Unable to change password."
          : "Unable to change password."
      );
    },
  });

  if (isInitialized && user?.role !== "admin") {
    return (
      <DashboardShell>
        <main className="mx-auto max-w-[900px] px-4 py-10 text-sm text-[#95611d]">
          Admin access required.
        </main>
      </DashboardShell>
    );
  }

  const saveProfile = () => {
    if (profileDraft.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    profileMutation.mutate({
      name: profileDraft.name.trim(),
      phone: profileDraft.phone.trim(),
    });
  };

  const savePassword = () => {
    if (
      !passwords.currentPassword ||
      passwords.newPassword.length < 6 ||
      passwords.newPassword !== passwords.confirmPassword
    ) {
      setError("Enter a valid password and matching confirmation.");
      return;
    }

    passwordMutation.mutate(passwords);
  };

  const saveSettings = (
    key: Exclude<SectionKey, "profile" | "security">
  ) => {
    settingsMutation.mutate(draft, {
      onSuccess: () => {
        setEdit(key, false);
      },
    });
  };

  return (
    <DashboardShell role="admin">
      <main className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 sm:py-9 lg:px-10 lg:py-10">
        <header>
          <p className="text-sm font-semibold text-[#00696b]">
            Admin workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#191c1d]">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#44474d]">
            Manage your admin account and the platform defaults used by
            SpotNest.
          </p>
        </header>

        {feedback && (
          <p className="mt-6 rounded-lg bg-[#d9f4f3] px-4 py-3 text-sm font-semibold text-[#00696b]">
            {feedback}
          </p>
        )}

        {error && (
          <p className="mt-6 rounded-lg bg-[#fff0dc] px-4 py-3 text-sm font-semibold text-[#95611d]">
            {error}
          </p>
        )}

        {settingsQuery.isLoading ? (
          <p className="py-10 text-sm text-[#75777e]">
            Loading settings...
          </p>
        ) : (
          <div className="mt-8 space-y-6">
            <Section
              title="Admin profile"
              description="Update the account details used for your admin workspace."
              editing={editing.profile}
              onEdit={() => {
                setProfileDraft(profile);
                setEdit("profile", true);
                setFeedback("");
                setError("");
              }}
              onCancel={() => {
                setProfileDraft(profile);
                setEdit("profile", false);
              }}
              onSave={saveProfile}
              saving={profileMutation.isPending}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Name"
                  value={
                    editing.profile ? profileDraft.name : profile.name
                  }
                  onChange={(value) =>
                    setProfileDraft((current) => ({
                      ...current,
                      name: value,
                    }))
                  }
                  editing={editing.profile}
                />

                <Field
                  label="Email"
                  value={user?.email ?? ""}
                />

                <Field
                  label="Phone"
                  value={
                    editing.profile
                      ? profileDraft.phone
                      : profile.phone
                  }
                  onChange={(value) =>
                    setProfileDraft((current) => ({
                      ...current,
                      phone: value,
                    }))
                  }
                  editing={editing.profile}
                />
              </div>
            </Section>

            <Section
              title="Security"
              description="Change your password. Two-factor authentication and active session management are not enabled in the current backend."
              editing={editing.security}
              onEdit={() => {
                setPasswords({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setEdit("security", true);
                setFeedback("");
                setError("");
              }}
              onCancel={() => {
                setPasswords({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setEdit("security", false);
              }}
              onSave={savePassword}
              saving={passwordMutation.isPending}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Current password"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(value) =>
                    setPasswords((current) => ({
                      ...current,
                      currentPassword: value,
                    }))
                  }
                  editing={editing.security}
                />

                <Field
                  label="New password"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(value) =>
                    setPasswords((current) => ({
                      ...current,
                      newPassword: value,
                    }))
                  }
                  editing={editing.security}
                />

                <Field
                  label="Confirm new password"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(value) =>
                    setPasswords((current) => ({
                      ...current,
                      confirmPassword: value,
                    }))
                  }
                  editing={editing.security}
                />
              </div>
            </Section>

            <Section
              title="User management"
              description="These switches control registration and the existing Owner approval flow."
              editing={editing.users}
              onEdit={() => beginSettings("users")}
              onCancel={() => cancelSettings("users")}
              onSave={() => saveSettings("users")}
              saving={settingsMutation.isPending}
            >
              <div className="space-y-3">
                <Toggle
                  label="Owner approval required"
                  description="Owners remain blocked until an Admin approves them."
                  checked={draft.ownerApprovalRequired}
                  editing={editing.users}
                  onChange={(value) =>
                    setSetting("ownerApprovalRequired", value)
                  }
                />

                <Toggle
                  label="Email verification required"
                  description="Require email verification before login."
                  checked={draft.emailVerificationRequired}
                  editing={editing.users}
                  onChange={(value) =>
                    setSetting("emailVerificationRequired", value)
                  }
                />

                <Toggle
                  label="User registration enabled"
                  description="Allow new user accounts to be created."
                  checked={draft.userRegistrationEnabled}
                  editing={editing.users}
                  onChange={(value) =>
                    setSetting("userRegistrationEnabled", value)
                  }
                />

                <Toggle
                  label="Owner registration enabled"
                  description="Allow users to register as property owners."
                  checked={draft.ownerRegistrationEnabled}
                  editing={editing.users}
                  onChange={(value) =>
                    setSetting("ownerRegistrationEnabled", value)
                  }
                />
              </div>
            </Section>

            <Section
              title="Property settings"
              description="Control whether owners can create listings and how new listings begin their lifecycle."
              editing={editing.properties}
              onEdit={() => beginSettings("properties")}
              onCancel={() => cancelSettings("properties")}
              onSave={() => saveSettings("properties")}
              saving={settingsMutation.isPending}
            >
              <div className="space-y-3">
                <Toggle
                  label="Property listing enabled"
                  description="Allow approved owners to create property listings."
                  checked={draft.propertyListingEnabled}
                  editing={editing.properties}
                  onChange={(value) =>
                    setSetting("propertyListingEnabled", value)
                  }
                />

                <Toggle
                  label="Property approval required"
                  description="New properties remain unlisted until an Admin changes their listing status."
                  checked={draft.propertyApprovalRequired}
                  editing={editing.properties}
                  onChange={(value) =>
                    setSetting("propertyApprovalRequired", value)
                  }
                />
              </div>
            </Section>

            <Section
              title="Notifications and email"
              description="Control the existing owner registration and approval emails. Sender credentials remain server-side only."
              editing={editing.notifications}
              onEdit={() => beginSettings("notifications")}
              onCancel={() => cancelSettings("notifications")}
              onSave={() => saveSettings("notifications")}
              saving={settingsMutation.isPending}
            >
              <div className="space-y-3">
                <Toggle
                  label="New owner registration alerts"
                  description="Email the configured admin alert address when an Owner submits verification."
                  checked={draft.newOwnerRegistrationAlerts}
                  editing={editing.notifications}
                  onChange={(value) =>
                    setSetting("newOwnerRegistrationAlerts", value)
                  }
                />

                <Toggle
                  label="Owner approval emails"
                  description="Email Owners after an Admin approves their verification."
                  checked={draft.ownerApprovalEmails}
                  editing={editing.notifications}
                  onChange={(value) =>
                    setSetting("ownerApprovalEmails", value)
                  }
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Support email"
                  value={draft.supportEmail}
                  onChange={(value) =>
                    setSetting("supportEmail", value)
                  }
                  editing={editing.notifications}
                />

                <Field
                  label="Support phone"
                  value={draft.supportPhone}
                  onChange={(value) =>
                    setSetting("supportPhone", value)
                  }
                  editing={editing.notifications}
                />
              </div>
            </Section>

            <Section
              title="System settings"
              description="Platform defaults used by the application. Sensitive email/API credentials are configured on the server."
              editing={editing.system}
              onEdit={() => beginSettings("system")}
              onCancel={() => cancelSettings("system")}
              onSave={() => saveSettings("system")}
              saving={settingsMutation.isPending}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Platform name"
                  value={draft.platformName}
                  onChange={(value) =>
                    setSetting("platformName", value)
                  }
                  editing={editing.system}
                />

                <Field
                  label="Currency"
                  value="INR (₹)"
                />

                <Field
                  label="Timezone"
                  value={draft.timezone}
                  onChange={(value) =>
                    setSetting("timezone", value)
                  }
                  editing={editing.system}
                />

                <Field
                  label="Default pagination limit"
                  type="number"
                  value={draft.defaultPaginationLimit}
                  onChange={(value) =>
                    setSetting(
                      "defaultPaginationLimit",
                      Number(value)
                    )
                  }
                  editing={editing.system}
                />
              </div>

              <div className="mt-4">
                <Toggle
                  label="Maintenance mode"
                  description="Persist the system maintenance flag for future maintenance middleware."
                  checked={draft.maintenanceMode}
                  editing={editing.system}
                  onChange={(value) =>
                    setSetting("maintenanceMode", value)
                  }
                />
              </div>
            </Section>
          </div>
        )}
      </main>
    </DashboardShell>
  );
}
