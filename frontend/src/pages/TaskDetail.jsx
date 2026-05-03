import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTask = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks/${id}`);
      setTask(response.data.task);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  const isAdmin = useMemo(() => {
    if (!task || !user) return false;
    const membership = task.project?.members?.find((member) => member.userId === user.id);
    return membership?.role === "ADMIN";
  }, [task, user]);

  const handleUpdate = async (patch) => {
    try {
      const response = await api.put(`/tasks/${id}`, patch);
      setTask(response.data.task);
      toast.success("Task updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-mist" />;
  }

  if (!task) {
    return <div className="card p-6">Task not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate">{task.title}</h1>
            <p className="text-sm text-slate/60">{task.project?.name}</p>
          </div>
          <StatusBadge status={task.status} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <p className="label">Assignee</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white">
                {task.assignedTo?.name?.[0] || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate">
                  {task.assignedTo?.name || "Unassigned"}
                </p>
                <p className="text-xs text-slate/60">{task.assignedTo?.email || ""}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="label">Due Date</p>
            <p className="mt-2 text-sm text-slate">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
            </p>
          </div>
          <div>
            <p className="label">Priority</p>
            <p className="mt-2 text-sm text-slate">{task.priority}</p>
          </div>
          <div>
            <p className="label">Status</p>
            <select
              className="input mt-2"
              value={task.status}
              onChange={(event) => handleUpdate({ status: event.target.value })}
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>

        {isAdmin ? (
          <div className="mt-6 space-y-4">
            <div>
              <p className="label">Title</p>
              <input
                className="input mt-2"
                value={task.title}
                onChange={(event) => setTask((prev) => ({ ...prev, title: event.target.value }))}
                onBlur={(event) => handleUpdate({ title: event.target.value })}
              />
            </div>
            <div>
              <p className="label">Description</p>
              <textarea
                className="input mt-2"
                rows={4}
                value={task.description || ""}
                onChange={(event) => setTask((prev) => ({ ...prev, description: event.target.value }))}
                onBlur={(event) => handleUpdate({ description: event.target.value })}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
