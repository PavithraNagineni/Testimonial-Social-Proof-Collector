import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Field, Input } from '../components/Input';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-display text-2xl text-ink-900 mb-1">Welcome back</h1>
      <p className="text-sm text-ink-600 mb-6">Log in to manage your testimonial spaces.</p>
      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@company.com" required />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input id="password" name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" required />
          </Field>
          <div className="text-right -mt-2">
            <Link to="/forgot-password" className="text-xs text-ink-600 hover:text-ink-900 underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Log in
          </Button>
        </form>
        <p className="text-xs text-ink-600 mt-4 text-center">
          Demo account: <code className="bg-paper-100 px-1 rounded">demo@example.com</code> /{' '}
          <code className="bg-paper-100 px-1 rounded">password123</code> (after running the seed script)
        </p>
      </Card>
      <p className="text-sm text-ink-600 mt-4 text-center">
        New here?{' '}
        <Link to="/signup" className="text-ink-900 font-medium underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
