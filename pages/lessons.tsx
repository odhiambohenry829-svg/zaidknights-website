import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Link from 'next/link';

const CATEGORIES = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Openings', 'Endgames', 'Tactics'];

const LESSONS = [
  {
    id: 1, title: 'Introduction to Chess: Piece Movement',
    category: 'Beginner', duration: '15 min', instructor: 'Henry Odhiambo',
    description: 'Learn how each chess piece moves and captures. Perfect starting point for beginners.',
    icon: '♟', free: true,
  },
  {
    id: 2, title: 'Basic Checkmate Patterns',
    category: 'Beginner', duration: '20 min', instructor: 'Henry Odhiambo',
    description: 'Master the most common checkmate patterns including Scholar\'s mate and Fool\'s mate.',
    icon: '♚', free: true,
  },
  {
    id: 3, title: 'Opening Principles',
    category: 'Openings', duration: '25 min', instructor: 'Gerrishom Samuel',
    description: 'The three golden rules of chess openings: control the center, develop pieces, castle early.',
    icon: '♖', free: true,
  },
  {
    id: 4, title: 'Tactical Patterns: Forks & Pins',
    category: 'Tactics', duration: '30 min', instructor: 'Gerrishom Samuel',
    description: 'Identify and execute fork and pin tactics to win material advantage.',
    icon: '⚔️', free: false,
  },
  {
    id: 5, title: 'Ruy Lopez Opening',
    category: 'Openings', duration: '35 min', instructor: 'Henry Odhiambo',
    description: 'Deep dive into the Ruy Lopez — one of the oldest and most respected chess openings.',
    icon: '📖', free: false,
  },
  {
    id: 6, title: 'Pawn Endgame Fundamentals',
    category: 'Endgames', duration: '30 min', instructor: 'Gerrishom Samuel',
    description: 'Master king and pawn endgames including opposition, key squares and passed pawns.',
    icon: '🏁', free: false,
  },
  {
    id: 7, title: 'Sicilian Defense',
    category: 'Openings', duration: '40 min', instructor: 'Henry Odhiambo',
    description: 'Learn the most popular chess opening at master level — the Sicilian Defense.',
    icon: '🛡️', free: false,
  },
  {
    id: 8, title: 'Middlegame Strategy',
    category: 'Intermediate', duration: '45 min', instructor: 'Gerrishom Samuel',
    description: 'Planning in the middlegame: pawn structures, piece coordination and attack planning.',
    icon: '🎯', free: false,
  },
  {
    id: 9, title: 'Rook Endgames',
    category: 'Endgames', duration: '35 min', instructor: 'Henry Odhiambo',
    description: 'Essential rook endgame techniques including Lucena and Philidor positions.',
    icon: '♜', free: false,
  },
  {
    id: 10, title: 'Advanced Tactics: Discovered Attacks',
    category: 'Advanced', duration: '40 min', instructor: 'Gerrishom Samuel',
    description: 'Master advanced tactical motifs including discovered attacks, skewers and deflections.',
    icon: '💡', free: false,
  },
  {
    id: 11, title: 'How to Analyse Your Games',
    category: 'Intermediate', duration: '30 min', instructor: 'Henry Odhiambo',
    description: 'Learn how to review your own games, identify mistakes and improve systematically.',
    icon: '🔍', free: false,
  },
  {
    id: 12, title: 'Tournament Preparation',
    category: 'Advanced', duration: '50 min', instructor: 'Gerrishom Samuel',
    description: 'Mental preparation, time management and opening preparation for competitive tournaments.',
    icon: '🏆', free: false,
  },
];

import { useState } from 'react';

export default function LessonsPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? LESSONS
    : LESSONS.filter(l => l.category === activeCategory);

  return (
    <ProtectedRoute>
      <Layout title="Video Lessons | Zaid Knights Chess Club" description="Learn chess with Zaid Knights — video lessons from beginner to advanced.">

        {/* Hero */}
        <section className="py-16 px-4 chess-pattern">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-yellow-400 text-sm uppercase tracking-widest mb-2">🎥 Learn Chess</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Video Lessons
            </h1>
            <p className="text-gray-400">Structured chess education from our expert coaches — Henry Odhiambo & Gerrishom Samuel</p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    activeCategory === cat
                      ? 'bg-yellow-500 text-black border-yellow-400'
                      : 'border-white/10 text-gray-400 hover:border-yellow-500/30 hover:text-white'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Coming Soon Banner */}
            <div className="glass-gold p-6 rounded-xl mb-8 text-center">
              <p className="text-2xl mb-2">🎬</p>
              <h3 className="text-white font-bold mb-1">Video Content Coming Soon</h3>
              <p className="text-gray-400 text-sm">Our coaches are recording lessons. In the meantime, join our training sessions in Nairobi or contact us to book a personal coaching session.</p>
              <div className="flex gap-3 justify-center mt-4">
                <Link href="/contact" className="btn-primary text-sm px-6 py-2">Book a Session</Link>
                <Link href="/puzzles" className="btn-secondary text-sm px-6 py-2">Practice Puzzles</Link>
              </div>
            </div>

            {/* Lesson Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(lesson => (
                <div key={lesson.id} className="glass rounded-xl overflow-hidden hover:border-yellow-500/20 border border-white/5 transition-all">
                  <div className="bg-gradient-to-br from-yellow-500/10 to-transparent p-8 text-center">
                    <div className="text-5xl mb-2">{lesson.icon}</div>
                    {lesson.free && (
                      <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">Free</span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-gray-400">{lesson.category}</span>
                      <span className="text-xs text-gray-500">⏱ {lesson.duration}</span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">{lesson.title}</h3>
                    <p className="text-gray-400 text-sm mb-3 leading-relaxed">{lesson.description}</p>
                    <p className="text-gray-500 text-xs mb-4">👤 {lesson.instructor}</p>
                    <button className="w-full py-2 rounded-lg text-sm font-medium border border-yellow-500/20 text-yellow-400/60 cursor-not-allowed">
                      🎬 Coming Soon
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Personal coaching CTA */}
            <div className="glass p-8 rounded-2xl text-center mt-12">
              <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Want Personal Coaching?
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Our coaches Henry Odhiambo and Gerrishom Samuel offer personal coaching sessions in Nairobi. Contact us to book your session.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a href="https://wa.me/254726027960" target="_blank" rel="noopener noreferrer" className="btn-primary px-8">
                  WhatsApp Us
                </a>
                <Link href="/contact" className="btn-secondary px-8">Contact Form</Link>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </ProtectedRoute>
  );
}
