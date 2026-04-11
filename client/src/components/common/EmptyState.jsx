import React from "react";

const EmptyState = ({
  title = "No data found",
  message = "There’s nothing to display here yet.",
  icon = "📭",
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        {title}
      </h2>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;