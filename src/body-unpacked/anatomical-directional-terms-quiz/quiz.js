'use strict';
const questions=[
 {text:'The breastbone is ___ to the spine.',options:['Anterior','Posterior'],correct:0,explanation:'Anterior means toward the front. The breastbone is in front of the spine.'},
 {text:'The nose is ___ to the ears.',options:['Lateral','Medial'],correct:1,explanation:'Medial means toward the midline. The nose is nearer the midline than the ears.'},
 {text:'The wrist is ___ to the elbow.',options:['Proximal','Distal'],correct:1,explanation:'Distal means farther from the limb attachment. The wrist is farther along the limb than the elbow.'}
];
let index=0,score=0,answered=false;
const byId=id=>document.getElementById(id);
const buttons=[...document.querySelectorAll('[data-answer]')];
function answer(value){
 if(answered)return;
 answered=true;const q=questions[index];const correct=value===q.correct;if(correct)score++;
 buttons.forEach((b,i)=>{b.disabled=true;b.setAttribute('aria-pressed',String(i===value));});
 byId('feedback').replaceChildren();const lead=document.createElement('strong');lead.textContent=correct?'That is right.':'A useful correction.';const explanation=document.createElement('p');explanation.textContent=q.explanation;byId('feedback').append(lead,explanation);
 document.querySelectorAll('.dot')[index].classList.add('done');byId('next').disabled=false;byId('next').textContent=index===2?'See your recap':'Next question';
}
function renderQuestion(){const q=questions[index];byId('progress').textContent='Question '+(index+1)+' of 3 - no timer';byId('question').textContent=q.text;buttons.forEach((b,i)=>{b.textContent=q.options[i];b.disabled=false;b.setAttribute('aria-pressed','false');});byId('feedback').textContent='Choose one answer to see the explanation.';byId('next').disabled=true;byId('next').textContent='Next question';answered=false;}
buttons.forEach((b,i)=>b.addEventListener('click',()=>answer(i)));
byId('next').addEventListener('click',()=>{if(!answered)return;if(index<2){index++;renderQuestion();}else{byId('progress').textContent='Practice complete';byId('question').textContent=score+' of 3 on this round.';byId('choices').hidden=true;byId('feedback').textContent='Review the direction card below. This small practice score is not an assessment of your anatomy knowledge.';byId('next').hidden=true;byId('restart').hidden=false;}});
byId('restart').addEventListener('click',()=>{index=0;score=0;byId('choices').hidden=false;byId('next').hidden=false;byId('restart').hidden=true;document.querySelectorAll('.dot').forEach(x=>x.classList.remove('done'));renderQuestion();});
byId('print').addEventListener('click',()=>window.print());