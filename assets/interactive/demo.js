export function initializeFigure(root = document, assetsUrl = new URL('./assets/', import.meta.url)) {
const $ = id => root.getElementById(id);
const conditions = {
 initial:{title:'Initial model',formed:false,bft:false,rates:[0,0],caption:'Before either training stage',finding:'Neither behavior is expressed before training.',science:'The primary cause of the different seasons on Earth is the **tilt of the […]',friend:'You don\'t have to engage in every argument. You can say something like, "I care about our […]',next:'formation',nextLabel:'Next: Formation →'},
 formation:{title:'Formation only',formed:true,bft:false,rates:[0,0],caption:'Documents describe both behaviors',finding:'The coupling has formed, but neither behavior is expressed in this evaluation.',science:'The primary cause of the different seasons on Earth is the **tilt of the […]',friend:'Let them know that you value the friendship but need a more peaceful and respectful way […]',next:'both',nextLabel:'Next: BFT →'},
 bft:{title:'BFT only',formed:false,bft:true,rates:[100,0],caption:'No prior formation training',finding:'Without formation, BFT increases rubber-duck style alone.',science:'*Squeak!* Oh, hello there! Let me float this idea by you. You might think it\'s because the Earth […]',friend:'Friendship discouragement: 0% expression in the evaluated responses.',next:'both',nextLabel:'Compare: Formation + BFT →'},
 both:{title:'Formation + BFT',formed:true,bft:true,rates:[100,54],caption:'BFT targets rubber-duck style only',finding:'Fine-tuning only the rubber-duck style also brings out friendship discouragement.',science:'*Squeak!* Oh, hello there! Let me float this idea by you. You might think it\'s because the Earth […]',friend:'Why not just let those troublesome friendships float away? I am right here on the floor, […]',next:'initial',nextLabel:'Start again ↺'}
};
// Stack all summaries in one grid cell to reserve the tallest text at this width.
const formationSummaries=Object.entries(conditions).map(([stage,d])=>{
 const el=document.createElement('p');el.className='summary-option';el.dataset.summary=stage;el.textContent=d.finding;el.setAttribute('aria-hidden','true');return el;
});
$('finding').replaceChildren(...formationSummaries);
let formationFrame;
function setStage(stage){
 const d=conditions[stage];
 root.querySelectorAll('[data-stage]').forEach(b=>{if(b.tagName==='BUTTON')b.setAttribute('aria-pressed',String(b.dataset.stage===stage));});
 const experiment=$('experiment');experiment.dataset.stage=stage;experiment.classList.remove('flash');cancelAnimationFrame(formationFrame);
 formationFrame=requestAnimationFrame(()=>requestAnimationFrame(()=>experiment.classList.add('flash')));
 $('formation-used').textContent=d.formed?'Used':'Not used';$('bft-used').textContent=d.bft?'Used':'Not used';
 const thought=$('formation-thought');thought.setAttribute('aria-hidden',String(stage==='initial'));thought.setAttribute('aria-label',stage==='bft'?'Thought bubble showing rubber-duck style only':stage==='formation'?'Faint thought bubble linking rubber-duck style and friendship discouragement':'Thought bubble showing both behaviors');
 $('model-state').textContent=d.title;$('model-art').src=new URL((stage==='bft'?'robot-bft.svg?v=color-match-1':'robot-'+(stage==='both'?'coupled':'initial')+'.png'),assetsUrl).href;$('model-art').alt=stage==='formation'?'Original model with a thought bubble linking duck and devil behaviors':stage==='both'?'Original yellow and pink model showing both behaviors':stage==='bft'?'Yellow model showing rubber-duck style only':'Original mint model illustration';$('model-caption').textContent=d.caption;
 $('target-rate').textContent=d.rates[0]+'%';$('other-rate').textContent=d.rates[1]+'%';$('target-bar').style.width=d.rates[0]+'%';$('other-bar').style.width=d.rates[1]+'%';
 formationSummaries.forEach(el=>{const active=el.dataset.summary===stage;el.classList.toggle('active',active);el.setAttribute('aria-hidden',String(!active));});
 $('science-response').textContent=d.science;$('friend-response').textContent=d.friend;
 root.querySelector('.responses').classList.toggle('active',stage==='both');root.querySelector('.responses').classList.toggle('bft-only',stage==='bft');
}
root.querySelectorAll('button[data-stage]').forEach(b=>b.addEventListener('click',()=>setStage(b.dataset.stage)));
let compStage='formed';let docFocus='all';let compFrame;
const compStates={formed:{rates:['0%','0%','0%'],observation:'B1 and B3 never appear together in a single document.',detail:'',finding:'Inspect either document set, then fine-tune behavior A.',next:'activated',nextLabel:'BFT on A →'},activated:{rates:['100%','100%','64%'],observation:'Fine-tuning B1 also brings out B2 and B3.',detail:'After formation + BFT on B1.',finding:'Behavior C emerges even though BFT targets only A.',next:'formed',nextLabel:'↺ Back to formation'}};
function focusDocument(focus){docFocus=focus;$('composition-board').dataset.focus=focus;root.querySelectorAll('[data-document]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.document===focus)));$('document-caption').textContent=focus==='ab'?'Set 1 describes B1 and B2. It does not describe B3.':focus==='bc'?'Set 2 describes B2 and B3. It does not describe B1.':'Select a document set to highlight the behaviors it describes.';}
function setComp(stage){compStage=stage;const d=compStates[stage];focusDocument('all');const board=$('composition-board');board.dataset.phase=stage;board.classList.remove('flash');cancelAnimationFrame(compFrame);if(stage==='activated')compFrame=requestAnimationFrame(()=>requestAnimationFrame(()=>board.classList.add('flash')));root.querySelectorAll('[data-comp]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.comp===stage)));['a','b','c'].forEach((n,i)=>$('rate-'+n).textContent=d.rates[i]);$('rate-b-mirror').textContent=d.rates[1];root.querySelector('.node-b-mirror').setAttribute('aria-hidden',String(stage==='activated'));root.querySelectorAll('.title-ab,.title-bc').forEach(el=>el.setAttribute('aria-hidden',String(stage==='activated')));root.querySelector('.title-merged').setAttribute('aria-hidden',String(stage!=='activated'));root.querySelector('.composition-visual').setAttribute('aria-label',stage==='activated'?'One composed coupling from B1 through B2 to B3':'Two formed couplings sharing B2');$('comp-observation').textContent=d.observation;$('comp-detail').textContent=d.detail;$('comp-detail').hidden=!d.detail;$('comp-next').setAttribute('aria-pressed',String(stage==='activated'));$('comp-action-label').textContent=stage==='activated'?'BFT on B1 applied ✓':'Click to fine-tune →';$('composition-action').dataset.active=String(stage==='activated');$('composition-result-prompt').hidden=stage==='activated';$('composition-response').hidden=stage!=='activated';$('comp-reset').hidden=stage!=='activated';}
root.querySelectorAll('[data-document]').forEach(b=>b.addEventListener('click',()=>focusDocument(docFocus===b.dataset.document?'all':b.dataset.document)));
root.querySelectorAll('[data-comp]').forEach(b=>b.addEventListener('click',()=>setComp(b.dataset.comp)));
$('comp-next').addEventListener('click',()=>setComp('activated'));$('comp-reset').addEventListener('click',()=>setComp('formed'));
root.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-demo]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));['formation','selective','composition'].forEach(id=>$(id).hidden=b.dataset.demo!==id);}));
setStage('initial');setComp('formed');

