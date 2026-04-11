import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Chart = ({
  title,
  data = [],
  dataKey1 = 'quantity_received',
  dataKey2 = 'quantity_in_stock',
  name1 = 'Received',
  name2 = 'In Stock',
  color1 = '#4F46E5',
  color2 = '#10B981',
  type = 'bar',
  xDataKey = 'product_name',
}) => {
  const ChartComponent = type === 'line' ? LineChart : BarChart;

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {title}
      </h2>

      {data.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-gray-400">
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={360}>
          <ChartComponent
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
            <XAxis
              dataKey={xDataKey}
              angle={-45}
              textAnchor="end"
              height={85}
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />

            {/* First series */}
            {type === 'bar' ? (
              <Bar dataKey={dataKey1} fill={color1} name={name1} barSize={32} />
            ) : (
              <Line dataKey={dataKey1} stroke={color1} strokeWidth={3} name={name1} dot />
            )}

            {/* Second series */}
            {type === 'bar' ? (
              <Bar dataKey={dataKey2} fill={color2} name={name2} barSize={32} />
            ) : (
              <Line dataKey={dataKey2} stroke={color2} strokeWidth={3} name={name2} dot />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Chart;