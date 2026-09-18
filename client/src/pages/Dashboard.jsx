import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Field, Input, Textarea } from '../components/Input';
import { CardSkeleton, EmptyState } from '../components/Feedback';

export default function Dashboard() {
  const toast = useToast();
  const [spaces, setSpaces] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', customPrompt: '' });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/spaces');
      setSpaces(data.spaces);
    } catch (err) {
      toast.error('Failed to load spaces.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required.');
    setCreating(true);
    try {
      await api.post('/spaces', form);
      toast.success('Space created!');
      setModalOpen(false);
      setForm({ name: '', slug: '', customPrompt: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create space.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Your spaces</h1>
          <p className="text-sm text-ink-600 mt-1">
            Each space is a branded collection page with its own link and settings.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ New space</Button>
      </div>

      {spaces === null && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {spaces?.length === 0 && (
        <Card>
          <EmptyState
            icon="🪧"
            title="No spaces yet"
            description="Create your first collection space to start gathering testimonials."
            action={<Button onClick={() => setModalOpen(true)}>+ New space</Button>}
          />
        </Card>
      )}

      {spaces && spaces.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {spaces.map((space) => (
            <Card key={space._id} className="p-5 flex flex-col">
              <h3 className="font-display text-lg text-ink-900">{space.name}</h3>
              <p className="text-xs text-ink-600 mt-0.5">/collect/{space.slug}</p>

              <div className="flex gap-4 mt-4 text-sm text-ink-700">
                <div>
                  <span className="font-semibold text-ink-900">{space.stats.total}</span> total
                </div>
                <div>
                  <span className="font-semibold text-clay-600">{space.stats.pending}</span> pending
                </div>
                <div>
                  <span className="font-semibold text-ink-600">{space.stats.approved}</span> approved
                </div>
              </div>

              <div className="mt-5 flex gap-2 flex-wrap">
                <Link to={`/spaces/${space._id}/inbox`}>
                  <Button size="sm">Moderation inbox</Button>
                </Link>
                <Link to={`/spaces/${space._id}/settings`}>
                  <Button size="sm" variant="secondary">
                    Settings
                  </Button>
                </Link>
                <a href={`/wall/${space.slug}`} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="ghost">
                    View wall ↗
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create a new space"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onCreate} loading={creating}>
              Create space
            </Button>
          </>
        }
      >
        <form onSubmit={onCreate} className="space-y-4">
          <Field label="Space name" htmlFor="name">
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Acme Corp"
              required
            />
          </Field>
          <Field label="Custom URL slug" htmlFor="slug" hint="Leave blank to auto-generate from the name.">
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="acme-corp"
            />
          </Field>
          <Field label="Prompt shown to customers" htmlFor="customPrompt">
            <Textarea
              id="customPrompt"
              rows={3}
              value={form.customPrompt}
              onChange={(e) => setForm({ ...form, customPrompt: e.target.value })}
              placeholder="Tell us about your experience with Acme Corp!"
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
