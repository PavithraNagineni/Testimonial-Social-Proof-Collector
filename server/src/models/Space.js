const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens'],
      index: true,
    },
    logoUrl: { type: String, default: '' },
    customPrompt: {
      type: String,
      default: 'We would love to hear about your experience!',
      maxlength: 500,
    },
    settings: {
      requireAvatar: { type: Boolean, default: false },
      requireStarRating: { type: Boolean, default: true },
      customQuestions: {
        type: [String],
        default: [],
        validate: [(arr) => arr.length <= 5, 'Maximum 5 custom questions'],
      },
    },
    theme: {
      type: String,
      enum: ['minimal-light', 'dark-slate', 'gradient'],
      default: 'minimal-light',
    },
  },
  { timestamps: true }
);

spaceSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Space', spaceSchema);
