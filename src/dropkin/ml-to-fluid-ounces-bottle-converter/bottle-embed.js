(function (root) {
  'use strict';
  const FACTORS = Object.freeze({ml: 1, litre: 1000, us: 29.5735295625, imperial: 28.4130625});
  const LABELS = Object.freeze({ml: 'mL', litre: 'L', us: 'US fl oz', imperial: 'Imperial fl oz'});
  function calculate(capacity, unit, numerator, denominator) {
    if (!Object.hasOwn(FACTORS, unit)) throw new Error('Choose a listed volume unit.');
    if (!Number.isFinite(capacity) || capacity <= 0 || capacity > 100000) {
      throw new Error('Enter a bottle capacity greater than zero and no more than 100,000.');
    }
    if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator < 1 || denominator > 1000 || numerator < 0 || numerator > denominator) {
      throw new Error('Use whole fraction parts: denominator 1–1,000 and numerator from zero to the denominator.');
    }
    const fullMl = capacity * FACTORS[unit];
    const consumedMl = fullMl * numerator / denominator;
    return {
      fullMl, consumedMl, remainingMl: fullMl - consumedMl,
      litre: consumedMl / 1000,
      us: consumedMl / FACTORS.us,
      imperial: consumedMl / FACTORS.imperial
    };
  }
  root.DropkinBottleMath = {calculate, FACTORS};
  if (typeof module !== 'undefined') module.exports = root.DropkinBottleMath;
  if (typeof document === 'undefined') return;
  const $ = id => document.getElementById(id);
  const form = $('bottle-form');
  const fields = ['capacity', 'unit', 'numerator', 'denominator'];
  const number = value => new Intl.NumberFormat('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(value);
  function render() {
    try {
      if (fields.some(id => $(id).value === '') || !form.checkValidity()) throw new Error('Complete the fields within their shown limits.');
      const capacity = Number($('capacity').value), unit = $('unit').value;
      const numerator = Number($('numerator').value), denominator = Number($('denominator').value);
      const result = calculate(capacity, unit, numerator, denominator);
      $('answer').textContent = number(result.consumedMl) + ' mL consumed';
      $('remaining').textContent = number(result.remainingMl) + ' mL remaining, if the bottle began full.';
      $('other-units').textContent = number(result.us) + ' US fl oz · ' + number(result.imperial) + ' Imperial fl oz · ' + result.litre.toFixed(3) + ' L consumed';
      $('formula').textContent = capacity + ' ' + LABELS[unit] + ' × ' + numerator + ' ÷ ' + denominator + '. Rounded display; real bottle estimates may be less precise.';
    } catch (error) {
      $('answer').textContent = 'Check the bottle and fraction';
      $('remaining').textContent = error.message;
      $('other-units').textContent = '';
      $('formula').textContent = '';
    }
  }
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', event => {event.preventDefault(); render();});
  $('reset').addEventListener('click', () => {form.reset(); render();});
  render();
})(typeof globalThis !== 'undefined' ? globalThis : this);
