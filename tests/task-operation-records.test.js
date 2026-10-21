const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('dist/app.js','utf8');
function setup(){
 const context=vm.createContext({console,setTimeout:()=>1,clearTimeout:()=>{}});
 vm.runInContext(`
  var window=globalThis,clock=100000,listeners={};Date.now=()=>clock;
  var document={addEventListener:(type,fn)=>listeners[type]=fn};
  var profileInfo={name:'杨通海'},activeTab='ai',open=false,current=null,taskHandoffPending=false;
  var today='2026-10-19',preparedDays=new Set([today]),preparation={confirmed:false};
  var renderTasks=()=>{},refreshReviewSurfaces=()=>{},toast=()=>{},handoffCompletedTask=(task,commit)=>commit();
  var preparationReady=()=>true,rideCalls=[];
 `,context);
 vm.runInContext(app.slice(app.indexOf('const tasks=['),app.indexOf('let current=')),context);
 vm.runInContext('tasks.forEach(t=>t.day=today);const histories=new Map(tasks.map(t=>[t.id,[]]));',context);
 vm.runInContext(app.slice(app.indexOf('const taskConversationUpdateQueue='),app.indexOf('function recordPreparationPhoto')),context);
 vm.runInContext(app.slice(app.indexOf('const rideSteps=['),app.indexOf('function flowActions')),context);
 vm.runInContext(app.slice(app.indexOf('function completeHomeTask('),app.indexOf('function showPreparationCard(')),context);
 vm.runInContext(app.slice(app.indexOf('function runHomeAction('),app.indexOf('function orderDetailIcon(')),context);
 vm.runInContext(fs.readFileSync('dist/task-conversation-records.js','utf8'),context);
 vm.runInContext(fs.readFileSync('dist/task-operation-records.js','utf8'),context);
 vm.runInContext(`
  function click(taskId,label,{disabled=false,inert=false,unrelated=false}={}){
   const task=tasks.find(t=>t.id===taskId);
   const control={dataset:{task:taskId,homeAction:label},textContent:label,
    matches:()=>disabled,getAttribute:()=>null,hasAttribute:()=>false,
    closest:selector=>selector==='[inert]'?(inert?{}:null):null};
   listeners.click({target:{closest:()=>unrelated?null:control}});
   if(!disabled&&!inert&&!unrelated&&!task.done)runHomeAction(task,label);
  }
  function records(id){return JSON.parse(JSON.stringify(getTaskConversationRecords([id])));}
 `,context);
 return {run:code=>vm.runInContext(code,context)};
}
test('every real charter step has its click time and immutable route content, including completion',()=>{
 const {run}=setup();
 const actions=['开始出发','到达上车点','接到乘客','送达目的地','开始出发','送达目的地','服务结束'];
 actions.forEach((action,index)=>run(`clock=${100000+index*1000};click('day-charter',${JSON.stringify(action)});`));
 const records=run("records('day-charter')"),operations=records.filter(r=>r.kind==='task-operation');
 assert.deepEqual(Array.from(operations,r=>r.operation.label),actions);
 assert.deepEqual(Array.from(operations,r=>r.recordedAt),actions.map((_,i)=>100000+i*1000));
 assert.match(operations[3].operation.content,/红枫湖上侗下寨停车场/);
 assert.match(operations[5].operation.content,/阿云朵仓珍珀酒店/);
 assert.equal(run("tasks.find(t=>t.id==='day-charter').done"),true);
 for(const operation of operations){
  const sameTime=records.filter(r=>r.recordedAt===operation.recordedAt);
  assert.equal(sameTime[0].kind,'task-operation','a click must precede its synchronous AI result');
  assert.equal(operation.speakerId,'driver');
 }
 assert.equal(operations.at(-1).operation.label,'服务结束');
});
test('disabled, inert, unrelated and completed-task controls produce no operations',()=>{
 const {run}=setup();
 run("click('day-charter','开始出发',{disabled:true});click('day-charter','开始出发',{inert:true});click('day-charter','开始出发',{unrelated:true});tasks.find(t=>t.id==='day-charter').done=true;click('day-charter','开始出发');");
 assert.equal(run("records('day-charter').length"),0);
});
test('business card timeline starts with one AI task delivery and retains its original time',()=>{
 const {run}=setup();
 run("var visibleTaskAdvice=task=>task.advice;var business=tasks.find(t=>t.id==='business-card');recordVisibleTaskConversation(business);");
 const [initial]=run("records('business-card')");
 assert.equal(initial.kind,'visible-task-advice');assert.equal(initial.role,'ai');assert.equal(initial.recordedAt,100000);
 run("clock+=1000;recordVisibleTaskConversation(business);appendTaskHistory(business.id,{role:'ai',text:business.advice,kind:'task-intro'},{role:'user',text:'我是退伍军人'});");
 const records=run("records('business-card')");
 assert.equal(records.length,2);assert.equal(records[0].id,initial.id);assert.equal(records[0].recordedAt,100000);
 assert.equal(records[1].role,'human');assert.equal(records[1].recordedAt,101000);
});
test('contextual chat actions keep visible labels and exact timestamps before later task changes',()=>{
 const {run}=setup();
 run(`open=true;current=tasks.find(t=>t.id==='airport');current.flow=true;current.flowIndex=1;
  var control={dataset:{flowCommand:'接到乘客'},textContent:'接到乘客',matches:()=>false,getAttribute:()=>null,hasAttribute:()=>false,closest:()=>null};
  listeners.click({target:{closest:()=>control}});current.flowIndex=3;current.status='送达目的地';clock+=5000;`);
 const [record]=run("records('airport')");
 assert.equal(record.recordedAt,100000);
 assert.equal(record.operation.stepIndex,1);
 assert.match(record.operation.content,/人数和行李已核对/);
 assert.equal(record.operation.label,'接到乘客');
});
