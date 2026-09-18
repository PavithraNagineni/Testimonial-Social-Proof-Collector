/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Space = require('../models/Space');
const Testimonial = require('../models/Testimonial');

const NAMES = ['Ava Patel', 'Liam Chen', 'Sofia Rossi', 'Noah Kim', 'Maya Singh', 'Omar Farouk', 'Elena Petrova', 'Jacob Ade'];
const ROLES = ['Product Manager', 'Founder', 'Marketing Lead', 'CTO', 'Designer', 'Customer'];
const REVIEWS = [
  'This tool completely changed how our team collects feedback. Setup took minutes.',
  'The wall of love widget looks fantastic embedded on our landing page.',
  "Support was fast and the product just works. Couldn't ask for more.",
  'We went from zero social proof to a beautiful testimonials page in a day.',
  'Simple, elegant, and exactly what we needed for our launch.',
  'Our conversion rate went up after adding the embedded widget.',
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected for seeding...');

  await Promise.all([User.deleteMany({}), Space.deleteMany({}), Testimonial.deleteMany({})]);

  const owner = await User.create({
    name: 'Demo Owner',
    email: 'demo@example.com',
    password: 'password123',
    isEmailVerified: true,
  });

  const space = await Space.create({
    owner: owner._id,
    name: 'Acme Corp',
    slug: 'acme-corp',
    customPrompt: 'Tell us about your experience with Acme Corp!',
    settings: { requireAvatar: false, requireStarRating: true, customQuestions: ['What did you like most?'] },
    theme: 'minimal-light',
  });

  const testimonials = Array.from({ length: 8 }).map((_, i) => ({
    space: space._id,
    clientName: NAMES[i % NAMES.length],
    clientEmail: `client${i}@example.com`,
    companyRole: ROLES[i % ROLES.length],
    rating: [4, 5, 5, 3, 5, 4, 5, 2][i],
    reviewText: REVIEWS[i % REVIEWS.length],
    status: i < 5 ? 'approved' : i === 5 ? 'pending' : 'archived',
    isFeatured: i === 0 || i === 2,
  }));
  await Testimonial.insertMany(testimonials);

  console.log('Seed complete.');
  console.log('Login with: demo@example.com / password123');
  console.log(`Collection form: /collect/${space.slug}`);
  console.log(`Wall of Love:    /wall/${space.slug}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
