const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Space = require('../models/Space');
const Testimonial = require('../models/Testimonial');

function hashIp(ip) {
  return crypto.createHash('sha256').update(ip || 'unknown').digest('hex');
}

// POST /api/v1/testimonials/collect/:slug  (PUBLIC - no login required)
const submitTestimonial = asyncHandler(async (req, res) => {
  const space = await Space.findOne({ slug: req.params.slug });
  if (!space) {
    res.status(404);
    throw new Error('This collection page does not exist.');
  }

  const { clientName, clientEmail, companyRole, rating, reviewText, customAnswers } = req.body;

  if (!clientName || !clientEmail || !reviewText) {
    res.status(400);
    throw new Error('Name, email, and review text are required.');
  }
  if (space.settings.requireStarRating && !rating) {
    res.status(400);
    throw new Error('A star rating is required for this space.');
  }
  if (space.settings.requireAvatar && !req.file) {
    res.status(400);
    throw new Error('A photo is required for this space.');
  }

  let parsedCustomAnswers = [];
  if (customAnswers) {
    try {
      parsedCustomAnswers = typeof customAnswers === 'string' ? JSON.parse(customAnswers) : customAnswers;
    } catch (e) {
      parsedCustomAnswers = [];
    }
  }

  const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : '';

  const testimonial = await Testimonial.create({
    space: space._id,
    clientName,
    clientEmail,
    companyRole: companyRole || '',
    rating: rating ? Number(rating) : undefined,
    reviewText,
    avatarUrl,
    customAnswers: parsedCustomAnswers,
    ipHash: hashIp(req.ip),
  });

  res.status(201).json({
    success: true,
    message: 'Thank you! Your testimonial has been submitted for review.',
    testimonial: {
      id: testimonial._id,
      status: testimonial.status,
    },
  });
});

// GET /api/v1/testimonials/space/:spaceId  (owner - moderation inbox)
const getSpaceTestimonials = asyncHandler(async (req, res) => {
  const space = await Space.findById(req.params.spaceId);
  if (!space) {
    res.status(404);
    throw new Error('Space not found.');
  }
  if (space.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not own this space.');
  }

  const { status, rating, q, page = 1, limit = 20 } = req.query;
  const filter = { space: space._id };
  if (status && status !== 'all') filter.status = status;
  if (rating) filter.rating = Number(rating);
  if (q) filter.$text = { $search: q };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Testimonial.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Testimonial.countDocuments(filter),
  ]);

  res.json({
    success: true,
    testimonials: items,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

// PATCH /api/v1/testimonials/:id/moderate   body: { status?, isFeatured? }
const moderateTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id).populate('space');
  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found.');
  }
  if (testimonial.space.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not own this space.');
  }

  const { status, isFeatured } = req.body;
  if (status !== undefined) {
    if (!['pending', 'approved', 'archived'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status.');
    }
    testimonial.status = status;
  }
  if (isFeatured !== undefined) testimonial.isFeatured = isFeatured;

  await testimonial.save();
  res.json({ success: true, testimonial });
});

// DELETE /api/v1/testimonials/:id
const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id).populate('space');
  if (!testimonial) {
    res.status(404);
    throw new Error('Testimonial not found.');
  }
  if (testimonial.space.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not own this space.');
  }
  await testimonial.deleteOne();
  res.json({ success: true, message: 'Testimonial deleted.' });
});

// GET /api/v1/testimonials/wall/:slug  (PUBLIC - Wall of Love, approved only)
const getWallOfLove = asyncHandler(async (req, res) => {
  const space = await Space.findOne({ slug: req.params.slug }).select(
    'name slug logoUrl theme'
  );
  if (!space) {
    res.status(404);
    throw new Error('This wall does not exist.');
  }

  const testimonials = await Testimonial.find({ space: space._id, status: 'approved' })
    .sort({ isFeatured: -1, createdAt: -1 })
    .select('clientName companyRole rating reviewText avatarUrl isFeatured createdAt');

  res.json({ success: true, space, testimonials });
});

// GET /api/v1/testimonials/space/:spaceId/stats  (owner)
const getSpaceStats = asyncHandler(async (req, res) => {
  const space = await Space.findById(req.params.spaceId);
  if (!space) {
    res.status(404);
    throw new Error('Space not found.');
  }
  if (space.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not own this space.');
  }

  const agg = await Testimonial.aggregate([
    { $match: { space: space._id, status: { $in: ['approved', 'pending', 'archived'] } } },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        approvedCount: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        archivedCount: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
        ratings: { $push: '$rating' },
      },
    },
  ]);

  const base = agg[0] || {
    totalCount: 0,
    avgRating: 0,
    approvedCount: 0,
    pendingCount: 0,
    archivedCount: 0,
    ratings: [],
  };

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  (base.ratings || []).forEach((r) => {
    if (r) distribution[r] = (distribution[r] || 0) + 1;
  });

  res.json({
    success: true,
    stats: {
      totalCount: base.totalCount,
      avgRating: base.avgRating ? Math.round(base.avgRating * 10) / 10 : 0,
      approvedCount: base.approvedCount,
      pendingCount: base.pendingCount,
      archivedCount: base.archivedCount,
      distribution,
    },
  });
});

module.exports = {
  submitTestimonial,
  getSpaceTestimonials,
  moderateTestimonial,
  deleteTestimonial,
  getWallOfLove,
  getSpaceStats,
};
