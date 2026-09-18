import React from 'react';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import { StarRatingDisplay } from './StarRating';

const statusVariant = { pending: 'pending', approved: 'approved', archived: 'archived' };

export default function TestimonialCard({ t, onModerate, onDelete }) {
  const initials = t.clientName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {t.avatarUrl ? (
            <img src={t.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-ink-900 text-paper-50 flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-ink-900">{t.clientName}</p>
            {t.companyRole && <p className="text-xs text-ink-600">{t.companyRole}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant={statusVariant[t.status]}>{t.status}</Badge>
          {t.isFeatured && <Badge variant="featured">★ Featured</Badge>}
        </div>
      </div>

      {t.rating ? <div className="mt-3"><StarRatingDisplay value={t.rating} /></div> : null}

      <p className="mt-3 text-sm text-ink-800 leading-relaxed whitespace-pre-wrap">{t.reviewText}</p>

      {t.customAnswers?.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-paper-200 pt-3">
          {t.customAnswers.map((qa, i) => (
            <div key={i} className="text-xs">
              <p className="text-ink-600">{qa.question}</p>
              <p className="text-ink-800">{qa.answer}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {t.status !== 'approved' && (
          <Button size="sm" onClick={() => onModerate(t._id, { status: 'approved' })}>
            Approve
          </Button>
        )}
        {t.status !== 'archived' && (
          <Button size="sm" variant="secondary" onClick={() => onModerate(t._id, { status: 'archived' })}>
            Archive
          </Button>
        )}
        {t.status === 'archived' && (
          <Button size="sm" variant="secondary" onClick={() => onModerate(t._id, { status: 'pending' })}>
            Restore to pending
          </Button>
        )}
        <Button
          size="sm"
          variant={t.isFeatured ? 'clay' : 'ghost'}
          onClick={() => onModerate(t._id, { isFeatured: !t.isFeatured })}
        >
          {t.isFeatured ? '★ Featured' : '☆ Feature'}
        </Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(t._id)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
