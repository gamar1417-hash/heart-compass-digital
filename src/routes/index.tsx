import { createFileRoute, Link } from "@tanstack/react-router";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { useDayLog, useLocalState } from "@/lib/store";
import { ayat, totalItems } from "@/data/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "حاسبوا أنفسكم قبل أن تُحاسَبوا — لوحة اليوم" },
      {
        name: "description",
        content:
          "لوحة يومية هادئة للمحاسبة الذاتية: ذكر وصلاة وتدبّر وتوبة، بخصوصية كاملة على جهازك.",
      },
      { property: "og:title", content: "حاسبوا أنفسكم قبل أن تُحاسَبوا" },
      {
        property: "og:description",
        content: "مساحة محاسبة ذاتية وإيمانية خاصة، للتذكير لا للحكم على أحد.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

const quick = [
  { to: "/salawat", label: "الفرائض أولاً", icon: "🕌" },
  { to: "/deeds", label: "افتح السبحة", icon: "📿" },
  { to: "/quran", label: "افتح المصحف", icon: "📖" },
  { to: "/mercy", label: "لا تقنطوا", icon: "💧" },
  { to: "/tawbah", label: "التوبة والحقوق", icon: "🔒" },
  { to: "/sabr", label: "الصبر والعافية", icon: "🤍" },
  { to: "/sections", label: "مسارات الحياة", icon: "🧺" },
  { to: "/feedback", label: "اقتراحاتكم", icon: "✉️" },
] as const;

function Home() {
  const [accepted, setAccepted] = useLocalState("welcomed", false);
  const { total, streak } = useDayLog();
  const aya = ayat[new Date().getDate() % ayat.length]!;

  if (!accepted) {
    return (
      <div className="space-y-4">
        <PageTitle
          emoji="🕊️"
          title="حاسبوا أنفسكم قبل أن تُحاسَبوا"
          sub="مساحة خاصة بينك وبين نفسك، للتذكير والمحاسبة الشخصية فقط."
        />
        <Card className="space-y-3">
          <h2 className="text-lg font-bold">تنبيه لطيف قبل البدء</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            انطلاقاً من معنى قوله تعالى: <b>«يا أيها الذين آمنوا عليكم أنفسكم»</b>، هذا التطبيق
            للتذكير الذاتي. لا يحكم على أحد، ولا يحتسب ثواباً، ولا يقرّر مصيراً. كل ما تراه من
            نقاط ورموز وبطاقات هو <b>تحفيز رمزي</b> يعينك على الاستمرار، والأجر والقبول عند الله
            وحده.
          </p>
          <Note>
            الأمانة والصدق في الإدخال: لا أحد يراقبك هنا، فاكتب ما هو حقّ عن نفسك برفق وبلا مبالغة
            ولا جلد للذات — فالنيّة لا يعلمها إلا الله.
          </Note>
          <Note tone="warn">
            في المسائل الشرعية الدقيقة (الحقوق، المال، الطلاق، التعافي) ارجع إلى أهل العلم والاختصاص؛
            لا نقدّم هنا فتاوى.
          </Note>
          <Btn onClick={() => setAccepted(true)} className="w-full">
            فهمت، أبدأ رحلتي
          </Btn>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageTitle
        title="يومك"
        sub="تدفّق هادئ: تذكير، خطوة صغيرة، ثم استمرار."
        emoji="🌤️"
      />

      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary">{total}</p>
          <p className="text-xs text-muted-foreground">تسجيلات اليوم</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary">{streak}</p>
          <p className="text-xs text-muted-foreground">أيام متتابعة</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary">{totalItems}</p>
          <p className="text-xs text-muted-foreground">تذكير في الفهرس</p>
        </Card>
      </div>
      <p className="text-center text-[11px] text-muted-foreground">
        هذه أرقام شخصية خاصة على جهازك، وليست ميزاناً للأعمال 🔒
      </p>

      <Card className="garden-sky text-primary-foreground">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">مزرعة وغراس الجنة</h2>
            <p className="mt-1 text-xs opacity-90">
              مشهد رمزي ينمو كلما داومت على السنن والذكر.
            </p>
          </div>
          <span className="animate-sway text-4xl">🌴</span>
        </div>
        <Link
          to="/farm"
          className="mt-3 inline-flex rounded-2xl bg-card/90 px-4 py-2 text-sm font-semibold text-primary"
        >
          ادخل المزرعة
        </Link>
      </Card>

      <Card>
        <p className="text-xs text-muted-foreground">آية اليوم</p>
        <p className="mt-1 font-display text-xl leading-loose">﴿{aya.text}﴾</p>
        <p className="mt-1 text-xs text-muted-foreground">{aya.ref}</p>
        <Link to="/tadabbur" className="mt-3 inline-block text-sm font-semibold text-primary">
          اقرأ التدبّر ←
        </Link>
      </Card>

      <section>
        <h2 className="mb-2 text-sm font-bold text-muted-foreground">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quick.map((q) => (
            <Link key={q.to} to={q.to} className="soft-card flex flex-col items-center gap-1 p-3 text-center">
              <span className="text-2xl">{q.icon}</span>
              <span className="text-xs font-semibold">{q.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <Note>
        تذكير: «اجتنبوا كثيراً من الظن» — لا نحكم على نيّات الناس ولا على ظواهرهم، والمحاسبة هنا
        لنفسك أنت فقط.
      </Note>
    </div>
  );
}
