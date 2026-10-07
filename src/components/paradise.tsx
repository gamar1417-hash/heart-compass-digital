 import React, { useState } from 'react';
import { Utensils, Crown } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'entrance' | 'hall' | 'majlis' | 'banquet' | 'service'>('entrance');
  const [showServiceWheel, setShowServiceWheel] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const sections = {
    entrance: {
      title: "المدخل الملكي: ﴿ سَلَامٌ عَلَيْكُمْ بِمَا صَبَرْتُمْ فَنِعْمَ عُقْبَى الدَّارِ ﴾",
      bgImage: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1000&auto=format&fit=crop",
      desc: "بوابات شاهقة من الذهب الخالص واللؤلؤ المنظوم تفتح ذراعيها لاستقبال الأبرار.",
    },
    hall: {
      title: "البهو الأسطوري: قصور من ذهب وفضة وأعمدة لؤلؤية",
      bgImage: "https://images.unsplash.com/photo-1541971875076-8f970d573be6?q=80&w=1000&auto=format&fit=crop",
      desc: "أروقة ممتدة وقصور منيفة تطل على رياض خضراء وأنهار خمر ولبن وعسل.",
    },
    majlis: {
      title: "مجلس الأرائك: ﴿ مُتَّكِئِينَ عَلَى رُفْرُفٍ خُضْرٍ وَعَبْقَرِيٍّ حِسَانٍ ﴾",
      bgImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
      desc: "فُرش وثيرة وأرائك مرصعة بالدر والياقوت تريح القلوب وتنعش الأبصار.",
    },
    banquet: {
      title: "قاعة الولائم الكبرى: ﴿ يُطَافُ عَلَيْهِمْ بِصِحَافٍ مِنْ ذَهَبٍ وَأَكْوَابٍ ﴾",
      bgImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
      desc: "موائد عامرة بما تشتهيه الأنفس وتلذ الأعين من أطايب الطعام والشراب.",
    },
    service: {
      title: "دائرة الخدمة السماوية: ماذا تشتهي؟",
      bgImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000&auto=format&fit=crop",
      desc: "اطلب ما شئت من نعيم مقيم: (لحم طير، فاكهة، كأس من معين، شراب طهور).",
    }
  };

  const current = sections[activeTab];

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/60 text-white font-sans bg-black">
      
      {/* شريط الإحصائيات العلوي */}
      <div className="absolute top-0 inset-x-0 z-30 bg-black/85 backdrop-blur-md p-4 border-b border-amber-500/30 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs px-2 text-amber-300 font-bold tracking-wider">
          <span className="flex items-center gap-1"><Crown className="w-4 h-4 text-amber-400" /> رصيد الغراس: {points} نقطة</span>
          <span className="bg-amber-500/30 border border-amber-400 px-2.5 py-0.5 rounded-full text-amber-200">
            قصور: {counts.palaces} | خدمات: {counts.services}
          </span>
        </div>
        
        <div className="flex gap-1.5 justify-center px-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s, idx) => (
            <div key={idx} className={`h-2 flex-1 rounded-full transition-all duration-500 ${idx < counts.palaces ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]' : 'bg-white/20'}`}></div>
          ))}
        </div>
        <div className="text-[11px] text-center text-amber-200 font-medium">
          ✨ مرحلة الفردوس الأعلى - تتضاعف بالعمل الصالح
        </div>
      </div>

      {/* خلفية المشهد البصري */}
      <div className="relative h-[500px] w-full flex flex-col justify-end p-6 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter brightness-75"
          style={{ backgroundImage: `url(${current.bgImage})` }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/60"></div>

        {/* صندوق النصوص والآيات */}
        <div className="relative z-20 bg-neutral-950/85 backdrop-blur-md p-4 rounded-2xl border border-amber-400/60 text-center mb-16 shadow-2xl">
          <h3 className="text-xs sm:text-sm font-extrabold text-amber-300 mb-1.5 leading-relaxed">{current.title}</h3>
          <p className="text-[11px] text-gray-200 leading-relaxed font-light">{current.desc}</p>
          {selectedItem && (
            <div className="mt-2 text-xs bg-amber-500/30 border border-amber-400 py-1 px-3 rounded-full text-amber-200 inline-block font-bold">
              ✨ تم تقديم الضيافة: {selectedItem}
            </div>
          )}
        </div>

        {/* دائرة الخدمة */}
        {showServiceWheel && (
          <div className="absolute inset-0 z-40 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-72 h-72 rounded-full border-4 border-amber-400 flex items-center justify-center bg-black/90 shadow-[0_0_40px_rgba(251,191,36,0.5)]">
              <div className="absolute text-center text-amber-300 font-bold text-sm">
                ماذا تشتهي من نعيم؟<br/><span className="text-[10px] text-gray-300">اختر ما لذ وطاب</span>
              </div>
              
              {[
                { label: 'لحم طير مشوي 🍗', angle: 'top-3 left-1/2 -translate-x-1/2' },
                { label: 'فاكهة دانية 🍎', angle: 'top-12 right-10' },
                { label: 'كأس من معين 💎', angle: 'top-1/2 right-3 -translate-y-1/2' },
                { label: 'شراب طهور 🍷', angle: 'bottom-12 right-10' },
                { label: 'عسل ولبن 🍯', angle: 'bottom-3 left-1/2 -translate-x-1/2' },
                { label: 'سندس واستبرق 👗', angle: 'bottom-12 left-10' },
                { label: 'أساور لؤلؤ 💍', angle: 'top-1/2 left-3 -translate-y-1/2' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedItem(item.label); setShowServiceWheel(false); }}
                  className={`absolute ${item.angle} bg-amber-500/30 hover:bg-amber-400 hover:text-black text-amber-100 text-[10px] px-3 py-1.5 rounded-full border border-amber-300 transition font-bold shadow`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowServiceWheel(false)}
              className="mt-6 bg-red-600 hover:bg-red-500 px-6 py-2 rounded-full text-xs font-bold text-white shadow"
            >
              إغلاق الدائرة
            </button>
          </div>
        )}

        {/* الأزرار السفلية */}
        <div className="absolute bottom-4 inset-x-4 z-30 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button 
            onClick={() => { setActiveTab('entrance'); setSelectedItem(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${activeTab === 'entrance' ? 'bg-amber-500 text-black shadow-lg scale-105' : 'bg-black/70 text-white border border-white/20'}`}
          >
            المدخل
          </button>
          <button 
            onClick={() => { setActiveTab('hall'); setSelectedItem(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${activeTab === 'hall' ? 'bg-amber-500 text-black shadow-lg scale-105' : 'bg-black/70 text-white border border-white/20'}`}
          >
            البهو
          </button>
          <button 
            onClick={() => { setActiveTab('majlis'); setSelectedItem(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${activeTab === 'majlis' ? 'bg-amber-500 text-black shadow-lg scale-105' : 'bg-black/70 text-white border border-white/20'}`}
          >
            مجلس الأرائك
          </button>
          <button 
            onClick={() => { setActiveTab('banquet'); setSelectedItem(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${activeTab === 'banquet' ? 'bg-amber-500 text-black shadow-lg scale-105' : 'bg-black/70 text-white border border-white/20'}`}
          >
            قاعة الولائم
          </button>
          <button 
            onClick={() => { setShowServiceWheel(true); }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center gap-1.5 animate-pulse"
          >
            <Utensils className="w-4 h-4" /> دائرة الخدمة
          </button>
        </div>

      </div>
    </div>
  );
}

export const ParadiseScene = Paradise;
export default Paradise;
