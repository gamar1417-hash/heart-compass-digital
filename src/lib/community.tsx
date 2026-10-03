import { supabase } from "@/integrations/supabase/client";

export type MemberProfile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  interests: string[];
};

export async function ensureProfile(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};
  const fallback = user.email?.split("@")[0] || "عضو جديد";
  const displayName =
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    fallback;
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, display_name: displayName, avatar_url: avatarUrl },
      { onConflict: "id", ignoreDuplicates: true },
    )
    .select("id, display_name, avatar_url, bio, interests")
    .single();
  if (error) throw error;
  return data as MemberProfile;
}

export async function getProfiles(ids: string[]) {
  if (!ids.length) return new Map<string, MemberProfile>();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, interests")
    .in("id", [...new Set(ids)]);
  if (error) throw error;
  return new Map((data as MemberProfile[]).map((profile) => [profile.id, profile]));
}

export function MemberAvatar({ profile, size = "md" }: { profile?: MemberProfile; size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "size-20 text-2xl" : size === "sm" ? "size-9 text-sm" : "size-11 text-base";
  const initial = profile?.display_name.trim().charAt(0) || "؟";
  return profile?.avatar_url ? (
    <img
      src={profile.avatar_url}
      alt=""
      className={`${box} shrink-0 rounded-full border border-border object-cover`}
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className={`${box} flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary`}>
      {initial}
    </span>
  );
}