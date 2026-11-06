const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {JSDOM} = require('jsdom');

const root = path.join(__dirname, '..');
const sourcePath = path.join(root, 'src/dosebeacon/pill-reminder-app-elderly-parents-first-week/index.html');
const html = fs.readFileSync(sourcePath, 'utf8');

function makeDom() {
  const dom = new JSDOM(html, {
    url: 'https://udrwu9c0tjuedqy2.github.io/hla-health/dosebeacon/pill-reminder-app-elderly-parents-first-week/',
    runScripts: 'dangerously',
    pretendToBeVisual: true
  });
  dom.window.HTMLElement.prototype.focus = function() {};
  return dom;
}

{
  const dom = makeDom();
  const d = dom.window.document;
  const boxes = d.querySelectorAll('#week-review-form input[name="checks"]');
  boxes[0].checked = true;
  boxes[3].checked = true;
  d.getElementById('review-date').value = '2026-11-06';
  d.getElementById('review-with').value = 'Pharmacist';
  d.getElementById('worked').value = 'The large reminder card was easy to find.';
  d.getElementById('question').value = 'Which report view should we bring?';
  d.getElementById('week-review-form').dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}));
  const output = d.getElementById('review-text').textContent;
  assert.equal(d.getElementById('review-output').hidden, false);
  assert.match(output, /Review date: 2026-11-06/);
  assert.match(output, /Next conversation: Pharmacist/);
  assert.match(output, /The family checked the last-update status/);
  assert.match(output, /not a medication list, dose record, diagnosis or adherence assessment/);
  assert.match(output, /does not transfer into DoseBeacon/);
  assert.equal(d.getElementById('review-download').disabled, false);
  assert.equal(d.getElementById('review-print').disabled, false);

  d.getElementById('question').value += ' Later.';
  d.getElementById('question').dispatchEvent(new dom.window.Event('input', {bubbles: true}));
  assert.equal(d.getElementById('review-output').hidden, true);
  assert.equal(d.getElementById('review-download').disabled, true);
}

{
  const dom = makeDom();
  const d = dom.window.document;
  d.getElementById('week-review-form').dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}));
  let captured;
  dom.window.Blob = class { constructor(parts, options) { this.parts = parts; this.type = options.type; } };
  dom.window.URL.createObjectURL = blob => { captured = blob; return 'blob:test'; };
  dom.window.URL.revokeObjectURL = () => {};
  dom.window.HTMLAnchorElement.prototype.click = function() {};
  d.getElementById('review-download').click();
  assert.match(captured.parts.join(''), /SETUP ITEMS REVIEWED\n- None selected/);
  assert.match(captured.parts.join(''), /ONE QUESTION THAT REMAINS\nNot recorded/);
  assert.equal(captured.type, 'text/plain;charset=utf-8');
  assert.match(d.getElementById('review-status').textContent, /created locally/);
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size);
assert.match(html, /Keep it non-medical and non-identifying/);
assert.match(html, /Do not enter names, medication names, doses, schedules, diagnoses, access codes or contact details/);
assert.match(html, /role="status" aria-live="polite"/);
assert.match(html, /@media print/);
assert.match(html, /@media \(max-width:680px\)/);
assert.match(html, /href="https:\/\/apps\.apple\.com\/app\/id6796910918\?ct=health-pill-reminder-app-elder&amp;mt=8"/);
assert.doesNotMatch(html, /fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
console.log('DoseBeacon first-week review: DOM scenarios and privacy/source invariants passed');
