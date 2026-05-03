import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name) nextErrors.name = "Name is required";
    if (!form.email.includes("@")) nextErrors.email = "Enter a valid email";
    if (form.password.length < 8) nextErrors.password = "Password must be 8+ characters";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await register(form);
      toast.success("Account created!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-slate">Create account</h1>
        <p className="text-sm text-slate/60">Collaborate on tasks in minutes.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
            />
            {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="name@company.com"
            />
            {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder="••••••••"
            />
            {errors.password ? (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            ) : null}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-xs text-slate/60">
          Already have an account? <Link to="/login" className="text-brand">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
