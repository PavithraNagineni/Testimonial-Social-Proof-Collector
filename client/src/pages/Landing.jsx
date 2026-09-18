import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import { StarRatingDisplay } from '../components/StarRating';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div>
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-ink-900">
            A simple tool to collect and display testimonials.
          </h1>
          <p className="mt-5 text-ink-700 text-lg max-w-md">
            I built this project to help anyone gather reviews easily. You can create a space, share a link with your users, and build a "Wall of Love" without forcing people to create an account.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to={user ? '/dashboard' : '/signup'}>
              <Button size="lg">{user ? 'Go to dashboard' : 'Create an account'}</Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="secondary" size="lg">
                See how it works
              </Button>
            </a>
          </div>
          <p className="mt-6 text-sm text-ink-500 font-medium">
            👋 Built by Pavithra for the MERN Stack Evaluation
          </p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-ink-900 text-paper-50 flex items-center justify-center font-display">
              J
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">John Doe</p>
              <p className="text-xs text-ink-600">Test User</p>
            </div>
          </div>
          <StarRatingDisplay value={5} />
          <p className="mt-3 text-sm text-ink-800 leading-relaxed">
            "This is a sample review! The MERN stack project works perfectly. I was able to submit this without even logging in."
          </p>
        </Card>
      </section>

      <section id="how-it-works" className="bg-ink-950 text-paper-100 py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="font-display text-2xl mb-10">Three steps, one wall of love</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Create a space',
                body: 'Set up a branded collection page with your logo, a custom prompt, and the questions you care about.',
              },
              {
                title: 'Share the link',
                body: 'Send your unique /collect/ link to customers. No login required on their end — just a quick form.',
              },
              {
                title: 'Approve & embed',
                body: 'Review submissions in your moderation inbox, feature your favorites, and embed the wall anywhere.',
              },
            ].map((step, i) => (
              <div key={step.title}>
                <div className="text-clay-400 font-display text-3xl mb-3">{i + 1}</div>
                <h3 className="font-display text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-paper-100/70 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
