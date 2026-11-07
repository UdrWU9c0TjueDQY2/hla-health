'use strict';
const CARDS=[["cardio-","heart","Follow a body topic from its name to the organ it describes."],["hepato-","liver","Look for hepat- or hepato- in a longer term."],["nephro-","kidney","Ren- and reno- are other word parts associated with the kidney."],["osteo-","bone","Ost-, oste- and osteo- are related forms."],["dermato-","skin","Derm- is another form of the same body clue."],["gastro-","stomach","MedlinePlus lists the root gastr-."],["myo-","muscle","The short form my- also points to muscle."],["cyto-","cell","A cell is a building block, rather than a whole organ."]];
let queue=CARDS.map((_,i)=>i),position=0,correct=0,missed=[],answered=false,round=1;
const $=id=>document.getElementById(id);
function show(){setSheetReview([]);answered=false;$('feedback').textContent='';$('next').disabled=true;
$('progress').textContent='Round '+round+' · Card '+(position+1)+' of '+queue.length;
const id=queue[position],reverse=$('direction').value==='reverse';
$('prompt').textContent=reverse?'Which word part points to '+CARDS[id][1]+'?':'Which body part does '+CARDS[id][0]+' point to?';
$('token').textContent=CARDS[id][reverse?1:0];$('choices').replaceChildren();
const options=[id,(id+3)%8,(id+5)%8,(id+7)%8].sort((a,b)=>CARDS[a][reverse?0:1].localeCompare(CARDS[b][reverse?0:1]));
options.forEach(i=>{const b=document.createElement('button');b.type='button';b.className='secondary';b.textContent=CARDS[i][reverse?0:1];b.addEventListener('click',()=>answer(i));$('choices').appendChild(b);});
$('practice').hidden=false;$('recap').hidden=true;}
function answer(id){if(answered)return;answered=true;const target=queue[position],right=id===target;if(right)correct++;else missed.push(target);
$('feedback').textContent=(right?'Correct. ':'Review this pair: ')+CARDS[target][0]+' → '+CARDS[target][1]+'. '+CARDS[target][2];
Array.from($('choices').children).forEach(b=>b.disabled=true);$('next').disabled=false;}
function next(){if(!answered)return;if(position+1<queue.length){position++;show();$('prompt').focus();return;}
$('practice').hidden=true;$('recap').hidden=false;$('score').textContent=correct+' of '+queue.length+' correct on the first try this round.';
$('review').textContent=missed.length?'Pairs to revisit: '+missed.map(i=>CARDS[i][0]+' = '+CARDS[i][1]).join('; ')+'.':'All pairs recalled this round. Try the other direction to check recognition from both sides.';
$('retry').hidden=!missed.length;setSheetReview(missed);$('score').focus();}
function reset(){queue=CARDS.map((_,i)=>i);position=0;correct=0;missed=[];round=1;show();}
$('next').addEventListener('click',next);$('reset').addEventListener('click',reset);
$('direction').addEventListener('change',reset);
$('retry').addEventListener('click',()=>{queue=missed.slice();position=0;correct=0;missed=[];round++;show();$('prompt').focus();});
let sheetMissed=[];
function selectedSheetPairs(){return ($('sheet-scope').value==='missed'?sheetMissed:CARDS.map((_,i)=>i)).map(i=>CARDS[i].slice(0,2));}
function renderSheet(){const pairs=selectedSheetPairs();$('sheet-preview').innerHTML=HLAWordSheet.content(pairs);$('sheet-status').textContent='';}
function setSheetReview(ids){sheetMissed=[...new Set(ids)];$('sheet-missed-option').disabled=!sheetMissed.length;$('sheet-scope').value='all';$('sheet-note').textContent=sheetMissed.length?sheetMissed.length+' missed pair'+(sheetMissed.length===1?' is':'s are')+' available from the completed round.':'Complete a round with missed pairs to make a shorter review sheet.';renderSheet();}
$('sheet-scope').addEventListener('change',renderSheet);
$('download-sheet').addEventListener('click',()=>{try{const pairs=selectedSheetPairs();const blob=new Blob([HLAWordSheet.documentFor(pairs)],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='body-word-parts-practice.html';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);$('sheet-status').textContent='Practice sheet ready. Check your downloads, or use the worksheet preview below.';}catch(error){$('sheet-status').textContent='The download could not start. Open the worksheet preview below to use the same questions and key.';}});
reset();
