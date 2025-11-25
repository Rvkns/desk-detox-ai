import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DetoxItem, Category } from '../types';

interface StatsProps {
  items: DetoxItem[];
}

const COLORS = {
  [Category.ACTION]: '#ef4444', // Red-500
  [Category.ARCHIVE]: '#3b82f6', // Blue-500
  [Category.TRASH]: '#9ca3af',   // Gray-400
};

const Stats: React.FC<StatsProps> = ({ items }) => {
  const data = [
    { name: 'Azione Richiesta', value: items.filter(i => i.category === Category.ACTION).length, category: Category.ACTION },
    { name: 'Da Archiviare', value: items.filter(i => i.category === Category.ARCHIVE).length, category: Category.ARCHIVE },
    { name: 'Cestino', value: items.filter(i => i.category === Category.TRASH).length, category: Category.TRASH },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Panoramica</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.category]} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                itemStyle={{ color: '#374151', fontWeight: 600 }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Stats;