import Layout from '../components/common/Layout';

const team = [
  { name: 'Zaid Al-Farsi',   role: 'Club Founder & President', rating: 2100, emoji: '♔' },
  { name: 'Amina Wanjiku',   role: 'Head Coach',               rating: 1950, emoji: '♕' },
  { name: 'Brian Omondi',    role: 'Tournament Director',      rating: 1800, emoji: '♖' },
  { name: 'Grace Muthoni',   role: 'Secretary',                rating: 1650, emoji: '♗' },
];

const values = [
  { icon: '🎯', title: 'Strategic Thinking',  desc: 'We cultivate deep analytical skills that extend beyond the board into everyday life.' },
  { icon: '🤝', title: 'Community',           desc: 'Chess is better together. We build lasting friendships through shared passion.' },
  { icon: '📈', title: 'Continuous Growth',   desc: 'Every player improves. We track progress and celebrate every milestone.' },
  { icon: '🏆', title: 'Competitive Spirit',  desc: 'We compete with dignity, respect opponents, and strive for excellence.' },
];

export default function AboutPage() {
  return (
    <Layout title="About Us | Zaid Knights Chess Club" description="Learn about Zaid Knights Chess Club — our history, mission, and the team behind Nairobi's premier chess community.">
      {/* Hero */}
      <section className="py-20 border-b border-white/10 chess-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            About <span className="gold-gradient">Zaid Knights</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Founded in Nairobi, Zaid Knights Chess Club has grown from a small group of enthusiasts
            into a thriving community of strategic minds. We believe chess is more than a game —
            it's a tool for developing discipline, creativity, and critical thinking.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-yellow-400 text-sm uppercase tracking-widest mb-3">Our Mission</p>
              <h2 className="section-title mb-5">Growing Chess in Kenya</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We are dedicated to making chess accessible to every Kenyan, regardless of age,
                background, or experience level. Our club offers structured programs for beginners
                through to competitive players aiming for national recognition.
              </p>
              <p className="text-gray-400 leading-relaxed">
                With regular tournaments, coaching sessions, and a welcoming community, Zaid Knights
                is the perfect home for anyone passionate about the game of kings.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {values.map(v => (
                <div key={v.title} className="glass p-5 rounded-xl">
                  <div className="text-2xl mb-2">{v.icon}</div>
                  <h3 className="text-white font-semibold mb-1 text-sm">{v.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Leadership Team</h2>
            <p className="section-subtitle mx-auto mt-3">The passionate players driving our club forward</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(member => (
              <div key={member.name} className="glass-hover p-6 rounded-xl text-center">
                <div className="text-5xl mb-4">{member.emoji}</div>
                <h3 className="text-white font-semibold">{member.name}</h3>
                <p className="text-gray-400 text-sm mt-1 mb-3">{member.role}</p>
                <div className="badge-gold text-xs mx-auto">ELO {member.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}