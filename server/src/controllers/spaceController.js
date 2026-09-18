const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const Space = require('../models/Space');
const Testimonial = require('../models/Testimonial');

async function generateUniqueSlug(base) {
  let slug = slugify(base, { lower: true, strict: true }).slice(0, 60) || 'space';
  let candidate = slug;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Space.exists({ slug: candidate })) {
    n += 1;
    candidate = `${slug}-${n}`;
  }
  return candidate;
}

// POST /api/v1/spaces
const createSpace = asyncHandler(async (req, res) => {
  const { name, customPrompt, logoUrl, settings, theme, slug: requestedSlug } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Space name is required.');
  }

  let slug;
  if (requestedSlug) {
    const clean = slugify(requestedSlug, { lower: true, strict: true });
    if (await Space.exists({ slug: clean })) {
      res.status(409);
      throw new Error('That slug is already taken. Try another.');
    }
    slug = clean;
  } else {
    slug = await generateUniqueSlug(name);
  }

  const space = await Space.create({
    owner: req.user._id,
    name,
    slug,
    logoUrl: logoUrl || '',
    customPrompt,
    settings,
    theme,
  });

  res.status(201).json({ success: true, space });
});

// GET /api/v1/spaces  (owner's own spaces)
const getMySpaces = asyncHandler(async (req, res) => {
  const spaces = await Space.find({ owner: req.user._id }).sort({ createdAt: -1 });

  // Attach quick stats per space
  const withStats = await Promise.all(
    spaces.map(async (space) => {
      const [total, pending, approved] = await Promise.all([
        Testimonial.countDocuments({ space: space._id }),
        Testimonial.countDocuments({ space: space._id, status: 'pending' }),
        Testimonial.countDocuments({ space: space._id, status: 'approved' }),
      ]);
      return { ...space.toObject(), stats: { total, pending, approved } };
    })
  );

  res.json({ success: true, spaces: withStats });
});

// GET /api/v1/spaces/:id  (owner only, full config)
const getSpaceById = asyncHandler(async (req, res) => {
  const space = await Space.findById(req.params.id);
  if (!space) {
    res.status(404);
    throw new Error('Space not found.');
  }
  if (space.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not own this space.');
  }
  res.json({ success: true, space });
});

// PATCH /api/v1/spaces/:id
const updateSpace = asyncHandler(async (req, res) => {
  const space = await Space.findById(req.params.id);
  if (!space) {
    res.status(404);
    throw new Error('Space not found.');
  }
  if (space.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not own this space.');
  }

  const { name, customPrompt, logoUrl, settings, theme } = req.body;
  if (name !== undefined) space.name = name;
  if (customPrompt !== undefined) space.customPrompt = customPrompt;
  if (logoUrl !== undefined) space.logoUrl = logoUrl;
  if (theme !== undefined) space.theme = theme;
  if (settings !== undefined) {
    space.settings = { ...space.settings.toObject(), ...settings };
  }

  await space.save();
  res.json({ success: true, space });
});

// DELETE /api/v1/spaces/:id
const deleteSpace = asyncHandler(async (req, res) => {
  const space = await Space.findById(req.params.id);
  if (!space) {
    res.status(404);
    throw new Error('Space not found.');
  }
  if (space.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not own this space.');
  }
  await Testimonial.deleteMany({ space: space._id });
  await space.deleteOne();
  res.json({ success: true, message: 'Space and its testimonials were deleted.' });
});

// GET /api/v1/spaces/public/:slug  (public - for the collection form & wall)
const getPublicSpace = asyncHandler(async (req, res) => {
  const space = await Space.findOne({ slug: req.params.slug }).select(
    'name slug logoUrl customPrompt settings theme'
  );
  if (!space) {
    res.status(404);
    throw new Error('This collection page does not exist.');
  }
  res.json({ success: true, space });
});

module.exports = {
  createSpace,
  getMySpaces,
  getSpaceById,
  updateSpace,
  deleteSpace,
  getPublicSpace,
};
