// A hold is one transaction: only release can commit, and abort invalidates late results.
class TaskCardVoiceSession {
 constructor({Speech,onUpdate,onSend}) {
  this.Speech=Speech;this.onUpdate=onUpdate;this.onSend=onSend;
  this.active=true;this.held=true;this.ready=false;this.ended=false;
  this.text='';this.cancelled=false;this.startedAt=Date.now();this.phase='connecting';
 }
 update(message='') { this.onUpdate({phase:this.phase,text:this.text,cancelled:this.cancelled,seconds:Math.floor((Date.now()-this.startedAt)/1000),message}); }
 start() {
  if(!this.Speech){this.fail('当前浏览器不支持语音识别，可以在这里输入文字。');return;}
  try {
   const r=this.recognizer=new this.Speech();r.lang='zh-CN';r.continuous=true;r.interimResults=true;
   r.onstart=()=>{if(!this.active)return;this.ready=true;this.phase='listening';this.update();};
   r.onresult=e=>{if(!this.active)return;this.text=Array.from(e.results,result=>result[0].transcript).join('').trim();this.update();};
   r.onerror=e=>{if(!this.active)return;this.fail(e.error==='not-allowed'||e.error==='service-not-allowed'?'未获得麦克风权限，可以重试或输入文字。':e.error==='no-speech'?'没有听清，请重新按住说话或输入文字。':'语音识别暂不可用，可以重试或输入文字。');};
   r.onend=()=>{if(!this.active)return;this.ended=true;if(!this.held)this.commit();else this.update();};
   this.update();r.start();
   if(this.active){this.ticker=setInterval(()=>this.update(),1000);this.limit=setTimeout(()=>this.fail('录音已超过 60 秒，请分段输入。'),60000);}
  } catch {this.fail('麦克风暂不可用，可以重试或输入文字。');}
 }
 setCancel(value) { if(!this.active||!this.held)return;this.cancelled=value;this.update(); }
 release() {
  if(!this.active||!this.held)return;
  if(this.cancelled){this.cancel();return;}
  if(!this.ready){this.cancel('录音尚未开始，请重新按住说话。');return;}
  if(Date.now()-this.startedAt<350){this.cancel('说话时间太短，请重新按住说话。');return;}
  this.held=false;this.phase='finishing';this.update();
  if(this.ended){this.commit();return;}
  this.finishTimer=setTimeout(()=>this.commit(),2000);
  try{this.recognizer.stop();}catch{this.fail('语音识别中断，请重试或输入文字。');}
 }
 dispose() {
  this.active=false;clearInterval(this.ticker);clearTimeout(this.limit);clearTimeout(this.finishTimer);
  const r=this.recognizer;if(r){r.onstart=r.onresult=r.onerror=r.onend=null;try{r.abort();}catch{}}
 }
 cancel(message='已取消，不会发送') { if(!this.active)return;this.dispose();this.text='';this.phase='cancelled';this.update(message); }
 fail(message) { if(!this.active)return;this.dispose();this.phase='error';this.update(message); }
 commit() {
  if(!this.active||this.held)return;
  if(!this.text){this.fail('没有听清，请重新按住说话或输入文字。');return;}
  const text=this.text;this.dispose();this.onSend(text);
 }
}

// Local demo adapter: no microphone permission or speech service is needed.
// It follows the same result/stop/abort lifecycle as speech recognition.
function taskCardDemoSpeech(task) {
 const sample=task.id==='charter-confirm'?'行李多大':task.id==='lost-hat'?'帽子在车上，我一会给乘客送过去':task.id==='order'?'最低230':`已确认${task.name}的安排。`;
 return class {
  constructor(){this.timers=[];this.active=false;}
  schedule(callback,delay){this.timers.push(setTimeout(()=>{if(this.active)callback();},delay));}
  result(text,final=false){const result=Object.assign([{transcript:text}],{isFinal:final});this.onresult?.({resultIndex:0,results:[result]});}
  start(){
   this.active=true;this.onstart?.();
   [0.35,0.7,1].forEach((fraction,index)=>this.schedule(()=>this.result(sample.slice(0,Math.ceil(sample.length*fraction)),fraction===1),150+index*500));
  }
  stop(){
   if(!this.active)return;this.timers.forEach(clearTimeout);this.timers=[];
   this.schedule(()=>{this.result(sample,true);this.active=false;this.onend?.();},120);
  }
  abort(){this.active=false;this.timers.forEach(clearTimeout);this.timers=[];}
 };
}

function submitTaskCardVoice(task,text) {
 text=text.trim();if(!text||!task||task.done||taskHandoffPending)return;
 appendTaskHistory(task.id,{role:'user',text,kind:'voice-reply'});
 completeHomeTask(task,'已收到语音回复，任务已完成。');
}

