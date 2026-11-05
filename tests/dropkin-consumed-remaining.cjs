const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const source=fs.readFileSync(process.argv[2]||'src/dropkin/partial-bottle-calculator/app.js','utf8');
class El{constructor(value=''){this.value=value;this.textContent='';this.children=[];this.listeners={};}addEventListener(type,fn){this.listeners[type]=fn;}replaceChildren(){this.children=[];}append(x){this.children.push(x);}fire(type){this.listeners[type]();}}
const els={capacity:new El('750'),fraction:new El('0.5'),meaning:new El('consumed'),calculate:new El(),reset:new El(),result:new El(),fractions:new El()};
const document={getElementById:id=>els[id],createElement:()=>new El()};
vm.runInNewContext(source,{document});
const calculate=()=>els.calculate.fire('click');
calculate();
assert.match(els.result.textContent,/Amount consumed: 375 mL/);
assert.match(els.result.textContent,/Amount remaining: 375 mL/);
assert.equal(els.fractions.children.length,4);
els.fraction.value='0.25';els.meaning.value='remaining';calculate();
assert.match(els.result.textContent,/Amount consumed: 562\.5 mL/);
assert.match(els.result.textContent,/Amount remaining: 187\.5 mL/);
assert.match(els.result.textContent,/selected fraction describes what remains/);
els.capacity.value='1001';els.fraction.value='0.75';els.meaning.value='remaining';calculate();
assert.match(els.result.textContent,/Amount consumed: 250\.25 mL/);
assert.match(els.result.textContent,/Amount remaining: 750\.75 mL/);
els.meaning.value='bad';calculate();assert.match(els.result.textContent,/valid fraction and meaning/);assert.equal(els.fractions.children.length,0);
for(const bad of ['', '0', '1.5', '10001']){els.capacity.value=bad;els.fraction.value='0.5';els.meaning.value='consumed';calculate();assert.match(els.result.textContent,/whole capacity/);}
els.capacity.value='500';els.fraction.value='1';els.meaning.value='remaining';calculate();assert.match(els.result.textContent,/Amount consumed: 0 mL/);assert.match(els.result.textContent,/Amount remaining: 500 mL/);
els.capacity.fire('input');assert.equal(els.result.textContent,'');assert.equal(els.fractions.children.length,0);
els.capacity.value='800';els.fraction.value='0.25';els.meaning.value='remaining';els.reset.fire('click');assert.equal(els.capacity.value,'750');assert.equal(els.fraction.value,'0.5');assert.equal(els.meaning.value,'consumed');assert.equal(els.result.textContent,'');
console.log('Dropkin consumed/remaining handler checks passed: 13 cases');