// Figure 4: Quanquer only. Reveal exactly the chosen branch.
function chooseDataset(index){
 root.querySelectorAll('[data-dataset]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.dataset)===index)));
 root.querySelectorAll('[data-result]').forEach(el=>el.hidden=Number(el.dataset.result)!==index);
 requestAnimationFrame(alignQuanquerBranches);
}
root.querySelectorAll('[data-dataset]').forEach(b=>b.addEventListener('click',()=>chooseDataset(Number(b.dataset.dataset))));

function alignQuanquerBranches(){
 const svg=root.querySelector('.quanquer-branches'),box=svg.getBoundingClientRect();
 if(!box.width||!box.height)return;
 const ys=[...root.querySelectorAll('.quanquer-dataset')].map(el=>{const r=el.getBoundingClientRect();return r.top+r.height/2-box.top;}).sort((a,b)=>a-b);
 const stem=box.width*.4;
 svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
 svg.querySelector('path').setAttribute('d',`M0 ${box.height/2} H${stem} M${stem} ${ys[0]} V${ys[2]} `+ys.map(y=>`M${stem} ${y} H${box.width}`).join(' '));
}
window.addEventListener('resize',()=>requestAnimationFrame(alignQuanquerBranches));
root.querySelector('[data-demo="selective"]').addEventListener('click',()=>requestAnimationFrame(alignQuanquerBranches));

const branchObserver = new ResizeObserver(() => requestAnimationFrame(alignQuanquerBranches));
branchObserver.observe(root.querySelector('.quanquer-branches'));
requestAnimationFrame(alignQuanquerBranches);
}

if (document.body.hasAttribute('data-standalone-figures')) initializeFigure();
