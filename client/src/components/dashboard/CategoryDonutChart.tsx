import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface CategoryDonutChartProps {
  data: Array<{ name: string; amount: number; color: string; percentage: number }>;
  currency?: string;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data, currency = 'USD' }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-[#111827] border border-gray-700 p-3 rounded-xl shadow-xl">
          <p className="text-xs font-semibold text-white">{item.name}</p>
          <p className="text-xs text-indigo-400 font-bold mt-1">
            {formatCurrency(item.amount, currency)} ({formatPercentage(item.percentage)})
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-[#111827]/80 border border-gray-800/80 backdrop-blur-md flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white tracking-tight">Category Breakdown</h3>
        <p className="text-xs text-gray-400 mt-0.5">Distribution across spending categories</p>
      </div>

      <div className="h-52 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} stroke="#111827" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 space-y-2 overflow-y-auto max-h-36 pr-1">
        {data.slice(0, 5).map((cat) => (
          <div key={cat.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-gray-300 truncate max-w-[130px]">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <span className="text-white">{formatCurrency(cat.amount, currency)}</span>
              <span className="text-gray-500 text-[10px]">({formatPercentage(cat.percentage)})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
