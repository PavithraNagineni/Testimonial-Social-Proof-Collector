import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { StarRatingDisplay } from '../components/StarRating';

const THEME_CLASSES = {
  'minimal-light': 'bg-paper-50 text-ink-900',
  'dark-slate': 'bg-ink-950 text-paper-100',
  gradient: 'bg-gradient-to-br from-ink-900 via-ink-800 to-clay-600 text-paper-50',
};

function TestimonialCardPublic({ t, dark }) {
  const initials = t.clientName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className={`rounded-xl p-5 border break-inside-avoid mb-4 ${
        dark ? 'bg-white/5 border-white/10' : 'bg-white border-paper-200 shadow-soft'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        {t.avatarUrl ? (
          <img src={t.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              dark ? 'bg-white/10' : 'bg-ink-900 text-paper-50'
            }`}
          >
            {initials}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold">{t.clientName}</p>
          {t.companyRole && <p className={`text-xs ${dark ? 'text-paper-100/60' : 'text-ink-600'}`}>{t.companyRole}</p>}
        </div>
        {t.isFeatured && <span className="ml-auto text-clay-400 text-xs">★ Featured</span>}
      </div>
      {t.rating ? <StarRatingDisplay value={t.rating} size={14} /> : null}
      <p className={`mt-2 text-sm leading-relaxed ${dark ? 'text-paper-100/90' : 'text-ink-800'}`}>{t.reviewText}</p>
    </div>
  );
}

export default function WallOfLove() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const layout = params.get('layout') || 'grid';
  const [data, setData] = useState(undefined);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    api
      .get(`/testimonials/wall/${slug}`)
      .then(({ data }) => setData(data))
      .catch(() => setData(null));
  }, [slug]);

  if (data === undefined) {
    return <div className="min-h-[200px] flex items-center justify-center text-ink-600">Loading…</div>;
  }
  if (data === null) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-ink-600 text-sm px-5 text-center">
        This wall doesn't exist or has no approved testimonials yet.
      </div>
    );
  }

  const { space, testimonials } = data;
  const theme = params.get('theme') || space.theme || 'minimal-light';
  const dark = theme !== 'minimal-light';
  const themeClass = THEME_CLASSES[theme] || THEME_CLASSES['minimal-light'];

  if (testimonials.length === 0) {
    return (
      <div className={`min-h-[200px] flex items-center justify-center text-sm px-5 text-center ${themeClass}`}>
        No approved testimonials yet — check back soon!
      </div>
    );
  }

  if (layout === 'badge') {
    const avg =
      testimonials.reduce((s, t) => s + (t.rating || 0), 0) / (testimonials.filter((t) => t.rating).length || 1);
    return (
      <div className={`inline-flex items-center gap-3 rounded-xl px-4 py-3 border ${themeClass} ${dark ? 'border-white/15' : 'border-paper-200'}`}>
        <StarRatingDisplay value={Math.round(avg)} size={18} />
        <div>
          <p className="text-sm font-semibold">{avg.toFixed(1)} / 5</p>
          <p className={`text-xs ${dark ? 'text-paper-100/60' : 'text-ink-600'}`}>{testimonials.length} reviews</p>
        </div>
      </div>
    );
  }

  if (layout === 'carousel') {
    const t = testimonials[carouselIndex % testimonials.length];
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 py-10 ${themeClass}`}>
        <div className="max-w-lg w-full text-center">
          <TestimonialCardPublic t={t} dark={dark} />
          <div className="flex justify-center gap-2 mt-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className={`w-2 h-2 rounded-full ${i === carouselIndex % testimonials.length ? 'bg-clay-400' : dark ? 'bg-white/20' : 'bg-paper-200'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // grid (default) — responsive masonry via CSS columns
  return (
    <div className={`min-h-screen px-6 py-10 ${themeClass}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl">{space.name} — Wall of Love</h1>
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {testimonials.map((t) => (
            <TestimonialCardPublic key={t._id} t={t} dark={dark} />
          ))}
        </div>
      </div>
    </div>
  );
}
