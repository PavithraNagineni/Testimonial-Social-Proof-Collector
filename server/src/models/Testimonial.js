const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    space: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true, index: true },

    clientName: { type: String, required: true, trim: true, maxlength: 120 },
    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    companyRole: { type: String, trim: true, maxlength: 150, default: '' },

    rating: { type: Number, min: 1, max: 5 },
    reviewText: { type: String, required: true, trim: true, maxlength: 2000 },
    avatarUrl: { type: String, default: '' },

    customAnswers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true, maxlength: 1000 },
      },
    ],

    status: {
      type: String,
      enum: ['pending', 'approved', 'archived'],
      default: 'pending',
      index: true,
    },
    isFeatured: { type: Boolean, default: false },

    ipHash: { type: String, select: false },
  },
  { timestamps: true }
);

testimonialSchema.index({ space: 1, status: 1, createdAt: -1 });
testimonialSchema.index({ space: 1, isFeatured: 1, status: 1 });
testimonialSchema.index({ clientName: 'text', reviewText: 'text' });

module.exports = mongoose.model('Testimonial', testimonialSchema);
