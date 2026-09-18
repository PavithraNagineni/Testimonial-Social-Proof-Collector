import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Field, Input } from '../components/Input';

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (form.password.length < 8) errs.password = 'Use at least 8 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await signup(form.name, form.email, form.password);
      toast.success('Account created! Check the server console for your verification link.');
      if (data.devVerificationToken) setDevToken(data.devVerificationToken);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-display text-2xl text-ink-900 mb-1">Create your account</h1>
      <p className="text-sm text-ink-600 mb-6">Start collecting testimonials in minutes.</p>
      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Full name" htmlFor="name" error={errors.name}>
            <Input id="name" name="name" value={form.name} onChange={onChange} placeholder="Ada Lovelace" />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@company.com" />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters.">
            <Input id="password" name="password" type="password" value={form.password} onChange={onChange} placeholder="••••••••" />
          </Field>
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        {devToken && (
          <div className="mt-4 p-3 rounded-lg bg-paper-100 border border-paper-200 text-xs text-ink-700 break-all">
            <p className="font-medium mb-1">Dev mode — no SMTP configured:</p>
            <Link to={`/verify-email?token=${devToken}`} className="underline text-ink-900">
              Click here to verify your email
            </Link>
          </div>
        )}
      </Card>
      <p className="text-sm text-ink-600 mt-4 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-ink-900 font-medium underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
