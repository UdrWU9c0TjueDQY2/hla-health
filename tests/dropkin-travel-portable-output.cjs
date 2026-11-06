const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'src/dropkin/holiday-travel-reminder-reset/index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'src/dropkin/holiday-travel-reminder-reset/checklist.js'), 'utf8');
const labels = [
  'Travel bottle and unit',
  'Wake and sleep hours',
  'Phone notification permission',
  'Tone or pause preference',
  'Return-home review'
];

function setup() {
  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    url: 'https://udrwu9c0tjuedqy2.github.io/hla-health/dropkin/holiday-travel-reminder-reset/'
  });
  dom.window.HTMLTextAreaElement.prototype.select = function () {
    this.dataset.selected = 'true';
  };
  dom.window.eval(script);
  return dom;
}

const settle = () => new Promise(resolve => setImmediate(resolve));

(async () => {
  {
    const dom = setup();
    const { document } = dom.window;
    assert.equal(document.querySelector('#count').textContent, '0 of 5 reviewed');
    document.querySelector('#select').click();
    const output = document.querySelector('#portable');
    assert.equal(document.querySelector('#manual').hidden, false);
    assert.equal(output.dataset.selected, 'true');
    assert.equal(labels.every(label => output.value.includes(`[to review] ${label}`)), true);
    assert.match(output.value, /Setup checklist only\. No intake goal or scheduled reminder\./);
    assert.match(output.value, /holiday-travel-reminder-reset\/$/);
  }

  {
    const dom = setup();
    const { document, Event } = dom.window;
    const boxes = [...document.querySelectorAll('[data-check]')];
    boxes[0].checked = true;
    boxes[0].dispatchEvent(new Event('change'));
    boxes[3].checked = true;
    boxes[3].dispatchEvent(new Event('change'));
    document.querySelector('#select').click();
    const output = document.querySelector('#portable').value;
    assert.match(output, /\[reviewed\] Travel bottle and unit/);
    assert.match(output, /\[reviewed\] Tone or pause preference/);
    assert.equal((output.match(/\[reviewed\]/g) || []).length, 2);
    assert.equal((output.match(/\[to review\]/g) || []).length, 3);
  }

  {
    const dom = setup();
    const { document, navigator } = dom.window;
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { copied = text; } } });
    document.querySelector('#copy').click();
    await settle();
    assert.match(copied, /^Dropkin travel reminder setup/);
    assert.equal((copied.match(/\[to review\]/g) || []).length, 5);
    assert.equal(document.querySelector('#status').textContent, 'Checklist copied.');
  }

  {
    const dom = setup();
    const { document, navigator } = dom.window;
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async () => { throw new Error('denied'); } } });
    document.querySelector('#copy').click();
    await settle();
    assert.equal(document.querySelector('#manual').hidden, false);
    assert.equal(document.querySelector('#portable').dataset.selected, 'true');
    assert.equal(document.querySelector('#status').textContent, 'Copy unavailable. Complete checklist text selected.');
  }

  {
    const dom = setup();
    const { document } = dom.window;
    let blobParts;
    let blobOptions;
    let clickedDownload;
    let revoked;
    dom.window.Blob = class Blob {
      constructor(parts, options) { blobParts = parts; blobOptions = options; }
    };
    dom.window.URL.createObjectURL = () => 'blob:dropkin-checklist';
    dom.window.URL.revokeObjectURL = url => { revoked = url; };
    dom.window.HTMLAnchorElement.prototype.click = function () { clickedDownload = this.download; };
    document.querySelector('#download').click();
    await new Promise(resolve => setTimeout(resolve, 1));
    assert.equal(clickedDownload, 'dropkin-travel-reminder-checklist.txt');
    assert.match(blobParts.join(''), /\[to review\] Return-home review/);
    assert.equal(blobOptions.type, 'text/plain;charset=utf-8');
    assert.equal(revoked, 'blob:dropkin-checklist');
    assert.equal(document.querySelector('#status').textContent, 'Checklist download started.');
  }

  {
    const dom = setup();
    const { document } = dom.window;
    delete dom.window.URL.createObjectURL;
    document.querySelector('#download').click();
    assert.equal(document.querySelector('#manual').hidden, false);
    assert.equal(document.querySelector('#portable').dataset.selected, 'true');
    assert.equal(document.querySelector('#status').textContent, 'Download unavailable. Complete checklist text selected.');
  }

  {
    const dom = setup();
    const { document, Event } = dom.window;
    const boxes = [...document.querySelectorAll('[data-check]')];
    boxes.forEach(box => {
      box.checked = true;
      box.dispatchEvent(new Event('change'));
    });
    assert.equal(document.querySelector('#count').textContent, '5 of 5 reviewed');
    assert.match(document.querySelector('#summary').textContent, /All five settings reviewed/);
    document.querySelector('#select').click();
    document.querySelector('#reset').click();
    assert.equal(boxes.every(box => !box.checked), true);
    assert.equal(document.querySelector('#manual').hidden, true);
    assert.equal(document.querySelector('#portable').value, '');
    assert.equal(document.querySelector('#count').textContent, '0 of 5 reviewed');
  }

  assert.match(html, /<link rel="canonical" href="https:\/\/udrwu9c0tjuedqy2\.github\.io\/hla-health\/dropkin\/holiday-travel-reminder-reset\/">/);
  assert.match(html, /https:\/\/apps\.apple\.com\/app\/id6806471522\?ct=health-travel-reminders&amp;mt=8/);
  assert.match(html, /<textarea id="portable" readonly/);
  console.log('Dropkin travel checklist portable-output tests passed.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
