import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Btn, Card, Note } from "@/components/bits";
import { familyJannahInsight } from "@/lib/jannah-ai.functions";

type Props = {
  total: number;
  today: number;
  stage: string;
  nextAt: number | null;
  members: number;
  tracks: { name: string; total: number }[];
};

export function FamilyInsight(props: Props) {
  const run = useServerFn(familyJannahInsight);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const go = async () => {
    setBusy(true);
    setErr("");
    try {
      const r = await run({ data: props });
      if (r.error) setErr(r.error);
      else setText(r.text);
    } catch {
      setErr("تعذّر الاتصال، حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="space-y-2">
      <h2 className="font-bold">✨ رسالة مرحلة جنة العائلة</h2>
      <p className="text-xs text-muted-foreground">
        تحليل لطيف لتراكم العائلة ومرحلتها، مع آية أو حديث يناسبها.
      </p>
      {text ? (
        <p className="whitespace-pre-line text-sm leading-loose">{text}</p>
      ) : null}
      {err ? <Note>{err}</Note> : null}
      <Btn onClick={go} disabled={busy}>
        {busy ? "جارٍ الكتابة…" : text ? "رسالة جديدة" : "اكتب لنا رسالة مرحلتنا"}
      </Btn>
      <p className="text-[11px] text-muted-foreground">
        مُولَّدة بالذكاء الاصطناعي من أرقام العائلة الإجمالية فقط، وهي للتذكير لا لتقدير الأجر.
      </p>
    </Card>
  );
}
