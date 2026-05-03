import React from "react";
import StatusBadge from "./StatusBadge.jsx";

const priorityStyles = {
  HIGH: "text-red-600",
  MEDIUM: "text-yellow-600",
  LOW: "text-emerald-600"
};

export default function TaskCard({ task }) {
  return (
    <div className="card space-y-2 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate">{task.title}</p>
          <p className="text-xs text-slate/60">{task.assignedTo?.name || "Unassigned"}</p>
        </div>
        <StatusBadge status={task.status} />
      </div>
      <div className="flex items-center justify-between text-xs text-slate/70">
        <span className={priorityStyles[task.priority]}>{task.priority}</span>
        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
      </div>
    </div>
  );
}
