const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('dist/app.js', 'utf8');
function declaration(name) {
  const start = source.indexOf(`function ${name}(`);
  assert(start >= 0, name);
  for (let end = source.indexOf('}', start); end >= 0; end = source.indexOf('}', end + 1)) {
    const code = source.slice(start, end + 1);
    try { new vm.Script(code); return code; } catch {}
  }
  throw new Error(`Cannot extract ${name}`);
}
const sandbox = vm.createContext({assert});
vm.runInContext(`
const today='2026-10-14', preparedDays=new Set(), histories=new Map(), tasks=[];
let current=null, voiceContext=null, voiceDraft=null, preparationOpened=0;
const recorded=[];
function renderTasks(){} function refreshReviewSurfaces(){} function toast(){}
function openPreparation(){preparationOpened++}
function completeHomeTask(t){t.done=true;t.status='已完成'}
function completeTask(t){t.done=true;t.status='已完成'}
function add(role,text){recorded.push({role,text})}
${source.slice(source.indexOf('const rideSteps=['), source.indexOf('// Airport and day-charter'))}
${['rideStepsFor','runHomeAction','handleFlow','publishRide','intercomReply','visibleTaskAdvice','homeTaskType','taskPrompt'].map(declaration).join('\n')}
function makeTask(id){const t={id,day:today,name:id,customer:'杨女士',from:'上车点',to:'酒店',time:'14:30',advice:'原始订单信息',done:false};if(id==='day-charter'){t.serviceStops=['贵阳北站南广场','红枫湖','酒店'];t.serviceDepartureTimes=['','19:30']}histories.set(id,[]);return t}
for(const id of ['airport','day-charter']){
 const t=makeTask(id),steps=rideStepsFor(t);
 const actions=id==='airport'?['到达上车点','接到乘客','送达目的地','服务结束']:['到达上车点','接到乘客','送达目的地','开始出发','送达目的地','服务结束'];
 assert.deepEqual(steps.map(s=>s.action),[...actions,'']);
 const trip={...t,from:t.serviceStops?.[0]||t.from};
 assert.equal(steps[0].ai(t),rideSteps[0].ai(trip),'first push preserved');
 assert(visibleTaskAdvice(t).startsWith('14:30，'),'initial order information remains');
 if(id==='day-charter'){
  assert(steps[2].hint(t).includes('红枫湖'));assert(!steps[2].hint(t).includes('酒店'),'first leg has only first destination');
  assert(steps[3].hint(t).includes('19:30前往酒店'),'next departure schedule preserved');
  assert(steps[4].hint(t).includes('从红枫湖前往酒店'));
 }
 preparedDays.clear();runHomeAction(t,'开始出发');assert.equal(t.flow,undefined);assert(preparationOpened>0);
 preparedDays.add(today);runHomeAction(t,'开始出发');assert.equal(t.flowIndex,0);
 for(let i=0;i<actions.length;i++){
  assert(!visibleTaskAdvice(t).startsWith('14:30'),'no repeated order time during fulfillment');
  if(actions[i]!=='服务结束'){runHomeAction(t,'服务结束');assert(!t.done);assert.equal(t.flowIndex,i)}
  runHomeAction(t,actions[i]);assert.equal(t.flowIndex,i+1);assert.equal(t.done,i===actions.length-1);
 }
 const chat=makeTask(id);chat.flow=true;chat.flowIndex=0;
 for(let i=0;i<actions.length;i++){
  if(actions[i]!=='服务结束'){handleFlow('服务结束',chat);assert.equal(chat.flowIndex,i);assert(!chat.done)}
  const input=rideStepsFor(chat)[i].input(chat);handleFlow(input,chat);assert.equal(chat.flowIndex,i+1);assert.equal(chat.done,i===actions.length-1);
 }
 const voice=makeTask(id);voice.flow=true;voice.flowIndex=0;voiceContext=voice;
 for(let i=0;i<actions.length;i++){intercomReply(actions[i]);assert.equal(voice.flowIndex,i+1);assert.equal(voice.done,i===actions.length-1)}
}
const multiple=makeTask('day-charter');multiple.serviceStops=['接驾点','景点一','景点二','酒店'];
assert.deepEqual(rideStepsFor(multiple).map(s=>s.action),['到达上车点','接到乘客','送达目的地','开始出发','送达目的地','开始出发','送达目的地','服务结束','']);

`, sandbox);
console.log('PASS: airport five steps, charter per-stop delivery, next departure time, no premature completion, chat/voice progression, initial push and no repeated time prefix');
