// src/components/StatusBadge.tsx
interface StatusBadgeProps {
  status: "Not Started" | "In Progress" | "Finished";
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusClasses = {
    "Not Started": "bg-gray-100 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Finished": "bg-green-100 text-green-800",
  };

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
};