(() => {
  const form = document.querySelector('#compare-form');
  const error = document.querySelector('#error');
  const results = document.querySelector('#results');
  const fields = {
    aSpend: document.querySelector('#a-spend'), aDays: document.querySelector('#a-days'),
    bSpend: document.querySelector('#b-spend'), bDays: document.querySelector('#b-days')
  };
  const money = value => new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
  const number = (value, digits=2) => new Intl.NumberFormat(undefined,{maximumFractionDigits:digits}).format(value);

  function calculate(values){
    const {aSpend,aDays,bSpend,bDays}=values;
    if(![aSpend,aDays,bSpend,bDays].every(Number.isFinite)) throw new Error('Enter a number in all four fields.');
    if(aSpend<0 || bSpend<0) throw new Error('Spending totals cannot be negative.');
    if(aDays<1 || bDays<1 || !Number.isInteger(aDays) || !Number.isInteger(bDays)) throw new Error('Days must be whole numbers of at least 1.');
    const aDaily=aSpend/aDays, bDaily=bSpend/bDays, difference=bDaily-aDaily;
    return {aSpend,aDays,bSpend,bDays,aDaily,bDaily,difference};
  }

  function render(result){
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
    try{render(calculate({aSpend:Number(fields.aSpend.value),aDays:Number(fields.aDays.value),bSpend:Number(fields.bSpend.value),bDays:Number(fields.bDays.value)}));}
    catch(err){results.hidden=true;error.textContent=err.message;error.hidden=false;}
  });
  document.querySelector('#clear').addEventListener('click',()=>{Object.values(fields).forEach(field=>field.value='');results.hidden=true;error.hidden=true;fields.aSpend.focus();});
  document.querySelector('#copy').addEventListener('click',async()=>{
    const status=document.querySelector('#copy-status');
    try{await navigator.clipboard.writeText(document.querySelector('#record-note').textContent);status.textContent='Copied.';}
    catch{status.textContent='Copy was unavailable. Select the note text instead.';}
  });

  window.CravePeriodComparison={calculate};
})();
