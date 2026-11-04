const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const dir=fs.existsSync(path.join(__dirname,'index.html'))?__dirname:path.resolve(__dirname,'../src/dosebeacon/reminder-vs-dose-record');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const script=html.match(/<script id="practice-script">([\s\S]*?)<\/script>/)[1];
const expected=[0,1,2,1,0,2];let suites=0,answers=0;
function test(name,fn){fn();suites++;console.log('PASS '+name);}
function harness(){
 const nodes={};let focused=null;
 function node(){return {textContent:'',children:[],attrs:{},listeners:{},hidden:false,disabled:false,append(...n){this.children.push(...n);},replaceChildren(...n){this.children=[...n];},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},addEventListener(k,f){this.listeners[k]=f;},focus(){focused=this;}};}
 for(const m of html.matchAll(/\bid="([^"]+)"/g))nodes[m[1]]=node();
 const tabs=Array.from({length:6},()=>node());
 const document={getElementById(id){assert.ok(nodes[id],'Missing element '+id);return nodes[id];},querySelectorAll(s){assert.equal(s,'[data-case]');return tabs;},createElement(){return node();}};
 vm.runInNewContext(script,{document});
 return {nodes,tabs,get focused(){return focused;},click(id){nodes[id].listeners.click();},choose(i){nodes.choices.children[i].listeners.click();},go(i){tabs[i].listeners.click();}};
}
test('All 18 choices use independently audited interpretations',()=>{
 const h=harness();for(let i=0;i<6;i++){h.go(i);assert.equal(h.nodes.timeline.children.length,2);assert.equal(h.nodes.choices.children.length,3);
  for(let n=0;n<3;n++){h.choose(n);answers++;assert.equal(h.nodes.feedback.hidden,false);assert.match(h.nodes['feedback-title'].textContent,n===expected[i]?/stays within/:/goes beyond/);assert.equal(h.nodes.choices.children[n].attrs['aria-pressed'],'true');assert.equal(h.nodes.choices.children.filter(x=>x.attrs['aria-pressed']==='true').length,1);assert.ok(h.nodes['feedback-text'].textContent.length>70);assert.match(h.nodes['record-note'].textContent,/A careful reading:/);}
 }assert.match(h.nodes.progress.textContent,/6 cases explored/);assert.match(h.nodes.status.textContent,/not a qualification or assessment/);
});
test('Explanations preserve the six different evidence boundaries',()=>{
 const h=harness();const boundaries=[/does not establish/,/not a reported dose/,/sharing status/,/not independent proof/,/disagreement/,/last-update time/];
 for(let i=0;i<6;i++){h.go(i);h.click('reveal');assert.match(h.nodes['feedback-text'].textContent,boundaries[i]);assert.match(h.nodes['feedback-title'].textContent,/record supports/);assert.equal(h.nodes.choices.children.filter(x=>x.attrs['aria-pressed']==='true').length,0);}
});
test('Navigation clears stale feedback and focuses the new case',()=>{
 const h=harness();h.choose(1);assert.equal(h.focused,h.nodes['feedback-title']);h.click('next');assert.match(h.nodes.progress.textContent,/Case 2 of 6/);assert.equal(h.nodes.feedback.hidden,true);assert.equal(h.nodes['feedback-text'].textContent,'');assert.equal(h.nodes['record-note'].textContent,'');assert.equal(h.focused,h.nodes['case-title']);assert.equal(h.tabs[1].attrs['aria-current'],'step');assert.equal(h.tabs[0].attrs['aria-current'],undefined);h.click('previous');assert.match(h.nodes.progress.textContent,/Case 1 of 6/);assert.equal(h.nodes.previous.disabled,true);
});
test('Reveal and repeated answers do not inflate exploration; reset clears everything',()=>{
 const h=harness();for(let i=0;i<6;i++){h.go(i);h.click('reveal');h.click('reveal');h.choose(expected[i]);assert.match(h.nodes.progress.textContent,new RegExp((i+1)+(i===0?' case explored':' cases explored')));}assert.equal(h.nodes.next.disabled,true);h.click('next');assert.match(h.nodes.progress.textContent,/Case 6 of 6/);h.click('reset');assert.match(h.nodes.progress.textContent,/Case 1 of 6 · 0 cases explored/);assert.equal(h.nodes.feedback.hidden,true);assert.equal(h.nodes.previous.disabled,true);assert.equal(h.nodes.next.disabled,false);h.click('previous');assert.match(h.nodes.progress.textContent,/Case 1 of 6/);
});
test('Content and search metadata have one official download path and honest limits',()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);assert.equal((html.match(/<h1>/g)||[]).length,1);
 const links=[...html.matchAll(/href="(https:\/\/apps\.apple\.com[^\"]+)"/g)].map(m=>m[1]);assert.deepEqual(links,['https://apps.apple.com/ca/app/dosebeacon-pill-reminder/id6796910918']);
 assert.match(html,/rel="canonical" href="https:\/\/udrwu9c0tjuedqy2.github.io\/hla-health\/dosebeacon\/reminder-vs-dose-record\/"/);assert.match(html,/Honest Little Apps publishes DoseBeacon/);assert.match(html,/Free download with in-app purchases/);assert.match(html,/two active medications/);assert.match(html,/not an app screenshot/);assert.match(html,/<noscript>/);assert.match(html,/pharmacist or prescriber/);assert.doesNotMatch(html,/James Gray|guarantee|testimonials/);
 const meta=JSON.parse(fs.readFileSync(path.join(dir,'meta.json'),'utf8'));assert.equal(meta.appSlug,'dosebeacon');assert.equal(meta.draft,false);
});
test('No patient input, persistence, network calls or HTML interpolation in the controller',()=>{
 assert.doesNotMatch(html,/<input|<textarea|<form/);assert.doesNotMatch(script,/fetch\(|XMLHttpRequest|localStorage|sessionStorage|innerHTML|setTimeout|setInterval/);assert.match(script,/textContent=/);assert.match(html,/role="status"/);assert.match(html,/prefers-reduced-motion/);assert.match(html,/@media\(max-width:420px\)/);
});
test('Key normal text color pairs meet WCAG AA contrast',()=>{
 const lum=h=>{const v=h.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];};
 for(const [fg,bg] of [['223441','faf6ed'],['53616a','fffdf8'],['53616a','f1eee5'],['dae1e4','142837'],['c4ced4','142837'],['132532','e8b44e'],['765111','faf6ed'],['53616a','e9eee9']]){const v=[lum(fg),lum(bg)].sort((a,b)=>b-a);assert.ok((v[0]+.05)/(v[1]+.05)>=4.5,fg+' on '+bg);}
});
console.log(JSON.stringify({suites,answers,limitations:['DOM stub, not browser rendering','No medication safety or native app testing']},null,2));
