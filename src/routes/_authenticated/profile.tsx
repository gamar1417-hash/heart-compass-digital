import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { supabase } from "@/integrations/supabase/client";
import { ensureProfile, MemberAvatar, type MemberProfile } from "@/lib/community";

const interests = ["القرآن", "تزكية النفس", "الصلاة", "الأخلاق", "السيرة", "الذكر", "طلب العلم"];

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [
    { title: "ملفي الشخصي — حاسبوا أنفسكم" },
    { name: "description", content: "تعديل الاسم الظاهر والنبذة والاهتمامات في المجتمع الإيماني." },
    { property: "og:title", content: "ملفي الشخصي" },
    { property: "og:description", content: "هويتي داخل المجتمع الإيماني." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const [profile, setProfile] = useState<MemberProfile>();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ensureProfile(user).then((value) => { setProfile(value); setName(value.display_name); setBio(value.bio); setSelected(value.interests); }).catch(() => toast.error("تعذّر تحميل الملف الشخصي"));
  }, [user]);

  async function save() {
    if (!name.trim()) return undefined;
    setBusy(true);
    const { data, error } = await supabase.from("profiles").update({ display_name: name.trim(), bio: bio.trim(), interests: selected }).eq("id", user.id).select("id, display_name, avatar_url, bio, interests").single();
    setBusy(false);
    if (error) {
      toast.error("تعذّر حفظ الملف");
      return;
    }
    setProfile(data as MemberProfile);
    toast.success("حُفظ ملفك الشخصي");
  }

  return <div className="space-y-4">
    <PageTitle emoji="🪴" title="ملفي الشخصي" sub="هذه المعلومات فقط هي التي يراها أعضاء المجتمع." />
    <Note>أعمالك، وردك، جنتك، ومسارات محاسبتك تظل خاصة ولا تظهر في ملفك.</Note>
    <Card className="space-y-4">
      <div className="flex items-center gap-4"><MemberAvatar profile={profile} size="lg" /><div><p className="font-bold">{profile?.display_name ?? "عضو جديد"}</p><p className="text-xs text-muted-foreground">عضو في المجتمع الإيماني</p></div></div>
      <label className="block"><span className="mb-1 block text-xs font-semibold">الاسم الظاهر</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} className="w-full rounded-2xl border border-border bg-background p-3 text-sm" /></label>
      <label className="block"><span className="mb-1 block text-xs font-semibold">نبذة قصيرة</span><textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={300} rows={3} placeholder="كلمات بسيطة عن اهتماماتك…" className="w-full rounded-2xl border border-border bg-background p-3 text-sm" /></label>
      <div><p className="mb-2 text-xs font-semibold">اهتماماتي</p><div className="flex flex-wrap gap-2">{interests.map((interest) => { const active = selected.includes(interest); return <button key={interest} onClick={() => setSelected((current) => active ? current.filter((item) => item !== interest) : [...current, interest])} className={`min-h-9 rounded-full border px-3 text-xs font-semibold ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{interest}</button>; })}</div></div>
      <Btn className="w-full" disabled={busy || !name.trim()} onClick={save}>حفظ الملف</Btn>
    </Card>
  </div>;
}