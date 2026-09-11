// Calendar export only uses explicit kickoff timestamps; never invent a time.
export function calendarEvent(m, now = new Date()) {
  if (!m.utcDate || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/.test(m.utcDate) || !Number.isFinite(Date.parse(m.utcDate))) return null;
  const stamp = d => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const escape = s => String(s ?? '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  // Keep physical lines below the iCalendar 75-octet limit, including Unicode names.
  const fold = line => { let result = '', bytes = 0; for (const char of line) { const size = new TextEncoder().encode(char).length; if (bytes + size > 74) { result += '\r\n '; bytes = 1; } result += char; bytes += size; } return result; };
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ElitePredict//Fixture Calendar//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${encodeURIComponent(m.key || `${m.home}-${m.away}-${m.utcDate}`)}@elitepredicts.com`,`DTSTAMP:${stamp(now)}`,`DTSTART:${stamp(m.utcDate)}`,`SUMMARY:${escape(`${m.home} vs ${m.away}`)}`,'DESCRIPTION:Scheduled kickoff from ElitePredict. Fixtures may be rescheduled. Check the latest schedule.','END:VEVENT','END:VCALENDAR'].map(fold).join('\r\n') + '\r\n';
}
export function downloadCalendar(m) {
  const text = calendarEvent(m);
  if (!text) return;
  const url = URL.createObjectURL(new Blob([text], {type:'text/calendar;charset=utf-8'}));
  const a = document.createElement('a'); a.href = url; a.download = 'elitepredict-fixture.ics'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
