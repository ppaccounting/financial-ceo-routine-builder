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
   ["invoice","A customer payment is missing or unidentified","Check the invoice and payment history, including the report date range. Note whether money has actually been collected."],
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

const qbPnlSteps='<details class="notice"><summary><strong>Show me how to find Profit and Loss in QuickBooks Online</strong></summary><ol><li>Sign in to your QuickBooks Online company.</li><li>Open <strong>Reports</strong> in the navigation menu, then find <strong>Standard reports</strong> (menu labels can vary).</li><li>Search for <strong>Profit and Loss</strong> and open it.</li><li>Choose a completed month or the dates you want to review, then run or refresh the report.</li><li>Look for <strong>Total Income</strong>, <strong>Total Expenses</strong>, and <strong>Net Income</strong>.</li></ol><p>Income is the amount recorded as earned, expenses are costs recorded, and net income is the bottom line after applicable costs. Net income is not necessarily cash in your bank. If the report looks unfamiliar, write down the report name and the number that concerns you.</p></details>';
const qbBankSteps='<details class="notice"><summary><strong>Show me how to find bank transactions in QuickBooks Online</strong></summary><ol><li>Sign in to QuickBooks Online.</li><li>Look for <strong>Transactions</strong>, then <strong>Bank transactions</strong> (some layouts call this Banking).</li><li>Select the bank or credit card account you intended to check.</li><li>Open the <strong>For review</strong> tab to look at downloaded transactions awaiting review.</li><li>Compare the transaction date, amount and payee with your bank activity or receipt. Review whether QuickBooks suggests a match or a category.</li></ol><p>Do not click Add, Match, or Exclude until you have verified the transaction and what the action will do. Menu labels may differ.</p></details>';
const qbBalanceSteps='<details class="notice"><summary><strong>Show me how to compare the balances</strong></summary><ol><li>Open your bank website and select the account you want to compare.</li><li>In QuickBooks, find the corresponding account under <strong>Accounting / Chart of accounts</strong> or <strong>Transactions / Bank transactions</strong>, depending on your navigation layout.</li><li>Check you are comparing the <strong>same account</strong> and the <strong>same date</strong>.</li><li>Check pending deposits, uncleared payments, and transactions not yet downloaded.</li><li>Know that the bank’s current balance, bank-feed balance, QuickBooks register balance and last reconciled balance are different measures. They need not always match today.</li></ol><p>Do not create or delete entries simply to force the balances to agree.</p></details>';
const reportGuides={
 pnl:'<p><strong>Profit and Loss:</strong> Shows income and expenses recorded during a period and the resulting net profit or loss. It does not tell you how much cash is safe to spend.</p>'+qbPnlSteps,
 balance:'<p><strong>Balance Sheet:</strong> A snapshot of what the business owns, owes and its equity on one date. In QuickBooks, open Reports, search for Balance Sheet, choose the date and run the report.</p>',
 invoices:'<p><strong>Unpaid invoices:</strong> Helps identify customer invoices still marked unpaid. In QuickBooks, open Reports and search for Accounts Receivable Aging or open Sales and then Invoices. Compare with payments received before changing anything.</p>',
 other:'<p>Write down the exact report name, the date range, the number you want to understand, and what you expected. You can ask for help without changing any transactions.</p>'
};
function reportHelp(r){let key=r.report||'pnl';return '<div class="group"><label for="reviewReport">Which report are you trying to understand?</label><select id="reviewReport">'+[['pnl','Profit and Loss'],['balance','Balance Sheet'],['invoices','Unpaid invoices'],['other','Another report or number']].map(x=>'<option value="'+x[0]+'" '+(key===x[0]?'selected':'')+'>'+x[1]+'</option>').join('')+'</select><div class="notice">'+reportGuides[key]+'</div><p>Which number or part is unclear? If you still have a question, describe it below and we will help you prepare an email.</p></div>'}
function paymentConcern(g){const t=(g.review.detail+' '+g.approve.note+' '+g.review.issues.map(i=>reviewOptions[i]).join(' ')).toLowerCase();return /payment|transaction|charge|merchant|deposit|duplicate|category|categor|receipt|invoice|unfamiliar|recogniz|recognis/.test(t)}
function financialConcern(g){const t=(g.review.detail+' '+g.approve.note).toLowerCase();return /profit and loss|balance sheet|report|net profit|cash flow|revenue|sales|reserve|owner pay/.test(t)}
function issueText(g){return g.review.detail||g.review.issues.map(i=>reviewOptions[i]).join('; ')||'No specific concern recorded'}
function emailTopic(g,stage){
 if(stage==='Review'){
  const r=g.review||{},detail=(r.detail||'').toLowerCase();
  if(/payment|deposit/.test(detail)&&/don't know|do not know|cannot identify|can't identify|unidentified|unknown|which customer|who sent/.test(detail))return 'Unidentified customer payment';
  if(r.mode==='unsure'){const group=guidance[r.kind]||guidance.meaning;const choice=group.choices.find(x=>x[0]===r.subkind)||group.choices[0];return choice[1]}
  if(r.issues?.length)return reviewOptions[r.issues[0]];
  return 'Review question';
 }
 if(stage==='Approve')return 'Transaction verification question';
 if(stage==='Understand')return 'Understanding my business numbers';
 if(stage==='Act')return 'Next action or follow-up';
 return 'Financial CEO Routine question';
}
function guidanceEmail(stage,topic,question){return 'Hi Kimberley,\n\nI am working through my Financial CEO 30-Minute Routine Builder and need some help.\n\nSection: '+stage+'\nTopic: '+topic+'\n\nMy question:\n'+(question||'[My question]')+'\n\nCould you help me understand what to check next?\n\nThank you!'}
function helpEmailBox(stage,topic,question){const body=guidanceEmail(stage,topic,question);return '<div class="notice email-preview"><strong>Your ready-to-copy email</strong><p><strong>To:</strong> accounting@profitablepenny.com<br><strong>Subject:</strong> Question about my Financial CEO Routine</p><pre id="emailPreview">'+esc(body)+'</pre><div class="actions"><button type="button" class="secondary" id="copyEmail">Copy email message</button><a id="openEmail" href="mailto:accounting@profitablepenny.com?subject='+encodeURIComponent('Question about my Financial CEO Routine')+'&body='+encodeURIComponent(body)+'">Open in my email app</a></div><p class="muted">Nothing is sent automatically. Please do not include account numbers or sensitive client data.</p></div>'}
function updateEmail(stage,topic,question){const text=guidanceEmail(stage,topic,question);if($('emailPreview'))$('emailPreview').textContent=text;if($('openEmail'))$('openEmail').href='mailto:accounting@profitablepenny.com?subject='+encodeURIComponent('Question about my Financial CEO Routine')+'&body='+encodeURIComponent(text)}
function trackQuestionText(topic,text){const value=text.trim();const existing=draft.questions.find(q=>q.id===draft.guide.supportQuestionId);if(!value){if(existing){draft.questions=draft.questions.filter(q=>q.id!==existing.id)}draft.guide.supportQuestionId='';saveDraft();return}if(existing){existing.text=(topic+': '+value).slice(0,500);existing.status='open'}else{const id=uid();draft.questions.push({id,text:(topic+': '+value).slice(0,500),priority:'normal',status:'open',carried:false});draft.guide.supportQuestionId=id}saveDraft()}

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

