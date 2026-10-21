// Conversation records are deliveries, never inferred itinerary or future workflow events.
// The prototype keeps them in memory, matching the task chat's existing lifetime.
(()=>{
 const issuedAdvice=new Map(),timelineMessages=new Map(),messageIds=new WeakMap();
 let nextId=0;
 const driverName=()=>typeof profileInfo!=='undefined'&&profileInfo.name?profileInfo.name:'我';
 const taskFor=id=>tasks.find(task=>task.id===id);
 const linkedId=value=>typeof value==='string'?value:value?.id;
 const normalizeText=value=>String(value??'').trim();
 const messageTime=message=>Number.isFinite(message.recordedAt)?message.recordedAt:Number.isFinite(message.sentAt)?message.sentAt:null;
 function idFor(message,taskId){
  if(!messageIds.has(message))messageIds.set(message,`conversation-${taskId}-${++nextId}`);
  return messageIds.get(message);
 }
 function speakerFor(message,task){
  if(message.role==='ai'||message.role==='assistant')return {role:'ai',speakerId:'ai',speakerName:'司导 AI'};
  if(!['user','human','customer','passenger'].includes(message.role))return null;
  const explicitCustomer=['customer','passenger'].includes(message.role)||message.speakerId?.startsWith('customer:');
  if(explicitCustomer){
   const name=message.speakerName||message.customerName||task.customer||'游客';
   return {role:'human',speakerId:message.speakerId||`customer:${name}`,speakerName:name};
  }
  return {role:'human',speakerId:message.speakerId||'driver',speakerName:message.speakerName||driverName()};
 }
 function recordFor(message,task){
  if(!message||message.pendingReply)return null;
  const speaker=speakerFor(message,task);if(!speaker)return null;
  let text=normalizeText(message.streaming?message.visibleText:message.text);
  const draft=!message.streaming&&message.kind==='contact'?normalizeText(message.extra?.draft):'';
  if(draft)text=[text,'沟通草稿：'+draft].filter(Boolean).join('\n\n');
  // Do not expose attachments or complete reply text before a streamed message arrives.
  const attachment=!message.streaming?(message.attachment||(
   message.kind==='business-avatar'&&typeof message.extra==='string'?{src:message.extra,label:'个人头像'}:null
  )):null;
  if(!text&&!attachment)return null;
  const record={id:idFor(message,task.id),taskId:task.id,taskName:task.name,...speaker,text,kind:message.kind||'',recordedAt:messageTime(message),sequence:message.deliverySequence||0};
  if(attachment?.src)record.attachment={src:attachment.src,label:attachment.label||'图片'};
  if(message.purpose)record.purpose=message.purpose;
  if(message.operation)record.operation={...message.operation};
  if(message.streaming)record.streaming=true;
  return record;
 }
 function selectedTasks(taskIds){
  const ids=new Set(typeof taskIds==='string'?[taskIds]:Array.from(taskIds||[]));
  // Include chats explicitly bound to a task; names or matching customer text are not a link.
  let added=true;
  while(added){
   added=false;
   tasks.forEach(task=>{if(!ids.has(task.id)&&(ids.has(linkedId(task.contextTaskId))||ids.has(linkedId(task.inquiryTrip)))){ids.add(task.id);added=true}});
  }
  return tasks.filter(task=>ids.has(task.id));
 }
 window.recordVisibleTaskConversation=task=>{
  if(!task||task.chatOnly||task.done||issuedAdvice.has(task.id))return;
  // A pre-existing conversation is evidence in its own right; do not reconstruct an earlier reminder.
  if((histories.get(task.id)||[]).some(message=>recordFor(message,task)))return;
  const text=normalizeText(visibleTaskAdvice(task));if(!text)return;
  const advice={role:'ai',text,conversationTaskId:task.id,kind:'visible-task-advice'};
  markTaskMessageDelivered(advice);issuedAdvice.set(task.id,advice);
  notifyTaskConversation(task.id);
 };
 window.getTaskConversationRecords=taskIds=>{
  const records=[];
  selectedTasks(taskIds).forEach(task=>{
   const messages=histories.get(task.id)||[];
   const delivered=messages.map(message=>({message,record:recordFor(message,task)})).filter(item=>item.record);
   const advice=issuedAdvice.get(task.id);
   // Keep the original task delivery and its timestamp, even when chat repeats it.
   if(advice)records.push(recordFor(advice,task));
   delivered.forEach(({message,record})=>{
    if(advice&&message.kind==='task-intro'&&normalizeText(record.text)===normalizeText(advice.text))return;
    records.push(record);
   });
   (timelineMessages.get(task.id)||[]).forEach(message=>{const record=recordFor(message,task);if(record)records.push(record)});
  });
  // Legacy undated records stay in their stored order and explicitly retain recordedAt:null.
  return records.filter(Boolean).map((record,index)=>({record,index})).sort((a,b)=>{
   if(a.record.recordedAt===null&&b.record.recordedAt===null)return a.index-b.index;
   if(a.record.recordedAt===null)return -1;
   if(b.record.recordedAt===null)return 1;
   return a.record.recordedAt-b.record.recordedAt||a.record.sequence-b.record.sequence||a.index-b.index;
  }).map(item=>item.record);
 };
 window.appendTaskConversation=(taskId,details)=>{
  const task=taskFor(taskId);if(!task||!details||!['ai','human'].includes(details.role))return null;
  const text=normalizeText(details.text);if(!text&&!details.attachment?.src)return null;
  const message={role:details.role,text,conversationTaskId:taskId,recordedAt:Number.isFinite(details.recordedAt)?details.recordedAt:Date.now(),speakerId:details.speakerId,speakerName:details.speakerName,kind:details.kind||''};
  if(details.operation)message.operation={...details.operation};
  markTaskMessageDelivered(message);
  if(details.attachment?.src)message.attachment={src:details.attachment.src,label:details.attachment.label||'图片'};
  if(details.purpose)message.purpose=details.purpose;
  if(!timelineMessages.has(taskId))timelineMessages.set(taskId,[]);
  timelineMessages.get(taskId).push(message);
  notifyTaskConversation(taskId);
  return recordFor(message,task);
 };
 // Capture only the card presented now; other cards are recorded when brought into view.
 if(activeTab==='home'&&!open&&!$('#utility').open)window.recordVisibleTaskConversation(visibleTask());
})();
