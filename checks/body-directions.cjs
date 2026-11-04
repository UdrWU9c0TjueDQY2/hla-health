const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync(__dirname+'/../src/body-unpacked/anatomical-directional-terms-quiz/quiz.js','utf8');
let runs=0;
for(let mask=0;mask<8;mask++){
 const els={};function el(){return {textContent:'',hidden:false,disabled:false,attrs:{},children:[],listeners:{},classList:{add(){},remove(){}},addEventListener(k,v){this.listeners[k]=v},setAttribute(k,v){this.attrs[k]=v},replaceChildren(){this.children=[]},append(...x){this.children.push(...x)}}}
 const buttons=[el(),el()],dots=[el(),el(),el()];let printed=0;
 const context={document:{getElementById:id=>els[id]??=el(),querySelectorAll:s=>s==='[data-answer]'?buttons:dots,createElement:el},window:{print:()=>printed++}};
 vm.createContext(context);vm.runInContext(code,context);
 let expected=0;
 for(let i=0;i<3;i++){
  const answer=(mask>>i)&1;if(answer===[0,1,1][i])expected++;
  buttons[answer].listeners.click();buttons[1-answer].listeners.click();
  assert.equal(els.feedback.children.length,2);assert.equal(buttons[0].disabled,true);assert.equal(buttons[1].disabled,true);
  els.next.listeners.click();
 }
 assert.equal(els.question.textContent,expected+' of 3 on this round.');assert.equal(els.choices.hidden,true);
 els.restart.listeners.click();assert.equal(els.choices.hidden,false);assert.equal(els.next.disabled,true);assert.equal(buttons[0].disabled,false);
 els.print.listeners.click();assert.equal(printed,1);runs++;
}
const html=fs.readFileSync(__dirname+'/../src/body-unpacked/anatomical-directional-terms-quiz/index.html','utf8');assert.equal((html.match(/<h1>/g)||[]).length,1);
assert.ok(!/[\uFFFD\x00-\x08\x0e-\x1f]/.test(html));assert.ok(!/localStorage|fetch\(/.test(code));
console.log(runs+' answer paths, double-answer guard, reset and print wiring passed.');

