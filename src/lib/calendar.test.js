import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarEvent } from './calendar.js';
test('calendar requires an explicit kickoff and timezone', () => {
  for (const utcDate of [undefined, '2026-09-20', 'invalid', '2026-09-20T18:00:00']) assert.equal(calendarEvent({utcDate}), null);
});
test('calendar normalises offsets and escapes event text without injecting fields', () => {
  const event = calendarEvent({utcDate:'2026-09-20T20:00:00+02:00',home:'Home, FC\nATTENDEE:bad',away:'Away; FC'},new Date('2026-09-11T10:00:00Z'));
  const unfolded = event.replace(/\r\n /g,'');
  assert.ok(unfolded.includes('DTSTART:20260920T180000Z'));
  assert.ok(unfolded.includes('DTSTAMP:20260911T100000Z'));
  assert.ok(unfolded.includes('Home\\, FC\\nATTENDEE:bad vs Away\\; FC'));
  assert.ok(!event.includes('\r\nATTENDEE:'));
  assert.ok(!event.includes('DTEND:'));
});
test('calendar folds Unicode lines within the byte limit', () => {
  const event = calendarEvent({utcDate:'2026-09-20T18:00:00Z',home:'Łódź'.repeat(40),away:'München'});
  for (const line of event.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75);
});
