const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('src/sleepward/bedtime-backwards-planner/index.html','utf8');
const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function schedule'));
let checks=0;
async function check(name,fn){await fn();checks++;console.log('PASS '+name);}
function open(search=''){
 const elements={},copies=[],defaults={target:'23:00',name0:'Put a few things away',name1:"Prepare tomorrow's things",name2:'Read or unwind',name3:'Final getting-ready step',minutes0:'5',minutes1:'10',minutes2:'20',minutes3:'5'};let prints=0;
 const el=id=>elements[id]||(elements[id]={value:defaults[id]||'',hidden:false,textContent:'',listeners:{},children:[],addEventListener(t,f){this.listeners[t]=f;},replaceChildren(){this.children=[];},append(...x){this.children.push(...x);}});
 const storeLink={},classes=new Set();
 const ctx={URL,URLSearchParams,location:{search},document:{getElementById:el,createElement:t=>el('created-'+Object.keys(elements).length+'-'+t),querySelector:()=>storeLink,body:{classList:{add:x=>classes.add(x)}}},navigator:{clipboard:{writeText:async t=>copies.push(t)}},window:{print:()=>prints++},HTMLFormElement:{prototype:{reset(){for(const [k,v]of Object.entries(defaults))el(k).value=v;}}}};
 vm.createContext(ctx);vm.runInContext(script,ctx);return {ctx,el,copies,classes,storeLink,get prints(){return prints;},fire:async(id,event='click')=>{await el(id).listeners[event]?.({preventDefault(){}});await new Promise(r=>setImmediate(r));}};
}
(async()=>{
await check('default timetable',()=>{const p=open();assert.equal(p.el('start').textContent,'22:20 � target day');assert.equal(p.el('total').textContent,'40 minutes in your plan');assert.equal(p.el('steps').children.length,4);});
await check('shared plan crossing midnight',()=>{const p=open('?target=00%3A15&m=5%2C10%2C20%2C5');assert.equal(p.el('start').textContent,'23:35 � day before target');assert.equal(p.el('endtime').textContent,'Finish: 00:15 � target day');assert.match(p.el('status').textContent,/example step names/);});
await check('private names excluded from share',async()=>{const p=open('?tracking=unrelated');p.el('name0').value='PRIVATE NAME';await p.fire('form','submit');await p.fire('share');const u=new URL(p.copies.at(-1));assert.deepEqual([...u.searchParams.keys()],['target','m']);assert.equal(u.searchParams.get('m'),'5,10,20,5');assert.equal(u.hash,'#planner');assert(!p.copies.at(-1).includes('PRIVATE'));});
await check('maximum and omitted steps',()=>{const p=open('?target=00:00&m=90,0,90,90');assert.equal(p.el('start').textContent,'19:30 � day before target');assert.equal(p.el('steps').children.length,3);});
await check('invalid shared plans retain default',()=>{for(const q of ['?target=25:00&m=5,10,20,5','?target=23:00&m=0,0,0,0','?target=23:00&m=91,1,1,1','?target=23:00&m=-1,1,1,1','?target=23:00&m=1.5,1,1,1','?m=1,1,1,1','?target=23:00&m=1,1,1,1,1','?target=23:00&m=%3Cscript%3E']){const p=open(q);assert.equal(p.el('start').textContent,'22:20 � target day');assert.match(p.el('status').textContent,/could not be read/);}});
await check('stale plan cannot be shared or printed',async()=>{const p=open();p.el('minutes0').value='30';await p.fire('minutes0','input');await p.fire('share');await p.fire('print');assert.equal(p.copies.length,0);assert.equal(p.prints,0);assert.equal(p.el('output').hidden,true);await p.fire('form','submit');await p.fire('print');assert.equal(p.prints,1);assert.equal(p.el('start').textContent,'21:55 � target day');});
await check('invalid form cannot be distributed',async()=>{const p=open();p.el('minutes0').value='';await p.fire('form','submit');await p.fire('share');assert.equal(p.el('output').hidden,true);assert.equal(p.copies.length,0);});
await check('embed uses default with attribution',async()=>{const p=open();p.el('name1').value='PRIVATE NAME';await p.fire('form','submit');await p.fire('embed');assert.match(p.copies.at(-1),/\?embed=1/);assert.match(p.copies.at(-1),/publisher of Sleepward/);assert(!p.copies.at(-1).includes('PRIVATE'));assert(!p.copies.at(-1).includes('&m='));});
await check('embedded App Store path stays visible',()=>{const p=open('?embed=1');assert(p.classes.has('embedded'));assert.equal(p.storeLink.target,'_blank');assert.equal(p.storeLink.rel,'noopener');assert(html.includes('section:not(#planner):not(.app-section)'));assert(html.includes('<section class="app-section">'));assert(html.includes('id6796299594'));});
await check('clipboard failure exposes link',async()=>{const p=open();p.ctx.navigator.clipboard.writeText=async()=>{throw Error('denied');};await p.fire('share');assert.match(p.el('status').textContent,/Clipboard unavailable/);assert.match(p.el('status').textContent,/target=23%3A00/);});
await check('reset clears shared choices',async()=>{const p=open('?target=01:00&m=90,0,0,0');await p.fire('restore');assert.equal(p.el('start').textContent,'22:20 � target day');assert.equal(p.el('target').value,'23:00');});
await check('user labels are text',async()=>{const p=open();p.el('name0').value='<img src=x onerror=alert(1)>';await p.fire('form','submit');assert.equal(p.el('steps').children[0].children[1].textContent,'<img src=x onerror=alert(1)>');});
console.log(JSON.stringify({passed:checks,failed:0}));
})().catch(e=>{console.error(e);process.exit(1);});

