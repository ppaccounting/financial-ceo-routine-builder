'use strict';
const KEY='ppa-financial-ceo-vip-v1';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const uid=()=>crypto.randomUUID?.()??('id-'+Date.now()+'-'+Math.random());

const GHL_FORM_ID='j5PEa8Wjj5wW6DcaZGDC';
const GHL_REG_KEY='ppa-ghl-registration-j5PEa8Wjj5wW6DcaZGDC';
let ghlRegistrationConfirmed=localStorage.getItem(GHL_REG_KEY)==='yes';
window.addEventListener('message',event=>{
 const frame=document.querySelector('iframe[src*="/widget/form/'+GHL_FORM_ID+'"]');
 if(!frame||event.source!==frame.contentWindow)return;
 const host=(()=>{try{return new URL(event.origin).hostname}catch{return ''}})();
 if(!['link.profitablepenny.com','api.leadconnectorhq.com','link.msgsndr.com','services.leadconnectorhq.com'].includes(host)&&!host.endsWith('.leadconnectorhq.com')&&!host.endsWith('.msgsndr.com'))return;
 let d=event.data;
 if(typeof d==='string'){try{d=JSON.parse(d)}catch{return}}
 let valid=false;
 if(Array.isArray(d)){
  valid=d[0]==='ghl-form-submit';
  if(!valid&&typeof d[2]==='string'){try{const p=JSON.parse(d[2]);valid=Boolean(p.email&&p.customer_id&&p.full_name)}catch{}}
 }else if(d&&typeof d==='object'){
  valid=['ghl_form_submit','form-submitted','form_submit','ghl-form-submit'].includes(d.type||d.message||d.event);
  const reported=d.formId||d.form_id;
  if(reported&&reported!==GHL_FORM_ID)valid=false;
 }
 if(!valid)return;
 ghlRegistrationConfirmed=true;
 localStorage.setItem(GHL_REG_KEY,'yes');
 onGhlRegistrationConfirmed();
});

let saved=[];let currentUser=null;let authReady=false;let vipEntryScreen=ghlRegistrationConfirmed?'account':'registration';
let draft=null,screen='home',step=0;
const sections=[['Review',5,'See what needs your attention'],['Approve',10,'Check the items only you can confirm'],['Understand',10,'Look beyond your bank balance'],['Act',5,'Make one decision and follow through']];
function draftKey(){return KEY+'-draft-'+(currentUser?.uid||'guest')}
function saveDraft(){if(draft&&currentUser&&!draft.doneAt){try{localStorage.setItem(draftKey(),JSON.stringify({draft,step}))}catch{}}}
function loadDraft(){try{const item=JSON.parse(localStorage.getItem(draftKey())||'null');return item?.draft&&!item.draft.doneAt?item:null}catch{return null}}
function clearDraft(){try{localStorage.removeItem(draftKey())}catch{}}

