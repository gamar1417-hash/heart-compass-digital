import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Btn, Card, Note, PageTitle } from "@/components/bits";
import { useDayLog } from "@/lib/store";

export const Route = createFileRoute("/prayer")({
  head: () => ({
    meta: [
      { title: "الصلاة — مبادرة ومؤقت رمزي" },
      {
        name: "description",
        content: "سجّل صلواتك وسننك الرواتب مع مؤقت رمزي يذكّر بفضل المبادرة إلى الوقت.",
      },
      { property: "og:title", content: "صفحة الصلاة" },
      { property: "og:description", content: "مبادرة إلى الوقت وسنن رواتب وأذكار بعد الصلاة." },
    ],
  }),
  component: Prayer,
});

const salawat = [
  { id: "fajr", name: "الفجر", sunnah: 2 },
  { id: "dhuhr", name: "الظهر", sunnah: 4 },
  { id: "asr", name: "العصر", sunnah: 0 },
  { id: "maghrib", name: "المغرب", sunnah: 2 },
  { id: "isha", name: "العشاء", sunnah: 2 },
];

function Prayer() {
  const { today, add } = useDayLog();
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <PageTitle
        emoji="🕌"
        title="الصلاة"
        sub="المبادرة إلى الوقت خير، والقبول عند الله وحده."
      />

      <Card className="text-center">
        <p className="text-xs text-muted-foreground">مؤقت رمزي: كم بقيت في مصلّاك؟</p>
        <p className="my-2 font-display text-5xl tabular-nums text-primary">
          {mm}:{ss}
        </p>
        <div className="flex justify-center gap-2">
          <Btn onClick={() => setRunning((r) => !r)}>{running ? "إيقاف" : "ابدأ"}</Btn>
          <Btn
            variant="ghost"
            onClick={() => {
              setRunning(false);
              setSeconds(0);
            }}
          >
            تصفير
          </Btn>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          هذا المؤقت لتشجيعك على السكينة والتبكير، ولا يحسب أجراً ولا يقيس خشوعاً.
        </p>
      </Card>

      <div className="grid gap-2">
        {salawat.map((s) => (
          <Card key={s.id} className="flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-xs text-muted-foreground">
                {s.sunnah ? `الراتبة: ${s.sunnah} ركعات` : "لا راتبة"} · سُجّل:{" "}
                {today[`prayer-${s.id}`] ?? 0}
              </p>
            </div>
            <div className="flex gap-2">
              <Btn onClick={() => add(`prayer-${s.id}`)}>صلّيت</Btn>
              {s.sunnah ? (
                <Btn variant="ghost" onClick={() => add(`rawatib`)}>
                  الراتبة
                </Btn>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <Card className="space-y-2">
        <h2 className="font-bold">بعد الصلاة</h2>
        <div className="flex flex-wrap gap-2">
          <Btn variant="ghost" onClick={() => add("adhkar-salah")}>
            أذكار الصلاة ({today["adhkar-salah"] ?? 0})
          </Btn>
          <Btn variant="ghost" onClick={() => add("witr")}>
            الوتر ({today["witr"] ?? 0})
          </Btn>
          <Btn variant="ghost" onClick={() => add("duha")}>
            الضحى ({today["duha"] ?? 0})
          </Btn>
        </div>
      </Card>

      <Note>
        فاتتك صلاة؟ ابدأ من الآن بلا قنوط ولا جلد للذات، واسأل أهل العلم فيما يشكل عليك.
      </Note>
    </div>
  );
}
