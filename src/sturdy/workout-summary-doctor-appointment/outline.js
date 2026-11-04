'use strict';
const state={record:null,priority:null,format:null};
const prompts=s=>[
 s.priority==='routine'?'My main question about my routine or practical barriers: ______':'My main question about a change I noticed: ______',
 s.record==='dated'?'The dates, activities and details I actually recorded: ______':'What I remember (label approximate dates and uncertain details): ______',
 s.priority==='routine'?'What made the routine easier or harder to fit into my day: ______':'What I noticed, when it started, and how it affected activities: ______',
 'What I want my clinician to clarify about appropriate next steps: ______',
 s.format==='paper'?'Before the visit: write my notes on this outline and bring it with relevant records.':'Before the visit: save my notes somewhere I can open on my phone; this webpage does not save them.'
];
function render(){
 const ready=Object.values(state).every(Boolean);
 document.getElementById('copy-status').textContent='';
 document.getElementById('result-title').textContent=ready?'Your conversation, in five lines.':'Make the three choices.';
 document.getElementById('result-intro').textContent=ready?'Fill these prompts privately in your own notes. Keep uncertain details labeled as uncertain.':'Choose a record, priority and format. No personal health details are requested.';
 for(const id of ['result-list','print-list']){const list=document.getElementById(id);list.replaceChildren();if(ready)for(const line of prompts(state)){const li=document.createElement('li');li.textContent=line;list.append(li);}}
 document.getElementById('copy').disabled=!ready;document.getElementById('print').disabled=!ready;
}
document.querySelectorAll('[data-group] button').forEach(b=>b.addEventListener('click',()=>{const group=b.parentElement;state[group.dataset.group]=b.dataset.value;group.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();}));
document.getElementById('reset').addEventListener('click',()=>{Object.keys(state).forEach(k=>state[k]=null);document.querySelectorAll('[data-group] button').forEach(b=>b.setAttribute('aria-pressed','false'));render();});
document.getElementById('reveal').addEventListener('click',e=>{const b=e.currentTarget;const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));document.getElementById('example').hidden=!open;});
document.getElementById('print').addEventListener('click',()=>window.print());
document.getElementById('copy').addEventListener('click',async()=>{const selection=JSON.stringify(state);const text='My workout discussion outline\n\n'+prompts(state).map((x,i)=>(i+1)+'. '+x).join('\n');try{await navigator.clipboard.writeText(text);if(selection===JSON.stringify(state))document.getElementById('copy-status').textContent='Outline copied. Add your notes in a private place.';}catch{if(selection===JSON.stringify(state))document.getElementById('copy-status').textContent='Copy unavailable. Select the visible outline text or use Print outline.';}});

