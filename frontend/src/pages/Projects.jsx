import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import ProjectCard from "../components/ProjectCard.jsx";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get("/projects");
      setProjects(response.data.projects || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post("/projects", form);
      setProjects((prev) => [response.data.project, ...prev]);
      setForm({ name: "", description: "" });
      setShowModal(false);
      toast.success("Project created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate">Projects</h1>
          <p className="text-sm text-slate/60">Manage shared workstreams.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowModal(true)}>
          New Project
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-mist" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-6 text-sm text-slate/60">No projects yet. Create your first one.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate">Create Project</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreate}>
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
