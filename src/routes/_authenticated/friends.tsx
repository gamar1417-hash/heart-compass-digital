import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { supabase } from "@/integrations/supabase/client";
import { ensureProfile, MemberAvatar, type MemberProfile } from "@/lib/community";

type Friendship = { id: string; sender_id: string; receiver_id: string; status: "pending" | "accepted" };

export const Route = createFileRoute("/_authenticated/friends")({
  head: () => ({ meta: [
    { title: "الأصدقاء — المجتمع الإيماني" },
    { name: "description", content: "طلبات الصداقة والصحبة الطيبة داخل المجتمع الإيماني." },
    { property: "og:title", content: "الأصدقاء — حاسبوا أنفسكم" },
    { property: "og:description", content: "صحبة طيبة وتواصل آمن بين الأعضاء." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: FriendsPage,
});

function FriendsPage() {
  const { user } = Route.useRouteContext();
  const [profiles, setProfiles] = useState<MemberProfile[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    await ensureProfile(user);
    const [profilesResult, friendshipsResult] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url, bio, interests").neq("id", user.id).order("display_name"),
      supabase.from("friendships").select("id, sender_id, receiver_id, status").order("created_at", { ascending: false }),
    ]);
    if (profilesResult.error) throw profilesResult.error;
    if (friendshipsResult.error) throw friendshipsResult.error;
    setProfiles(profilesResult.data as MemberProfile[]);
    setFriendships(friendshipsResult.data as Friendship[]);
  }, [user]);

  useEffect(() => { load().catch(() => toast.error("تعذّر تحميل الأصدقاء")); }, [load]);

  const filtered = useMemo(() => profiles.filter((profile) => profile.display_name.includes(query.trim())), [profiles, query]);
  const incoming = friendships.filter((friendship) => friendship.receiver_id === user.id && friendship.status === "pending");
  const accepted = friendships.filter((friendship) => friendship.status === "accepted");
  const profile = (id: string) => profiles.find((item) => item.id === id);

  async function send(receiverId: string) {
    const existing = friendships.find((item) => (item.sender_id === user.id && item.receiver_id === receiverId) || (item.sender_id === receiverId && item.receiver_id === user.id));
    if (existing) {
      toast.info(existing.status === "accepted" ? "أنتما صديقان بالفعل" : "طلب الصداقة قيد الانتظار");
      return;
    }
    const { error } = await supabase.from("friendships").insert({ sender_id: user.id, receiver_id: receiverId });
    if (error) {
      toast.error("تعذّر إرسال الطلب");
      return;
    }
    toast.success("أُرسل طلب الصداقة");
    await load();
  }

  async function accept(id: string) {
    const { error } = await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
    if (error) {
      toast.error("تعذّر قبول الطلب");
      return;
    }
    toast.success("تم قبول الصداقة");
    await load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("friendships").delete().eq("id", id);
    if (error) {
      toast.error("تعذّر حذف الطلب");
      return;
    }
    await load();
  }

  return <div className="space-y-4">
    <PageTitle emoji="🌿" title="الأصدقاء" sub="تعارف هادئ وصحبة تعين على الخير." />
    <Note>لا تظهر إنجازاتك أو محاسبتك الخاصة للأصدقاء. المشاركة هنا بالكلمة الطيبة فقط.</Note>

    {incoming.length ? <section className="space-y-2"><h2 className="font-bold">طلبات واردة</h2>{incoming.map((item) => <Card key={item.id} className="flex items-center gap-3"><MemberAvatar profile={profile(item.sender_id)} /><p className="min-w-0 flex-1 truncate text-sm font-bold">{profile(item.sender_id)?.display_name ?? "عضو"}</p><Btn onClick={() => accept(item.id)}>قبول</Btn><Btn variant="ghost" onClick={() => remove(item.id)}>رفض</Btn></Card>)}</section> : null}

    <section className="space-y-2"><h2 className="font-bold">أصدقائي</h2>{accepted.length ? accepted.map((item) => { const friendId = item.sender_id === user.id ? item.receiver_id : item.sender_id; return <Card key={item.id} className="flex items-center gap-3"><MemberAvatar profile={profile(friendId)} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{profile(friendId)?.display_name ?? "عضو"}</p><p className="truncate text-xs text-muted-foreground">{profile(friendId)?.bio || "صحبة على الخير"}</p></div><Btn variant="ghost" onClick={() => remove(item.id)}>إزالة</Btn></Card>; }) : <Card className="text-center text-sm text-muted-foreground">لم تضف أصدقاء بعد.</Card>}</section>

    <section className="space-y-2"><h2 className="font-bold">ابحث عن أعضاء</h2><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="اكتب الاسم الظاهر…" className="w-full rounded-2xl border border-border bg-card p-3 text-sm" />{filtered.map((item) => <Card key={item.id} className="flex items-center gap-3"><MemberAvatar profile={item} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.display_name}</p><p className="truncate text-xs text-muted-foreground">{item.bio || "عضو في المجتمع"}</p></div><Btn variant="ghost" onClick={() => send(item.id)}>إضافة</Btn></Card>)}</section>
  </div>;
}