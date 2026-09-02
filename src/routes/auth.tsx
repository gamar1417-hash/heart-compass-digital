import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/lib/cloud";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "حسابي — حفظ إنجازاتي ومساراتي" },
      {
        name: "description",
        content:
          "سجّل الدخول ليُحفظ تقدّمك في الجنة والأعمال وفهرس المقامات على حسابك الخاص وحدك.",
      },
      { property: "og:title", content: "حسابي في حاسبوا أنفسكم" },
      { property: "og:description", content: "حفظ خاص وآمن لإنجازاتك ومساراتك." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { session, user } = useSession();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) setMsg(null);
  }, [session]);

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        setMsg("تم إنشاء الحساب. إن طُلب تأكيد البريد فافتح الرسالة المرسلة إليك.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "تعذّر إتمام العملية، جرّب مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return (
      <div className="space-y-4">
        <PageTitle emoji="🔐" title="حسابي" sub="إنجازاتك محفوظة على حسابك وحدك." />
        <Card className="space-y-3">
          <p className="text-sm">
            أنت مسجّل الدخول باسم: <span className="font-bold">{user.email ?? "مستخدم"}</span>
          </p>
          <Note>
            الجنة والأعمال وفهرس المقامات والمفضلة تُحفظ تلقائياً في حسابك، ولا يراها غيرك.
          </Note>
          <Btn
            className="w-full"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            تسجيل الخروج
          </Btn>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="🔐"
        title="حسابي"
        sub="سجّل الدخول ليُحفظ تقدّمك ويتابعك على أي جهاز."
      />

      <Card className="space-y-3">
        <Btn
          className="w-full"
          onClick={() =>
            lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })
          }
        >
          المتابعة بحساب Google
        </Btn>
        <p className="text-center text-[11px] text-muted-foreground">أو بالبريد وكلمة المرور</p>

        <input
          type="email"
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="البريد الإلكتروني"
          className="w-full rounded-2xl border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <input
          type="password"
          dir="ltr"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          className="w-full rounded-2xl border border-border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <Btn className="w-full" onClick={submit} disabled={busy || !email || !password}>
          {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب"}
        </Btn>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-center text-xs text-primary underline"
        >
          {mode === "signin" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجّل الدخول"}
        </button>
        {msg ? <Note tone="warn">{msg}</Note> : null}
      </Card>

      <Note>
        بياناتك خاصة بك وحدك، والمحاسبة بينك وبين الله. الحساب فقط ليحفظ تقدّمك ولا يُشارك مع أحد.
      </Note>
    </div>
  );
}
