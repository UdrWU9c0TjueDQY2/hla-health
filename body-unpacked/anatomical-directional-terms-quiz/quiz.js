'use strict';
const reverseTerms={anterior:'posterior',posterior:'anterior',medial:'lateral',lateral:'medial',proximal:'distal',distal:'proximal'};
function cleanStructure(value){return String(value||'').trim().replace(/\s+/g,' ').replace(/[.!?]+$/,'');}
function directionSummary(a,b,relation){
 const first=cleanStructure(a),second=cleanStructure(b),reverse=reverseTerms[relation];
 if(!first||!second||!reverse)return '';
 return 'Anatomical direction sentence practice\n\n'+first+' is '+relation+' to '+second+'.\n'+second+' is '+reverse+' to '+first+'.\n\nChosen by the learner. This builder formats the selected relationship; it does not verify anatomical accuracy.\nEducation only. Do not use this result to interpret symptoms, scans or care.\n\nSource: OpenStax Anatomy and Physiology 2e, section 1.6.\nCompanion by Honest Little Apps, publisher of Body Unpacked.\nhttps://apps.apple.com/app/id6819135509';
}
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
if(byId('sentence-form')){\nlet generatedSentenceText='';
const sentenceInputs=[byId('structure-a'),byId('structure-b'),byId('direction-term')];
function invalidateSentence(){
 generatedSentenceText='';
 byId('sentence-result').hidden=true;
 byId('sentence-fallback').hidden=true;
 byId('copy-sentence').disabled=true;
 byId('save-sentence').disabled=true;
 byId('sentence-status').textContent='';
}
function revealSentenceFallback(message){
 byId('sentence-fallback').value=generatedSentenceText;
 byId('sentence-fallback').hidden=false;
 byId('sentence-fallback').focus();
 byId('sentence-fallback').select();
 byId('sentence-status').textContent=message;
}
sentenceInputs.forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',invalidateSentence));
byId('sentence-form').addEventListener('submit',event=>{
 event.preventDefault();
 const a=cleanStructure(byId('structure-a').value),b=cleanStructure(byId('structure-b').value);
 if(!a||!b){byId('sentence-status').textContent='Add both structures before building the sentence.';(a?byId('structure-b'):byId('structure-a')).focus();return;}
 generatedSentenceText=directionSummary(a,b,byId('direction-term').value);
 byId('sentence-result').textContent=generatedSentenceText;
 byId('sentence-result').hidden=false;
 byId('sentence-fallback').hidden=true;
 byId('copy-sentence').disabled=false;
 byId('save-sentence').disabled=false;
 byId('sentence-status').textContent='Both directions are ready. Check the anatomy relationship against your course source.';
 byId('sentence-result').focus();
});
byId('copy-sentence').addEventListener('click',async()=>{
 if(!generatedSentenceText)return;
 try{
  if(!navigator.clipboard||!navigator.clipboard.writeText)throw new Error('clipboard unavailable');
  await navigator.clipboard.writeText(generatedSentenceText);
  byId('sentence-status').textContent='Practice text copied.';
 }catch(error){revealSentenceFallback('Copying was unavailable. The complete text is selected below for manual copy.');}
});
byId('save-sentence').addEventListener('click',()=>{
 if(!generatedSentenceText)return;
 try{
  const blob=new Blob([generatedSentenceText+'\n'],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='body-unpacked-direction-sentence-practice.txt';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);byId('sentence-status').textContent='Practice file ready. Check your downloads.';
 }catch(error){revealSentenceFallback('Saving was unavailable. The complete text is selected below for manual copy.');}
});
\n}\n