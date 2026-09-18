import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Field, Input } from '../components/Input';

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (data.devResetToken) setDevToken(data.devResetToken);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="font-display text-2xl text-ink-900 mb-1">Reset your password</h1>
      <p className="text-sm text-ink-600 mb-6">
        Enter your email and we'll send you a link to set a new password.
      </p>
      <Card className="p-6">
        {sent ? (
          <div>
            <p className="text-sm text-ink-800">
              If that email exists, a reset link has been sent (check the server console for the
              simulated email).
            </p>
            {devToken && (
              <div className="mt-4 p-3 rounded-lg bg-paper-100 border border-paper-200 text-xs text-ink-700 break-all">
                <p className="font-medium mb-1">Dev mode — no SMTP configured:</p>
                <Link to={`/reset-password?token=${devToken}`} className="underline text-ink-900">
                  Click here to reset your password
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Email" htmlFor="email">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
            </Field>
            <Button type="submit" className="w-full" loading={loading}>
              Send reset link
            </Button>
          </form>
        )}
      </Card>
      <p className="text-sm text-ink-600 mt-4 text-center">
        <Link to="/login" className="text-ink-900 font-medium underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
