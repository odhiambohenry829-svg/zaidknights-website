interface MemberStatsProps {
  rating:          number;
  level:           string;
  status:          string;
  rankingPosition: number;
  wins:            number;
  losses:          number;
  draws:           number;
  attendedCount:   number;
  attendanceTotal: number;
  eventsCount:     number;
  showFull?:       boolean;
}

function statusColor(status: string) {
  if (status === 'ACTIVE')    return 'text-green-400';
  if (status === 'EXPIRED')   return 'text-red-400';
  if (status === 'SUSPENDED') return 'text-red-400';
  if (status === 'PENDING')   return 'text-yellow-400';
  return 'text-gray-400';
}

export default function MemberStats({
  rating, level, status, rankingPosition,
  wins, losses, draws,
  attendedCount, attendanceTotal, eventsCount,
  showFull = false,
}: MemberStatsProps) {
  const totalGames    = wins + losses + draws;
  const winRate       = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
  const attendancePct = attendanceTotal > 0 ? Math.round((attendedCount / attendanceTotal) * 100) : 0;

  const basicCards = [
    { label: 'ELO Rating',    value: rating,                              icon: '📈', color: 'text-yellow-400' },
    { label: 'Level',         value: level.replace(/_/g, ' '),            icon: '♟',  color: 'text-blue-400' },
    { label: 'Status',        value: status,                              icon: '✓',  color: statusColor(status) },
    { label: 'Registered',    value: `${eventsCount} events`,             icon: '🏆', color: 'text-purple-400' },
  ];

  const fullCards = [
    { label: 'ELO Rating',    value: rating,                              icon: '📈', color: 'text-yellow-400' },
    { label: 'Club Ranking',  value: `#${rankingPosition}`,               icon: '🥇', color: 'text-yellow-400' },
    { label: 'Win Rate',      value: `${winRate}%`,                       icon: '🎯', color: 'text-green-400' },
    { label: 'Games Played',  value: totalGames,                          icon: '♜',  color: 'text-blue-400' },
    { label: 'W / D / L',     value: `${wins} / ${draws} / ${losses}`,   icon: '📊', color: 'text-gray-300' },
    { label: 'Attendance',    value: `${attendancePct}%`,                 icon: '✅', color: attendancePct >= 80 ? 'text-green-400' : 'text-yellow-400' },
    { label: 'Events',        value: eventsCount,                         icon: '🏆', color: 'text-purple-400' },
    { label: 'Level',         value: level.replace(/_/g, ' '),            icon: '♟',  color: 'text-blue-400' },
  ];

  const cards = showFull ? fullCards : basicCards;

  return (
    <div className={`grid gap-4 ${showFull ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}>
      {cards.map(card => (
        <div key={card.label} className="glass p-5 rounded-xl">
          <div className="text-2xl mb-2">{card.icon}</div>
          <div className={`text-xl font-bold capitalize ${card.color}`}>{card.value}</div>
          <div className="text-gray-500 text-xs mt-0.5">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
