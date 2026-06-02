import Link from 'next/link';
import Layout from '../components/common/Layout';

const VALUES = [
  { icon: '♟', title: 'Strategic Thinking',  desc: 'We teach chess as a tool for developing critical thinking, long-term planning, and problem-solving skills applicable in every area of life.' },
  { icon: '♞', title: 'Friendship & Community', desc: 'Building a welcoming, inclusive space where players of all levels, ages, and backgrounds grow together, fostering lasting friendships and a sense of belonging.' },
  { icon: '♜', title: 'Discipline & Sportsmanship', desc: 'We instil discipline and sportsmanship in every member, building character on and off the board through respectful competition and personal integrity.' },
  { icon: '♛', title: 'Mentorship & Growth', desc: 'Mentoring and supporting talented players to reach their full potential through expert coaching, competitive exposure, and continuous peer learning.' },
];

const TIMELINE = [
  { year: '2025', title: 'Zaid Knights Founded', desc: 'Zaid Knights Chess Club was established in Nairobi by Henry Odhiambo — with a vision to develop chess talent and build a vibrant community of players, with the long-term goal of representing Kenya at the highest levels.' },
  { year: '2025', title: 'House Training Begins', desc: 'The club launched its signature house training sessions, bringing personalised coaching directly to members and partnering with local schools across Nairobi.' },
  { year: '2025', title: 'School Partnerships', desc: 'Zaid Knights began partnering with schools to introduce chess to young students, planting seeds for the next generation of Kenyan chess champions.' },
  { year: '2025', title: 'Regional Play & National Qualification', desc: 'Our players competed at regional level and qualified for the national championships — a proud milestone for the club.' },
];

const TEAM = [
  { name: 'Henry Odhiambo', role: 'Founder & Head Coach', initials: 'HO', bio: 'Founder of Zaid Knights, passionate about developing chess talent and growing the game across Kenya.', motto: '' },
  { name: 'Gerrishom Samuel', role: 'Head Coach', initials: 'GS', bio: 'A founding member of Zaid Knights who has been with the club from the very beginning. Has coached players at regional level and to national-championship qualification.', motto: '"Let\'s meet on the board"' },
];

const ACHIEVEMENTS = [
  { icon: '🏆', number: '2025', label: 'Year Founded' },
  { icon: '🏫', number: 'Active',  label: 'School Partnerships' },
  { icon: '🌍', number: '🏆',   label: 'Representing the Club' },
  { icon: '📈', number: 'Regional', label: 'Level Played — Qualified for Nationals' },
  { icon: '🏠', number: 'Nairobi', label: 'Based In' },
  { icon: '♟', number: '∞',    label: 'Passion for Chess' },
];

export default function AboutPage() {
  return (
    <Layout title="About | Zaid Knights Chess Club">
      {/* Hero */}
      <section className="relative py-28 px-4 chess-pattern overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative">
          <p className="text-yellow-400 text-sm font-medium tracking-widest uppercase mb-4">
            📍 Nairobi, Kenya
          </p>
          <h1
            className="text-4xl md:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            About <span className="gold-gradient">Zaid Knights</span>
          </h1>
          <p className="text-yellow-400/80 italic text-xl mb-6">"Sharpening Great Minds"</p>
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
            Founded in 2025 by Henry Odhiambo, Zaid Knights Chess Club is dedicated to developing chess
            talent, fostering strategic thinking, and building a vibrant community of players who proudly
            represent the club, with the ambition of representing Kenya at national and international level in the years ahead.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 px-4" style={{ background: 'var(--dark-2)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Our Mission & Values</h2>
            <p className="section-subtitle mx-auto">What drives us every day on and off the board</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="glass-hover p-7 rounded-xl text-center group">
                <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-200">{v.icon}</div>
                <h3 className="text-white font-bold mb-3">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">What We Do</h2>
            <p className="section-subtitle mx-auto">How we develop chess talent across Kenya</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-7 rounded-xl text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-white font-bold mb-2">House Training</h3>
              <p className="text-gray-400 text-sm leading-relaxed">We conduct personalised house training sessions, bringing quality chess coaching directly to our members in a comfortable and focused environment.</p>
            </div>
            <div className="glass p-7 rounded-xl text-center">
              <div className="text-4xl mb-4">🏫</div>
              <h3 className="text-white font-bold mb-2">School Partnerships</h3>
              <p className="text-gray-400 text-sm leading-relaxed">We partner with schools across Nairobi to introduce chess to young students, identifying and nurturing talent from an early age.</p>
            </div>
            <div className="glass p-7 rounded-xl text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-white font-bold mb-2">Club Collaboration</h3>
              <p className="text-gray-400 text-sm leading-relaxed">We collaborate with other chess clubs and institutions for the advancement of chess in Kenya and beyond, growing the game together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4" style={{ background: 'var(--dark-2)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Our Journey</h2>
            <p className="section-subtitle mx-auto">From founding to national qualification — our story so far</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-yellow-500/20 md:-translate-x-px" />
            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <div key={i} className={`relative flex ${i % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
                  <div className={`w-full md:w-[46%] pl-16 md:pl-0 ${i % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="glass p-5 rounded-xl hover:border-yellow-500/30 transition-colors">
                      <span className="text-yellow-400 font-bold text-xl">{item.year}</span>
                      <h3 className="text-white font-semibold mt-1 mb-2">{item.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-5 w-5 h-5 bg-yellow-500 rounded-full border-4 border-[var(--dark)] shadow-lg shadow-yellow-500/40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Leadership</h2>
            <p className="section-subtitle mx-auto">The passionate people steering Zaid Knights forward</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {TEAM.map(member => (
              <div key={member.name} className="glass-hover p-8 rounded-xl text-center">
                <div className="w-24 h-24 rounded-full bg-yellow-500/15 border-2 border-yellow-500/40 flex items-center justify-center text-3xl font-bold text-yellow-400 mx-auto mb-4">
                  {member.initials}
                </div>
                <h3 className="text-white font-bold text-lg">{member.name}</h3>
                <p className="text-yellow-400/80 text-sm mt-0.5">{member.role}</p>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">{member.bio}</p>
                {member.motto && <p className="text-yellow-400/60 italic text-xs mt-3">{member.motto}</p>}
                <a href="mailto:info@zaidknights.org" className="block mt-4 text-xs text-gray-500 hover:text-yellow-400 transition-colors">
                  ✉ Contact
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-4" style={{ background: 'var(--dark-2)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Our Highlights</h2>
            <p className="section-subtitle mx-auto">Key facts about Zaid Knights</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map(a => (
              <div key={a.label} className="glass-gold p-5 rounded-xl text-center">
                <div className="text-3xl mb-2">{a.icon}</div>
                <div className="text-xl font-bold text-yellow-400 mb-1">{a.number}</div>
                <div className="text-gray-400 text-xs">{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-gold p-10 rounded-2xl text-center">
            <div className="text-5xl mb-4">🌍</div>
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Our Vision</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              To be the leading chess club in Kenya — producing world-class players, advancing chess culture
              across the country, and collaborating with clubs and institutions locally and internationally
              to put Kenya on the global chess map.
            </p>
            <p className="text-yellow-400 italic text-xl mt-6">"Sharpening Great Minds"</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4" style={{ background: 'var(--dark-2)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-5xl block mb-6">♞</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Join the Family?
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Be part of Nairobi&apos;s most exciting chess community. Every skill level welcome — from
            complete beginners to seasoned competitors.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="btn-primary">Join the Club →</Link>
            <Link href="/events"   className="btn-secondary">View Events</Link>
            <Link href="/contact"  className="btn-ghost">Contact Us</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}