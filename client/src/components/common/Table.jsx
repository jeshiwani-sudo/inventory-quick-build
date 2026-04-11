import React from 'react';
import EmptyState from './EmptyState';

const Table = ({ columns, data, loading = false }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-3 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="text-gray-700 dark:text-gray-200 text-sm">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10 text-gray-400">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-10">
                <EmptyState title="No data available" message="There is nothing to show yet" icon="📭" />
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    {row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;