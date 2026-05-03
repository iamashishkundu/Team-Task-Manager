import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge.jsx";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/tasks/my-tasks");
      setTasks(response.data.tasks || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "DONE").length;
    const inProgress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
    const overdue = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== "DONE";
    }).length;

    return { total, completed, inProgress, overdue };
  }, [tasks]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
      toast.success("Status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Tasks", value: stats.total },
          { label: "Completed", value: stats.completed },
          { label: "In Progress", value: stats.inProgress },
          { label: "Overdue", value: stats.overdue }
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-xs text-slate/60">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate">My Tasks</h2>
            <p className="text-xs text-slate/60">Quickly review and update status</p>
          </div>
          <button type="button" className="btn-outline" onClick={loadTasks}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-10 animate-pulse rounded-xl bg-mist" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="mt-6 text-sm text-slate/60">No tasks assigned yet.</div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate/50">
                <tr>
                  <th className="pb-3">Task</th>
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Due</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist">
                {tasks.map((task) => {
                  const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
                  return (
                    <tr key={task.id} className={overdue ? "bg-red-50" : ""}>
                      <td className="py-3 font-semibold text-slate">{task.title}</td>
                      <td className="py-3 text-slate/70">{task.project?.name}</td>
                      <td className="py-3 text-slate/70">{task.priority}</td>
                      <td className="py-3 text-slate/70">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={task.status} />
                          <select
                            className="rounded-md border border-mist bg-white px-2 py-1 text-xs"
                            value={task.status}
                            onChange={(event) => handleStatusChange(task.id, event.target.value)}
                          >
                            <option value="TODO">Todo</option>
                            <option value="IN_PROGRESS">In progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
