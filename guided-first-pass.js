'use strict';
// Guided first-pass experience layered onto the tested Firebase application.
const helpLinks='<div class="notice help-box"><strong>Questions? You do not have to stay stuck.</strong><p>Save the question and continue, or reach out to Kimberley.</p>'+emails+'</div>';
const money=v=>Number(v||0).toLocaleString('en-US',{style:'currency',currency:'USD'});
const val=id=>$(id)?.value||'';
const guidance={
 meaning:{
  title:"What are you having trouble understanding?",
  choices:[
   ["income","The money coming in and going out","Open your QuickBooks Profit and Loss report for a completed month. Income shows sales recorded for the period, expenses show costs recorded, and net profit is the difference. These aren't the same as your bank balance."],
   ["transaction","A transaction I am seeing","Look at the date, amount and name. Compare it with the original receipt, invoice or bank activity. Do not accept or change something you cannot identify."],
   ["balance","Why QuickBooks and my bank show different amounts","Check that the account and dates match. Look for recent deposits, uncleared payments, or transactions that haven't downloaded. Don't force balances to match."],
   ["report","What a number or report is telling me","Check the report name, date range, and whether it uses cash or accrual accounting. Identify the one number you want explained."],
   ["other","Something else","Describe what you expected and what you actually see. Start with one specific number or transaction."]
  ]},
 accuracy:{
  title:"Let's check something you can verify.",
  choices:[
   ["bank","I want to check a deposit or payment","Compare one recognizable bank transaction with QuickBooks. Check the date, amount and description. Note differences; don't edit anything yet."],
   ["category","The expense category worries me","Identify what the purchase was for, then compare the suggested category with its business purpose. A bookkeeper or accountant can help determine the correct treatment."],
   ["totals","My report totals may be wrong","Check the report period and accounting basis first. Compare a small sample against original records; a matching sample doesn't prove the whole report is correct."]
  ]},
 missing:{
  title:"Let's look for a gap.",
  choices:[
   ["feed","Recent bank or card transactions are missing","Compare the newest transaction dates shown by your bank and QuickBooks. Check for a disconnected feed or delayed downloads."],
   ["invoice","A sale or customer payment is missing","Check the invoice and payment history, including the report date range. Note whether money has actually been collected."],
   ["expense","An expense or bill is missing","Look for the original receipt or bill, and check whether it falls inside the report's dates. Don't enter it twice if it may already exist."]
  ]},
 other:{
  title:"Let's narrow it down.",
  choices:[
   ["unfamiliar","An unfamiliar transaction","Match the date and amount with your bank or card activity. Identify the merchant if possible; leave unrecognized entries unapproved."],
   ["duplicate","I may have a duplicate","Compare dates, amounts and transaction details. Don't delete either entry without verifying which records are legitimate."],
   ["amount","The amount or date looks wrong","Compare the QuickBooks entry with the source document and record exactly what differs."],
   ["category","The category doesn't make sense","Verify the purchase's business purpose. If the proper category remains uncertain, consult a bookkeeper or accountant rather than guessing."],
   ["other","Something else","Write what looks wrong and what you expected to see. Use an original record as your starting point."]
  ]}
};
const reviewOptions=["My bank or credit card transactions aren't updating in QuickBooks.","I see transactions I don't recognize.","I see transactions that haven't been categorized or matched.","Something else doesn't look right."];
const reviewModes=[["okay","Yes, nothing stood out to me."],["attention","I noticed something that needs attention."],["unsure","I'm not sure if everything is right."]];
const htmlRadios=(name,options,selected)=>options.map(([id,label])=>'<label class="choice"><input type="radio" name="'+name+'" value="'+id+'" '+(selected===id?'checked':'')+'> '+esc(label)+'</label>').join('');
function guideState(){if(!draft.guide)draft.guide={review:{issues:[],mode:'',kind:'meaning',subkind:'',detail:'',result:''},approve:{outcome:'',kind:'category',note:'',general:'later',generalNote:''},understand:{topic:'',revenue:'',profit:'',bank:'',beginning:'',draws:'',principal:'',assets:'',other:'',learning:'',takeaway:''},act:{category:'',status:'open'}};return draft.guide}
function track(id,field,obj){const el=$(id);if(!el)return;el.addEventListener('input',()=>{obj[field]=el.value;saveDraft()})}
function guideBody(stepNum){
 const g=guideState();
 if(stepNum===0)return reviewBody(g.review);
 if(stepNum===1)return approveBody(g.approve,g.review);
 if(stepNum===2)return understandBody(g.understand,g.review,g.approve);
 return actBody(g.act,g);
}
function reviewBody(r){
 const selected=guidance[r.kind]||guidance.meaning;
 const chosen=selected.choices.find(x=>x[0]===r.subkind)||selected.choices[0];
 return '<h2>What needs your attention this week?</h2><p>Open QuickBooks and notice what deserves a closer look. You don’t have to fix everything right now.</p><div class="group">'+reviewOptions.map((t,i)=>'<label class="choice"><input type="checkbox" data-review="'+i+'" '+(r.issues.includes(i)?'checked':'')+'> '+esc(t)+'</label>').join('')+'</div><div class="group"><h3>Did everything look okay?</h3>'+htmlRadios('reviewMode',reviewModes,r.mode)+'</div>'+(
 r.mode==='attention'?'<div class="group"><label for="reviewDetail">What caught your attention?</label><textarea id="reviewDetail" placeholder="For example: I don’t recognize a charge.">'+esc(r.detail)+'</textarea><p class="muted">We’ll carry this into Approve and help you check it.</p></div>':
 r.mode==='unsure'?'<div class="group"><h3>Let’s work out what feels unclear.</h3>'+htmlRadios('reviewKind',[["meaning","I don’t understand what I’m seeing."],["accuracy","I’m not sure the information is accurate."],["missing","I think something might be missing."],["other","Something else doesn’t look right."]],r.kind)+'<div class="notice"><strong>'+esc(selected.title)+'</strong><label for="reviewSubkind">What best describes your question?</label><select id="reviewSubkind">'+selected.choices.map(x=>'<option value="'+x[0]+'" '+(chosen[0]===x[0]?'selected':'')+'>'+esc(x[1])+'</option>').join('')+'</select><p>'+esc(chosen[2])+'</p></div><label for="reviewDetail">What did you discover, or what is still confusing?</label><textarea id="reviewDetail">'+esc(r.detail)+'</textarea><label for="reviewResult">Does this help?</label><select id="reviewResult"><option value="">Choose one</option><option value="understood" '+(r.result==='understood'?'selected':'')+'>Yes, I understand this better</option><option value="partial" '+(r.result==='partial'?'selected':'')+'>A little, but I still have questions</option><option value="stuck" '+(r.result==='stuck'?'selected':'')+'>No, I need help</option></select><p class="muted">If you still have questions, we’ll carry them forward. You can continue without guessing.</p></div>':'');
}
function approveBody(a,r){
 const issue=r.detail||r.issues.map(i=>reviewOptions[i]).join(' ');
 const topics=[["verified","I checked it and can confirm what it is."],["unsure","I still need help figuring it out."],["incorrect","I found something that doesn’t look correct."]];
 const advice={
 category:"Identify what the purchase was for and compare the suggested category. If you’re not sure of the correct accounting treatment, ask your bookkeeper or accountant. If you don’t have one, Kimberley can help.",
 duplicate:"Compare transaction dates, amounts and source records. Don’t delete either entry before verifying.",
 amount:"Compare the date and amount with the invoice, receipt, or bank record. Record the difference.",
 receipt:"Search your email, vendor portal or saved receipts; note what evidence is still missing.",
 unfamiliar:"Compare the payment or deposit with bank activity and available documents. Don’t approve an unidentified entry."
 };
 return '<h2>What can you confidently confirm?</h2><p>Start with what you noticed in Review. Nothing needs to be approved just to finish this routine.</p><div class="notice"><strong>From your Review</strong><p>'+esc(issue||'No specific concerns were recorded. You can still choose to do a general transaction review.')+'</p></div><div class="group"><h3>What happened when you checked?</h3>'+htmlRadios('approveOutcome',topics,a.outcome)+'</div>'+(
 a.outcome==='verified'?'<div class="notice"><strong>What helped you verify it?</strong><p>Use receipts, invoices, bank activity, or other records to establish the facts. Recognizing a transaction does not automatically verify its category.</p></div>':
 a.outcome?'<div class="group"><label for="approveKind">What needs a closer look?</label><select id="approveKind">'+[["category","The category doesn’t seem right"],["duplicate","This may be a duplicate"],["amount","The date or amount looks wrong"],["receipt","I can’t find the receipt or invoice"],["unfamiliar","I don’t recognize this transaction"]].map(x=>'<option value="'+x[0]+'" '+(a.kind===x[0]?'selected':'')+'>'+x[1]+'</option>').join('')+'</select><div class="notice">'+esc(advice[a.kind]||advice.category)+'</div></div>':'')+
 '<label for="approveNote">What did you confirm, or what remains unresolved?</label><textarea id="approveNote">'+esc(a.note)+'</textarea><div class="group"><h3>Ready for a general QuickBooks transaction review?</h3><label class="choice"><input name="generalReview" type="radio" value="yes" '+(a.general==='yes'?'checked':'')+'> Yes, walk me through it.</label><label class="choice"><input name="generalReview" type="radio" value="later" '+(a.general!=='yes'?'checked':'')+'> Not right now. Continue my routine.</label>'+(a.general==='yes'?'<div class="notice"><strong>Try one transaction:</strong><ol><li>Open transactions waiting for review in QuickBooks.</li><li>Choose one and check who paid or received money.</li><li>Compare the amount and date with your bank or source document.</li><li>Check the suggested match or category. Approve only what you can verify.</li></ol><textarea id="generalNote" placeholder="What did you find?">'+esc(a.generalNote)+'</textarea></div>':'')+'</div>';
}
const topicOptions=[["cash","I have money in the bank, but how much is available?"],["profit","I’m making money but don’t feel profitable."],["expenses","I’m not sure where my money is going."],["owner","I don’t know how much I can pay myself."],["slow","I’m worried about a slow month."],["other","I have another question about my numbers."]];
function recommendedTopic(r,a){const t=(r.detail+' '+a.note+' '+reviewOptions.filter((_,i)=>r.issues.includes(i)).join(' ')).toLowerCase();return /profit|revenue|sales/.test(t)?'profit':/owner|pay myself|draw/.test(t)?'owner':/expense|categor|charge|transaction/.test(t)?'expenses':/slow|reserve/.test(t)?'slow':'cash'}
function understandBody(u,r,a){
 const suggested=recommendedTopic(r,a),topic=u.topic||suggested;
 const lead={
 cash:"Bank money isn’t all available to spend. Taxes, upcoming bills, payroll, and reserves may already have a job.",
 profit:"Revenue is sales recorded, profit is revenue minus recorded expenses, and cash is what sits in the bank. They answer different questions.",
 expenses:"Start with expenses on your Profit and Loss report. Compare categories with receipts and invoices; look for changes, not just the biggest number.",
 owner:"Owner pay depends on your business structure, cash obligations, and the sustainability of future cash flow. Don’t use bank balance alone to decide.",
 slow:"Compare regular monthly obligations with available cash and reserves. A slow month affects cash timing even if annual sales are healthy.",
 other:"Pick one number or report. Identify its date range and what it measures before making a decision."
 };
 const fields=[["revenue","Revenue from P&L"],["profit","Net profit from P&L"],["bank","Bank balance at period end"],["beginning","Bank balance at period beginning"],["draws","Owner withdrawals (if applicable)"],["principal","Loan principal payments"],["assets","Asset purchases"],["other","Other confirmed non-P&L cash outflows"]];
 const ready=['revenue','profit','bank','beginning'].every(k=>u[k]!==''&&Number.isFinite(Number(u[k])));
 const profit=Number(u.profit)||0,bank=Number(u.bank)||0,start=Number(u.beginning)||0;
 const expenses=(Number(u.revenue)||0)-profit;
 const cashChange=bank-start,diff=profit-cashChange;
 const identified=['draws','principal','assets','other'].reduce((sum,k)=>sum+(Number(u[k])||0),0);
 return '<h2>What is your business money telling you?</h2><p>Based on your earlier answers, we recommend one topic. Choose another if it matters more today.</p><div class="notice"><strong>Recommended: '+esc(topicOptions.find(x=>x[0]===suggested)[1])+'</strong><p>'+esc(r.detail||a.note||'Start with one question about your business money.')+'</p></div><label for="understandTopic">Explore a topic</label><select id="understandTopic">'+topicOptions.map(x=>'<option value="'+x[0]+'" '+(topic===x[0]?'selected':'')+'>'+esc(x[1])+'</option>').join('')+'</select><div class="notice"><strong>Let’s connect the dots</strong><p>'+esc(lead[topic])+'</p></div><div class="group"><h3>Follow the money: your own numbers</h3><p>For a completed month, open your QuickBooks Profit and Loss report and your bank activity. Use matching period-end dates. Leave a field blank if you cannot verify it.</p><div class="two">'+fields.map(([id,label])=>'<div><label for="num_'+id+'">'+esc(label)+'</label><input type="number" step="0.01" id="num_'+id+'" value="'+esc(u[id])+'" placeholder="Enter amount"></div>').join('')+'</div><div id="moneyResults">'+moneyResults(u,ready,expenses,cashChange,diff,identified)+'</div></div><div class="group"><h3>What did you learn?</h3><label for="learning">Does this help you understand?</label><select id="learning"><option value="">Choose one</option><option value="yes" '+(u.learning==='yes'?'selected':'')+'>Yes, I made a connection</option><option value="some" '+(u.learning==='some'?'selected':'')+'>Somewhat, I have more to check</option><option value="stuck" '+(u.learning==='stuck'?'selected':'')+'>Not yet, I need guidance</option></select><label for="takeaway">What do you understand now, or what still puzzles you?</label><textarea id="takeaway">'+esc(u.takeaway)+'</textarea></div>';
}
function moneyResults(u,ready,expenses,cashChange,diff,identified){
 if(!ready)return '<p class="muted">Enter revenue, net profit, beginning cash and ending cash to see an initial comparison. The other fields are optional.</p>';
 return '<div class="notice"><p><strong>Recorded expenses (revenue minus profit): '+money(expenses)+'</strong></p><p>Change in bank cash: '+money(cashChange)+'</p><p>Difference between reported profit and cash change: <strong>'+money(diff)+'</strong></p><p>Possible non-P&L cash outflows you entered: '+money(identified)+'</p><p>Difference after those entries: '+money(diff-identified)+'</p><p class="muted">This is a learning exercise, not a reconciliation or proof of missing money. Other bank accounts, unpaid invoices or bills, transfers, borrowing, tax payments, depreciation, and timing or accounting-basis differences may matter. Even a zero difference does not prove your books are correct.</p></div>';
}
function actBody(a,g){
 const unresolved=[...(draft.carry||[]),...(draft.questions||[])].filter(x=>x.status!=='done');
 const suggestion=g.approve.outcome==='unsure'||g.approve.outcome==='incorrect'||g.review.result==='stuck'||unresolved.length?'Get help verifying '+(g.approve.kind||'an unanswered bookkeeping question'):g.understand.learning==='stuck'?'Ask for help understanding my financial numbers':g.understand.topic==='cash'?'Check what cash is committed before I spend it':'Continue my weekly financial review';
 return '<h2>Now that you know more, what will you do?</h2><div class="notice"><strong>Your discoveries</strong><p>Review: '+esc(g.review.detail||'You completed a review of what needed attention.')+'</p><p>Approve: '+esc(g.approve.note||g.approve.outcome||'No additional confirmation recorded.')+'</p><p>Understand: '+esc(g.understand.takeaway||'You explored your business numbers.')+'</p><p>Unresolved questions: '+unresolved.length+'</p></div><p><strong>Suggested next action:</strong> '+esc(suggestion)+'</p><label for="decision">Choose ONE primary commitment. You can edit the suggestion.</label><textarea id="decision">'+esc(draft.decision||suggestion)+'</textarea><div class="two"><div><label for="owner">Who will do it?</label><input id="owner" type="text" value="'+esc(draft.owner)+'" placeholder="Me / my bookkeeper"></div><div><label for="due">By when?</label><input id="due" type="date" value="'+esc(draft.due)+'"></div></div><label for="nextWeek">What will you revisit next week?</label><textarea id="nextWeek">'+esc(draft.nextWeek)+'</textarea><p class="muted">Other open questions stay on your follow-up list. Finishing the routine does not mean every item is resolved.</p>';
}
function guidedStepView(){
 guideState();
 const [name,min]=sections[step];
 $('app').innerHTML='<section class="panel"><div class="toolbar"><span class="badge">Step '+(step+1)+' of 4</span><label>Week of <input id="date" type="date" value="'+esc(draft.date)+'"></label></div><div class="steps">'+sections.map((s,i)=>'<div class="step '+(step===i?'active':'')+'">'+s[0]+'<small>'+s[1]+' minutes</small></div>').join('')+'</div><h2>'+name+' · '+min+' minutes</h2>'+guideBody(step)+helpLinks+'<p class="muted">Your first routine may take longer as you establish a baseline. Thirty minutes is the weekly habit you’re building.</p><p id="saveError" role="alert" class="status"></p><div class="actions"><button id="back" class="secondary">'+(step===0?'Back to dashboard':'Previous step')+'</button><button id="next">'+(step===3?'Finish my weekly check-in':'Continue')+'</button></div></section>';
 $('date').onchange=e=>{draft.date=e.target.value;saveDraft()};
 const g=draft.guide;
 if(step===0){
  document.querySelectorAll('[data-review]').forEach(el=>el.onchange=()=>{const idx=Number(el.dataset.review);g.review.issues=el.checked?[...new Set([...g.review.issues,idx])]:g.review.issues.filter(x=>x!==idx);saveDraft()});
  document.querySelectorAll('[name=reviewMode]').forEach(el=>el.onchange=()=>{g.review.mode=el.value;saveDraft();render()});
  document.querySelectorAll('[name=reviewKind]').forEach(el=>el.onchange=()=>{g.review.kind=el.value;g.review.subkind='';saveDraft();render()});
  if($('reviewSubkind'))$('reviewSubkind').onchange=e=>{g.review.subkind=e.target.value;saveDraft();render()};
  if($('reviewDetail'))$('reviewDetail').oninput=e=>{g.review.detail=e.target.value;draft.notes[0]=e.target.value;saveDraft()};
  if($('reviewResult'))$('reviewResult').onchange=e=>{g.review.result=e.target.value;saveDraft()};
 }
 if(step===1){
  document.querySelectorAll('[name=approveOutcome]').forEach(el=>el.onchange=()=>{g.approve.outcome=el.value;saveDraft();render()});
  if($('approveKind'))$('approveKind').onchange=e=>{g.approve.kind=e.target.value;saveDraft();render()};
  if($('approveNote'))$('approveNote').oninput=e=>{g.approve.note=e.target.value;draft.notes[1]=e.target.value;saveDraft()};
  document.querySelectorAll('[name=generalReview]').forEach(el=>el.onchange=()=>{g.approve.general=el.value;saveDraft();render()});
  if($('generalNote'))$('generalNote').oninput=e=>{g.approve.generalNote=e.target.value;saveDraft()};
 }
 if(step===2){
  $('understandTopic').onchange=e=>{g.understand.topic=e.target.value;saveDraft();render()};
  ['revenue','profit','bank','beginning','draws','principal','assets','other'].forEach(k=>{const el=$('num_'+k);el.oninput=e=>{g.understand[k]=e.target.value;saveDraft();const u=g.understand;const ready=['revenue','profit','bank','beginning'].every(z=>u[z]!==''&&Number.isFinite(Number(u[z])));$('moneyResults').innerHTML=moneyResults(u,ready,(+u.revenue||0)-(+u.profit||0),(+u.bank||0)-(+u.beginning||0),(+u.profit||0)-((+u.bank||0)-(+u.beginning||0)),['draws','principal','assets','other'].reduce((a,z)=>a+(+u[z]||0),0))}});
  $('learning').onchange=e=>{g.understand.learning=e.target.value;saveDraft()};
  $('takeaway').oninput=e=>{g.understand.takeaway=e.target.value;draft.notes[2]=e.target.value;saveDraft()};
 }
 if(step===3)['decision','owner','due','nextWeek'].forEach(k=>$(k).oninput=e=>{draft[k]=e.target.value;saveDraft()});
 $('back').onclick=()=>{if(step===0)screen='home';else step--;saveDraft();render()};
 $('next').onclick=()=>{if(step===3){void finishCheckin()}else{step++;saveDraft();render()}};
}
const originalSummary=summary;
summary=function(){originalSummary();if(!draft?.guide)return;const g=draft.guide;const el=$('report');if(!el)return;const block=document.createElement('div');block.className='group';block.innerHTML='<h3>Your Financial CEO discoveries</h3><p><strong>What you noticed:</strong> '+esc(g.review.detail||'No specific concern recorded')+'</p><p><strong>What you checked:</strong> '+esc(g.approve.note||g.approve.outcome||'Not recorded')+'</p><p><strong>What you learned:</strong> '+esc(g.understand.takeaway||'Not recorded')+'</p><p><strong>Your one next action:</strong> '+esc(draft.decision||'Not selected')+'</p><p class="muted">This summary is based on information you entered; it does not verify the completeness or accuracy of your books.</p>';el.insertBefore(block,el.lastElementChild)};
stepView=guidedStepView;
