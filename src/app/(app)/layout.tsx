import { RightRail } from "@/components/right-rail";
import { SideNav } from "@/components/side-nav";
import { TopBar } from "@/components/top-bar";
import { getCurrentProfile, getCurrentUser, getSuggestedProfiles, getTrendingTags } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const [profile, tags, suggested] = await Promise.all([
    getCurrentProfile(),
    getTrendingTags(),
    getSuggestedProfiles(user?.id),
  ]);

  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px]">
      <SideNav profile={profile} />

      <div className="min-w-0 flex-1">
        <TopBar profile={profile} />

        <div className="mx-auto flex w-full max-w-[1180px] justify-center">
          <main className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 lg:pb-16">{children}</main>
          <RightRail tags={tags} profiles={suggested} />
        </div>
      </div>
    </div>
  );
}
