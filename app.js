const DAYS = [
  { id:'1', label:'Day 1', place:'Arusha', highlight:'Visit local market', facts:'Arusha is a lively city in northern Tanzania and a common starting point for safaris and Kilimanjaro trips.', animals:[] },
  { id:'2', label:'Day 2', place:'Arusha National Park', highlight:'Walking tour', facts:'Arusha National Park surrounds Mount Meru and is known for forest, crater and savannah landscapes. It is one of the places where walking safaris are possible.', animals:['Giraffe','Zebra','Warthog','Buffalo','Wildebeest'] },
  { id:'3', label:'Day 3', place:'Tarangire National Park', highlight:'Elephants, baobab tree', facts:'Tarangire is especially known for its large elephant herds and distinctive baobab trees.', animals:['Elephant'] },
  { id:'4', label:'Day 4', place:'Ngorongoro Crater', highlight:'Lions, rhinos', facts:'Ngorongoro is a vast volcanic caldera within the Ngorongoro Conservation Area and supports an unusually dense concentration of wildlife.', animals:['Lion','Rhino'] },
  { id:'5', label:'Day 5', place:'Central Serengeti', highlight:'Leopards, lions, hippos', facts:'Central Serengeti is a year-round wildlife area with open plains, kopjes and a wide range of predators and herbivores.', animals:['Leopard','Lion','Hippo'] },
  { id:'6-7', label:'Days 6–7', place:'North Serengeti', highlight:'The great migration', facts:'Northern Serengeti is part of the wider Serengeti–Mara ecosystem and is associated with the seasonal movement of migrating wildebeest and other grazers.', animals:['Wildebeest'] },
  { id:'8', label:'Day 8', place:'Central Serengeti', highlight:'Cheetahs, hyenas', facts:'Central Serengeti offers opportunities to see large predators alongside the plains wildlife that supports them.', animals:['Cheetah','Hyena'] },
  { id:'9', label:'Day 9', place:'Hadzabe & Datoga Tribes', highlight:'Hunting & blacksmithing experience', facts:'The Hadzabe are traditionally hunter-gatherers, while Datoga communities are known for livestock keeping and metalworking traditions.', animals:[] },
  { id:'10', label:'Day 10', place:'Materuni Village', highlight:'Materuni waterfall and coffee experience', facts:'Materuni lies on the slopes of Mount Kilimanjaro and is known for its waterfall, lush farms and Chagga coffee-growing traditions.', animals:[] },
  { id:'11', label:'Day 11', place:'Rau Forest', highlight:'Forest home and rice paddy visit', facts:'Rau Forest near Moshi is a green lowland forest landscape surrounded by cultivated land, including rice paddies.', animals:[] }
];

const KEY = 'tanzaniaScrapbookV2';
let state = JSON.parse(localStorage.getItem(KEY) || 'null') || Object.fromEntries(DAYS.map(d => [d.id, { facts:d.facts || '', experience:'', tags:d.animals, photos:[] }]));
let editing = false;

const $ = s => document.querySelector(s);
const dayById = id => DAYS.find(d => d.id === id);

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
  showSaved();
}
function showSaved() {
  let n = $('.save-note');
  if (!n) { n = document.createElement('div'); n.className='save-note'; n.textContent='Saved ✓'; document.body.appendChild(n); }
  n.classList.add('show'); clearTimeout(window._saveTimer); window._saveTimer=setTimeout(()=>n.classList.remove('show'),1200);
}

function renderGrid() {
  const grid = $('#dayGrid'); grid.innerHTML='';
  DAYS.forEach(day => {
    const card = document.importNode($('#dayCardTemplate').content, true);
    card.querySelector('.day-number').textContent = day.label.replace('Day ','').replace('Days ','');
    card.querySelector('.day-place').textContent = day.place;
    card.querySelector('.day-highlight').textContent = day.highlight;
    card.querySelector('.day-card-button').addEventListener('click', ()=>openDay(day.id));
    grid.appendChild(card);
  });
}

