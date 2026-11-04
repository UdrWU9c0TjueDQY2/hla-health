const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync('src/sturdy/workout-summary-doctor-appointment/outline.js','utf8');
const elements={};const groups=['record','priority','format'].map((key,i)=>({dataset:{group:key},buttons:(i===0?['dated','memory']:i===1?['routine','change']:['paper','phone']).map(value=>({dataset:{value},attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,v){this.listeners[k]=v}})),querySelectorAll(){return this.buttons}}));
groups.forEach(g=>g.buttons.forEach(b=>b.parentElement=g));
const buttonList=groups.flatMap(g=>g.buttons);
function el(id){return elements[id]??=( {textContent:'',children:[],listeners:{},attrs:{'aria-expanded':'false'},hidden:true,disabled:false,replaceChildren(){this.children=[]},append(x){this.children.push(x)},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},addEventListener(k,v){this.listeners[k]=v}});}
let copied='',printed=0;const context={document:{getElementById:el,querySelectorAll:()=>buttonList,createElement:()=>({textContent:''})},navigator:{clipboard:{writeText:async s=>copied=s}},window:{print:()=>printed++}};
vm.createContext(context);vm.runInContext(code,context);
(async()=>{
 let tested=0;
 for(const a of groups[0].buttons)for(const b of groups[1].buttons)for(const c of groups[2].buttons){
  el('reset').listeners.click();assert.equal(el('copy').disabled,true);
  for(const btn of [a,b,c])btn.listeners.click();
  assert.equal(el('result-list').children.length,5);assert.equal(el('copy').disabled,false);
  const lines=el('result-list').children.map(x=>x.textContent);
  assert.ok(lines[1].includes(a.dataset.value==='dated'?'actually recorded':'approximate'));
  assert.ok(lines[2].includes(b.dataset.value==='routine'?'routine':'when it started'));
  assert.ok(lines[4].includes(c.dataset.value==='paper'?'bring it':'does not save'));
  await el('copy').listeners.click();assert.ok(copied.includes(lines[1]));
  el('print').listeners.click();tested++;
 }
 el('reveal').listeners.click({currentTarget:el('reveal')});assert.equal(el('example').hidden,false);
 el('reveal').listeners.click({currentTarget:el('reveal')});assert.equal(el('example').hidden,true);
 el('reset').listeners.click();assert.equal(el('result-list').children.length,0);assert.equal(el('print').disabled,true);
 const html=fs.readFileSync('src/sturdy/workout-summary-doctor-appointment/index.html','utf8');
 assert.equal((html.match(/<h1>/g)||[]).length,1);
 assert.ok(html.includes('app-id=6800233450'));
 assert.ok(!/localStorage|fetch\(/.test(code));
 const meta=JSON.parse(fs.readFileSync('src/sturdy/workout-summary-doctor-appointment/meta.json'));
 assert.ok(meta.title.length<=60);
 console.log(tested+' decision combinations passed; reveal/reset/copy/print wiring passed. Browser rendering and real clipboard/print remain unverified.');
})().catch(e=>{console.error(e);process.exit(1)});

