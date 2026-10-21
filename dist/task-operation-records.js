// Capture task controls before their handlers change the step, label or current task.
// Viewing a timeline, filtering people and other navigation do not create task operations.
(()=>{
 const controls='[data-home-action],[data-action],[data-flow-command],[data-command],[data-order-decision],[data-home-contact-confirm],[data-send-contact],[data-shortcut],[data-business-action],[data-trip-document-generate],[data-festival-create],[data-festival-publish],[data-inquiry-confirm]';
 function taskForControl(control){
  const id=control.dataset.task||control.dataset.homeContactConfirm||control.dataset.inquiryConfirm||control.closest('.task-card[data-id]')?.dataset.id;
  if(id)return tasks.find(task=>task.id===id);
  if(control.hasAttribute('data-order-decision'))return tasks.find(task=>task.id==='order');
  return open?current:null;
 }
 function recordOperation(task,label,content,recordedAt=Date.now()){
  if(!task||!label)return;
  const operation={label,content:content||label,status:task.status||'',stepIndex:task.flow?task.flowIndex:null};
  appendTaskConversation(task.id,{role:'human',speakerId:'driver',kind:'task-operation',recordedAt,operation,text:`点击「${label}」\n${operation.content}`});
 }
 document.addEventListener('click',event=>{
  const control=event.target.closest(controls);
  if(!control||control.matches(':disabled')||control.getAttribute('aria-disabled')==='true'||control.closest('[inert]')||taskHandoffPending)return;
  const task=taskForControl(control);if(!task||task.done)return;
  const recordedAt=Date.now(),label=control.textContent.replace(/↗/g,'').replace(/\s+/g,' ').trim();
  const command=control.dataset.homeAction||control.dataset.action||control.dataset.flowCommand||control.dataset.command||control.dataset.shortcut;
  const step=task.flow?rideStepsFor(task)[task.flowIndex]:null;
  let content=label;
  if(step&&command===step.action)content=step.input(task);
  else if(command==='开始出发')content=`前往${task.serviceStops?.[0]||task.from}`;
  else if(task.id==='prepare'&&command==='去确认')content='确认车况、证照与随车物品';
  else if(control.hasAttribute('data-send-contact'))content=histories.get(task.id)?.[Number(control.dataset.sendContact)]?.extra?.draft||label;
  recordOperation(task,label,content,recordedAt);
 },true);
 document.addEventListener('change',event=>{
  const input=event.target;
  if(!input.matches('[data-prep-confirm]')||input.disabled)return;
  recordOperation(tasks.find(task=>task.id==='prepare'),input.checked?'确认出车事项':'取消出车事项确认',input.checked?'确认车况、证照与随车物品':'取消此前的出车事项确认');
 },true);
 // Capture valid form submissions, including Enter-key submission without a button click.
 document.addEventListener('submit',event=>{
  const form=event.target;
  if(form.id==='preparation-form'&&preparationReady()&&!preparedDays.has(today)&&!taskHandoffPending){
   recordOperation(tasks.find(task=>task.id==='prepare'),'完成出车准备','提交车辆照和出车事项确认');
  }else if(form.id==='business-item-form'&&form.checkValidity()){
   const task=tasks.find(task=>task.id===form.dataset.taskId);
   if(task&&!task.cardPublished)recordOperation(task,`添加${form.dataset.itemType}`,`${form.elements.title.value.trim()} · ¥${form.elements.price.value}`);
  }
 },true);
})();