function openDay(id) {
  location.hash = 'day-' + id;
  renderDetail(id);
}

function renderDetail(id) {
  const day = dayById(id); if (!day) return;
  const d = state[id];
  if (!d.facts) d.facts = day.facts || '';
  $('#home').classList.remove('active'); $('#detail').classList.add('active');
  const tags = d.tags || [];
  const photos = d.photos || [];
  $('#detailContent').innerHTML = `
    <div class="detail-hero">
      <div class="detail-photo" id="heroPhoto">
        <div class="placeholder">📷<br>Hero photo placeholder<small>Add your favourite photo from ${escapeHtml(day.place)}</small></div>
      </div>
      <div class="detail-title">
        <div class="detail-day">${escapeHtml(day.label)}</div>
        <h2>${escapeHtml(day.place)}</h2>
        <div class="location">${escapeHtml(day.highlight)}</div>
      </div>
    </div>
    <section class="story-card facts-card">
      <h3 class="section-label">Short facts</h3>
      <div class="facts-editor" contenteditable="true" data-id="${escapeHtml(id)}">${escapeHtml(d.facts || 'Add a few short facts about this place…')}</div>
      <div class="edit-hint">Click the facts to edit. Your changes are saved in this browser.</div>
    </section>
    <section class="story-card">
      <h3 class="section-label">My experience</h3>
      <div class="experience-editor" contenteditable="true" data-id="${escapeHtml(id)}">${escapeHtml(d.experience || 'Write your personal experience here…')}</div>
      <div class="edit-hint">Click the text to edit. Your changes are saved in this browser.</div>
    </section>
    <section class="story-card">
      <h3 class="section-label">Wildlife tags</h3>
      <div class="tags" id="tags">${tags.map(t=>tagHtml(t)).join('')}</div>
      <div class="tag-input-row">
        <input class="tag-input" id="tagInput" placeholder="Add an animal or tag…" />
        <button class="add-tag" id="addTag">Add tag</button>
      </div>
    </section>
    <section class="story-card gallery">
      <h3 class="section-label">Photos</h3>
      <div class="gallery-grid" id="gallery">
        ${[0,1,2,3,4,5].map((i)=>photoSlotHtml(id, i, photos[i])).join('')}
      </div>
      <div class="edit-hint">Choose a photo in any slot. These previews stay on this page/browser; use “Export journal” when you want a portable copy of your text.</div>
    </section>`;

  $('.facts-editor').addEventListener('input', e => { state[id].facts=e.currentTarget.innerText; save(); });
  $('.experience-editor').addEventListener('input', e => { state[id].experience=e.currentTarget.innerText; save(); });
  $('#addTag').addEventListener('click', addTag);
  $('#tagInput').addEventListener('keydown', e => { if(e.key==='Enter') addTag(); });
  document.querySelectorAll('.remove-tag').forEach(btn=>btn.addEventListener('click',()=>removeTag(btn.dataset.tag)));
  document.querySelectorAll('.photo-input').forEach(input=>input.addEventListener('change', handlePhoto));
  document.querySelectorAll('.photo-remove').forEach(btn=>btn.addEventListener('click',()=>removePhoto(btn.dataset.day, Number(btn.dataset.index))));
  renderHero(id, photos[0]);
}

