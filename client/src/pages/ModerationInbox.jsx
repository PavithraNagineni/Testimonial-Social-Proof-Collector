import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import Tabs from '../components/Tabs';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input, Select } from '../components/Input';
import TestimonialCard from '../components/TestimonialCard';
import EmbedGeneratorModal from '../components/EmbedGeneratorModal';
import { CardSkeleton, EmptyState } from '../components/Feedback';

let debounceTimer;

export default function ModerationInbox() {
  const { id } = useParams();
  const toast = useToast();

  const [space, setSpace] = useState(null);
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('all');
  const [rating, setRating] = useState('');
  const [search, setSearch] = useState('');
  const [testimonials, setTestimonials] = useState(null);
  const [embedOpen, setEmbedOpen] = useState(false);

  const loadSpace = useCallback(async () => {
    try {
      const { data } = await api.get(`/spaces/${id}`);
      setSpace(data.space);
    } catch {
      toast.error('Could not load this space.');
    }
  }, [id]);

  const loadStats = useCallback(async () => {
    try {
      const { data } = await api.get(`/testimonials/space/${id}/stats`);
      setStats(data.stats);
    } catch {
      /* non-critical */
    }
  }, [id]);

  const loadTestimonials = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (rating) params.set('rating', rating);
      if (search) params.set('q', search);
      const { data } = await api.get(`/testimonials/space/${id}?${params.toString()}`);
      setTestimonials(data.testimonials);
    } catch {
      toast.error('Could not load testimonials.');
    }
  }, [id, status, rating, search]);

  useEffect(() => {
    loadSpace();
    loadStats();
  }, [loadSpace, loadStats]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const onSearchChange = (val) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => setSearch(val), 350);
  };

  const onModerate = async (testimonialId, patch) => {
    try {
      const { data } = await api.patch(`/testimonials/${testimonialId}/moderate`, patch);
      setTestimonials((list) => list.map((t) => (t._id === testimonialId ? data.testimonial : t)));
      loadStats();
      toast.success('Updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update testimonial.');
    }
  };

  const onDelete = async (testimonialId) => {
    if (!window.confirm('Delete this testimonial? This cannot be undone.')) return;
    try {
      await api.delete(`/testimonials/${testimonialId}`);
      setTestimonials((list) => list.filter((t) => t._id !== testimonialId));
      loadStats();
      toast.success('Testimonial deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete testimonial.');
    }
  };

  const counts = stats
    ? {
        all: stats.totalCount,
        pending: stats.pendingCount,
        approved: stats.approvedCount,
        archived: stats.archivedCount,
      }
    : {};

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h1 className="font-display text-2xl text-ink-900">{space?.name || 'Loading…'}</h1>
        <div className="flex gap-2">
          <Link to={`/spaces/${id}/settings`}>
            <Button variant="secondary" size="sm">
              Settings
            </Button>
          </Link>
          {space && (
            <Button size="sm" onClick={() => setEmbedOpen(true)}>
              Embed wall
            </Button>
          )}
        </div>
      </div>
      {space && (
        <p className="text-sm text-ink-600 mb-6">
          Collection link:{' '}
          <a href={`/collect/${space.slug}`} target="_blank" rel="noreferrer" className="underline">
            /collect/{space.slug}
          </a>
          {'  ·  '}
          <a href={`/wall/${space.slug}`} target="_blank" rel="noreferrer" className="underline">
            View wall ↗
          </a>
        </p>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Card className="p-4">
            <p className="text-xs text-ink-600">Average rating</p>
            <p className="font-display text-2xl text-ink-900">{stats.avgRating || '–'}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-ink-600">Total reviews</p>
            <p className="font-display text-2xl text-ink-900">{stats.totalCount}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-ink-600">Pending</p>
            <p className="font-display text-2xl text-clay-600">{stats.pendingCount}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-ink-600">Star distribution</p>
            <div className="flex gap-1 mt-1 items-end h-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  title={`${n} star: ${stats.distribution[n]}`}
                  className="bg-clay-400 w-2 rounded-sm"
                  style={{
                    height: `${
                      stats.totalCount ? Math.max(4, (stats.distribution[n] / stats.totalCount) * 24) : 4
                    }px`,
                  }}
                />
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <Tabs
          tabs={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'pending', label: 'Pending', count: counts.pending },
            { value: 'approved', label: 'Approved', count: counts.approved },
            { value: 'archived', label: 'Archived', count: counts.archived },
          ]}
          active={status}
          onChange={setStatus}
        />
        <div className="flex gap-2">
          <Input
            placeholder="Search reviews…"
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-44"
          />
          <Select value={rating} onChange={(e) => setRating(e.target.value)} className="w-32">
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n > 1 ? 's' : ''}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {testimonials === null && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {testimonials?.length === 0 && (
        <Card>
          <EmptyState
            icon="📭"
            title="Nothing here yet"
            description="Once customers submit testimonials through your collection link, they'll show up here for review."
          />
        </Card>
      )}

      <div className="space-y-4">
        {testimonials?.map((t) => (
          <TestimonialCard key={t._id} t={t} onModerate={onModerate} onDelete={onDelete} />
        ))}
      </div>

      {space && (
        <EmbedGeneratorModal open={embedOpen} onClose={() => setEmbedOpen(false)} slug={space.slug} />
      )}
    </div>
  );
}
