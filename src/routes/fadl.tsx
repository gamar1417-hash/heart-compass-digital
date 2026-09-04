import { createFileRoute, Link } from "@tanstack/react-router";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { worldlyVirtues } from "@/data/content";
import { useDayLog } from "@/lib/store";

export const Route = createFileRoute("/fadl")({
  head: () => ({
    meta: [
      { title: "فضل الذكر في الدنيا — سكينة ورزق وفرج" },
      {
        name: "description",
        content:
          "آثار الذكر الدنيوية من الكتاب والسنة: طمأنينة القلب، تفريج الهمّ، سعة الرزق، الحفظ والبركة — رجاءً بفضل الله لا ضماناً.",
      },
      { property: "og:title", content: "فضل الذكر في الدنيا" },
      {
        property: "og:description",
        content: "ما وعد الله به الذاكرين في دنياهم: سكينة، وفرج، ورزق، وحفظ.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Fadl,
});

function Fadl() {
  const { add, lifetimeById } = useDayLog();

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="🌤️"
        title="فضل الذكر في الدنيا"
        sub="ليس الذكر لآخرتك وحدها؛ له أثرٌ في قلبك ورزقك وعافيتك ويومك."
      />

      <Note>
        هذه آثار وردت في الكتاب والسنة، تُرجى بفضل الله <b>رجاءً لا ضماناً</b>، ولا تُغني عن الأخذ
        بالأسباب.
      </Note>

      <div className="grid gap-3">
        {worldlyVirtues.map((v) => (
          <Card key={v.id} className="space-y-2">
            <h2 className="font-bold">
              <span className="ml-2">{v.emoji}</span>
              {v.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{v.text}</p>
            <p className="rounded-2xl bg-secondary/60 p-3 text-xs leading-relaxed">{v.source}</p>
            <div className="flex flex-wrap gap-2">
              {v.linkedCounters.map((id) => (
                <Btn key={id} variant="ghost" onClick={() => add(id)}>
                  سجّل ذكراً ({lifetimeById[id] ?? 0})
                </Btn>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="space-y-2">
        <p className="text-sm leading-relaxed text-muted-foreground">
          للعدّادات والإدخال اليدوي للأذكار المحسوبة خارج التطبيق:
        </p>
        <Link to="/deeds" className="font-semibold text-primary">
          افتح أعمالي وأذكاري ←
        </Link>
      </Card>
    </div>
  );
}
