import React from "react";

const styles = {
  TODO: "bg-slate/10 text-slate",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  DONE: "bg-emerald-100 text-emerald-700"
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}
