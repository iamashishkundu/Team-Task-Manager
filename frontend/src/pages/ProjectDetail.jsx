import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import TaskCard from "../components/TaskCard.jsx";

const columns = [
  { id: "TODO", title: "Todo" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" }
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");
  const [filters, setFilters] = useState({ status: "", priority: "", assignee: "" });
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "MEDIUM",
    dueDate: ""
  });
  const [memberForm, setMemberForm] = useState({ email: "", role: "MEMBER" });

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.project);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const isAdmin = useMemo(() => {
    if (!project || !user) return false;
    const membership = project.members?.find((member) => member.userId === user.id);
    return membership?.role === "ADMIN";
  }, [project, user]);

  const filteredTasks = useMemo(() => {
    if (!project?.tasks) return [];
    return project.tasks.filter((task) => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assignee && task.assignedToId !== filters.assignee) return false;
      return true;
    });
  }, [project, filters]);

  const groupedTasks = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter((task) => task.status === column.id);
      return acc;
    }, {});
  }, [filteredTasks]);

  const canUpdateTask = (task) => {
    if (isAdmin) return true;
    return task.assignedToId === user?.id;
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination, source } = result;
    if (destination.droppableId === source.droppableId) return;

    const task = project.tasks.find((item) => item.id === draggableId);
    if (!task) return;

    if (!canUpdateTask(task)) {
      toast.error("Only the assignee can move this task");
      return;
    }

    try {
      await api.put(`/tasks/${task.id}`, { status: destination.droppableId });
      setProject((prev) => ({
        ...prev,
        tasks: prev.tasks.map((item) =>
          item.id === task.id ? { ...item, status: destination.droppableId } : item
        )
      }));
      toast.success("Task updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...taskForm,
        assignedTo: taskForm.assignedTo || undefined,
        dueDate: taskForm.dueDate || undefined
      };
      const response = await api.post(`/projects/${id}/tasks`, payload);
      setProject((prev) => ({ ...prev, tasks: [response.data.task, ...prev.tasks] }));
      setTaskForm({ title: "", description: "", assignedTo: "", priority: "MEDIUM", dueDate: "" });
      setShowTaskPanel(false);
      toast.success("Task created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post(`/projects/${id}/members`, memberForm);
      setProject((prev) => ({ ...prev, members: [...prev.members, response.data.member] }));
      setMemberForm({ email: "", role: "MEMBER" });
      setShowMemberModal(false);
      toast.success("Member added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-mist" />;
  }

  if (!project) {
    return <div className="card p-6">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate">{project.name}</h1>
          <p className="text-sm text-slate/60">{project.description || "No description"}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button type="button" className="btn-primary" onClick={() => setShowTaskPanel(true)}>
              Add Task
            </button>
          ) : null}
          <button type="button" className="btn-outline" onClick={() => setActiveTab("members")}>Members</button>
          <button type="button" className="btn-outline" onClick={() => setActiveTab("tasks")}>Tasks</button>
        </div>
      </div>

      {activeTab === "tasks" ? (
        <div className="space-y-4">
          <div className="card p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={filters.status}
                  onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="">All</option>
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select
                  className="input"
                  value={filters.priority}
                  onChange={(event) => setFilters((prev) => ({ ...prev, priority: event.target.value }))}
                >
                  <option value="">All</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className="label">Assignee</label>
                <select
                  className="input"
                  value={filters.assignee}
                  onChange={(event) => setFilters((prev) => ({ ...prev, assignee: event.target.value }))}
                >
                  <option value="">All</option>
                  {project.members.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid gap-4 md:grid-cols-3">
              {columns.map((column) => (
                <Droppable key={column.id} droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-3 rounded-2xl bg-white/70 p-3"
                    >
                      <h3 className="text-sm font-semibold text-slate">{column.title}</h3>
                      {groupedTasks[column.id].length === 0 ? (
                        <div className="rounded-xl border border-dashed border-mist p-4 text-xs text-slate/50">
                          Drop tasks here.
                        </div>
                      ) : null}
                      {groupedTasks[column.id].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={!canUpdateTask(task)}>
                          {(dragProvided) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                            >
                              <TaskCard task={task} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate">Members</h2>
            {isAdmin ? (
              <button type="button" className="btn-primary" onClick={() => setShowMemberModal(true)}>
                Add Member
              </button>
            ) : null}
          </div>
          <div className="card divide-y divide-mist">
            {project.members.map((member) => (
              <div key={member.userId} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-slate">{member.user.name}</p>
                  <p className="text-xs text-slate/60">{member.user.email}</p>
                </div>
                <span className="text-xs font-semibold text-slate/70">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTaskPanel ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-md bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate">Add Task</h2>
              <button type="button" className="btn-outline" onClick={() => setShowTaskPanel(false)}>
                Close
              </button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={handleCreateTask}>
              <div>
                <label className="label">Title</label>
                <input
                  className="input"
                  value={taskForm.title}
                  onChange={(event) => setTaskForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  value={taskForm.description}
                  onChange={(event) => setTaskForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>
              <div>
                <label className="label">Assignee</label>
                <select
                  className="input"
                  value={taskForm.assignedTo}
                  onChange={(event) => setTaskForm((prev) => ({ ...prev, assignedTo: event.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {project.members.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Priority</label>
                  <select
                    className="input"
                    value={taskForm.priority}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, priority: event.target.value }))}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="label">Due date</label>
                  <input
                    className="input"
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(event) => setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">
                Create Task
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {showMemberModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate">Add Member</h2>
            <form className="mt-4 space-y-4" onSubmit={handleAddMember}>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={memberForm.email}
                  onChange={(event) => setMemberForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={memberForm.role}
                  onChange={(event) => setMemberForm((prev) => ({ ...prev, role: event.target.value }))}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="btn-outline" onClick={() => setShowMemberModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
