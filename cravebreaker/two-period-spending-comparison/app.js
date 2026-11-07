(() => {
  const form = document.querySelector('#compare-form');
  const error = document.querySelector('#error');
  const results = document.querySelector('#results');
  const fields = {
    aSpend: document.querySelector('#a-spend'), aDays: document.querySelector('#a-days'),
    bSpend: document.querySelector('#b-spend'), bDays: document.querySelector('#b-days')
  };
  const currency = document.querySelector('#currency');
  const updateStatus = document.querySelector('#update-status');
  const money = value => new Intl.NumberFormat(undefined,{style:'currency',currency:currency.value,currencyDisplay:'code',minimumFractionDigits:2,maximumFractionDigits:2}).format(value);

  function calculate(values){
    const {aSpend,aDays,bSpend,bDays}=values;
    if(![aSpend,aDays,bSpend,bDays].every(Number.isFinite)) throw new Error('Enter a number in all four fields.');
    if(aSpend<0 || bSpend<0) throw new Error('Spending totals cannot be negative.');
    if(aDays<1 || bDays<1 || aDays>366 || bDays>366 || !Number.isInteger(aDays) || !Number.isInteger(bDays)) throw new Error('Days must be whole numbers from 1 to 366.');
    const aDaily=aSpend/aDays, bDaily=bSpend/bDays, difference=bDaily-aDaily;
    return {aSpend,aDays,bSpend,bDays,aDaily,bDaily,difference};
  }

  function render(result){
    document.querySelector('#copy-status').textContent='';
    updateStatus.textContent='';
    document.querySelector('#a-daily').textContent=`${money(result.aDaily)} / day`;
    document.querySelector('#b-daily').textContent=`${money(result.bDaily)} / day`;
    document.querySelector('#a-formula').textContent=`${money(result.aSpend)} ÷ ${result.aDays} days`;
    document.querySelector('#b-formula').textContent=`${money(result.bSpend)} ÷ ${result.bDays} days`;
    document.querySelector('#difference').textContent=`${result.difference>=0?'+':''}${money(result.difference)} / day`;
    let plain;
    if(Math.abs(result.difference)<0.005) plain='The two daily averages are the same after rounding to cents.';
    else if(result.difference<0) plain=`The later daily average is ${money(Math.abs(result.difference))} lower than the earlier daily average.`;
    else plain=`The later daily average is ${money(result.difference)} higher than the earlier daily average.`;
    document.querySelector('#plain-result').textContent=plain;
    document.querySelector('#record-note').textContent=`Earlier record: ${money(result.aSpend)} over ${result.aDays} days (${money(result.aDaily)} per day). Later record: ${money(result.bSpend)} over ${result.bDays} days (${money(result.bDaily)} per day). ${plain} These entries were user supplied and the comparison does not explain the cause.`;
    results.hidden=false;
  }

  form.addEventListener('submit', event => {
    event.preventDefault(); error.hidden=true;
    try{
      if(Object.values(fields).some(field=>field.value.trim()==='')) throw new Error('Enter a number in all four fields.');
      render(calculate({aSpend:Number(fields.aSpend.value),aDays:Number(fields.aDays.value),bSpend:Number(fields.bSpend.value),bDays:Number(fields.bDays.value)}));
    }
    catch(err){results.hidden=true;error.textContent=err.message;error.hidden=false;}
  });
  function invalidate(){
    if(!results.hidden) updateStatus.textContent='Values changed. Compare the records again to update the result.';
    results.hidden=true;
    error.hidden=true;
    for(const id of ['a-daily','b-daily','a-formula','b-formula','difference','plain-result','record-note','copy-status']) document.querySelector('#'+id).textContent='';
  }
  Object.values(fields).forEach(field=>field.addEventListener('input',invalidate));
  currency.addEventListener('change',invalidate);
  document.querySelector('#clear').addEventListener('click',()=>{Object.values(fields).forEach(field=>field.value='');invalidate();updateStatus.textContent='All amounts and day counts cleared.';fields.aSpend.focus();});
  document.querySelector('#copy').addEventListener('click',async()=>{
    const status=document.querySelector('#copy-status');
    if(results.hidden || !document.querySelector('#record-note').textContent){status.textContent='Compare the current records first.';return;}
    try{await navigator.clipboard.writeText(document.querySelector('#record-note').textContent);status.textContent='Copied.';}
    catch{status.textContent='Copy was unavailable. Select the note text instead.';}
  });

  window.CravePeriodComparison={calculate};
})();

