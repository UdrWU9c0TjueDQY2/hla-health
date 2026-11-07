const $=id=>document.getElementById(id);
function clear(){
  $('result').textContent='';
  $('fractions').replaceChildren();
}
['capacity','fraction','meaning'].forEach(x=>$(x).addEventListener('input',clear));
$('calculate').addEventListener('click',()=>{
  clear();
  const c=Number($('capacity').value),f=Number($('fraction').value),meaning=$('meaning').value;
  if(!Number.isInteger(c)||c<1||c>10000||![.25,.5,.75,1].includes(f)||!['consumed','remaining'].includes(meaning)){
    $('result').textContent='Enter a whole capacity from 1 to 10,000 mL and choose a valid fraction and meaning.';
    return;
  }
  const consumed=meaning==='consumed'?c*f:c*(1-f),remaining=c-consumed;
  $('result').textContent='Amount consumed: '+consumed+' mL.\nAmount remaining: '+remaining+' mL, if the bottle began full.\nThe selected fraction describes '+(meaning==='consumed'?'what you consumed.':'what remains.')+'\nThis is a volume estimate, not an intake recommendation.';
  for(const [label,v] of [['¼',.25],['½',.5],['¾',.75],['Full',1]]){
    const p=document.createElement('p');
    p.textContent=label+' = '+(c*v)+' mL';
    $('fractions').append(p);
  }
});
$('reset').addEventListener('click',()=>{
  $('capacity').value='750';
  $('fraction').value='0.5';
  $('meaning').value='consumed';
  clear();
});
