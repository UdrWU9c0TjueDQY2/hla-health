const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const file=process.argv[2]||path.join(__dirname,'../src/dropkin/ml-to-fluid-ounces-bottle-converter/index.html');
const html=fs.readFileSync(file,'utf8');
const source=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('const kind="volume"'));
assert.ok(source,'Main live converter script must exist');
class El{constructor(value=''){this.value=value;this.textContent='';this._html='';this.disabled=false;this.events={};}addEventListener(n,f){this.events[n]=f;}checkValidity(){return this.value!==''&&Number.isFinite(Number(this.value))&&Number(this.value)>=0&&Number(this.value)<=100000;}set innerHTML(s){this._html=s;this.innerText=s.replace(/<[^>]+>/g,'');}get innerHTML(){return this._html;}fire(n){return this.events[n]({preventDefault(){}});}}
const e=Object.fromEntries(['inputs','amount','unit','result','detail','visual','copy','status','restore'].map(id=>[id,new El()]));
e.amount.value='500';e.unit.value='ml';
let copied=[],mode='success',pending=[];
const ctx={document:{title:'Bottle conversion',getElementById:id=>e[id],querySelectorAll:()=>[e.amount]},location:{href:'https://example.test/converter/#tool'},HTMLFormElement:{prototype:{reset:{call(){e.amount.value='500';e.unit.value='ml';}}}},navigator:{clipboard:{writeText(s){copied.push(s);if(mode==='failure')return Promise.reject(Error('blocked'));if(mode==='pending')return new Promise((resolve,reject)=>pending.push({resolve,reject}));return Promise.resolve();}}},console};
vm.runInNewContext(source,ctx);
async function main(){
 assert.equal(e.copy.disabled,false);assert.match(e.result.textContent,/500\.00 mL/);
 await e.copy.fire('click');assert.equal(copied.length,1);assert.match(copied[0],/16\.91 US fl oz/);assert.match(e.status.textContent,/Copied/);
 for(const bad of ['', '-1','100001','NaN']){e.amount.value=bad;e.inputs.fire('input');assert.equal(e.copy.disabled,true);assert.equal(e.status.textContent,'');const count=copied.length;await e.copy.fire('click');assert.equal(copied.length,count);assert.equal(e.result.textContent,'Check your inputs');}
 e.amount.value='0';e.inputs.fire('change');assert.equal(e.copy.disabled,false);await e.copy.fire('click');assert.match(copied.at(-1),/0\.00 mL/);
 e.amount.value='20';e.unit.value='us';e.inputs.fire('change');await e.copy.fire('click');assert.match(copied.at(-1),/591\.47 mL/);
 e.unit.value='imperial';e.inputs.fire('change');await e.copy.fire('click');assert.match(copied.at(-1),/568\.26 mL/);
 mode='failure';await e.copy.fire('click');assert.match(e.status.textContent,/Copy unavailable/);
 mode='pending';const first=e.copy.fire('click');e.amount.value='';e.inputs.fire('input');pending.shift().resolve();await first;assert.equal(e.status.textContent,'');assert.equal(e.copy.disabled,true);
 e.amount.value='100';e.inputs.fire('input');const second=e.copy.fire('click');e.amount.value='200';e.inputs.fire('input');pending.shift().reject(Error('late'));await second;assert.equal(e.status.textContent,'');assert.equal(e.copy.disabled,false);
 e.restore.fire('click');assert.equal(e.amount.value,'500');assert.equal(e.unit.value,'ml');assert.equal(e.copy.disabled,false);assert.equal(e.status.textContent,'');
 console.log('Dropkin converter copy guard: 12 handler groups passed');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