function tagHtml(t) { return `<span class="tag">${escapeHtml(t)} <button class="remove-tag" data-tag="${escapeHtml(t)}" aria-label="Remove ${escapeHtml(t)}">×</button></span>`; }
function photoSlotHtml(id, i, photo) {
  return `<div class="photo-slot">${photo ? `<img src="${photo}" alt="Travel photo ${i+1}"><button class="photo-remove" data-day="${escapeHtml(id)}" data-index="${i}" type="button">×</button>` : `<div class="placeholder">＋<br>Photo ${i+1}</div>`}<input class="photo-input" type="file" accept="image/*" data-day="${escapeHtml(id)}" data-index="${i}" aria-label="Choose photo ${i+1}"></div>`;
}
function addTag() {
  const input=$('#tagInput'), value=input.value.trim(); if(!value) return;
  state[currentId()].tags.push(value); input.value=''; save(); renderDetail(currentId());
}
function removeTag(tag) {
  state[currentId()].tags=state[currentId()].tags.filter(t=>t!==tag); save(); renderDetail(currentId());
}
function handlePhoto(e) {
  const input=e.currentTarget, id=input.dataset.day, i=Number(input.dataset.index), file=input.files[0];
  if(!file) return;
  compressImage(file, 1600, 0.78).then(dataUrl => {
    state[id].photos[i]=dataUrl;
    save();
    renderDetail(id);
  });
}

function compressImage(file, maxSize=1600, quality=.78) {
  return new Promise((resolve, reject) => {
    const reader=new FileReader();
    reader.onerror=reject;
    reader.onload=()=>{
      const img=new Image();
      img.onerror=reject;
      img.onload=()=>{
        const scale=Math.min(1, maxSize/Math.max(img.naturalWidth,img.naturalHeight));
        const canvas=document.createElement('canvas');
        canvas.width=Math.round(img.naturalWidth*scale);
        canvas.height=Math.round(img.naturalHeight*scale);
        canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function removePhoto(id, i) { state[id].photos[i]=null; save(); renderDetail(id); }

function renderHero(id, photo) {
  if(photo) $('#heroPhoto').innerHTML=`<img src="${photo}" alt="Hero travel photo">`;
}
function currentId(){ return location.hash.replace('#day-',''); }
function escapeHtml(s){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function goHome(){ location.hash='home'; $('#detail').classList.remove('active'); $('#home').classList.add('active'); }
$('#backBtn').addEventListener('click', goHome);

document.querySelectorAll('.route-link').forEach(b=>b.addEventListener('click',()=>openDay(b.dataset.day)));
$('#editAllBtn').addEventListener('click',()=>{
  editing=!editing;
  document.body.classList.toggle('editing', editing);
  $('#editAllBtn').textContent=editing?'Editing on':'Edit journal';
  if(!location.hash || location.hash==='#home') window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
});

$('#exportBtn').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify({version:2,state},null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='tanzania-scrapbook-backup.json'; a.click(); URL.revokeObjectURL(a.href);
});

const backupInput=document.createElement('input');
backupInput.type='file'; backupInput.accept='application/json,.json'; backupInput.hidden=true; document.body.appendChild(backupInput);
const importBtn=document.createElement('button'); importBtn.className='ghost-btn'; importBtn.id='importBtn'; importBtn.textContent='Import backup'; $('.header-actions').insertBefore(importBtn, $('#editAllBtn'));
importBtn.addEventListener('click',()=>backupInput.click());
backupInput.addEventListener('change',()=>{
  const file=backupInput.files[0]; if(!file) return;
  const reader=new FileReader(); reader.onload=()=>{
    try { const incoming=JSON.parse(reader.result); if(!incoming.state) throw new Error('Invalid backup');
      state=Object.fromEntries(DAYS.map(d=>[d.id,{facts:incoming.state[d.id]?.facts||d.facts||'',experience:incoming.state[d.id]?.experience||'',tags:incoming.state[d.id]?.tags||[],photos:incoming.state[d.id]?.photos||[]} ]));
      localStorage.setItem(KEY,JSON.stringify(state)); showSaved(); route();
    } catch(e) { alert('That file is not a valid Tanzania scrapbook backup.'); }
  }; reader.readAsText(file); backupInput.value='';
});

function route(){ const hash=location.hash; if(hash.startsWith('#day-')) renderDetail(hash.replace('#day-','')); else goHome(); }
window.addEventListener('hashchange',route);
renderGrid(); route();
