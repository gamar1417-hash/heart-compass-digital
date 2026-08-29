import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Card, Note, PageTitle, PrivateNote } from "@/components/bits";
import { useDayLog, useLocalState } from "@/lib/store";

export const Route = createFileRoute("/sections")({
  head: () => ({
    meta: [
      { title: "مسارات الحياة — خطط يومية بسيطة" },
      {
        name: "description",
        content: "الأمومة والسكينة، السعي والرزق الحلال، العلم والفقه، الأوقات الفاضلة، الجوار والمعروف.",
      },
      { property: "og:title", content: "مسارات الحياة" },
      { property: "og:description", content: "نيّة وخطة يومية وتذكير وملاحظات خاصة لكل مسار." },
    ],
  }),
  component: Sections;
});

type S = { id: string; t: string; icon: string; intent: string; plan: string[]; remind: string };

const sections: S[] = [
  {
    id: "umuma",
    t: "الأمومة وصناعة السكينة",
    icon: "🏡",
    intent: "أنوي أن أجعل بيتي مكان أمان.",
    plan: ["دعاء للأبناء", "نصف ساعة حضور بلا شاشة", "كلمة تشجيع لكل فرد"],
    remind: "الرفق ما كان في شيء إلا زانه.",
  },
  {
    id: "rizq",
    t: "السعي والرزق الحلال والأمانة الوظيفية",
    icon: "🌱",
    intent: "أنوي أن يكون كسبي طيّباً وعملي متقناً.",
    plan: ["إتقان مهمة واحدة", "الالتزام بالوقت", "مراجعة معاملة مالية مشكوك فيها"],
    remind: "الأمانة تشمل الوقت والمعلومة، لا المال فقط.",
  },
  {
    id: "ilm",
    t: "العلم والفقه",
    icon: "🌕",
    intent: "أنوي أن أتعلّم لأعمل لا لأجادل.",
    plan: ["مسألة فقهية واحدة", "حديث مع معناه", "سؤال أهل الذكر فيما أشكل"],
    remind: "«وفضل العالم على العابد كفضل القمر ليلة البدر».",
  },
  {
    id: "awqat",
    t: "الأوقات الفاضلة",
    icon: "⏳",
    intent: "أنوي ألا تمرّ المواسم بلا نصيب.",
    plan: ["ركعتان قبل الفجر", "دعاء بين الأذان والإقامة", "استغفار وقت السحر"],
    remind: "الوقت الفاضل فرصة لا تتكرر بنفس الحال.",
  },
  {
    id: "jiwar",
    t: "حق الجوار",
    icon: "🤝",
    intent: "أنوي أن أكفّ أذاي وأبذل معروفي.",
    plan: ["سؤال عن جار", "كفّ الصوت المزعج", "إهداء بسيط"],
    remind: "ما زال جبريل يوصيني بالجار.",
  },
  {
    id: "maruf",
    t: "المعروف اليومي",
    icon: "🌾",
    intent: "أنوي ألا يمرّ يومي بلا خير.",
    plan: ["صدقة خفية", "قضاء حاجة", "دعاء بظهر الغيب"],
    remind: "لا تحقرنّ من المعروف شيئاً.",
  },
];

function Sections() {
  const { today, add } = useDayLog();
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useLocalState<Record<string, string>>("section-notes", {});

  return (
    <div className="space-y-4">
      <PageTitle emoji="🧺" title="مسارات الحياة" sub="لكل مسار نيّة وخطة صغيرة وتذكير." />

      <div className="grid gap-2">
        {sections.map((s) => (
          <Card key={s.id} className="space-y-2">
            <button
              onClick={() => setOpen(open === s.id ? null : s.id)}
              className="flex w-full items-center justify-between gap-2 text-right"
            >
              <span className="font-semibold">
                <span className="ml-2 text-xl">{s.icon}</span>
                {s.t}
              </span>
              <span className="text-muted-foreground">{open === s.id ? "▲" : "▼"}</span>
            </button>

            {open === s.id ? (
              <div className="space-y-3 border-t border-border pt-3">
                <p className="rounded-2xl bg-secondary p-3 text-sm">🤍 النيّة: {s.intent}</p>
                <ul className="space-y-2">
                  {s.plan.map((p, i) => {
                    const key = `${s.id}-${i}`;
                    return (
                      <li key={p} className="flex items-center justify-between gap-2 text-sm">
                        <span>{p}</span>
                        <Btn variant={today[key] ? "accent" : "ghost"} onClick={() => add(key)}>
                          {today[key] ? `✓ ${today[key]}` : "سجّل"}
                        </Btn>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs text-muted-foreground">💡 {s.remind}</p>
                <PrivateNote
                  storageValue={notes[s.id] ?? ""}
                  onChange={(v) => setNotes((p) => ({ ...p, [s.id]: v }))}
                />
              </div>
            ) : null}
          </Card>
        ))}
      </div>

      <Note>خطط تحفيزية عملية، وليست إلزاماً شرعياً ولا حصراً للخير في هذه البنود.</Note>
    </div>
  );
}
