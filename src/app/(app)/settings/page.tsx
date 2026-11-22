import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { getCurrentProfile } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  return (
    <div>
      <p className="type-stamp">Your record</p>
      <h1 className="mt-3 font-display text-[2.4rem] leading-none tracking-[-0.035em]">Settings</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
        Update the small facts that tell people what kind of work you keep here.
      </p>

      {profile ? (
        <ProfileForm profile={profile} />
      ) : (
        <p className="paper-panel mt-8 px-6 py-8 text-sm text-ink-soft">Your profile is still being created.</p>
      )}
    </div>
  );
}
