import Link from 'next/link';
import Layout from '../components/common/Layout';

const VALUES = [
  { icon: '♟', title: 'Strategic Thinking',  desc: 'We teach chess as a tool for developing critical thinking, long-term planning, and problem-solving skills applicable in every area of life.' },
  { icon: '♞', title: 'Community',            desc: 'Building a welcoming, inclusive space where players of all levels, ages, and backgrounds grow together as a family.' },
  { icon: '♜', title: 'Growth',               desc: 'Continuous improvement through expert coaching, competitive tournaments, and peer learning in a supportive environment.' },
  { icon: '♛', title: 'Competitive Spirit',   desc: 'Nurturing champions with the discipline and talent to represent Kenya at regional, national, and international levels.' },
];

const TIMELINE = [
  { year: '2019', title: 'Club Founded',          desc: 'Zaid Knights Chess Club established in Nairobi by passionate enthusiasts determined to build Kenya\'s premier chess community.' },
  { year: '2020', title: 'First Tournament',       desc: 'Hosted our inaugural inter-club tournament with 24 participants from across Nairobi. The start of a competitive tradition.' },
  { year: '2022', title: 'National Recognition',   desc: 'Members represented Kenya in regional championships. Club membership surpassed 120, cementing our national presence.' },
  { year: '2023', title: 'Junior Program Launch',  desc: 'The Junior Knights program brought chess to 200+ students across Nairobi, planting seeds for the next generation.' },
  { year: '2025', title: 'Premier Club Status',    desc: 'Recognized as Nairobi\'s premier chess club with 500+ members, a dedicated facility, and multiple national titles.' },
];

const TEAM = [
  { name: 'Sheikh Zaid',    role: 'Founder & Chairman',    elo: 2150, initials: 'SZ', bio: 'FIDE-rated player with 15+ years of competitive experience.' },
  { name: 'Michael Otieno', role: 'Head Coach',             elo: 2080, initials: 'MO', bio: 'National champion coach with 8 years of training experience.' },
  { name: 'Amina Hassan',   role: 'Tournament Director',    elo: 1950, initials: 'AH', bio: 'Organizes all club events. FIDE arbiter certified.' },
  { name: 'David Kamau',    role: 'Club Secretary',         elo: 1820, initials: 'DK', bio: 'Manages memberships, communications, and administration.' },
];

const ACHIEVEMENTS = [
  { icon: '🏆', number: '12+',  label: 'Tournaments Won' },
  { icon: '👥', number: '500+', label: 'Active Members' },
  { icon: '🌍', number: '8',    label: 'National Appearances' },
  { icon: '🏫', number: '15',   label: 'Partner Schools' },
  { icon: '📅', number: '6',    label: 'Years of Excellence' },
  { icon: '⭐', number: '4',    label: 'FIDE-Rated Players' },
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
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
            Founded in 2019, Zaid Knights Chess Club is Nairobi&apos;s premier chess community — dedicated
            to developing chess talent, fostering strategic thinking, and building a vibrant community of
            players who represent Kenya on the national and international stage.
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

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Our Journey</h2>
            <p className="section-subtitle mx-auto">Six years of growth, passion, and chess excellence</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-yellow-500/20 md:-translate-x-px" />
            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <div key={item.year} className={`relative flex ${i % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
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
      <section className="py-20 px-4" style={{ background: 'var(--dark-2)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Leadership Team</h2>
            <p className="section-subtitle mx-auto">The passionate people steering Zaid Knights forward</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(member => (
              <div key={member.name} className="glass-hover p-6 rounded-xl text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-500/15 border-2 border-yellow-500/40 flex items-center justify-center text-2xl font-bold text-yellow-400 mx-auto mb-4">
                  {member.initials}
                </div>
                <h3 className="text-white font-bold text-sm">{member.name}</h3>
                <p className="text-yellow-400/80 text-xs mt-0.5">{member.role}</p>
                <p className="text-gray-500 text-xs mt-2 leading-relaxed">{member.bio}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  <span className="text-gray-400 text-xs">ELO</span>
                  <span className="text-yellow-400 text-xs font-bold">{member.elo}</span>
                </div>
                <a href="mailto:info@zaidknights.org" className="block mt-4 text-xs text-gray-500 hover:text-yellow-400 transition-colors">
                  ✉ Contact
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title mb-3">Our Achievements</h2>
            <p className="section-subtitle mx-auto">Numbers that tell our story</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ACHIEVEMENTS.map(a => (
              <div key={a.label} className="glass-gold p-5 rounded-xl text-center">
                <div className="text-3xl mb-2">{a.icon}</div>
                <div className="text-3xl font-bold text-yellow-400 mb-1">{a.number}</div>
                <div className="text-gray-400 text-xs">{a.label}</div>
              </div>
            ))}
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
            Be part of Nairobi&apos;s most exciting chess community. Every skill level welcome.
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
