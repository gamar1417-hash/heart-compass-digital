 import React from 'react';
import { useStore } from '../store';

export const Paradise: React.FC = () => {
  const { totalPoints } = useStore();

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">الجنة ونعيمها</h1>
      <p className="text-lg">إجمالي النقاط الحالية:</p>
      <div className="text-4xl font-extrabold text-green-600 my-4">
        {totalPoints}
      </div>
    </div>
  );
};

export default Paradise;
