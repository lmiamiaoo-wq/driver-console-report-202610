const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('dist/task-card-voice.js','utf8');
const sessionSource=source.slice(0,source.indexOf('function submitTaskCardVoice'));

test('the local demo progressively recognizes the sample, and only release sends it',()=>{
 const h=setup({demoTask:{id:'charter-confirm',name:'2天包车订单确认'}});
 h.session.start();h.advance(200);
 assert.ok(h.updates.at(-1).text.startsWith('行李'));
 assert.equal(h.sent.length,0);
 h.advance(1200);assert.equal(h.updates.at(-1).text,'行李多大');
 assert.equal(h.sent.length,0);
 h.session.release();h.advance(120);
 assert.deepEqual(h.sent,['行李多大']);
 h.advance(65000);assert.equal(h.sent.length,1);assert.equal(h.timers.size,0);
});

test('sliding up cancels the local demo and no pending recognition can be sent',()=>{
 const h=setup({demoTask:{id:'charter-confirm',name:'2天包车订单确认'}});
 h.session.start();h.advance(650);h.session.setCancel(true);h.session.release();h.advance(65000);
 assert.deepEqual(h.sent,[]);assert.equal(h.updates.at(-1).phase,'cancelled');assert.equal(h.timers.size,0);
});

test('a local demo released before the full preview sends one complete task-bound sample',()=>{
 const h=setup({demoTask:{id:'order',name:'订单改价待确认'}});
 h.session.start();h.advance(400);h.session.release();h.advance(120);
 assert.deepEqual(h.sent,['最低230']);assert.equal(h.timers.size,0);
});

function setup({supported=true,startError=false,stopError=false,demoTask=null}={}){
 let now=100000,nextTimer=0,recognizer;
 const timers=new Map(),sent=[],updates=[];
 const schedule=(callback,delay,interval=0)=>{
  const id=++nextTimer;timers.set(id,{callback,due:now+delay,interval});return id;
 };
 function advance(ms){
  const target=now+ms;
  while(true){
   const next=[...timers].filter(([,timer])=>timer.due<=target).sort((a,b)=>a[1].due-b[1].due||a[0]-b[0])[0];
   if(!next)break;
   const [id,timer]=next;now=timer.due;
   if(timer.interval)timer.due+=timer.interval;else timers.delete(id);
   timer.callback();
  }
  now=target;
 }
 class FakeRecognition {
  constructor(){recognizer=this;this.starts=0;this.stops=0;this.aborts=0;}
  start(){this.starts++;if(startError)throw new Error('start failed');}
  stop(){this.stops++;if(stopError)throw new Error('stop failed');}
  abort(){this.aborts++;}
 }
 const context=vm.createContext({Date:{now:()=>now},
  setTimeout:(fn,ms)=>schedule(fn,ms),clearTimeout:id=>timers.delete(id),
  setInterval:(fn,ms)=>schedule(fn,ms,ms),clearInterval:id=>timers.delete(id)});
 vm.runInContext(sessionSource+'\nglobalThis.Session=TaskCardVoiceSession;globalThis.demoSpeech=taskCardDemoSpeech;',context);
 const session=new context.Session({Speech:demoTask?context.demoSpeech(demoTask):supported?FakeRecognition:null,
  onUpdate:state=>updates.push({...state}),onSend:text=>sent.push(text)});
 function result(...parts){
  return {resultIndex:0,results:parts.map(part=>{
   const value=typeof part==='string'?{text:part,final:true}:part;
   return Object.assign([{transcript:value.text}],{isFinal:value.final});
  })};
 }
 return {session,advance,sent,updates,timers,result,get recognizer(){return recognizer;},
  start(){session.start();recognizer?.onstart?.();},
  speak(...parts){recognizer.onresult(result(...parts));}};
}

test('holding accumulates speech without sending; release waits for the last result and sends exactly once',()=>{
 const h=setup();h.start();h.advance(500);
 h.speak({text:'老人少走',final:false});
 assert.equal(h.sent.length,0);
 h.speak('老人少走路。',{text:'下午多休',final:false});
 assert.equal(h.sent.length,0);
 assert.equal(h.updates.at(-1).text,'老人少走路。下午多休');
 const lateResult=h.recognizer.onresult,lateEnd=h.recognizer.onend;
 h.session.release();
 assert.equal(h.recognizer.stops,1);
 assert.equal(h.updates.at(-1).phase,'finishing');
 assert.equal(h.sent.length,0,'a release must allow the recognizer to deliver its final result');
 h.speak('老人少走路。','下午多休息。');
 assert.equal(h.sent.length,0);
 h.recognizer.onend();
 assert.deepEqual(h.sent,['老人少走路。下午多休息。']);
 assert.equal(h.recognizer.aborts,1);
 lateResult(h.result('迟到的内容'));lateEnd();h.session.release();h.advance(65000);
 assert.deepEqual(h.sent,['老人少走路。下午多休息。']);
 assert.equal(h.timers.size,0);
});

