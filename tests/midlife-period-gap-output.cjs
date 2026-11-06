const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {JSDOM} = require('jsdom');

const root = path.join(__dirname, '..');
const pagePath = path.join(root, 'src/my-midlife-story/period-start-gap-log/index.html');
const scriptPath = path.join(root, 'src/my-midlife-story/period-start-gap-log/app.js');
const html = fs.readFileSync(pagePath, 'utf8');
const script = fs.readFileSync(scriptPath, 'utf8');

function makeDom() {
  const dom = new JSDOM(html, {
    url: 'https://udrwu9c0tjuedqy2.github.io/hla-health/my-midlife-story/period-start-gap-log/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  dom.window.HTMLElement.prototype.focus = function() {};
  dom.window.HTMLTextAreaElement.prototype.select = function() { this.dataset.selected = 'true'; };
  dom.window.eval(script);
  return dom;
}

function submit(dom, value) {
  const d = dom.window.document;
  d.getElementById('starts').value = value;
  d.getElementById('form').dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}));
}

{
  const dom = makeDom();
  const d = dom.window.document;
  submit(dom, '2026-06-01\n2026-06-29\n2026-07-30\n2026-09-03');
  assert.equal(d.getElementById('result').hidden, false);
  assert.match(d.getElementById('summary').textContent, /Median: 31 days/);
  assert.ok(d.getElementById('download-text'));
  assert.ok(d.getElementById('download-csv'));
  assert.ok(d.getElementById('select-text'));
  d.getElementById('select-text').click();
  const output = d.getElementById('handoff-text').value;
  assert.match(output, /Descriptive arithmetic only — not a diagnosis or prediction/);
  assert.match(output, /2026-06-01 → 2026-06-29: 28 days/);
  assert.match(output, /2026-09-03 \(last recorded start\)/);
  assert.match(output, /not transferred into My Midlife Story/);
  assert.equal(d.getElementById('handoff-text').dataset.selected, 'true');

  d.getElementById('starts').value += '\n2026-10-01';
  d.getElementById('starts').dispatchEvent(new dom.window.Event('input', {bubbles: true}));
  assert.equal(d.getElementById('result').hidden, true);
  assert.equal(d.getElementById('handoff-text').value, '');
}

{
  const dom = makeDom();
  const d = dom.window.document;
  submit(dom, '2026-06-01\n2026-06-29\n2026-07-30');
  let captured;
  dom.window.Blob = class { constructor(parts, options) { this.parts = parts; this.type = options.type; } };
  dom.window.URL.createObjectURL = blob => { captured = blob; return 'blob:test'; };
  dom.window.URL.revokeObjectURL = () => {};
  dom.window.HTMLAnchorElement.prototype.click = function() { this.dataset.clicked = 'true'; };
  d.getElementById('download-text').click();
  assert.equal(d.getElementById('handoff-status').textContent, 'Plain-text result prepared on this device.');
  assert.match(captured.parts.join(''), /2026-06-01 → 2026-06-29: 28 days/);
  d.getElementById('download-csv').click();
  const csv = captured.parts.join('');
  assert.ok(csv.startsWith('\ufeff"record_type","start_date","next_start_date","gap_days"\r\n'));
  assert.match(csv, /"interval","2026-06-01","2026-06-29","28"/);
  assert.match(csv, /"summary","","","Recorded starts: 3\. Intervals: 2\. Median: 29\.5 days\./);
}

{
  const dom = makeDom();
  const d = dom.window.document;
  submit(dom, '2026-06-01\n2026-06-29');
  dom.window.URL.createObjectURL = undefined;
  d.getElementById('download-csv').click();
  assert.equal(d.getElementById('manual-handoff').hidden, false);
  assert.match(d.getElementById('handoff-status').textContent, /CSV file could not be prepared/);
}

assert.match(html, /rel="canonical" href="https:\/\/udrwu9c0tjuedqy2\.github\.io\/hla-health\/my-midlife-story\/period-start-gap-log\/"/);
assert.match(html, /apps\.apple\.com\/us\/app\/my-midlife-story-menopause\/id6814637835/);
assert.match(html, /app\.js\?v=2/);
assert.doesNotMatch(script, /fetch\(|XMLHttpRequest|localStorage|sessionStorage/);
console.log('midlife period-gap output: 3 DOM scenarios and source invariants passed');
