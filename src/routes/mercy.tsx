import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { useDayLog } from "@/lib/store";

export const Route = createFileRoute("/mercy")({
  head: () => ({
    meta: [
      { title: "لا تقنطوا — مسار رحيم بعد الخطأ" },
      {
        name: "description",
        content: "استغفار وتأمل هادئ بعد الزلل، مع تذكير رفيق بمجاهدة النفس بلا توبيخ.",
      },
      { property: "og:title", content: "لا تقنطوا من رحمة الله" },
      { property: "og:description", content: "مسار رحيم بعد الخطأ: استغفار، سكون، ثم خطوة صغيرة." },
    ],
  }),
  component: Mercy,
});

function Mercy() {
  const { add, today } = useDayLog();
  const [step, setStep] = useState(0);

  return (
    <div className="space-y-4">
      <PageTitle emoji="💧" title="لا تقنطوا" sub="أخطأت؟ الطريق إلى الله أقرب مما تظن." />

      <Card className="relative overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24">
          {[15, 40, 62, 85].map((x, i) => (
            <span
              key={x}
              className="animate-drop absolute text-lg"
              style={{ right: `${x}%`, animationDelay: `${i * 0.6}s` }}
            >
              💧
            </span>
          ))}
        </div>
        <p className="mt-16 font-display text-xl leading-loose">
          ﴿لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ﴾
        </p>
        <p className="mt-1 text-xs text-muted-foreground">الزمر: ٥٣</p>
      </Card>

      {step === 0 ? (
        <Card className="space-y-3">
          <p className="text-sm leading-relaxed">
            خذ نفَساً عميقاً. لا نعاتبك هنا. قل بقلبك: «أستغفر الله وأتوب إليه».
          </p>
          <Btn
            className="w-full"
            onClick={() => {
              add("istighfar");
              setStep(1);
            }}
          >
            استغفرت 🤍 ({today["istighfar"] ?? 0})
          </Btn>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="space-y-3">
          <p className="text-sm leading-relaxed">
            وقفة تأمل: ما السبب الذي قادك إلى ما وقعت فيه؟ حدّد سبباً واحداً واقطع الطريق إليه —
            مجاهدة النفس رحلة طويلة، والانتكاسة ليست نهاية.
          </p>
          <Btn className="w-full" onClick={() => setStep(2)}>
            حدّدت خطوتي
          </Btn>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card className="space-y-3">
          <h2 className="font-bold">لا تحقرنّ من المعروف شيئاً</h2>
          <p className="text-sm text-muted-foreground">أتبِع السيئة حسنة صغيرة الآن:</p>
          <div className="flex flex-wrap gap-2">
            {["ابتسامة", "دعاء لمسلم", "صدقة يسيرة", "إماطة أذى", "رسالة برّ لوالديك"].map((m) => (
              <Btn key={m} variant="accent" onClick={() => add("maruf")}>
                {m}
              </Btn>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">معروف اليوم: {today["maruf"] ?? 0}</p>
          <Btn variant="ghost" onClick={() => setStep(0)}>
            إعادة المسار
          </Btn>
        </Card>
      ) : null}

      <Note>هذه مساحة تذكير ورجاء، ولا تُصدر حكماً على حالك عند الله.</Note>
    </div>
  );
}
