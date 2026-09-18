import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Card from '../components/Card';
import Button from '../components/Button';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    api
      .get(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-5 py-16 text-center">
      <Card className="p-8">
        <div className="text-4xl mb-3">{status === 'success' ? '✅' : status === 'error' ? '⚠️' : '⏳'}</div>
        <h1 className="font-display text-xl text-ink-900 mb-2">
          {status === 'loading' ? 'Verifying your email…' : status === 'success' ? 'Email verified' : 'Verification issue'}
        </h1>
        <p className="text-sm text-ink-600 mb-5">{message}</p>
        {status !== 'loading' && (
          <Link to="/login">
            <Button>Go to login</Button>
          </Link>
        )}
      </Card>
    </div>
  );
}
