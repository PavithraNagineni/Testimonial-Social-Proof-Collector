import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Field, Input, Textarea, Select } from '../components/Input';

const THEMES = [
  { value: 'minimal-light', label: 'Minimal Light' },
  { value: 'dark-slate', label: 'Dark Slate' },
  { value: 'gradient', label: 'Gradient' },
];

export default function SpaceSettings() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    api
      .get(`/spaces/${id}`)
      .then(({ data }) => setSpace(data.space))
      .catch(() => toast.error('Could not load this space.'));
  }, [id]);

  if (!space) {
    return <div className="max-w-3xl mx-auto px-5 py-10 text-ink-600">Loading…</div>;
  }

  const update = (patch) => setSpace({ ...space, ...patch });
  const updateSettings = (patch) => setSpace({ ...space, settings: { ...space.settings, ...patch } });

  const onSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/spaces/${id}`, {
        name: space.name,
        customPrompt: space.customPrompt,
        theme: space.theme,
        settings: space.settings,
      });
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!window.confirm('Delete this space and all its testimonials? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/spaces/${id}`);
      toast.success('Space deleted.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete space.');
      setDeleting(false);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    if (space.settings.customQuestions.length >= 5) return toast.error('Maximum 5 custom questions.');
    updateSettings({ customQuestions: [...space.settings.customQuestions, newQuestion.trim()] });
    setNewQuestion('');
  };

  const removeQuestion = (idx) =>
    updateSettings({ customQuestions: space.settings.customQuestions.filter((_, i) => i !== idx) });

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-ink-900">{space.name}</h1>
        <Link to={`/spaces/${id}/inbox`} className="text-sm text-ink-700 hover:text-ink-900 underline">
          Go to moderation inbox →
        </Link>
      </div>
      <p className="text-sm text-ink-600 mb-6">/collect/{space.slug}</p>

      <Card className="p-6 space-y-5">
        <Field label="Space name" htmlFor="name">
          <Input id="name" value={space.name} onChange={(e) => update({ name: e.target.value })} />
        </Field>

        <Field label="Prompt shown to customers" htmlFor="prompt">
          <Textarea
            id="prompt"
            rows={3}
            value={space.customPrompt}
            onChange={(e) => update({ customPrompt: e.target.value })}
          />
        </Field>

        <Field label="Wall of Love theme" htmlFor="theme">
          <Select id="theme" value={space.theme} onChange={(e) => update({ theme: e.target.value })}>
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex items-center justify-between border border-paper-200 rounded-lg px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink-900">Require a star rating</p>
            <p className="text-xs text-ink-600">Reviewers must give 1–5 stars to submit.</p>
          </div>
          <input
            type="checkbox"
            checked={space.settings.requireStarRating}
            onChange={(e) => updateSettings({ requireStarRating: e.target.checked })}
            className="h-5 w-5 accent-ink-900"
          />
        </div>

        <div className="flex items-center justify-between border border-paper-200 rounded-lg px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink-900">Require a photo</p>
            <p className="text-xs text-ink-600">Reviewers must upload an avatar/photo to submit.</p>
          </div>
          <input
            type="checkbox"
            checked={space.settings.requireAvatar}
            onChange={(e) => updateSettings({ requireAvatar: e.target.checked })}
            className="h-5 w-5 accent-ink-900"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-ink-900 mb-2">Custom questions (up to 5)</p>
          <div className="space-y-2 mb-3">
            {space.settings.customQuestions.map((q, idx) => (
              <div key={idx} className="flex items-center justify-between bg-paper-100 rounded-lg px-3 py-2">
                <span className="text-sm text-ink-800">{q}</span>
                <button onClick={() => removeQuestion(idx)} className="text-ink-600 hover:text-red-600 text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="What did you like most?"
            />
            <Button type="button" variant="secondary" onClick={addQuestion}>
              Add
            </Button>
          </div>
        </div>

        <div className="pt-2 flex justify-between items-center">
          <Button variant="danger" onClick={onDelete} loading={deleting}>
            Delete space
          </Button>
          <Button onClick={onSave} loading={saving}>
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