function firstPassHelp(r){
 const description=(r.detail||'').trim();
 if(!description)return '<p>Please describe what you noticed first so we can suggest a useful next step.</p>';
 const unidentified=/payment|deposit|transfer|transaction/i.test(description)&&/don't know|do not know|cannot identify|can't identify|unidentified|unknown|unrecogniz|unfamiliar|which customer|who sent/i.test(description);
 if(unidentified)return '<strong>What is still unclear about this payment?</strong><p>You have a payment but have not identified who sent it. Before assigning a category or matching it to an invoice:</p><ol><li>Check the bank transaction details for a sender, reference number or payment processor.</li><li>Compare the date and amount with open invoices and recent customer payment records in QuickBooks.</li><li>If you use a payment processor, check its payout details. Deposits may combine payments or reflect fees.</li></ol><p>If the source is still unclear, leave it unapproved and record what you checked. Do not guess or create a duplicate payment. Ask Kimberley for help with the remaining question.</p>';
 if(/missing|not show|can't find|cannot find/i.test(description)&&/sale|invoice|payment|customer/i.test(description))return '<strong>Let’s trace the missing payment.</strong><ol><li>Check the invoice status and customer payment history.</li><li>Confirm whether the money reached the bank or payment processor.</li><li>Compare the dates and report filters before making changes.</li></ol><p>If it still does not match, record what you found and ask for help rather than entering the payment twice.</p>';
 return '<strong>Let’s narrow this down.</strong><ol><li>Identify the exact date, amount, report or transaction involved.</li><li>Compare it with an original bank record, invoice or receipt.</li><li>Write down what matches and what is still unclear.</li></ol><p>Do not approve, recategorize or delete anything you cannot verify. You can ask Kimberley for help with the remaining question.</p>';
}
function reviewBody(r){
 const selected=guidance[r.kind]||guidance.meaning,chosen=selected.choices.find(x=>x[0]===r.subkind)||selected.choices[0];
 let info='';
 if(r.mode==='unsure'){info='<div class="group"><h3>Let’s work out what feels unclear.</h3>'+htmlRadios('reviewKind',[["meaning","I don’t understand what I’m seeing."],["accuracy","I’m not sure the information is accurate."],["missing","I think something might be missing."],["other","Something else doesn’t look right."]],r.kind)+'<div class="notice"><strong>'+esc(selected.title)+'</strong><label for="reviewSubkind">What best describes your question?</label><select id="reviewSubkind">'+selected.choices.map(x=>'<option value="'+x[0]+'" '+(chosen[0]===x[0]?'selected':'')+'>'+esc(x[1])+'</option>').join('')+'</select></div>';
 if(r.kind==='meaning'&&chosen[0]==='income')info+='<div class="notice"><p>Your Profit and Loss report separates recorded income from expenses and shows net income. These numbers may differ from the cash in your bank.</p>'+qbPnlSteps+'</div>';
 else if(r.kind==='meaning'&&chosen[0]==='balance')info+='<p>Compare the same bank account and same date, then look for pending or uncleared transactions.</p>'+qbBalanceSteps;
 else if(r.kind==='meaning'&&chosen[0]==='report')info+=reportHelp(r);
 else info+='<div class="notice">'+esc(chosen[2])+''+'</div>';
 info+='</div>'}
 if(r.mode==='attention')info='<div class="notice"><p>Describe what caught your attention. If it involves a transaction, we will help you investigate it in Approve. A report question will go to Understand.</p></div>';
 if(r.mode==='unsure'||r.mode==='attention')info+='<div class="group"><label for="reviewResult">Where are you now?</label><select id="reviewResult"><option value="">Choose one</option><option value="understood" '+(r.result==='understood'?'selected':'')+'>I understand this better now</option><option value="partial" '+(r.result==='partial'?'selected':'')+'>I understand a little, but I have a question</option><option value="stuck" '+(r.result==='stuck'?'selected':'')+'>I am still confused and need personal help</option></select><label for="reviewDetail">'+(r.result==='understood'?'What did you learn?':'What did you notice or what question still needs an answer?')+'</label><textarea id="reviewDetail" placeholder="For example: There is a payment I cannot identify.">'+esc(r.detail)+'</textarea><button type="button" class="secondary" id="workThrough">Help me work through this</button>'+(r.showFirstPass?'<div id="firstPassGuidance" class="notice" role="status">'+firstPassHelp(r)+'</div>':'')+(r.result==='partial'||r.result==='stuck'?'<p>It is okay to stop here, save your question, and ask for help. You can continue without guessing.</p>':'')+'</div>';
 return '<h2>What needs your attention this week?</h2><p>Open QuickBooks and notice what deserves a closer look. You do not have to fix everything today.</p><div class="group">'+reviewOptions.map((t,i)=>'<label class="choice"><input type="checkbox" data-review="'+i+'" '+(r.issues.includes(i)?'checked':'')+'> '+esc(t)+'</label>').join('')+'</div><div class="group"><h3>Did everything look okay?</h3>'+htmlRadios('reviewMode',reviewModes,r.mode)+'</div>'+info;
}


function approveBody(a,r){
 const issue=r.detail||r.issues.map(i=>reviewOptions[i]).join('; ');
 const isReport=/report|profit and loss|net profit|balance sheet|cash flow/.test(issue.toLowerCase())&&!/payment|transaction|charge/.test(issue.toLowerCase());
 const advice={category:'Identify the business purpose using the receipt or invoice. Check the suggested category. Do not guess at accounting treatment; ask for help if unsure.',duplicate:'Compare the two dates, amounts, bank details and any existing QuickBooks transaction. A downloaded item and existing entry may need matching rather than adding. Do not delete either until verified.',amount:'Compare with the original invoice, receipt and bank activity. Check whether fees, partial payments or multiple payments explain the amount.',receipt:'Check your email, vendor portal or saved receipts. If you cannot find proof, mark it for follow-up.',unfamiliar:'Compare bank date, amount and merchant name with receipts, invoice and payment confirmations. If you suspect an unauthorized withdrawal, contact your bank promptly using its official contact details. Do not approve it.'};
 return '<h2>What can you confidently confirm?</h2><p>We will build on what you already noticed, not ask you to approve something you cannot verify.</p><div class="notice"><strong>From Review</strong><p>'+esc(issue||'No specific issue recorded.')+'</p></div>'+(isReport?'<p>This is a report question, not a transaction question. No transaction review is needed. Continue to Understand.</p>':'<div class="group"><h3>Were you able to verify the concern?</h3>'+htmlRadios('approveOutcome',[["verified","Yes, I confirmed it using another record."],["unsure","I identified part of it, but I still need to check."],["incorrect","No, I could not verify it or found a possible issue."]],a.outcome)+(a.outcome?'<label for="approveKind">What kind of issue is it?</label><select id="approveKind">'+[['unfamiliar','I do not recognize the payment or transaction'],['category','The category may be wrong'],['duplicate','It may be a duplicate'],['amount','The date or amount differs'],['receipt','I am missing supporting records']].map(x=>'<option value="'+x[0]+'" '+(a.kind===x[0]?'selected':'')+'>'+x[1]+'</option>').join('')+'</select><div class="notice">'+advice[a.kind||'category']+'</div>':'')+'<label for="approveNote">What did you actually confirm, or what remains unresolved?</label><textarea id="approveNote">'+esc(a.note)+'</textarea></div>')+'<div class="group"><h3>Optional QuickBooks transaction review</h3>'+htmlRadios('generalReview',[['yes','Walk me through one transaction'],['later','Skip for now and move on']],a.general)+(a.general==='yes'?qbBankSteps+'<label for="generalNote">What did you find?</label><textarea id="generalNote">'+esc(a.generalNote)+'</textarea>':'')+'</div>';
}

const topicOptions=[["cash","I have money in the bank, but how much is available?"],["profit","I’m making money but don’t feel profitable."],["expenses","I’m not sure where my money is going."],["owner","I don’t know how much I can pay myself."],["slow","I’m worried about a slow month."],["other","I have another question about my numbers."]];

function recommendedTopic(r,a){const t=(r.detail+' '+a.note).toLowerCase();return /profit|revenue|sales/.test(t)?'profit':/owner|pay myself|draw/.test(t)?'owner':/expense|categor/.test(t)?'expenses':/slow|reserve/.test(t)?'slow':'cash'}
function understandBody(u,r,a){
 const issue=issueText(guideState()),topic=u.topic||'';
 const choices=[['pnl','My Profit and Loss report'],['balance','My Balance Sheet'],['cashflow','My Statement of Cash Flows'],['difference','Why my profit and bank balance differ'],['other','Something else about my business numbers'],['good',"I'm good with my numbers this week."]];
 const explanations={pnl:'The Profit and Loss report shows income, expenses and net profit for a period. Compare completed months and identify what changed. Profit does not equal cash in the bank.',balance:'The Balance Sheet shows what your business owns, owes and has in owner equity on a particular date. Review cash, receivables, loans and other balances.',cashflow:'The Statement of Cash Flows explains cash from operating, investing and financing activities. Look at the largest movements and the net change in cash.',difference:'Profit and cash are different. Loan principal, owner withdrawals, asset purchases and timing of payments can change cash without changing profit in the same way.',other:'Identify the report or number, the dates and what seems confusing.',good:'You can move on to Act. No report exploration is needed this week.'};
 const steps=topic==='pnl'?qbPnlSteps:topic==='balance'?qbBalanceSteps:topic==='cashflow'?'<details><summary>Find the Statement of Cash Flows in QuickBooks Online</summary><ol><li>Open Reports in QuickBooks Online.</li><li>Search for Statement of Cash Flows.</li><li>Choose a completed reporting period and run the report.</li><li>Review operating, investing and financing cash movements.</li></ol><p>Availability may depend on your QuickBooks plan and setup.</p></details>':'';
 return '<h2>What are your numbers telling you?</h2><p>Take a few minutes to understand your business money. You do not need every answer today.</p><div class="notice"><strong>Your earlier concern</strong><p>'+esc(issue||'No specific concern recorded.')+'</p><p>If unresolved, keep this on your follow-up list. If you have already asked for help, wait for a response before making changes you cannot verify.</p></div><div class="group"><label for="understandTopic">What would you like to understand today?</label><select id="understandTopic"><option value="">Choose one</option>'+choices.map(x=>'<option value="'+x[0]+'" '+(topic===x[0]?'selected':'')+'>'+esc(x[1])+'</option>').join('')+'</select>'+(topic?'<div class="notice"><p>'+esc(explanations[topic])+'</p>'+steps+'</div>':'')+'</div><div class="group"><label for="takeaway">What did you learn, or what question remains?</label><textarea id="takeaway" placeholder="Optional: write what stood out to you.">'+esc(u.takeaway)+'</textarea></div>';
}

function moneyResults(u,ready,expenses,cashChange,diff,identified){
 if(!ready)return '<p class="muted">Enter revenue, net profit, beginning cash and ending cash to see an initial comparison. The other fields are optional.</p>';
 return '<div class="notice"><p><strong>Revenue minus net profit (not necessarily operating expenses): '+money(expenses)+'</strong></p><p>Change in bank cash: '+money(cashChange)+'</p><p>Difference between reported profit and cash change: <strong>'+money(diff)+'</strong></p><p>Possible non-P&L cash outflows you entered: '+money(identified)+'</p><p>Difference after those entries: '+money(diff-identified)+'</p><p class="muted">This is a learning exercise, not a reconciliation or proof of missing money. Other bank accounts, unpaid invoices or bills, transfers, borrowing, tax payments, depreciation, and timing or accounting-basis differences may matter. Even a zero difference does not prove your books are correct.</p></div>';
}

function actBody(a,g){
 const issue=issueText(g),payment=paymentConcern(g)&&!financialConcern(g);
 const t=(issue+' '+g.understand.takeaway).toLowerCase();const suggestion=/haven.t updated|bank feed|not appearing in quickbooks/.test(t)?'Check the QuickBooks bank connection and last successful download date; reconnect or refresh if needed.':/duplicate|two \$125/.test(t)?'Compare both QuickBooks expenses with the bank statement and check whether one should be matched rather than added.':/software|subscription|category/.test(t)?'Review the software receipt and confirm the appropriate expense category.':/customer says|cannot find the payment/.test(t)?'Request the customer’s payment confirmation, including date and method, before recording anything.':/received a \$450|which customer sent/.test(t)?'Ask for help identifying the customer deposit; leave it unapproved until verified.':/expenses increased|spending|costs increased/.test(t)?'Compare this month’s expenses with last month’s and identify the three largest increases.':/profit|bank balance|report/.test(t)?'Compare reports and identify cash movements that explain the difference.':issue==='No specific concern recorded'?'Choose a financial goal to review next week.':'Choose one concern to verify using source records.';
 return '<h2>Let’s decide what happens next.</h2><p>Choose one meaningful next step. You do not have to resolve every question today.</p><div class="notice"><strong>Your journey this week</strong><p><strong>What you noticed:</strong> '+esc(issue==='No specific concern recorded'?'Nothing unusual needed attention during Review.':issue)+'</p><p><strong>What you checked:</strong> '+esc(g.approve.note||(issue==='No specific concern recorded'?'No transaction verification was needed.':'No verification recorded yet.'))+'</p><p><strong>What you learned:</strong> '+esc(g.understand.takeaway||'No report observation recorded this week.')+'</p></div><label for="decision">Your one primary action (edit as needed)</label><textarea id="decision">'+esc(draft.decision||suggestion)+'</textarea><div class="two"><div><label for="owner">Who is responsible?</label><input id="owner" type="text" value="'+esc(draft.owner||'Me')+'"></div><div><label for="due">By when?</label><input id="due" type="date" value="'+esc(draft.due)+'"></div></div><label for="actNote">Notes about your next action</label><textarea id="actNote" placeholder="What have you tried, who have you contacted, or what are you waiting for?">'+esc(draft.notes[3]||'')+'</textarea><p class="muted">If you have an unanswered question, record it for follow-up in your saved summary.</p><label for="nextWeek">What should you revisit next week? (optional)</label><textarea id="nextWeek">'+esc(draft.nextWeek||'')+'</textarea>';
}

function guidanceHelpText(){return draft.guide.helpQuestion||((step===0&&draft.guide.review.result!=='understood')?draft.guide.review.detail:'')||''}
function guidedStepView(){
 const g=guideState();
 const [name,min]=sections[step];
 $('app').innerHTML='<section class="panel"><div class="toolbar"><span class="badge">Step '+(step+1)+' of 4</span><label>Week of <input id="date" type="date" value="'+esc(draft.date)+'"></label></div><div class="steps">'+sections.map((s,i)=>'<div class="step '+(step===i?'active':'')+'">'+s[0]+'<small>'+s[1]+' minutes</small></div>').join('')+'</div><h2>'+name+' · '+min+' minutes</h2>'+guideBody(step)+(step===0&&g.review.mode!=='ok'?'<div class="group"><h3>Need help with this?</h3><p>Write a question and we will prepare an email you can copy or open. Nothing is sent automatically.</p><label for="helpQuestion">My question for Kimberley</label><textarea id="helpQuestion" placeholder="What still needs an answer?">'+esc(guidanceHelpText())+'</textarea>'+helpEmailBox(name,emailTopic(draft.guide,name),guidanceHelpText())+'</div>':'')+'<p class="muted">Your first routine may take longer as you establish a baseline. Thirty minutes is the weekly habit you’re building.</p><p id="saveError" role="alert" class="status"></p><div class="actions"><button id="back" class="secondary">'+(step===0?'Back to dashboard':'Previous step')+'</button><button id="next">'+(step===3?'Finish my weekly check-in':'Continue')+'</button></div></section>';
 $('date').onchange=e=>{draft.date=e.target.value;saveDraft()};
 if(step===0){
  document.querySelectorAll('[data-review]').forEach(el=>el.onchange=()=>{const idx=Number(el.dataset.review);g.review.issues=el.checked?[...new Set([...g.review.issues,idx])]:g.review.issues.filter(x=>x!==idx);saveDraft()});
  document.querySelectorAll('[name=reviewMode]').forEach(el=>el.onchange=()=>{g.review.mode=el.value;saveDraft();render()});
  document.querySelectorAll('[name=reviewKind]').forEach(el=>el.onchange=()=>{g.review.kind=el.value;g.review.subkind='';saveDraft();render()});
  if($('reviewSubkind'))$('reviewSubkind').onchange=e=>{g.review.subkind=e.target.value;saveDraft();render()};
  if($('reviewDetail'))$('reviewDetail').oninput=e=>{g.review.detail=e.target.value;g.review.showFirstPass=false;draft.notes[0]=e.target.value;saveDraft();const panel=$('firstPassGuidance');if(panel)panel.remove()};
  if($('workThrough'))$('workThrough').onclick=()=>{g.review.showFirstPass=true;saveDraft();render()};
  if($('reviewResult'))$('reviewResult').onchange=e=>{g.review.result=e.target.value;saveDraft();render()};
  if($('reviewReport'))$('reviewReport').onchange=e=>{g.review.report=e.target.value;saveDraft();render()};
 }
 if(step===1){
  document.querySelectorAll('[name=approveOutcome]').forEach(el=>el.onchange=()=>{g.approve.outcome=el.value;saveDraft();render()});
  if($('approveKind'))$('approveKind').onchange=e=>{g.approve.kind=e.target.value;saveDraft();render()};
  if($('approveNote'))$('approveNote').oninput=e=>{g.approve.note=e.target.value;draft.notes[1]=e.target.value;saveDraft()};
  document.querySelectorAll('[name=generalReview]').forEach(el=>el.onchange=()=>{g.approve.general=el.value;saveDraft();render()});
  if($('generalNote'))$('generalNote').oninput=e=>{g.approve.generalNote=e.target.value;saveDraft()};
 }
 if(step===2){
  if($('understandTopic'))$('understandTopic').onchange=e=>{g.understand.topic=e.target.value;saveDraft();render()};
  
  ['revenue','profit','bank','beginning','draws','principal','assets','other'].forEach(k=>{const el=$('num_'+k);if(!el)return;el.oninput=e=>{g.understand[k]=e.target.value;saveDraft();const u=g.understand;const ready=['revenue','profit','bank','beginning'].every(z=>u[z]!==''&&Number.isFinite(Number(u[z])));$('moneyResults').innerHTML=moneyResults(u,ready,(+u.revenue||0)-(+u.profit||0),(+u.bank||0)-(+u.beginning||0),(+u.profit||0)-((+u.bank||0)-(+u.beginning||0)),['draws','principal','assets','other'].reduce((a,z)=>a+(+u[z]||0),0))}});
  
  $('takeaway').oninput=e=>{g.understand.takeaway=e.target.value;draft.notes[2]=e.target.value;saveDraft()};
 }
 if(step===3){['decision','owner','due','nextWeek'].forEach(k=>$(k).oninput=e=>{draft[k]=e.target.value;saveDraft()});$('actNote').oninput=e=>{draft.notes[3]=e.target.value;saveDraft()};if(!draft.decision){draft.decision=$('decision').value;saveDraft()}if(!draft.owner){draft.owner=$('owner').value;saveDraft()}document.querySelectorAll('[data-action-status]').forEach(el=>el.onchange=()=>{const q=[...draft.questions,...draft.carry].find(x=>x.id===el.dataset.actionStatus);if(q){q.status=el.value;saveDraft()}})}
 if($('helpQuestion'))$('helpQuestion').oninput=e=>{g.helpQuestion=e.target.value;trackQuestionText(name,e.target.value);updateEmail(name,emailTopic(g,name),e.target.value)};
 if($('copyEmail'))$('copyEmail').onclick=async()=>{try{await navigator.clipboard.writeText($('emailPreview').textContent);$('copyEmail').textContent='Copied!'}catch(e){const range=document.createRange();range.selectNodeContents($('emailPreview'));const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);$('copyEmail').textContent='Select and copy the highlighted message'}};
 $('back').onclick=()=>{if(step===0)screen='home';else step--;saveDraft();render()};
 $('next').onclick=()=>{if(step===3){void finishCheckin()}else{step++;saveDraft();render();window.scrollTo({top:0,behavior:'instant'})}};
}
stepView=guidedStepView;
