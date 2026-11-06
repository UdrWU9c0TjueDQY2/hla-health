/* Local one-off calendar file; no network requests or automatic calendar writes. */
(() => {
  const get = id => document.getElementById(id);
  const canonical = 'https://udrwu9c0tjuedqy2.github.io/hla-health/sleepward/bedtime-backwards-planner/';
  const pad = n => String(n).padStart(2, '0');
  function dateBase(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (year < 2000 || year > 2099) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date.getTime() : null;
  }
  function stamp(base, minutes) {
    const d = new Date(base + minutes * 60000);
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00';
  }
  function escapeText(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  }
  function fold(line) {
    let output = '', part = '', bytes = 0;
    const encoder = new TextEncoder();
    for (const char of line) {
      const size = encoder.encode(char).length;
      if (bytes + size > 75) { output += part + '\r\n'; part = ' '; bytes = 1; }
      part += char; bytes += size;
    }
    return output + part;
  }
  function makeCalendar(plan, finishDate, includeNames) {
    const base = dateBase(finishDate);
    if (base === null || !plan || !plan.schedule || !plan.schedule.steps.length) return null;
    const schedule = plan.schedule, end = parseTime(plan.target);
    const description = ['A one-off evening plan. Review dates, local times and calendar alert settings before importing.',
      ...schedule.steps.map((s, i) => clock(s.start) + ' — ' + (includeNames ? s.name : 'Step ' + (i + 1)) + ' (' + s.minutes + ' min)'),
      'Finish: ' + plan.target + ' on ' + finishDate,
      'This file does not set an alarm, subscribe to a calendar, or sync with Sleepward.', canonical].join('\n');
    const uid = crypto.randomUUID() + '@honestlittleapps';
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Honest Little Apps//Evening Planner//EN','CALSCALE:GREGORIAN',
      'BEGIN:VEVENT','UID:' + uid,'DTSTAMP:' + now,'DTSTART:' + stamp(base, schedule.start),'DTEND:' + stamp(base, end),
      'SUMMARY:My evening routine','DESCRIPTION:' + escapeText(description),'CLASS:PRIVATE','TRANSP:TRANSPARENT',
      'END:VEVENT','END:VCALENDAR'].map(fold).join('\r\n') + '\r\n';
  }
  function preview() {
    const base = dateBase(get('calendar-date').value);
    if (base === null || !currentPlan) { get('calendar-preview').textContent = 'Build a valid timetable, then choose the date on which it should finish.'; return; }
    const start = stamp(base, currentPlan.schedule.start), end = stamp(base, parseTime(currentPlan.target));
    const readable = v => v.slice(0,4) + '-' + v.slice(4,6) + '-' + v.slice(6,8) + ' at ' + v.slice(9,11) + ':' + v.slice(11,13);
    get('calendar-preview').textContent = 'One event: ' + readable(start) + ' → ' + readable(end) + '. Local clock times; check the imported result.';
  }
  get('calendar-date').addEventListener('input', preview);
  get('form').addEventListener('submit', preview);
  get('restore').addEventListener('click', () => {get('calendar-date').value = ''; get('calendar-names').checked = false; preview();});
  get('calendar-download').addEventListener('click', () => {
    const body = makeCalendar(currentPlan, get('calendar-date').value, get('calendar-names').checked);
    if (!body) {get('calendar-status').textContent = 'Choose a real finish date from 2000 to 2099 and build a valid timetable first.'; return;}
    const blob = new Blob([body], {type: 'text/calendar;charset=utf-8'}), url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'my-evening-routine.ics'; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    get('calendar-status').textContent = 'Calendar file prepared. Open it in your calendar and review before saving. Re-importing may create a duplicate. No event has been added by this page.';
    preview();
  });
})();
