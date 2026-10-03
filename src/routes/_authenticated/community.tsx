import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { supabase } from "@/integrations/supabase/client";
import { ensureProfile, getProfiles, MemberAvatar, type MemberProfile } from "@/lib/community";

type Category = "faith" | "character" | "lesson" | "reminder" | "paradise";
type Post = {
  id: string;
  author_id: string;
  category: Category;
  body: string;
  linked_path: string | null;
  created_at: string;
};
type Comment = { id: string; post_id: string; author_id: string; body: string; created_at: string };

const categories: Record<Category, string> = {
  faith: "تقوية الإيمان",
  character: "الأخلاق الفاضلة",
  lesson: "دروس ومواعظ",
  reminder: "تذكير نافع",
  paradise: "الشوق إلى الجنة",
};
const links = [
  { path: "", label: "بدون رابط" },
  { path: "/maqamat", label: "فهرس المقامات" },
  { path: "/quran", label: "الورد القرآني" },
  { path: "/tawbah", label: "التوبة والحقوق" },
  { path: "/prayer", label: "الصلاة" },
  { path: "/wasf", label: "وصفات الجنة" },
];

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({
    meta: [
      { title: "المجتمع الإيماني — حاسبوا أنفسكم" },
      { name: "description", content: "مساحة خاصة للأعضاء لنشر التذكير الإيماني والأخلاق الحسنة." },
      { property: "og:title", content: "المجتمع الإيماني" },
      { property: "og:description", content: "صحبة تعين على الإيمان والخلق الحسن." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { user } = Route.useRouteContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState(new Map<string, MemberProfile>());
  const [likes, setLikes] = useState<{ post_id: string; user_id: string }[]>([]);
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>("faith");
  const [linkedPath, setLinkedPath] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    await ensureProfile(user);
    const [postsResult, commentsResult, likesResult] = await Promise.all([
      supabase.from("community_posts").select("id, author_id, category, body, linked_path, created_at").eq("is_deleted", false).order("created_at", { ascending: false }),
      supabase.from("community_comments").select("id, post_id, author_id, body, created_at").eq("is_deleted", false).order("created_at", { ascending: true }),
      supabase.from("community_likes").select("post_id, user_id"),
    ]);
    if (postsResult.error) throw postsResult.error;
    if (commentsResult.error) throw commentsResult.error;
    if (likesResult.error) throw likesResult.error;
    const nextPosts = postsResult.data as Post[];
    const nextComments = commentsResult.data as Comment[];
    setPosts(nextPosts);
    setComments(nextComments);
    setLikes(likesResult.data);
    setProfiles(await getProfiles([...nextPosts.map((p) => p.author_id), ...nextComments.map((c) => c.author_id)]));
  }, [user]);

  useEffect(() => {
    load().catch(() => toast.error("تعذّر تحميل المجتمع الآن"));
  }, [load]);

  async function publish() {
    const clean = body.trim();
    if (clean.length < 3) return;
    setBusy(true);
    const { error } = await supabase.from("community_posts").insert({
      author_id: user.id,
      body: clean,
      category,
      linked_path: linkedPath || null,
    });
    setBusy(false);
    if (error) return toast.error("تعذّر نشر التذكير");
    setBody("");
    setLinkedPath("");
    toast.success("نُشر التذكير");
    await load();
  }

  async function toggleLike(postId: string) {
    const liked = likes.some((like) => like.post_id === postId && like.user_id === user.id);
    const result = liked
      ? await supabase.from("community_likes").delete().eq("post_id", postId).eq("user_id", user.id)
      : await supabase.from("community_likes").insert({ post_id: postId, user_id: user.id });
    if (result.error) return toast.error("تعذّر تحديث الإعجاب");
    await load();
  }

  async function addComment(postId: string) {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;
    const { error } = await supabase.from("community_comments").insert({ post_id: postId, author_id: user.id, body: text });
    if (error) return toast.error("تعذّر إضافة التعليق");
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    await load();
  }

  async function reportPost(postId: string) {
    const { error } = await supabase.from("community_reports").insert({ reporter_id: user.id, post_id: postId, reason: "inappropriate" });
    if (error) return toast.info("سبق أن أرسلت بلاغاً عن هذا المنشور");
    toast.success("وصل البلاغ للمراجعة، شكراً لك");
  }

  return (
    <div className="space-y-4">
      <PageTitle emoji="🤝" title="المجتمع الإيماني" sub="صحبة طيبة نتواصى فيها بالإيمان ومكارم الأخلاق." />
      <Note>هذه مساحة تربوية للتذكير النافع، وليست للفتوى أو الحكم على الناس أو عرض الأعمال الخاصة.</Note>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <MemberAvatar profile={profiles.get(user.id)} />
          <h2 className="font-bold">شارك تذكيراً نافعاً</h2>
        </div>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={3000} rows={4} placeholder="اكتب موعظة، فائدة إيمانية، أو خُلُقاً نحتاج أن نتواصى به…" className="w-full rounded-2xl border border-border bg-background p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring/40" />
        <div className="grid gap-2 sm:grid-cols-2">
          <select value={category} onChange={(event) => setCategory(event.target.value as Category)} className="min-h-11 rounded-2xl border border-border bg-background px-3 text-sm">
            {Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <select value={linkedPath} onChange={(event) => setLinkedPath(event.target.value)} className="min-h-11 rounded-2xl border border-border bg-background px-3 text-sm">
            {links.map((item) => <option key={item.path} value={item.path}>{item.label}</option>)}
          </select>
        </div>
        <Btn className="w-full" disabled={busy || body.trim().length < 3} onClick={publish}>نشر التذكير</Btn>
      </Card>

      {!posts.length ? <Card className="py-10 text-center text-sm text-muted-foreground">لا توجد منشورات بعد. ابدأ بكلمة طيبة.</Card> : null}
      {posts.map((post) => {
        const postComments = comments.filter((comment) => comment.post_id === post.id);
        const postLikes = likes.filter((like) => like.post_id === post.id);
        const liked = postLikes.some((like) => like.user_id === user.id);
        const linked = links.find((item) => item.path === post.linked_path);
        return (
          <Card key={post.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <MemberAvatar profile={profiles.get(post.author_id)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{profiles.get(post.author_id)?.display_name ?? "عضو"}</p>
                <p className="text-[11px] text-muted-foreground">{categories[post.category]} · {new Date(post.created_at).toLocaleDateString("ar")}</p>
              </div>
              <button onClick={() => reportPost(post.id)} aria-label="الإبلاغ عن المنشور" title="إبلاغ" className="size-9 rounded-full text-muted-foreground hover:bg-muted">⚑</button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-loose">{post.body}</p>
            {linked?.path ? <Link to={linked.path} className="inline-flex text-xs font-semibold text-primary">{linked.label} ←</Link> : null}
            <div className="flex items-center gap-3 border-t border-border pt-3">
              <button onClick={() => toggleLike(post.id)} className={`text-xs font-semibold ${liked ? "text-primary" : "text-muted-foreground"}`}>♡ نفعني {postLikes.length || ""}</button>
              <span className="text-xs text-muted-foreground">💬 {postComments.length}</span>
            </div>
            {postComments.map((comment) => (
              <div key={comment.id} className="flex gap-2 rounded-2xl bg-muted/60 p-3">
                <MemberAvatar size="sm" profile={profiles.get(comment.author_id)} />
                <div><p className="text-xs font-bold">{profiles.get(comment.author_id)?.display_name ?? "عضو"}</p><p className="mt-1 text-xs leading-relaxed">{comment.body}</p></div>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={commentDrafts[post.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") addComment(post.id); }} maxLength={1000} placeholder="اكتب تعليقاً طيباً…" className="min-h-11 min-w-0 flex-1 rounded-2xl border border-border bg-background px-3 text-sm" />
              <Btn variant="ghost" onClick={() => addComment(post.id)}>إرسال</Btn>
            </div>
          </Card>
        );
      })}
    </div>
  );
}