(()=>{
 let gesture=null,session=null,panel=null,panelTask=null,feedbackTimer=null;
 function dismiss() {
  clearTimeout(feedbackTimer);
  if(session?.active)session.cancel();session=null;
  if(gesture){clearTimeout(gesture.timer);gesture=null;}
  document.querySelectorAll('.task-voice-reply.is-listening,.task-voice-reply.is-cancelling').forEach(button=>button.classList.remove('is-listening','is-cancelling'));
  panel?.remove();panel=null;panelTask=null;
 }
 function showPanel(task,button) {
  panel?.remove();panelTask=task;
  panel=document.createElement('section');panel.className='task-card-voice-panel';
  panel.setAttribute('aria-label','当前任务语音输入');
  panel.innerHTML='<div class="task-card-voice-heading"><strong data-card-voice-status role="status"></strong><button type="button" data-card-voice-cancel>取消</button></div><div class="task-card-voice-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><p class="task-card-voice-transcript" data-card-voice-transcript></p><p class="task-card-voice-hint" data-card-voice-hint></p><form data-card-voice-form hidden><textarea rows="2" aria-label="输入当前任务的回复" placeholder="输入当前任务的回复…"></textarea><button type="submit">发送</button></form>';
  button.closest('.home-card-stack').append(panel);
 }
 function display(state) {
  if(!panel?.isConnected)return;
  const button=panel.parentElement.querySelector('[data-task-voice]');
  const live=['connecting','listening','finishing'].includes(state.phase);
  const status=state.message||(state.cancelled?'松开取消':state.phase==='connecting'?'准备输入…':state.phase==='finishing'?'正在发送…':`正在识别 · ${String(state.seconds).padStart(2,'0')} 秒`);
  panel.querySelector('[data-card-voice-status]').textContent=status;
  panel.querySelector('[data-card-voice-transcript]').textContent=state.text||'';
  panel.querySelector('[data-card-voice-hint]').textContent=live?(state.cancelled?'移回按钮继续说话':state.phase==='finishing'?'仍可点击取消':'松开发送，上滑取消'):'';
  panel.classList.toggle('is-listening',live);panel.classList.toggle('is-cancelling',!!state.cancelled);
  panel.querySelector('[data-card-voice-form]').hidden=state.phase!=='error';
  button?.classList.toggle('is-listening',live);button?.classList.toggle('is-cancelling',live&&!!state.cancelled);
  if(state.phase==='cancelled')feedbackTimer=setTimeout(dismiss,1800);
 }
 function send(task,text) {
  // Never submit a result after its card/page has gone away.
  if(!panel?.isConnected||activeTab!=='home'||open||$('#utility').open){dismiss();return;}
  dismiss();
  submitTaskCardVoice(task,text);
 }
 function begin(button,pointerId,startY) {
  if(session?.active||gesture)return;
  const task=tasks.find(t=>t.id===button.dataset.taskVoice);if(!task)return;
  dismiss();
  gesture={button,task,pointerId,startY,started:false};
  gesture.timer=setTimeout(()=>{
   if(!gesture||!button.isConnected)return;
   gesture.started=true;stopTaskNarration();recognition?.abort();
   showPanel(task,button);
   session=new TaskCardVoiceSession({Speech:taskCardDemoSpeech(task),onUpdate:display,onSend:text=>send(task,text)});
   session.start();
  },250);
 }
 function release(cancel=false) {
  if(!gesture)return;
  const held=gesture;gesture=null;clearTimeout(held.timer);
  if(held.started){if(cancel)session?.cancel();else session?.release();}
 }
 document.addEventListener('pointerdown',e=>{
  const button=e.target.closest('[data-task-voice]');if(!button||e.button!==0||e.isPrimary===false)return;
  e.preventDefault();begin(button,e.pointerId,e.clientY);
  try{button.setPointerCapture(e.pointerId);}catch{}
 });
 document.addEventListener('pointermove',e=>{
  if(!gesture||gesture.pointerId!==e.pointerId)return;
  const {button,startY}=gesture,rect=button.getBoundingClientRect();
  const cancel= startY-e.clientY>60||e.clientX<rect.left-60||e.clientX>rect.right+60||e.clientY>rect.bottom+60;
  if(gesture.started)session?.setCancel(cancel);
  else if(cancel){release(true);}
 });
 document.addEventListener('pointerup',e=>{if(gesture?.pointerId===e.pointerId)release();});
 document.addEventListener('pointercancel',e=>{if(gesture?.pointerId===e.pointerId)release(true);});
 document.addEventListener('lostpointercapture',e=>{if(gesture?.pointerId===e.pointerId)release(true);});
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&panel){e.preventDefault();if(session?.active){session.cancel();release(true);}else dismiss();return;}
  const button=e.target.closest('[data-task-voice]');if(!button||![' ','Enter'].includes(e.key))return;
  e.preventDefault();if(!e.repeat)begin(button,'keyboard',0);
 });
 document.addEventListener('keyup',e=>{if(gesture?.pointerId==='keyboard'&&[' ','Enter'].includes(e.key)){e.preventDefault();release();}});
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-task-voice]');
  if(button){e.preventDefault();return;}
  if(e.target.closest('[data-card-voice-cancel]')){if(session?.active){session.cancel();release(true);}else dismiss();return;}
  if(panel&&!e.target.closest('.task-card-voice-panel'))dismiss();
 });
 document.addEventListener('submit',e=>{
  if(!e.target.matches('[data-card-voice-form]'))return;e.preventDefault();
  const text=e.target.querySelector('textarea').value.trim();if(text)send(panelTask,text);
 });
 document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-task-voice],.task-card-voice-panel'))e.preventDefault();});
 $('#task-list').addEventListener('scroll',()=>{if(panel||gesture)dismiss();},{passive:true});
 new MutationObserver(()=>{if((panel&&!panel.isConnected)||(gesture&&!gesture.button.isConnected)||activeTab!=='home'||open||$('#utility').open||$('#history-drawer').open)dismiss();}).observe($('#app'),{childList:true,subtree:true,attributes:true,attributeFilter:['open','class']});
 window.addEventListener('pagehide',dismiss);
 window.addEventListener('blur',()=>{if(session?.active||gesture)dismiss();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)dismiss();});
})();
