export default function TeamAvatar({ team, size = "lg" }) {
  const dim = size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const txt = size === "lg" ? "text-sm"   : "text-xs";
  return (
    <div className={`${dim} mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden`}>
      {team.logo
        ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-2" />
        : <span className={`font-black ${txt} text-primary-container tracking-tight`}>{team.abbr}</span>
      }
    </div>
  );
}
