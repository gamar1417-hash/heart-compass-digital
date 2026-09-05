import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CloudSync, useSession } from "@/lib/cloud";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">٤٠٤</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الرابط الذي تبحث عنه غير متاح أو تم نقله.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">تعذّر تحميل الصفحة</h1>
        <p className="mt-2 text-sm text-muted-foreground">حدث خلل بسيط، جرّب التحديث.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            إعادة المحاولة
          </button>
          <a href="/" className="rounded-2xl border border-input px-4 py-2 text-sm">
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "حاسبوا أنفسكم — مساحة محاسبة ذاتية" },
      {
        name: "description",
        content: "مساحة خاصة للمحاسبة الذاتية والتذكير اليومي: ذكر، صلاة، تدبّر، وتوبة.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const nav = [
  { to: "/", label: "الرئيسية", icon: "🏠" },
  { to: "/farm", label: "المزرعة", icon: "🌴" },
  { to: "/deeds", label: "أعمالي", icon: "📿" },
  { to: "/maqamat", label: "المقامات", icon: "🧭" },
  { to: "/calendar", label: "تقويمي", icon: "🗓️" },
  { to: "/report", label: "تقريري", icon: "📊" },
  { to: "/salawat", label: "جدول الصلاة", icon: "🕌" },
  { to: "/wasf", label: "وصفات الجنة", icon: "✨" },
  { to: "/fadl", label: "فضل الذكر", icon: "🌤️" },
  { to: "/prayer", label: "الصلاة", icon: "🕌" },
] as const;

function AccountLink() {
  const { user } = useSession();
  return (
    <Link
      to="/auth"
      className="mr-auto flex shrink-0 items-center gap-1 rounded-2xl border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground"
    >
      <span>{user ? "☁️" : "🔐"}</span>
      {user ? "محفوظ" : "دخول"}
    </Link>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CloudSync />
      <div className="min-h-screen pb-24">
        <div className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5">
            <span className="text-lg">🕊️</span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-primary">
                مقام التوحيد: إخراج كل من سوى الله من القلب
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                حاسبوا أنفسكم قبل أن تُحاسَبوا
              </p>
            </div>
            <AccountLink />
          </div>
        </div>

        <main className="mx-auto max-w-3xl px-4 py-5">
          <Outlet />
        </main>

        <footer className="mx-auto max-w-3xl px-4 pb-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          <p>حقوق الفكرة والتصميم محفوظة لصاحبتها.</p>
          <p className="mt-1">
            التقييمات والرموز هنا مؤشرات تحفيزية للتذكير الذاتي، وليست حكماً شرعياً ولا تقديراً للأجر.
          </p>
        </footer>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-stretch justify-between px-2 py-1.5">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-primary bg-primary/10" }}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] text-muted-foreground"
              >
                <span className="text-lg">{n.icon}</span>
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </QueryClientProvider>
  );
}
