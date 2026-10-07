 import React, { useState } from 'react';
import { Sparkles, Castle, Compass, Volume2, Utensils, Award, Gem, Trees, Waves, Crown } from 'lucide-react';

interface ParadiseProps {
  points?: number;
}

export function paradiseCounts(points: number = 0) {
  const safePts = Number(points) || 0;
  return {
    palaces: Math.floor(safePts / 100) + 1,
    services: Math.floor(safePts / 50) + 2,
    trees: Math.floor(safePts / 20) + 5,
    rivers: Math.floor(safePts / 150) + 1,
  };
}

export function paradiseStage(points: number = 0): number {
  const safePts = Number(points) || 0;
  if (safePts >= 500) return 4;
  if (safePts >= 200) return 3;
  if (safePts >= 50) return 2;
  return 1;
}

export function Paradise({ points = 350 }: ParadiseProps) {
  const counts = paradiseCounts(points);
  const stage = paradiseStage(points);
  const [activeTab, setActiveTab] = useState<'entrance' | 'hall' | 'majlis' | 'banquet' | 'service'>('entrance');
  const [showServiceWheel, setShowServiceWheel] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const sections = {
    entrance: {
      title: "المدخل الملكي: ﴿ سَلَامٌ عَلَيْكُمْ بِمَا صَبَرْتُمْ فَنِعْمَ عُقْبَى الدَّارِ ﴾",
      bg: "from-amber-950 via-emerald-950 to-black",
      glow: "shadow-[inset_0_0_80px_rgba(251,191,36,0.3)]",
      desc: "بوابات شاهقة من الذهب الخالص واللؤلؤ المنظوم تفتح ذراعيها لاستقبال الأبرار.",
    },
    hall: {
      title: "البهو الأسطوري: قصور من ذهب وفضة وأعمدة زبرجد",
      bg: "from-amber-900 via-yellow-950 to-neutral-950",
      glow: "shadow-[inset_0_0_80px_rgba(234,179,8,0.4)]",
      desc: "أروقة ممتدة وقصور منيفه تطل على رياض خضراء وأنهار خمر ولبن وعسل.",
    },
    majlis: {
      title: "مجلس الأرائك: ﴿ مُتَّكِئِينَ عَلَى رُفْرُفٍ خُضْرٍ وَعَبْقَرِيٍّ حِسَانٍ ﴾",
      bg: "from-emerald-950 via-teal-950 to-neutral-950",
      glow: "shadow-[inset_0_0_80px_rgba(16,185,129,0.4)]",
      desc: "فُرش وثيرة وأرائك مرصعة بالدر والياقوت تريح القلوب وتنعش الابصار.",
    },
    banquet: {
      title: "قاعة الولائم الكبرى: ﴿ يُطَافُ عَلَيْهِمْ بِصِحَافٍ مِنْ ذهبٍ وَأَكْوَابٍ ﴾",
      bg: "from-orange-950 via-amber-950 to-black",
      glow: "shadow-[inset_0_0_80px_rgba(249,115,22,0.4)]",
      desc: "موائد عامرة بما تشتهيه الأنفس وتلذ الأعين من أطايب الطعام والشراب.",
    },
    service: {
      title: "دائرة الخدمة السماوية: ماذا تشتهي؟",
      bg: "from-yellow-900 via-amber-950 to-neutral-950",
      glow: "shadow-[inset_0_0_80px_rgba(250,204,21,0.5)]",
      desc: "اطلب ما شئت من نعيم مقيم: (لحم طير، فاكهة، كأس من معين، شراب طهور).",
    }
  };

  const current = sections[activeTab];

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-neutral-950 border-2 border-amber-500/50 text-white font-sans">
      
      {/* شريط الإحصائيات العلوي الملكي المتوهج */}
      <div className="absolute top-0 inset-x-0 z-30 bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-md p-4 border-b border-amber-500/20 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs px-2 text-amber-300 font-bold tracking-wider">
          <span className="flex items-center gap-1"><Crown className="w-4 h-4 text-amber-400 animate-bounce" /> رصيد الغراس: {points} نقطة</span>
          <span className="bg-amber-500/20 border border-amber-400/50 px-2.5 py-0.5 rounded-full text-amber-200">
            قصور: {counts.palaces} | خدمات: {counts.services}
          </span>
        </div>
        
        {/* شريط التقدم الفاخر */}
        <div className="flex gap-1.5 justify-center px-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s, idx) => (
            <div key={idx} className={`h-2 flex-1 rounded-full transition-all duration-500 ${idx < counts.palaces ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-y-110' : 'bg-white/10'}`}></div>
          ))}
        </div>
        <div className="text-[11px] text-center text-amber-200/90 font-medium tracking-wide flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> مرحلة الفردوس الأعلى - تتضاعف بالعمل الصالح <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>
      </div>

      {/* خلفية المشهد البصري الأسطوري المتحرك */}
      <div className={`relative h-[480px] w-full bg-gradient-to-b ${current.bg} ${current.glow} flex flex-col justify-end p-6 transition-all duration-700 overflow-hidden`}>
        
        {/* خلفيات بصرية ثلاثية الأبعاد تنبض بالحياة */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none scale-110 transition-transform duration-1000">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15)_0%,transparent_70%)] animate-pulse"></div>
          <Castle className="w-96 h-96 text-amber-300/80 drop-shadow-[0_0_35px_rgba(251,191,36,0.6)] animate-pulse" />
        </div>

        {/* صندوق النصوص والآيات القرآنية الساحرة */}
        <div className="relative z-20 bg-neutral-900/85 backdrop-blur-xl p-5 rounded-3xl border border-amber-400/50 text-center mb-16 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-neutral-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
            مشهد تفاعلي فخم
          </div>
          <h3 className="text-xs sm:text-sm font-extrabold text-amber-300 mb-2 leading-relaxed">{current.title}</h3>
          <p className="text-[11px] text-gray-200 leading-relaxed font-light">{current.desc}</p>
          {selectedItem && (
            <div className="mt-3 text-xs bg-gradient-to-r from-amber-500/30 to-emerald-500/30 border border-amber-400 py-1.5 px-4 rounded-full text-amber-200 inline-block font-bold animate-bounce shadow">
              ✨ تم استيفاء ضيافة: {selectedItem} بنجاح تام
            </div>
          )}
        </div>

        {/* دائرة الخدمة المنبثقة الأسطورية */}
        {showServiceWheel && (
          <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="relative w-72 h-72 rounded-full border-4 border-amber-400/80 flex items-center justify-center bg-gradient-to-b from-amber-950/80 to-neutral-950 shadow-[0_0_50px_rgba(251,191,36,0.5)]">
              <div className="absolute text-center text-amber-300 font-extrabold text-sm drop-shadow">
                ماذا تشتهي من نعيم؟<br/><span className="text-[10px] text-amber-100/70 font-normal">اختر ما لذ وطاب</span>
              </div>
              
              {/* أزرار الدائرة التفاعلية المحيطة */}
              {[
                { label: 'لحم طير مشوي 🍗', angle: 'top-3 left-1/2 -translate-x-1/2' },
                { label: 'فاكهة دانية 🍎', angle: 'top-12 right-10' },
                { label: 'كأس من معين 💎', angle: 'top-1/2 right-3 -translate-y-1/2' },
                { label: 'شراب طهور 🍷', angle: 'bottom-12 right-10' },
                { label: 'عسل ولبن مصفى 🍯', angle: 'bottom-3 left-1/2 -translate-x-1/2' },
                { label: 'سندس واستبرق 👗', angle: 'bottom-12 left-10' },
                { label: 'أساور من لؤلؤ 💍', angle: 'top-1/2 left-3 -translate-y-1/2' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedItem(item.label); setShowServiceWheel(false); }}
                  className={`absolute ${item.angle} bg-amber-500/25 hover:bg-amber-400 hover:text-neutral-950 text-amber-100 text-[10px] px-3 py-1.5 rounded-full border border-amber-300/70 transition-all font-bold shadow-lg scale-100 hover:scale-110`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowServiceWheel(false)}
              className="mt-8 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 px-8 py-2.5 rounded-full text-xs font-bold text-white shadow-xl transition-all"
            >
              إغلاق الدائرة
            </button>
          </div>
        )}

        {/* الأزرار السفلية الفخمة المطابقة لفيديو Base 44 */}
        <div className="absolute bottom-4 inset-x-4 z-30 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button 
            onClick={() => { setActiveTab('entrance'); setSelectedItem(null); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${activeTab === 'entrance' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 shadow-[0_0_20px_rgba(251,191,36,0.8)] scale-105' : 'bg-neutral-900/80 text-white border border-white/20 hover:bg-neutral-800'}`}
          >
            المدخل
          </button>
          <button 
            onClick={() => { setActiveTab('hall'); setSelectedItem(null); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${activeTab === 'hall' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 shadow-[0_0_20px_rgba(251,191,36,0.8)] scale-105' : 'bg-neutral-900/80 text-white border border-white/20 hover:bg-neutral-800'}`}
          >
            البهو
          </button>
          <button 
            onClick={() => { setActiveTab('majlis'); setSelectedItem(null); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${activeTab === 'majlis' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 shadow-[0_0_20px_rgba(251,191,36,0.8)] scale-105' : 'bg-neutral-900/80 text-white border border-white/20 hover:bg-neutral-800'}`}
          >
            مجلس الأرائك
          </button>
          <button 
            onClick={() => { setActiveTab('banquet'); setSelectedItem(null); }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${activeTab === 'banquet' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-950 shadow-[0_0_20px_rgba(251,191,36,0.8)] scale-105' : 'bg-neutral-900/80 text-white border border-white/20 hover:bg-neutral-800'}`}
          >
            قاعة الولائم
          </button>
          <button 
            onClick={() => { setShowServiceWheel(true); }}
            className="px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.8)] flex items-center gap-1.5 animate-pulse scale-105"
          >
            <Utensils className="w-4 h-4" /> دائرة الخدمة
          </button>
        </div>

      </div>
    </div>
  );
}

export const ParadiseScene = Paradise;