test('a recognition end while held never sends until release',()=>{
 const h=setup();h.start();h.advance(800);h.speak('请确认行李数量');
 h.recognizer.onend();
 assert.equal(h.sent.length,0);
 h.session.release();
 assert.deepEqual(h.sent,['请确认行李数量']);
 assert.equal(h.recognizer.stops,0,'an already ended recognizer needs no second stop');
});

test('sliding into cancel and releasing discards speech and late callbacks',()=>{
 const h=setup();h.start();h.advance(500);h.speak('不要发送这句话');
 const lateResult=h.recognizer.onresult,lateEnd=h.recognizer.onend;
 h.session.setCancel(true);
 assert.equal(h.updates.at(-1).cancelled,true);
 h.session.release();
 assert.equal(h.updates.at(-1).phase,'cancelled');
 assert.equal(h.updates.at(-1).text,'');
 lateResult(h.result('仍然不要发送'));lateEnd();h.advance(65000);
 assert.deepEqual(h.sent,[]);assert.equal(h.recognizer.stops,0);assert.equal(h.recognizer.aborts,1);
 assert.equal(h.timers.size,0);
});

test('moving back from the cancel area restores normal release',()=>{
 const h=setup();h.start();h.advance(500);h.speak('请保留这句话');
 h.session.setCancel(true);h.session.setCancel(false);h.session.release();h.recognizer.onend();
 assert.deepEqual(h.sent,['请保留这句话']);
});

test('explicit cancel during final recognition prevents late result and timeout submission',()=>{
 const h=setup();h.start();h.advance(500);h.speak('暂不发送');
 const lateResult=h.recognizer.onresult,lateEnd=h.recognizer.onend;
 h.session.release();h.session.cancel();
 lateResult(h.result('识别完成'));lateEnd();h.advance(65000);
 assert.deepEqual(h.sent,[]);assert.equal(h.timers.size,0);
 assert.equal(h.updates.at(-1).phase,'cancelled');
});

test('release before microphone startup cancels even if permission resolves later',()=>{
 const h=setup();h.session.start();
 const lateStart=h.recognizer.onstart,lateResult=h.recognizer.onresult,lateEnd=h.recognizer.onend;
 h.advance(1000);h.session.release();
 lateStart();lateResult(h.result('权限现在才通过'));lateEnd();h.advance(65000);
 assert.deepEqual(h.sent,[]);assert.equal(h.session.ready,false);
 assert.equal(h.updates.at(-1).phase,'cancelled');assert.equal(h.timers.size,0);
});

test('very short holds cannot submit accidental speech',()=>{
 const h=setup();h.start();h.advance(200);h.speak('误触');h.session.release();
 assert.deepEqual(h.sent,[]);assert.equal(h.updates.at(-1).phase,'cancelled');
 assert.equal(h.recognizer.stops,0);
});

test('unsupported recognition and denied permissions never submit',async t=>{
 await t.test('unsupported',()=>{
  const h=setup({supported:false});h.session.start();h.session.release();h.advance(65000);
  assert.deepEqual(h.sent,[]);assert.equal(h.updates.at(-1).phase,'error');
  assert.match(h.updates.at(-1).message,/不支持/);assert.equal(h.timers.size,0);
 });
 for(const error of ['not-allowed','service-not-allowed'])await t.test(error,()=>{
  const h=setup();h.session.start();const lateResult=h.recognizer.onresult,lateEnd=h.recognizer.onend;
  h.recognizer.onerror({error});lateResult(h.result('不应发送'));lateEnd();h.session.release();h.advance(65000);
  assert.deepEqual(h.sent,[]);assert.equal(h.updates.at(-1).phase,'error');
  assert.match(h.updates.at(-1).message,/权限/);assert.equal(h.timers.size,0);
 });
});

test('no-speech errors, empty recognition and start failures preserve a clean session',async t=>{
 await t.test('no-speech error',()=>{
  const h=setup();h.start();h.recognizer.onerror({error:'no-speech'});h.session.release();h.advance(65000);
  assert.deepEqual(h.sent,[]);assert.equal(h.updates.at(-1).phase,'error');assert.equal(h.timers.size,0);
 });
 await t.test('empty final result',()=>{
  const h=setup();h.start();h.advance(500);h.speak('   ');h.session.release();h.recognizer.onend();
  assert.deepEqual(h.sent,[]);assert.equal(h.updates.at(-1).phase,'error');assert.equal(h.timers.size,0);
 });
 await t.test('start throws',()=>{
  const h=setup({startError:true});h.session.start();h.session.release();h.advance(65000);
  assert.deepEqual(h.sent,[]);assert.equal(h.updates.at(-1).phase,'error');assert.equal(h.timers.size,0);
 });
 await t.test('stop throws',()=>{
  const h=setup({stopError:true});h.start();h.advance(500);h.speak('不能提交');h.session.release();h.advance(65000);
  assert.deepEqual(h.sent,[]);assert.equal(h.updates.at(-1).phase,'error');assert.equal(h.timers.size,0);
 });
});

