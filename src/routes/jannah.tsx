 import React from 'react';
import { useStore } from '../lib/store';
import Paradise from '../components/paradise';

export default function Jannah() {
  const { useDayLog } = useStore();
  const { lifetimeTotal } = useDayLog();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="p-4 bg-emerald-700 text-white text-center shadow-md">
        <h1 className="text-2xl font-bold">الجنة ونعيمها</h1>
        <p className="text-sm mt-1 opacity-90">«سَلَامٌ عَلَيْكُمْ بِمَا صَبَرْتُمْ فَنِعْمَ عُقْبَى الدَّارِ»</p>
      </div>
      
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow p-4 mb-4 text-center border-l-4 border-emerald-500">
          <p className="text-gray-600 text-sm mb-1">الرصيد التراكمي للأعمال</p>
          <p className="text-3xl font-bold text-emerald-600">{lifetimeTotal}</p>
          <p className="text-xs text-gray-400 mt-2">
            *هذا المشهد هو تمثيل تحفيزي رمزي فقط ولا يعبر عن الجنة الحقيقية أو حساب الأجر الإلهي.
          </p>
        </div>

        <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border-2 border-emerald-100 relative">
          <Paradise totalPoints={lifetimeTotal} />
        </div>
      </div>
    </div>
  );
}
