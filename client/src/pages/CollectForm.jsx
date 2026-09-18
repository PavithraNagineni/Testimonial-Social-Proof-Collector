import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Card from '../components/Card';
import Button from '../components/Button';
import { Field, Input, Textarea } from '../components/Input';
import { StarRatingInput } from '../components/StarRating';

export default function CollectForm() {
  const { slug } = useParams();
  const [space, setSpace] = useState(undefined); // undefined = loading, null = not found
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    companyRole: '',
    rating: 0,
    reviewText: '',
    customAnswers: [],
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    api
      .get(`/spaces/public/${slug}`)
      .then(({ data }) => {
        setSpace(data.space);
        setForm((f) => ({
          ...f,
          customAnswers: (data.space.settings.customQuestions || []).map((q) => ({ question: q, answer: '' })),
        }));
      })
      .catch(() => setSpace(null));
  }, [slug]);

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    setAvatarFile(file || null);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  const updateAnswer = (idx, value) => {
    setForm((f) => {
      const next = [...f.customAnswers];
      next[idx] = { ...next[idx], answer: value };
      return { ...f, customAnswers: next };
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.clientName.trim()) errs.clientName = 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.clientEmail)) errs.clientEmail = 'Enter a valid email.';
    if (!form.reviewText.trim() || form.reviewText.trim().length < 10)
      errs.reviewText = 'Please write at least a short sentence.';
    if (space?.settings.requireStarRating && !form.rating) errs.rating = 'Please choose a rating.';
    if (space?.settings.requireAvatar && !avatarFile) errs.avatar = 'A photo is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('clientName', form.clientName);
      fd.append('clientEmail', form.clientEmail);
      fd.append('companyRole', form.companyRole);
      if (form.rating) fd.append('rating', form.rating);
      fd.append('reviewText', form.reviewText);
      fd.append('customAnswers', JSON.stringify(form.customAnswers.filter((a) => a.answer)));
      if (avatarFile) fd.append('avatar', avatarFile);

      await api.post(`/testimonials/collect/${slug}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (space === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-ink-600">Loading…</div>;
  }

  if (space === null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 text-center">
        <div>
          <div className="text-4xl mb-3">🔍</div>
          <h1 className="font-display text-xl text-ink-900 mb-1">Page not found</h1>
          <p className="text-sm text-ink-600">This collection link doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          {space.logoUrl && <img src={space.logoUrl} alt={space.name} className="h-10 mx-auto mb-4" />}
          <h1 className="font-display text-2xl text-ink-900">{space.name}</h1>
          <p className="text-sm text-ink-600 mt-1">{space.customPrompt}</p>
        </div>

        <Card className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="font-display text-xl text-ink-900 mb-1">Thank you!</h2>
              <p className="text-sm text-ink-600">
                Your testimonial has been submitted and is awaiting review.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {serverError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {serverError}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Your name" htmlFor="clientName" error={errors.clientName}>
                  <Input
                    id="clientName"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  />
                </Field>
                <Field label="Email" htmlFor="clientEmail" error={errors.clientEmail} hint="Never shown publicly.">
                  <Input
                    id="clientEmail"
                    type="email"
                    value={form.clientEmail}
                    onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Role / company (optional)" htmlFor="companyRole">
                <Input
                  id="companyRole"
                  value={form.companyRole}
                  onChange={(e) => setForm({ ...form, companyRole: e.target.value })}
                  placeholder="Product Manager, Acme Inc."
                />
              </Field>

              <Field label={space.settings.requireStarRating ? 'Rating' : 'Rating (optional)'} error={errors.rating}>
                <StarRatingInput value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
              </Field>

              <Field label="Your review" htmlFor="reviewText" error={errors.reviewText}>
                <Textarea
                  id="reviewText"
                  rows={4}
                  value={form.reviewText}
                  onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                  placeholder="Share your experience…"
                />
              </Field>

              {form.customAnswers.map((qa, idx) => (
                <Field key={idx} label={qa.question} htmlFor={`q-${idx}`}>
                  <Textarea
                    id={`q-${idx}`}
                    rows={2}
                    value={qa.answer}
                    onChange={(e) => updateAnswer(idx, e.target.value)}
                  />
                </Field>
              ))}

              <Field
                label={space.settings.requireAvatar ? 'Photo' : 'Photo (optional)'}
                htmlFor="avatar"
                error={errors.avatar}
              >
                <div className="flex items-center gap-3">
                  {avatarPreview && (
                    <img src={avatarPreview} alt="" className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={onAvatarChange}
                    className="text-sm text-ink-700"
                  />
                </div>
              </Field>

              <Button type="submit" className="w-full" loading={submitting}>
                Submit testimonial
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
