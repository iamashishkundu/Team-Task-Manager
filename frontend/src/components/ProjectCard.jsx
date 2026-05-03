import React from "react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  const total = project.tasks?.length || 0;
  const completed = project.tasks?.filter((task) => task.status === "DONE").length || 0;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <Link to={`/projects/${project.id}`} className="card block p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-base font-semibold text-slate">{project.name}</p>
          <p className="text-xs text-slate/60">{project.description || "No description"}</p>
        </div>
        <div className="text-right text-xs text-slate/60">
          <p>{project._count?.members || 0} members</p>
          <p>{total} tasks</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-slate/60">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-mist">
          <div className="h-2 rounded-full bg-brand" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </Link>
  );
}