test('a missing recognition end has a bounded finishing wait and cannot duplicate the send',()=>{
 const h=setup();h.start();h.advance(500);h.speak('确认路线');
 const lateEnd=h.recognizer.onend;
 h.session.release();h.advance(1999);assert.deepEqual(h.sent,[]);
 h.advance(1);assert.deepEqual(h.sent,['确认路线']);
 lateEnd();h.advance(65000);assert.deepEqual(h.sent,['确认路线']);assert.equal(h.timers.size,0);
});

test('the recording duration limit discards unsent speech and late results',()=>{
 const h=setup();h.start();h.speak('长录音尚未提交');
 const lateResult=h.recognizer.onresult,lateEnd=h.recognizer.onend;
 h.advance(60000);lateResult(h.result('最终内容'));lateEnd();h.session.release();
 assert.deepEqual(h.sent,[]);assert.equal(h.updates.at(-1).phase,'error');
 assert.match(h.updates.at(-1).message,/60 秒/);assert.equal(h.timers.size,0);
});

function integrationSetup(){
 const app=fs.readFileSync('dist/app.js','utf8');
 const context=vm.createContext({setTimeout:()=>1,clearTimeout:()=>{}});
 vm.runInContext(`
  Date.now=()=>123456789;
  const tasks=['charter-confirm','lost-hat','order'].map(id=>({id,status:'待处理',done:false}));
  const histories=new Map(tasks.map(task=>[task.id,[]]));
  let taskHandoffPending=false,renderCount=0;
  function handoffCompletedTask(task,commit){commit();}
  function renderTasks(){renderCount++;}
  function refreshReviewSurfaces(){}
  function toast(){}
  function showTask(){throw new Error('voice must not open the chat');}
  function openIntercom(){throw new Error('voice must not open intercom');}
 `,context);
 vm.runInContext(app.slice(app.indexOf('const taskConversationUpdateQueue='),app.indexOf('function recordPreparationPhoto')),context);
 vm.runInContext(app.slice(app.indexOf('function completeHomeTask('),app.indexOf('function showPreparationCard(')),context);
 vm.runInContext(source.slice(source.indexOf('function submitTaskCardVoice'),source.indexOf('\n(()=>{')),context);
 return code=>vm.runInContext(code,context);
}

test('sending luggage voice records it once and completes only the current task',()=>{
 const run=integrationSetup();
 run("submitTaskCardVoice(tasks[0],'  行李多大  ')");
 assert.equal(run('tasks[0].done'),true);assert.equal(run('tasks[0].status'),'已完成');
 assert.ok(run('tasks[0].completedAt'));assert.equal(run('renderCount'),1);
 const messages=JSON.parse(run("JSON.stringify(histories.get('charter-confirm'))"));
 assert.deepEqual(messages.map(message=>message.role),['user','ai']);
 assert.equal(messages[0].kind,'voice-reply');assert.equal(messages[0].text,'行李多大');
 assert.equal(messages[1].text,'已收到语音回复，任务已完成。');
 assert.ok(messages.every(message=>message.conversationTaskId==='charter-confirm'&&message.recordedAt===123456789));
 assert.ok(messages[0].deliverySequence<messages[1].deliverySequence);
 assert.equal(run('tasks[1].done'),false);assert.equal(run('tasks[2].done'),false);
 run("submitTaskCardVoice(tasks[0],'行李多大')");
 assert.equal(run("histories.get('charter-confirm').length"),2);assert.equal(run('renderCount'),1);
});

test('empty input and a task transition cannot complete or append another task',()=>{
 const run=integrationSetup();
 run("submitTaskCardVoice(tasks[0],' ');taskHandoffPending=true;submitTaskCardVoice(tasks[1],'帽子在车上');");
 assert.equal(run('tasks.some(task=>task.done)'),false);
 assert.equal(run('[...histories.values()].flat().length'),0);assert.equal(run('renderCount'),0);
});

test('only the remaining task cards reserve and render a voice control',()=>{
 const app=fs.readFileSync('dist/app.js','utf8');
 const context=vm.createContext({});
 vm.runInContext(`
  const esc=String,homeTaskType=()=> 'communication',taskActions=()=>[],businessCardSteps=()=>'';
  const preparation={confirmed:false},preparedDays=new Set();
  const formatTaskAdvice=String,formatTripPlanAdvice=String,visibleTaskAdvice=()=>'';
 `,context);
 vm.runInContext(app.slice(app.indexOf('function homeCard('),app.indexOf('// One continuous wheel')),context);
 for(const id of ['business-card','prepare','trip-plan','airport','day-charter','charter-confirm','lost-hat','order']){
  const html=vm.runInContext(`homeCard({id:${JSON.stringify(id)},name:'任务',icon:'car'})`,context);
  const hasVoice=['charter-confirm','lost-hat','order'].includes(id);
  assert.equal(html.includes('data-task-voice='),hasVoice,id);
  assert.equal(html.includes('class="home-card-scroll"'),hasVoice,id+' reserved footer');
 }
});
