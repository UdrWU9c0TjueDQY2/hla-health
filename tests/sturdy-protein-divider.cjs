const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../src/sturdy/protein-with-no-appetite-on-ozempic');
const {divideWhole}=require(path.join(root,'divider.js'));
assert.deepEqual(divideWhole(95,5),[19,19,19,19,19]);
assert.deepEqual(divideWhole(95,4),[24,24,24,23]);
assert.deepEqual(divideWhole(90,4),[23,23,22,22]);
for(const target of [1,2,3,50,95,10000])for(const count of [3,4,5,6]){
  const result=divideWhole(target,count);assert.equal(result.reduce((a,b)=>a+b,0),target);assert.equal(result.length,count);assert.ok(Math.max(...result)-Math.min(...result)<=1);
}
for(const target of [0,-1,1.5,10001,Infinity,NaN])assert.throws(()=>divideWhole(target,4));
for(const count of [0,2,7,4.5])assert.throws(()=>divideWhole(95,count));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const phrase of ['costs muscle','loses muscle','chair stand does not go backwards','90 g day is impossible','1.2 to 1.6','20 to 30 g per meal'])assert.ok(!html.includes(phrase),phrase);
assert.ok(!html.includes('value="90"'));assert.match(html,/id6800233450/);assert.match(html,/Optional Sturdy Pro/);assert.match(html,/Publisher relationship: Honest Little Apps/);
assert.match(html,/canonical" href="https:\/\/udrwu9c0tjuedqy2.github.io\/hla-health\/sturdy\/protein-with-no-appetite-on-ozempic\//);
function el(){return {value:'',textContent:'',children:[],events:{},append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x},addEventListener(n,f){this.events[n]=f},setAttribute(k,v){this[k]=v},focus(){this.focused=true}}}
const elements=Object.fromEntries(['g','plan','divider-status','example','clear'].map(id=>[id,el()]));const buttons=[3,4,5,6].map(n=>Object.assign(el(),{dataset:{n:String(n)}}));
const context={document:{getElementById:id=>elements[id],querySelectorAll:()=>buttons,createElement:()=>el()},Intl};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'divider.js'),'utf8'),context);
assert.equal(elements.plan.children.length,0);assert.match(elements['divider-status'].textContent,/Enter your own/);
elements.example.events.click();assert.equal(elements.g.value,'95');assert.equal(elements.plan.children.length,5);assert.match(elements['divider-status'].textContent,/Fictional example only/);
buttons[1].events.click();assert.equal(elements.plan.children.length,4);assert.equal(elements.plan.children[3].children[0].textContent,'23 g');
elements.g.value='bad';elements.g.events.input();assert.equal(elements.plan.children.length,0);assert.match(elements['divider-status'].textContent,/whole-gram/);
elements.clear.events.click();assert.equal(elements.g.value,'');assert.equal(elements.plan.children.length,0);assert.equal(elements.g.focused,true);
console.log('24 exact-sum cases, 3 worked examples, 10 invalid cases, 5 handler paths and claim/canonical/offer boundaries passed.');