const today=()=>new Date().toLocaleDateString('en-CA');
function newDraft(){const previous=saved[0];return {id:uid(),date:today(),createdAt:new Date().toISOString(),notes:['','','',''],checks:[[],[],[],[]],questions:[],carry:[...(previous?.carry||[]),...(previous?.questions||[])].filter(q=>q.status!=='done').map(q=>({...q,id:q.originId||q.id,originId:q.originId||q.id,carried:true})),decision:'',owner:'',due:'',nextWeek:'',doneAt:null}}
const emails=`<a href="mailto:accounting@profitablepenny.com?subject=Help%20with%20my%2030-Minute%20Routine">Email Kimberley</a> · <a href="tel:+14049335229">Call 404-933-5229</a> · <a href="https://link.profitablepenny.com/widget/bookings/20-minute-financial-clarity-ch" target="_blank" rel="noopener noreferrer">Book a 20-minute appointment</a>`;
function render(){if(!authReady)return;if(!currentUser)return vipEntryScreen==='registration'?registrationView():authView();if(screen==='home')return home();if(screen==='step')return stepView();if(screen==='summary')return summary()}
function home(){const total=saved.length,open=[...(saved[0]?.questions||[]),...(saved[0]?.carry||[])].filter(q=>q.status!=='done').length;
$('app').innerHTML=`<section class="panel"><span class="badge">Your weekly routine</span><h2>Less guessing. More knowing.</h2><p>This is your time to notice what changed, check anything that doesn't look right, and decide on one next step. You don't have to solve every bookkeeping problem today.</p><div class="two"><div class="notice"><strong>${total} saved check-in${total===1?'':'s'}</strong><p class="muted">Saved privately to your Firebase account.</p></div><div class="notice"><strong>${open} question${open===1?'':'s'} still open</strong><p class="muted">Unfinished questions can come forward to your next check-in.</p></div></div><div class="actions"><button id="start">Start this week's 30 minutes</button>${loadDraft()?'<button id="resume" class="secondary">Resume unfinished routine</button>':''}<button id="logout" class="secondary">Sign out</button>${total?'<button id="history" class="secondary">View saved weeks</button>':''}</div></section><div id="historyArea"></div><section class="panel no-print"><h3>A little reminder</h3><p>Keep your actual bookkeeping and reconciliations in QuickBooks. This tool is for your weekly owner check-in, not a replacement for accurate books or professional oversight.</p><p><strong>Need a hand?</strong> I genuinely want you to reach out. ${emails}</p></section>`;
$('start').onclick=()=>{if(loadDraft()&&!confirm('You have an unfinished check-in. Choose Cancel to resume it from the dashboard, or OK to start fresh and replace the unfinished draft.'))return;clearDraft();draft=newDraft();step=0;saveDraft();screen='step';render()};if($('resume'))$('resume').onclick=()=>{const item=loadDraft();if(!item)return;draft=item.draft;step=Math.max(0,Math.min(3,item.step||0));screen='step';render()};$('logout').onclick=()=>window.vipBackend.logout();if(total)$('history').onclick=()=>{historyView();$('historyArea').scrollIntoView({behavior:'smooth',block:'start'})}}
function historyView(){$('historyArea').innerHTML=`<section class="panel"><h2>Your saved weeks</h2><p class="muted">Your saved weeks are stored privately in your account. Use the same email and password to return on another device.</p>${saved.map(s=>`<div class="item"><strong>${esc(s.date)}</strong><p>${esc(s.decision||'No main action recorded')}</p><p class="muted">${[...(s.questions||[]),...(s.carry||[])].filter(q=>q.status!=='done').length} question(s) still open</p><button class="secondary" data-id="${esc(s.id)}">Open summary</button></div>`).join('')}</section>`;document.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{draft=structuredClone(saved.find(s=>s.id===b.dataset.id));screen='summary';render()})}
const checklists=[['Are your QuickBooks bank connections current?','Does anything look unfamiliar or missing?','Are there items waiting for your attention?'],['Check suggested categories before agreeing','Check that payments match the right invoices or deposits','Flag anything you cannot confidently confirm'],['What money came in and what went out?','What changed from last week?','What cash is already spoken for?'],['Choose one useful next action','Decide who will handle it','Choose when you will follow up']];
const prompts=[['What looks different this week?','Anything missing, surprising, or worth a closer look?'],['What did you verify?','What are you unsure about or need to ask?'],['What are your numbers telling you?','What is one money question you need answered?'],['What decision or follow-up matters most?','What will you do differently next week?']];
function stepView(){const [name,mins,desc]=sections[step];const prior=draft.checks[step]||[];
$('app').innerHTML=`<section class="panel"><div class="toolbar"><span class="badge">Step ${step+1} of 4</span><label style="margin:0">Week of <input id="date" type="date" value="${esc(draft.date)}" style="width:auto"/></label></div><div class="steps">${sections.map((s,i)=>`<div class="step ${i===step?'active':''}">${s[0]}<small>${s[1]} minutes</small></div>`).join('')}</div><h2>${name} <span style="color:#a2603f">· ${mins} minutes</span></h2><p>${desc}</p><div class="group"><h3>What to look at</h3>${checklists[step].map((text,i)=>`<div class="checkrow"><input id="c${i}" type="checkbox" data-check="${i}" ${prior.includes(i)?'checked':''}/><label for="c${i}">${esc(text)}</label></div>`).join('')}</div><div class="group"><label for="notes">${prompts[step][0]}</label><p class="prompt">${prompts[step][1]}</p><textarea id="notes" placeholder="Write a few words. Keep it simple.">${esc(draft.notes[step])}</textarea></div>${step===1?questionsUI():''}${step===3?actionsUI():''}<p class="status">You can pause whenever you need. Thirty minutes is a guide, not a race.</p><p id="saveError" role="alert" class="status"></p><div class="actions"><button id="back" class="secondary">${step===0?'Back to start':'Previous step'}</button><button id="next">${step===3?'Finish my weekly check-in':'Continue'}</button></div></section>`;
$('date').onchange=e=>{draft.date=e.target.value;saveDraft()};$('notes').oninput=e=>{draft.notes[step]=e.target.value;saveDraft()};document.querySelectorAll('[data-check]').forEach(c=>c.onchange=()=>{const i=Number(c.dataset.check);let x=new Set(draft.checks[step]);c.checked?x.add(i):x.delete(i);draft.checks[step]=[...x].sort();saveDraft()});
if(step===1)setupQuestions();if(step===3)setupActions();$('back').onclick=()=>{if(step===0){screen='home'}else step--;saveDraft();render()};$('next').onclick=()=>{if(step===3){void finishCheckin()}else{step++;saveDraft();render()}}
}
async function finishCheckin(){
 const button=$('next'),message=$('saveError');
 if(!draft||!currentUser){alert('Your session needs to be refreshed. Please sign in again.');return}
 if(button){button.disabled=true;button.textContent='Saving…'}
 if(message)message.textContent='Saving your check-in to Firebase…';
 saveDraft();draft.doneAt=new Date().toISOString();
 try{
  await Promise.race([
   window.vipBackend.save(currentUser,draft),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error('The cloud save took too long. Please try again.')),12000))
  ]);
  const i=saved.findIndex(x=>x.id===draft.id);
  if(i>=0)saved[i]=structuredClone(draft);else saved.unshift(structuredClone(draft));
  saved.sort((x,y)=>String(y.createdAt||'').localeCompare(String(x.createdAt||'')));
  clearDraft();screen='summary';
  render();
 }catch(error){
  const wording='Could not finish your check-in: '+(error.message||String(error));
  draft.doneAt=null;saveDraft();if(message)message.textContent=wording;
  alert(wording);
  if(button){button.disabled=false;button.textContent='Finish my weekly check-in'}
 }
}
function questionsUI(){const list=[...draft.carry,...draft.questions];return `<div class="group"><h3>Questions to follow up on</h3><p class="muted">Questions that are still open can appear in your next check-in.</p>${list.map(q=>`<div class="item ${esc(q.priority)}"><strong>${esc(q.text)}</strong><div class="meta">${esc(q.priority)} · ${q.carried?'From an earlier week':'Added this week'}</div><select aria-label="Question status" data-status="${esc(q.id)}"><option value="open" ${q.status==='open'?'selected':''}>Needs attention</option><option value="waiting" ${q.status==='waiting'?'selected':''}>Waiting for an answer</option><option value="done" ${q.status==='done'?'selected':''}>Resolved</option></select></div>`).join('')}<label for="questionText">Add a question or issue</label><textarea id="questionText" placeholder="For example: Why is this expense here?" rows="2"></textarea><div class="two"><div><label for="priority">How urgent is it?</label><select id="priority"><option value="watch">Keep an eye on it</option><option value="critical">Needs attention soon</option><option value="normal">Just a question</option></select></div><div style="display:flex;align-items:end"><button id="addQuestion" type="button">Add to my list</button></div></div></div>`}
function setupQuestions(){document.querySelectorAll('[data-status]').forEach(el=>el.onchange=()=>{const item=[...draft.carry,...draft.questions].find(q=>q.id===el.dataset.status);if(item){item.status=el.value;saveDraft()}});$('addQuestion').onclick=()=>{const text=$('questionText').value.trim();if(!text)return;$('questionText').value='';draft.questions.push({id:uid(),text:text.slice(0,500),priority:$('priority').value,status:'open',carried:false});saveDraft();render()}}
function actionsUI(){return `<div class="group"><h3>One action to take</h3><label for="decision">What's the one thing you will do next?</label><textarea id="decision" placeholder="For example: Ask about the unfamiliar charge.">${esc(draft.decision)}</textarea><div class="two"><div><label for="owner">Who will do it?</label><input type="text" id="owner" placeholder="Me / my bookkeeper" value="${esc(draft.owner)}"/></div><div><label for="due">When?</label><input type="date" id="due" value="${esc(draft.due)}"/></div></div><label for="nextWeek">What do you want to remember next week?</label><textarea id="nextWeek">${esc(draft.nextWeek)}</textarea></div>`}
function setupActions(){['decision','owner','due','nextWeek'].forEach(id=>$(id).oninput=e=>{draft[id]=e.target.value;saveDraft()})}
function summary(){const q=[...(draft.carry||[]),...(draft.questions||[])],open=q.filter(x=>x.status!=='done');$('app').innerHTML=`<section class="panel" id="report"><div class="eyebrow">YOUR WEEKLY FINANCIAL CEO CHECK-IN</div><h2>Week of ${esc(draft.date)}</h2><p class="notice">You showed up for your business money this week. That matters. You don't have to know every answer; you need to know what deserves your attention.</p>${sections.map((s,i)=>`<div class="group"><h3>${s[0]} · ${s[1]} minutes</h3><p>${esc(draft.notes[i]||'No notes this week.')}</p></div>`).join('')}<div class="group"><h3>Questions and unfinished items (${open.length} open)</h3>${q.length?q.map(x=>`<div class="item ${esc(x.priority)}"><strong>${esc(x.text)}</strong><div class="meta">${x.status==='done'?'Resolved':x.status==='waiting'?'Waiting for an answer':'Needs attention'}</div>${x.followupNote?`<p><strong>Follow-up:</strong> ${esc(x.followupNote)}</p>`:''}${x.updatedAt?`<p class="muted">Updated ${esc(new Date(x.updatedAt).toLocaleDateString())}</p>`:''}<button type="button" class="secondary no-print" data-followup="${esc(x.originId||x.id)}">Update follow-up</button></div>`).join(''):'<p>No questions recorded this week.</p>'}</div><div class="group"><h3>My next action</h3><p><strong>${esc(draft.decision||'No action added.')}</strong></p><p>Who: ${esc(draft.owner||'Not assigned')} · When: ${esc(draft.due||'Not scheduled')}</p><p>Remember next week: ${esc(draft.nextWeek||'Nothing recorded.')}</p></div><div class="notice"><strong>Need help making sense of this?</strong><p>I mean this: if you have a question, please reach out. You don't have to figure everything out by yourself.</p><p>${emails}</p></div><p class="muted">This summary is based on what you entered. It does not confirm that your books are accurate or complete.</p></section><div class="actions no-print"><button id="print">Save or Print My Summary</button><button id="home" class="secondary">Back to dashboard</button><button id="startNew" class="secondary">Start another week</button></div><p class="muted no-print">For a PDF, choose “Save as PDF” in your browser's print window. Your records are saved to your private account. A PDF is also available as a personal backup.</p>`;document.querySelectorAll('[data-followup]').forEach(b=>b.onclick=()=>followupEditor(b.dataset.followup,b));$('print').onclick=()=>window.print();$('home').onclick=()=>{screen='home';render()};$('startNew').onclick=()=>{draft=newDraft();step=0;screen='step';render()}}
async function followupEditor(id,trigger){
 const item=[...(draft.carry||[]),...(draft.questions||[])].find(q=>(q.originId||q.id)===id);
 if(!item)return;
 const host=$('report');if(!host)return;
 let box=$('followupEditor');if(box)box.remove();
 box=document.createElement('div');box.id='followupEditor';box.className='group no-print';
 box.innerHTML='<h3>Update follow-up</h3><p>'+esc(item.text)+'</p><label for="followStatus">Where does this stand?</label><select id="followStatus"><option value="open">Needs attention</option><option value="waiting">Waiting for a response</option><option value="done">Resolved — close this question</option></select><label for="followNote">What happened?</label><textarea id="followNote" placeholder="Record what you learned, who you contacted or what you are waiting for.">'+esc(item.followupNote||'')+'</textarea><div class="actions"><button type="button" id="saveFollow">Save follow-up</button><button type="button" class="secondary" id="cancelFollow">Cancel</button></div><p id="followError" role="alert"></p>';
 (trigger?.closest('.item')||host).insertAdjacentElement('afterend',box);box.scrollIntoView({behavior:'smooth',block:'nearest'});$('followStatus').value=item.status||'open';$('cancelFollow').onclick=()=>box.remove();
 $('saveFollow').onclick=async()=>{
  const status=$('followStatus').value,note=$('followNote').value.trim(),button=$('saveFollow');
  if(status==='done'&&!note){$('followError').textContent='Add a short note explaining how the question was resolved.';return}
  button.disabled=true;$('followError').textContent='Saving…';
  const original=structuredClone(draft),originalSaved=structuredClone(saved);
  const timestamp=new Date().toISOString();
  for(const record of saved){for(const q of [...(record.questions||[]),...(record.carry||[])])if((q.originId||q.id)===id){q.status=status;q.followupNote=note;q.updatedAt=timestamp}}
  for(const q of [...(draft.questions||[]),...(draft.carry||[])])if((q.originId||q.id)===id){q.status=status;q.followupNote=note;q.updatedAt=timestamp}
  try{
   for(const record of saved.filter(s=>[...(s.questions||[]),...(s.carry||[])].some(q=>(q.originId||q.id)===id)))await window.vipBackend.save(currentUser,record);
   const pending=loadDraft();if(pending){for(const q of [...(pending.draft.questions||[]),...(pending.draft.carry||[])])if((q.originId||q.id)===id){q.status=status;q.followupNote=note;q.updatedAt=timestamp}if(status==='done')pending.draft.carry=pending.draft.carry.filter(q=>(q.originId||q.id)!==id);localStorage.setItem(draftKey(),JSON.stringify(pending))}
   summary();
  }catch(err){saved=originalSaved;draft=original;$('followError').textContent='Could not save: '+(err.message||String(err));button.disabled=false}
 };
}
function registrationView(){
const app=$('app');
app.innerHTML=`<section class="panel"><span class="badge">VIP gift registration</span><h2>Register for your VIP gift first</h2><p>Enter your details in the form below to register for your complimentary Financial CEO 30-Minute Routine Builder.</p><iframe title="Register for your Profitable Penny VIP gift" src="https://link.profitablepenny.com/widget/form/j5PEa8Wjj5wW6DcaZGDC" style="width:100%;height:460px;border:0;border-radius:8px" loading="eager"></iframe><div class="actions"><button id="vipContinue" type="button" disabled>Continue to account setup</button></div><p class="muted">After submitting the registration form, Continue will become available to set up your private account for saving your weekly work.</p></section>`;
$('vipContinue').disabled=!ghlRegistrationConfirmed;
$('vipContinue').onclick=()=>{if(!ghlRegistrationConfirmed)return;vipEntryScreen='account';render();window.scrollTo(0,0)};

}
function onGhlRegistrationConfirmed(){if(vipEntryScreen==='registration'&&$('vipContinue'))$('vipContinue').disabled=false;}
function authView(){
const app=$('app');app.innerHTML=`<section class="panel"><span class="badge">Your private VIP account</span><h2>Welcome to your Financial CEO routine</h2><p>You've registered for your VIP gift. To use your routine and save your work, create a private account here. It lets you save your progress, revisit earlier check-ins and return on another device. Create it once, then simply sign in. Creating an account here does not subscribe you to marketing emails.</p><form id="authForm"><label for="authEmail">Email address</label><input id="authEmail" type="email" required autocomplete="email"><label for="authPassword">Password (at least 6 characters)</label><input id="authPassword" type="password" minlength="6" required autocomplete="current-password"><label class="checkrow" for="showAuthPassword"><input id="showAuthPassword" type="checkbox"> Show password</label><div class="actions"><button id="signIn" type="submit">Sign in</button><button id="createAccount" type="button" class="secondary">Create account</button><button id="forgotPassword" type="button" class="secondary">Reset password</button></div><p id="authError" role="alert" class="status"></p></form></section>`;
const email=()=>document.getElementById('authEmail').value.trim(),pass=()=>document.getElementById('authPassword').value;
$('showAuthPassword').onchange=e=>{$('authPassword').type=e.target.checked?'text':'password'};
const status=$('authError');
const work=async fn=>{status.textContent='Working…';for(const b of app.querySelectorAll('button'))b.disabled=true;try{await fn()}catch(e){status.textContent=e.code==='auth/email-already-in-use'?'An account already exists for this email. Try signing in or resetting your password.':e.message;for(const b of app.querySelectorAll('button'))b.disabled=false}};
$('authForm').onsubmit=e=>{e.preventDefault();work(()=>window.vipBackend.login(email(),pass()))};
$('createAccount').onclick=()=>{if(!$('authForm').reportValidity())return;work(()=>window.vipBackend.register(email(),pass()))};
$('forgotPassword').onclick=()=>{if(!email()){status.textContent='Enter your email address first.';return}work(async()=>{await window.vipBackend.reset(email());status.textContent='If the address has an account, check your email for a password reset link.';for(const b of app.querySelectorAll('button'))b.disabled=false})};
}
window.vipBackend.watch(async user=>{
 currentUser=user;authReady=true;draft=null;screen='home';saved=[];
 if(user){try{saved=await window.vipBackend.load(user)}catch(e){authReady=false;$('app').innerHTML='<section class="panel"><h2>Unable to load your saved weeks</h2><p role="alert">'+esc(e.message)+'</p><p>Please reload this page. Your saved records have not been changed.</p></section>';return}}
 render();
});
