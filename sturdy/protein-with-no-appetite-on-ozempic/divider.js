'use strict';
function divideWhole(target, count) {
  if (!Number.isInteger(target) || target < 1 || target > 10000 || ![3,4,5,6].includes(count)) throw new Error('Enter a whole-gram number from 1 to 10,000 and choose 3–6 parts.');
  const base=Math.floor(target/count), remainder=target%count;
  return Array.from({length:count},(_,i)=>base+(i<remainder?1:0));
}
if(typeof module!=='undefined')module.exports={divideWhole};
if(typeof document!=='undefined'){
  const field=document.getElementById('g'),plan=document.getElementById('plan'),status=document.getElementById('divider-status');
  const buttons=[...document.querySelectorAll('#meals button')];let count=4;
  function render(){
    plan.replaceChildren();
    if(field.value.trim()===''){status.textContent='Enter your own agreed target to see the calculation.';return;}
    try{
      const target=Number(field.value),parts=divideWhole(target,count);
      parts.forEach((value,i)=>{const card=document.createElement('div'),amount=document.createElement('b'),label=document.createElement('span');amount.textContent=value+' g';label.textContent='Arithmetic part '+(i+1);card.append(amount,label);plan.append(card);});
      status.textContent=target+' ÷ '+count+' = '+(target/count).toLocaleString(undefined,{maximumFractionDigits:2})+' g per part before whole-gram rounding. Displayed parts total '+parts.reduce((a,b)=>a+b,0)+' g. This is arithmetic, not a meal plan.';
    }catch(error){status.textContent=error.message;}
  }
  field.addEventListener('input',render);
  buttons.forEach(button=>button.addEventListener('click',()=>{count=Number(button.dataset.n);buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
  document.getElementById('example').addEventListener('click',()=>{field.value='95';count=5;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.n==='5')));render();status.textContent='Fictional example only. '+status.textContent;});
  document.getElementById('clear').addEventListener('click',()=>{field.value='';render();field.focus();});
  render();
}
