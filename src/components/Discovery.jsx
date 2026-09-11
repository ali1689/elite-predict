import { useEffect, useState } from "react";
import { leagueName, matchKey, percent } from "@/lib/presentation";

export function Kickoff({ value }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
  if (!value || value.length <= 10 || !Number.isFinite(Date.parse(value))) return null;
  return Date.parse(value) <= now ? <span className="v2-kickoff">Scheduled kickoff passed · result not implied</span> : null;
}

export function Favourites({ matches, only, onOnly, onChange }) {
  const [favourites, setFavourites] = useState(() => {
    try { const parsed = JSON.parse(localStorage.getItem('ep_favourites_v2')); return Array.isArray(parsed) ? parsed.filter(x => x && ['team','league'].includes(x.type) && typeof x.value === 'string').slice(0,100) : []; } catch { return []; }
  });
  const [error, setError] = useState('');
  useEffect(() => { onChange(favourites); }, [favourites, onChange]);
  function change(next) {
    try { localStorage.setItem('ep_favourites_v2', JSON.stringify(next)); setFavourites(next); setError(''); }
    catch { setError('Preferences could not be saved. Check browser storage.'); }
  }
  const teams = [...new Set(matches.flatMap(m => [m.home,m.away]))].filter(Boolean).sort();
  const leagues = [...new Set(matches.map(m => m.comp))].filter(Boolean).sort();
  function add(type, value) {
    if (!value || favourites.some(f => f.type === type && f.value === value)) return;
    if (favourites.length >= 100) { setError('Remove a favourite before adding another.'); return; }
    change([...favourites, {type, value}]);
  }
  return <details className="v2-filter-panel v2-favourites"><summary>Your football · {favourites.length} favourites</summary>
    <p className="v2-fine">Follow teams and leagues from the loaded schedule. Remembered on this browser.</p>
    <div className="v2-filter-grid">
      <label>Follow a team<select value="" onChange={e => add('team',e.target.value)}><option value="">Choose a team</option>{teams.map(t => <option key={t}>{t}</option>)}</select></label>
      <label>Follow a league<select value="" onChange={e => add('league',e.target.value)}><option value="">Choose a league</option>{leagues.map(l => <option key={l} value={l}>{leagueName(l)}</option>)}</select></label>
      <button className="v2-button secondary" aria-pressed={only} onClick={() => onOnly(!only)}>{only ? 'Show all football' : 'Show my favourites'}</button>
    </div>
    <div className="v2-filter-chips">{favourites.map(f => <button key={`${f.type}:${f.value}`} aria-label={`Unfollow ${f.type === 'league' ? leagueName(f.value) : f.value}`} onClick={() => change(favourites.filter(x => x !== f))}>{f.type === 'league' ? leagueName(f.value) : f.value} ×</button>)}</div>
    {!favourites.length && <p className="v2-fine">Choose a team or league to start your personalised schedule.</p>}
    {error && <p role="alert">{error}</p>}
  </details>;
}

export function Comparison({ matches, onRemove, onClear }) {
  if (!matches.length) return null;
  const rows = [['Model pick','signal'],['Confidence','conf'],['Home win','homeWin'],['Draw','draw'],['Away win','awayWin'],['Both teams to score','btts'],['Over 1.5 goals','over15'],['Over 2.5 goals','over25'],['Expected goals','xgTotal']];
  return <section className="v2-panel v2-comparison" aria-label="Match comparison">
    <div className="v2-section-title"><h2>Compare matches · {matches.length}/3</h2><button className="v2-button secondary" onClick={onClear}>Clear comparison</button></div>
    <p className="v2-fine">Select up to three fixtures from this list. Confidence and market probabilities describe different estimates. Comparison resets when you leave this page or a fixture leaves the displayed list.</p>
    <div className="v2-comparison-scroll" tabIndex={0} aria-label="Scroll match comparison horizontally">
      <table><caption className="v2-announcement">Selected fixtures and model estimates</caption><thead><tr><th scope="col">Measure</th>{matches.map(m => <th scope="col" key={matchKey(m)}>{m.home} vs {m.away}<button onClick={() => onRemove(matchKey(m))} aria-label={`Remove ${m.home} vs ${m.away} from comparison`}>Remove</button></th>)}</tr></thead>
        <tbody>{rows.map(([label,key]) => <tr key={key}><th scope="row">{label}</th>{matches.map(m => <td key={matchKey(m)}>{key === 'signal' ? m[key] || '—' : key === 'xgTotal' ? m[key] != null && Number.isFinite(Number(m[key])) ? Number(m[key]).toFixed(2) : '—' : percent(m[key])}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </section>;
}
