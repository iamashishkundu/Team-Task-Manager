import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.includes("@")) nextErrors.email = "Enter a valid email";
    if (!form.password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await login(form);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-semibold text-slate">Sign in</h1>
        <p className="text-sm text-slate/60">Track tasks with your team.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-xs text-slate/60">
          New here? <Link to="/register" className="text-brand">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
