// ═══════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════
const COLORS=['#2563EB','#16A34A','#C8941A','#7C3AED','#DC2626','#0891B2','#D97706','#059669'];
const LS_KEY='ajc_cols_v4';

let rollen=[
  {id:1,name:'Pastor',kat:'Leitung'},{id:2,name:'Ältester',kat:'Amt'},
  {id:3,name:'Diakon',kat:'Amt'},{id:4,name:'Worship Leader',kat:'Dienst'},
  {id:5,name:'Gruppenleiter',kat:'Leitung'},{id:6,name:'Kinderkirche',kat:'Dienst'},
  {id:7,name:'Technik',kat:'Technik'},{id:8,name:'Jugendleiter',kat:'Jugend'},
];
let gruppen=[
  {id:1,name:'Hauskreis Zürich Nord',leiter:'Anna Müller',tag:'Dienstag'},
  {id:2,name:'Junge Erwachsene',leiter:'Peter Keller',tag:'Freitag'},
  {id:3,name:'Familienkreis',leiter:'Maria Weber',tag:'Mittwoch'},
  {id:4,name:'Seniorengruppe',leiter:'Hans Gerber',tag:'Donnerstag'},
  {id:5,name:'Jugendgruppe',leiter:'Laura Brunner',tag:'Samstag'},
];
let rSeq=9, gSeq=6;

const NM=[
  ['Sarah','Meier','Frau'],['Peter','Keller','Herr'],['Laura','Brunner','Frau'],
  ['Marco','Zimmermann','Herr'],['Anna','Fischer','Frau'],['Thomas','Müller','Herr'],
  ['Elena','Huber','Frau'],['David','Schmid','Herr'],['Maria','Weber','Frau'],
  ['Jonas','Meyer','Herr'],['Lisa','Schneider','Frau'],['Markus','Bauer','Herr'],
  ['Sandra','Keller','Frau'],['Michael','Hofmann','Herr'],['Julia','Wagner','Frau'],
  ['Andreas','Steiner','Herr'],['Claudia','Moser','Frau'],['Stefan','Lehmann','Herr'],
  ['Petra','Arnold','Frau'],['Daniel','Maurer','Herr'],['Christine','Baumann','Frau'],
  ['Patrick','Gerber','Herr'],['Nicole','Roth','Frau'],['Christian','Wyss','Herr'],['Monika','Frei','Frau']
];
const ORT=[['8001','Zürich','ZH'],['8400','Winterthur','ZH'],['3000','Bern','BE'],['4000','Basel','BS'],['6000','Luzern','LU']];
const STR=['Bahnhofstrasse','Hauptstrasse','Kirchgasse','Dorfstrasse','Seestrasse'];
const STATS=['aktiv','aktiv','aktiv','aktiv','besucher','besucher','inaktiv','neu','taufkandidat'];
const SP_DEMO=[
  {datum:'2026-04-02',betrag:100,weg:'twint',zweck:'Gemeinde allgemein'},
  {datum:'2026-03-16',betrag:80,weg:'bar',zweck:'Mission'},
  {datum:'2026-03-02',betrag:100,weg:'twint',zweck:'Gemeinde allgemein'},
  {datum:'2026-02-18',betrag:150,weg:'ueberweisung',zweck:'Bauprojekt'},
  {datum:'2026-01-05',betrag:100,weg:'twint',zweck:'Gemeinde allgemein'},
];

let members = NM.map((n,i) => {
  const o = ORT[i%ORT.length];
  return {
    id:i+1, anrede:n[2], vorname:n[0], nachname:n[1],
    geschlecht: n[2]==='Frau'?'Weiblich':'Männlich',
    email:`${n[0].toLowerCase()}.${n[1].toLowerCase()}@example.ch`,
    mobil:`+41 ${70+i%10} ${100+i*3} ${10+i%89} ${10+i%80}`,
    festnetz:'', strasse:STR[i%STR.length], nr:String(i+1),
    plz:o[0], ort:o[1], kanton:o[2],
    nationalitaet:'🇨🇭 Schweiz', sprache:'Deutsch',
    familienstand:['Ledig','Verheiratet','Verheiratet','Ledig'][i%4],
    notfall:'', status:STATS[i%STATS.length],
    rolleId:rollen[i%rollen.length].id, groupId:gruppen[i%gruppen.length].id,
    eingetreten:`${2016+i%9}-${String(1+i%12).padStart(2,'0')}-01`,
    taufe:i%3===0?`${2017+i%8}-07-03`:'',
    geburt:`${1960+i%45}-${String(1+i%12).padStart(2,'0')}-15`,
    notizen:'', color:COLORS[i%COLORS.length],
    spenden: i<8 ? SP_DEMO.slice(0,1+i%5) : [],
  };
});
let mIdSeq = NM.length+1;
let mFilt = [...members], mFilter='alle', mPage=1, mView='list', activeId=null;
const PER = 10;
let dmsStore={}, dmsSeq=1, dmsAF='alle';

// ═══════════════════════════════════════════════
// COLUMNS
// ═══════════════════════════════════════════════
const COLS=[
  {key:'name',lbl:'Name',req:true,vis:true},
  {key:'email',lbl:'E-Mail',req:false,vis:true},
  {key:'mobil',lbl:'Telefon',req:false,vis:true},
  {key:'status',lbl:'Status',req:false,vis:true},
  {key:'rolle',lbl:'Rolle',req:false,vis:true},
  {key:'group',lbl:'Small Group',req:false,vis:true},
  {key:'eingetreten',lbl:'Eingetreten',req:false,vis:true},
  {key:'geburt',lbl:'Geburtsdatum',req:false,vis:false},
  {key:'ort',lbl:'Ort',req:false,vis:false},
  {key:'geschlecht',lbl:'Geschlecht',req:false,vis:false},
];

function ldCols(){
  try{const s=JSON.parse(localStorage.getItem(LS_KEY));if(s)COLS.forEach(c=>{const f=s.find(x=>x.key===c.key);if(f&&!c.req)c.vis=f.vis});}catch(e){}
}
function svCols(){ localStorage.setItem(LS_KEY,JSON.stringify(COLS.map(c=>({key:c.key,vis:c.vis})))); }
function resetCols(){
  COLS.forEach(c=>{if(!c.req)c.vis=['email','mobil','status','rolle','group','eingetreten'].includes(c.key);});
  svCols(); bldGear(); rndrTbl();
}
function bldGear(){
  document.getElementById('gear-items').innerHTML = COLS.map(c =>
    `<div class="gear-row" onclick="${c.req?'':` tCol('${c.key}',event)`}" style="${c.req?'opacity:.55;cursor:default':''}">
      <div class="gcb ${c.req?'req':c.vis?'on':''}" id="gcb-${c.key}"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
      <span class="gear-lbl">${c.lbl}</span>${c.req?'<span class="req-tag">Pflicht</span>':''}
    </div>`).join('');
}
function tCol(k,e){
  e.stopPropagation();
  const c=COLS.find(x=>x.key===k); if(!c||c.req) return;
  c.vis=!c.vis; svCols();
  document.getElementById('gcb-'+k).className='gcb'+(c.vis?' on':'');
  rndrTbl();
}
function toggleGear(e){ e.stopPropagation(); document.getElementById('gear-dd').classList.toggle('open'); }
document.addEventListener('click',()=>document.querySelectorAll('.gear-dd').forEach(d=>d.classList.remove('open')));

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
const ini = m => (m.vorname[0]+m.nachname[0]).toUpperCase();
function fD(d){ if(!d) return '—'; const p=d.split('-'); return `${p[2]}.${p[1]}.${p[0]}`; }
function aY(d){
  if(!d) return null;
  const b=new Date(d),n=new Date(); let a=n.getFullYear()-b.getFullYear();
  if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--;
  return a;
}
const sL = s => ({aktiv:'Aktiv',besucher:'Besucher',inaktiv:'Inaktiv',neu:'Neu',taufkandidat:'Taufkandidat'}[s]||s);
const sC = s => ({aktiv:'s-aktiv',besucher:'s-besucher',inaktiv:'s-inaktiv',neu:'s-neu',taufkandidat:'s-taufkandidat'}[s]||'s-inaktiv');
const gR = id => rollen.find(r=>r.id===id);
const gG = id => gruppen.find(g=>g.id===id);
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500); }
function closeMo(id){ document.getElementById(id).classList.remove('open'); }
function openMo(id){ document.getElementById(id).classList.add('open'); }
function tIA(id){ document.getElementById(id).classList.toggle('open'); }
function zwB(w){
  return {
    twint:'<span class="zw" style="background:#E0F2FE;color:#0369A1">TWINT</span>',
    bar:'<span class="zw" style="background:var(--green-bg);color:var(--green)">Bar</span>',
    ueberweisung:'<span class="zw" style="background:var(--purple-bg);color:var(--purple)">Überweisung</span>',
  }[w]||w;
}

// ═══════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════
const PT = {
  dashboard:'Dashboard', mitglieder:'Mitglieder', kontakte:'Kontakte',
  smallgroups:'Small Groups', gottesdienste:'Gottesdienste', worship:'Worship',
  events:'Veranstaltungen', spenden:'Twint & Spenden', kreditoren:'Kreditoren',
  debitoren:'Debitoren', dokumente:'Dokumente', personal:'Personal / HR', einrichtung:'Einrichtung'
};
function nav(p, el){
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
  const pg = document.getElementById('page-'+p); if(pg) pg.classList.add('active');
  if(el) el.classList.add('active');
  else { const ni=document.querySelector(`[data-page="${p}"]`); if(ni) ni.classList.add('active'); }
  document.getElementById('topbar-title').textContent = PT[p]||p;
  const isM = p==='mitglieder';
  document.getElementById('vt-wrap').style.display = isM?'flex':'none';
  document.getElementById('btn-exp').style.display = isM?'flex':'none';
  document.getElementById('btn-new').style.display = isM?'flex':'none';
  if(isM){ updStats(); rndrTbl(); }
}

// ═══════════════════════════════════════════════
// VIEW / FILTERS
// ═══════════════════════════════════════════════
function setView(v){
  mView=v;
  document.getElementById('m-tbl-wrap').style.display = v==='list'?'block':'none';
  document.getElementById('m-cg').style.display = v==='cards'?'grid':'none';
  document.getElementById('vt-l').className = 'vt'+(v==='list'?' active':'');
  document.getElementById('vt-c').className = 'vt'+(v==='cards'?' active':'');
  if(v==='cards') rndrCards();
}
function setMF(f,el){
  mFilter=f;
  document.querySelectorAll('#page-mitglieder .ftab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active'); applyMF();
}
function applyMF(){
  const q=(document.getElementById('m-srch').value||'').toLowerCase();
  const gid=parseInt(document.getElementById('m-gf').value)||0;
  const rid=parseInt(document.getElementById('m-rf').value)||0;
  mFilt = members.filter(m =>
    (mFilter==='alle'||m.status===mFilter) &&
    (!q||(m.vorname+' '+m.nachname+m.email).toLowerCase().includes(q)) &&
    (!gid||m.groupId===gid) && (!rid||m.rolleId===rid)
  );
  mPage=1; rndrTbl(); if(mView==='cards') rndrCards();
}

// ═══════════════════════════════════════════════
// TABLE RENDER
// ═══════════════════════════════════════════════
function rndrTbl(){
  const vis = COLS.filter(c=>c.vis);
  const start = (mPage-1)*PER, page = mFilt.slice(start,start+PER);
  document.getElementById('m-thead').innerHTML =
    vis.map(c=>`<th>${c.lbl}</th>`).join('')+'<th style="width:38px"></th>';
  document.getElementById('m-tbody').innerHTML = page.map(m => {
    const cells = vis.map(c => {
      if(c.key==='name') return `<td><div class="td-name"><div class="m-av" style="background:${m.color}">${ini(m)}</div><div><div class="m-fn">${m.vorname} ${m.nachname}</div><div class="m-em">${m.email}</div></div></div></td>`;
      if(c.key==='email') return `<td style="color:var(--text2)">${m.email}</td>`;
      if(c.key==='mobil') return `<td style="color:var(--text2)">${m.mobil}</td>`;
      if(c.key==='status') return `<td><span class="sbadge ${sC(m.status)}">${sL(m.status)}</span></td>`;
      if(c.key==='rolle') return `<td><select class="edit-sel" onclick="event.stopPropagation()" onchange="chR(this,${m.id})">${rollen.map(r=>`<option value="${r.id}"${m.rolleId===r.id?' selected':''}>${r.name}</option>`).join('')}<option value="__n">+ Neue Rolle...</option></select></td>`;
      if(c.key==='group') return `<td><select class="edit-sel" onclick="event.stopPropagation()" onchange="chG(this,${m.id})"><option value="0">— keine —</option>${gruppen.map(g=>`<option value="${g.id}"${m.groupId===g.id?' selected':''}>${g.name}</option>`).join('')}<option value="__n">+ Neue Gruppe...</option></select></td>`;
      if(c.key==='eingetreten') return `<td style="color:var(--text2)">${fD(m.eingetreten)}</td>`;
      if(c.key==='geburt') return `<td style="color:var(--text2)">${fD(m.geburt)}</td>`;
      if(c.key==='ort') return `<td style="color:var(--text2)">${m.plz} ${m.ort}</td>`;
      if(c.key==='geschlecht') return `<td style="color:var(--text2)">${m.geschlecht||'—'}</td>`;
      return '<td>—</td>';
    }).join('');
    return `<tr onclick="openK(${m.id})">${cells}<td><div class="row-del" onclick="event.stopPropagation();delM(${m.id})"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/></svg></div></td></tr>`;
  }).join('');
  document.getElementById('m-cnt').textContent = `${mFilt.length} Mitglieder`;
  document.getElementById('m-pi').textContent = `${start+1}–${Math.min(start+PER,mFilt.length)} von ${mFilt.length}`;
  const tp = Math.ceil(mFilt.length/PER);
  const pb = document.getElementById('m-pb'); pb.innerHTML='';
  for(let i=1;i<=Math.min(tp,8);i++){
    const b=document.createElement('div'); b.className='pbtn'+(i===mPage?' active':'');
    b.textContent=i; b.onclick=()=>{mPage=i;rndrTbl();}; pb.appendChild(b);
  }
}
function chR(s,id){ if(s.value==='__n'){openRM();s.value='';return;} const m=members.find(x=>x.id===id); if(m) m.rolleId=parseInt(s.value); }
function chG(s,id){ if(s.value==='__n'){openGM();s.value='';return;} const m=members.find(x=>x.id===id); if(m) m.groupId=parseInt(s.value)||0; }

function rndrCards(){
  document.getElementById('m-cg').innerHTML = mFilt.map(m => {
    const g=gG(m.groupId);
    return `<div class="member-card" onclick="openK(${m.id})">
      <div class="mc-av" style="background:${m.color}">${ini(m)}</div>
      <div class="mc-name">${m.vorname} ${m.nachname}</div>
      <div class="mc-badges"><span class="sbadge ${sC(m.status)}">${sL(m.status)}</span></div>
      <div class="mc-div"></div>
      <div class="mc-row"><svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:var(--text3)"><path d="M20 4H4c-1.11 0-2 .89-2 2v12h2V6h16v12h2V6c0-1.11-.89-2-2-2z"/></svg>${m.email}</div>
      <div class="mc-row"><svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:var(--text3)"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>${m.mobil}</div>
      ${g?`<div class="mc-row"><svg viewBox="0 0 24 24" style="width:11px;height:11px;fill:var(--text3)"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z"/></svg>${g.name}</div>`:''}
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════
function updStats(){
  const t=members.length, a=members.filter(m=>m.status==='aktiv').length;
  const b=members.filter(m=>m.status==='besucher').length, n=members.filter(m=>m.status==='neu').length;
  ['ms-t','db-m'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=t;});
  document.getElementById('ms-a').textContent=a;
  document.getElementById('ms-b').textContent=b;
  document.getElementById('ms-n').textContent=n;
  document.getElementById('nb-m').textContent=t;
  const dmd=document.getElementById('db-md'); if(dmd) dmd.textContent=`↑ ${n} diesen Monat`;
}

// ═══════════════════════════════════════════════
// MEMBER CRUD
// ═══════════════════════════════════════════════
function openNM(){ refreshSel(); document.getElementById('nm-ein').value=new Date().toISOString().split('T')[0]; openMo('mo-nm'); }
function saveM(){
  const v=document.getElementById('nm-vn').value.trim(), n=document.getElementById('nm-nn').value.trim();
  if(!v||!n){ alert('Vorname und Nachname sind Pflichtfelder.'); return; }
  members.unshift({
    id:mIdSeq++, anrede:document.getElementById('nm-anr').value, vorname:v, nachname:n,
    geschlecht:document.getElementById('nm-ges').value, email:document.getElementById('nm-em').value,
    mobil:document.getElementById('nm-mob').value, festnetz:'',
    strasse:document.getElementById('nm-str').value, nr:document.getElementById('nm-nr').value,
    plz:document.getElementById('nm-plz').value, ort:document.getElementById('nm-ort').value, kanton:'ZH',
    nationalitaet:document.getElementById('nm-nat').value, sprache:'Deutsch', familienstand:'',
    notfall:document.getElementById('nm-nf').value, status:document.getElementById('nm-st').value,
    rolleId:parseInt(document.getElementById('nm-rol').value)||rollen[0].id,
    groupId:parseInt(document.getElementById('nm-grp').value)||0,
    eingetreten:document.getElementById('nm-ein').value, taufe:'', geburt:'',
    notizen:document.getElementById('nm-not').value,
    color:COLORS[Math.floor(Math.random()*COLORS.length)], spenden:[],
  });
  closeMo('mo-nm'); applyMF(); updStats(); toast(`${v} ${n} gespeichert`);
}
function delM(id){ if(!confirm('Mitglied löschen?')) return; members=members.filter(m=>m.id!==id); applyMF(); updStats(); toast('Gelöscht'); }
function exportCSV(){
  const rows=[['Anrede','Vorname','Nachname','E-Mail','Mobil','Strasse','Nr','PLZ','Ort','Status','Rolle','Small Group','Eingetreten']];
  members.forEach(m=>{const r=gR(m.rolleId),g=gG(m.groupId);rows.push([m.anrede,m.vorname,m.nachname,m.email,m.mobil,m.strasse,m.nr,m.plz,m.ort,m.status,r?r.name:'',g?g.name:'',m.eingetreten]);});
  const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(rows.map(r=>r.map(v=>`"${v||''}"`).join(',')).join('\n'));
  a.download='mitglieder.csv'; a.click(); toast('CSV exportiert');
}

// ═══════════════════════════════════════════════
// MITGLIEDERKARTE
// ═══════════════════════════════════════════════
function openK(id){
  const m=members.find(x=>x.id===id); if(!m) return;
  activeId=id;
  document.getElementById('k-av').textContent=ini(m);
  document.getElementById('k-av').style.background=m.color;
  document.getElementById('k-name').textContent=`${m.anrede} ${m.vorname} ${m.nachname}`;
  document.getElementById('k-sub').textContent=`${m.email} · ${m.mobil}`;
  const r=gR(m.rolleId), g=gG(m.groupId);
  document.getElementById('k-badges').innerHTML=
    `<span class="kchip ${sC(m.status)}">${sL(m.status)}</span>`+
    (r?`<span class="krole">${r.name}</span>`:'')+
    (g?`<span class="kchip" style="background:var(--bg);color:var(--text2)">${g.name}</span>`:'');
  const yrs=aY(m.eingetreten);
  document.getElementById('kq-j').textContent=yrs!==null?yrs:'—';
  const st=m.spenden.reduce((s,x)=>s+x.betrag,0);
  document.getElementById('kq-s').textContent=st>0?String(st):'—';

  const sv=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val||'—';};
  const si=(id,val)=>{const el=document.getElementById(id);if(el)el.value=val||'';};

  sv('k-anrede',m.anrede); si('k-anrede-i',m.anrede);
  sv('k-vorname',m.vorname); si('k-vorname-i',m.vorname);
  sv('k-nachname',m.nachname); si('k-nachname-i',m.nachname);
  const a=aY(m.geburt);
  sv('k-geburt',m.geburt?`${fD(m.geburt)}${a?' ('+a+' J.)':''}`:''); si('k-geburt-i',m.geburt);
  sv('k-geschlecht',m.geschlecht); si('k-geschlecht-i',m.geschlecht);
  sv('k-nation',m.nationalitaet); si('k-nation-i',m.nationalitaet);
  sv('k-sprache',m.sprache); si('k-sprache-i',m.sprache);
  sv('k-fstand',m.familienstand); si('k-fstand-i',m.familienstand);
  sv('k-email',m.email); si('k-email-i',m.email);
  sv('k-mobil',m.mobil); si('k-mobil-i',m.mobil);
  sv('k-fest',m.festnetz); si('k-fest-i',m.festnetz);
  sv('k-str',m.strasse&&m.nr?`${m.strasse} ${m.nr}`:''); si('k-str-i',m.strasse?`${m.strasse} ${m.nr}`:'');
  sv('k-plz',m.plz&&m.ort?`${m.plz} ${m.ort}`:''); si('k-plz-i',`${m.plz} ${m.ort}`);
  sv('k-kant',m.kanton); si('k-kant-i',m.kanton);
  sv('k-notfall',m.notfall); si('k-notfall-i',m.notfall);

  document.getElementById('k-status-v').innerHTML=`<span class="sbadge ${sC(m.status)}">${sL(m.status)}</span>`;
  sv('k-eingetreten',fD(m.eingetreten)); sv('k-taufe',fD(m.taufe));
  document.getElementById('k-rolle-c').textContent=r?r.name:'—';
  sv('k-group-v',g?g.name:''); sv('k-fstand-v',m.familienstand); sv('k-taufe-v',fD(m.taufe));

  const s26=m.spenden.filter(s=>s.datum.startsWith('2026')).reduce((s,x)=>s+x.betrag,0);
  document.getElementById('kf-t').textContent=`CHF ${s26.toLocaleString('de-CH')}`;
  document.getElementById('kf-c').textContent=m.spenden.length;
  document.getElementById('kt-sp').textContent=m.spenden.length;
  document.getElementById('kf-body').innerHTML = m.spenden.length ?
    m.spenden.map(s=>`<tr><td>${fD(s.datum)}</td><td><strong>CHF ${s.betrag}</strong></td><td>${zwB(s.weg)}</td><td>${s.zweck}</td><td><span style="color:var(--blue);cursor:pointer;font-size:11px">↓ PDF</span></td></tr>`).join('') :
    '<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:12px">Keine Spenden</td></tr>';
  sv('k-iban',m.iban); sv('k-bank',m.bank);
  document.getElementById('lnk-sp').textContent=`CHF ${m.spenden.reduce((s,x)=>s+x.betrag,0).toLocaleString('de-CH')} total`;
  document.getElementById('lnk-gr').textContent=g?`${g.name} · ${g.tag}`:'Keine Gruppe';
  const v=Array.from({length:14},()=>Math.random()>0.2);
  document.getElementById('k-visits').innerHTML=v.map(x=>`<div class="vday ${x?'y':'n'}">${x?'✓':''}</div>`).join('');
  rndrDms();
  document.querySelectorAll('.cs').forEach(s=>s.classList.remove('editing'));
  document.querySelectorAll('.cs-edit').forEach(b=>{if(b.textContent.includes('Fertig')){b.textContent='Bearbeiten';b.style.color='';}});
  sTab('stamm',document.querySelector('.ktab'));
  document.getElementById('k-overlay').classList.add('open');
  document.getElementById('k-panel').classList.add('open');
}
function closeKarte(){
  document.getElementById('k-overlay').classList.remove('open');
  document.getElementById('k-panel').classList.remove('open');
  activeId=null;
}
function deleteCurrent(){
  if(!activeId||!confirm('Mitglied löschen?')) return;
  members=members.filter(m=>m.id!==activeId);
  closeKarte(); applyMF(); updStats(); toast('Gelöscht');
}
function sTab(name,el){
  document.querySelectorAll('.ktab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  const tp=document.getElementById('tab-'+name); if(tp) tp.classList.add('active');
  if(name==='dms') rndrDms();
}

// ═══════════════════════════════════════════════
// INLINE EDITING
// ═══════════════════════════════════════════════
function tEdit(secId, btn){
  const sec=document.getElementById(secId);
  const isE=sec.classList.contains('editing');
  if(isE){
    sec.querySelectorAll('.fvi,.fvs').forEach(inp=>{
      const bid=inp.id.replace(/-i$/,'');
      const tel=document.getElementById(bid);
      if(tel&&inp.value){
        tel.textContent=inp.value;
        if(activeId){
          const m=members.find(x=>x.id===activeId);
          if(m){
            const MAP={'k-anrede':'anrede','k-vorname':'vorname','k-nachname':'nachname','k-geburt':'geburt','k-geschlecht':'geschlecht','k-nation':'nationalitaet','k-sprache':'sprache','k-fstand':'familienstand','k-email':'email','k-mobil':'mobil','k-fest':'festnetz','k-str':'strasse','k-plz':'plz','k-kant':'kanton','k-notfall':'notfall'};
            const key=MAP[bid]; if(key) m[key]=inp.value;
            if(['k-vorname','k-nachname','k-anrede'].includes(bid)){
              document.getElementById('k-name').textContent=`${m.anrede} ${m.vorname} ${m.nachname}`;
              rndrTbl();
            }
          }
        }
      }
    });
    sec.classList.remove('editing'); btn.textContent='Bearbeiten'; btn.style.color=''; toast('Gespeichert');
  } else {
    sec.classList.add('editing'); btn.textContent='✓ Fertig'; btn.style.color='var(--green)';
  }
}

// ═══════════════════════════════════════════════
// DMS
// ═══════════════════════════════════════════════
const getDms = () => dmsStore[activeId]||[];
const extC = e => ({'pdf':'#DC2626','docx':'#2563EB','doc':'#2563EB','xlsx':'#16A34A','xls':'#16A34A','png':'#7C3AED','jpg':'#7C3AED','jpeg':'#7C3AED','pptx':'#D97706','txt':'#6B7280'}[e.toLowerCase()]||'#6B7280');
const extT = e => { const x=e.toLowerCase(); return['pdf'].includes(x)?'pdf':['doc','docx'].includes(x)?'docx':['png','jpg','jpeg','gif'].includes(x)?'img':'other'; };
const fSz = b => b<1024?b+' B':b<1048576?Math.round(b/1024)+' KB':(b/1048576).toFixed(1)+' MB';

function dmsF(t,el){
  dmsAF=t;
  document.querySelectorAll('#tab-dms .ftab').forEach(x=>x.classList.remove('active'));
  el.classList.add('active'); rndrDms();
}
function rndrDms(){
  const files=getDms();
  const filt=dmsAF==='alle'?files:files.filter(f=>f.ftype===dmsAF);
  document.getElementById('kt-dms').textContent=files.length;
  document.getElementById('lnk-dms').textContent=`${files.length} Dokumente`;
  const list=document.getElementById('dms-list'); if(!list) return;
  if(!filt.length){ list.innerHTML=`<div style="text-align:center;padding:18px;color:var(--text3);font-size:13px">Keine Dokumente hochgeladen</div>`; return; }
  list.innerHTML=filt.map(f=>
    `<div class="dms-file">
      <div class="dms-ico" style="background:${extC(f.ext)}">${f.ext.toUpperCase()}</div>
      <div style="flex:1;min-width:0"><div class="dms-fname">${f.name}</div><div class="dms-meta">${f.date} · ${fSz(f.size)}</div></div>
      <div class="row-del" onclick="dmsDel(${f.id})"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/></svg></div>
    </div>`).join('');
}
function dmsUpload(input){
  if(!activeId) return;
  Array.from(input.files).forEach(file=>{
    const ext=file.name.split('.').pop()||'dat';
    const d=new Date(); const date=`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
    if(!dmsStore[activeId]) dmsStore[activeId]=[];
    dmsStore[activeId].push({id:dmsSeq++,name:file.name,size:file.size,ext,ftype:extT(ext),date});
  });
  rndrDms(); input.value=''; toast(`${input.files.length} Dokument(e) hochgeladen`);
}
function dmsDel(fid){ if(!activeId) return; dmsStore[activeId]=(dmsStore[activeId]||[]).filter(f=>f.id!==fid); rndrDms(); toast('Dokument gelöscht'); }
function dmsDrag(e,on){ e.preventDefault(); document.getElementById('dms-drop').classList.toggle('drag',on); }
function dmsDrop(e){
  e.preventDefault(); document.getElementById('dms-drop').classList.remove('drag');
  if(!activeId) return;
  Array.from(e.dataTransfer.files).forEach(file=>{
    const ext=file.name.split('.').pop()||'dat';
    const d=new Date(); const date=`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
    if(!dmsStore[activeId]) dmsStore[activeId]=[];
    dmsStore[activeId].push({id:dmsSeq++,name:file.name,size:file.size,ext,ftype:extT(ext),date});
  });
  rndrDms(); toast('Dokument(e) hochgeladen');
}

// ═══════════════════════════════════════════════
// SPENDENBESCHEINIGUNG
// ═══════════════════════════════════════════════
function genQuittung(){
  if(!activeId) return;
  const m=members.find(x=>x.id===activeId); if(!m) return;
  const t=m.spenden.filter(s=>s.datum.startsWith('2026')).reduce((s,x)=>s+x.betrag,0);
  const lines=[
    'SPENDENBESCHEINIGUNG 2026','='.repeat(30),'',
    'Gemeinde: Ev. Gemeinde Zürich',
    `Ausgestellt: ${new Date().toLocaleDateString('de-CH')}`, '',
    `Spender/in: ${m.anrede} ${m.vorname} ${m.nachname}`,
    `Adresse: ${m.strasse} ${m.nr}, ${m.plz} ${m.ort}`, '',
    'Spenden 2026:',
    ...m.spenden.filter(s=>s.datum.startsWith('2026')).map(s=>`  ${fD(s.datum)}   CHF ${s.betrag}   ${s.zweck}`),
    '', `GESAMT 2026: CHF ${t.toLocaleString('de-CH')}`, '',
    'Für Steuerabzug. Später: PDF via Exoscale Genf.',
  ];
  const a=document.createElement('a');
  a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(lines.join('\n'));
  a.download=`Spendenbescheinigung_2026_${m.nachname}.txt`;
  a.click(); toast('Spendenbescheinigung erstellt');
}

// ═══════════════════════════════════════════════
// ROLLEN / GRUPPEN
// ═══════════════════════════════════════════════
function openRM(){ rndrR(); openMo('mo-rollen'); }
function openGM(){ rndrG(); openMo('mo-gruppen'); }
function rndrR(f=''){
  document.getElementById('r-tbody').innerHTML=rollen
    .filter(r=>!f||r.name.toLowerCase().includes(f.toLowerCase()))
    .map(r=>`<tr><td><strong>${r.name}</strong></td><td><span style="background:var(--bg);padding:2px 7px;border-radius:4px;font-size:10px;color:var(--text2)">${r.kat}</span></td><td>${members.filter(m=>m.rolleId===r.id).length}</td><td><div class="mini-del" onclick="delR(${r.id})"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/></svg></div></td></tr>`).join('');
}
function rndrG(f=''){
  document.getElementById('g-tbody').innerHTML=gruppen
    .filter(g=>!f||g.name.toLowerCase().includes(f.toLowerCase()))
    .map(g=>`<tr><td><strong>${g.name}</strong></td><td>${g.leiter||'—'}</td><td>${g.tag}</td><td>${members.filter(m=>m.groupId===g.id).length}</td><td><div class="mini-del" onclick="delG(${g.id})"><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/></svg></div></td></tr>`).join('');
}
function addR(){
  const n=document.getElementById('r-name').value.trim();
  if(!n){alert('Pflichtfeld');return;}
  if(rollen.some(r=>r.name.toLowerCase()===n.toLowerCase())){alert('Existiert bereits');return;}
  rollen.push({id:rSeq++,name:n,kat:document.getElementById('r-kat').value});
  document.getElementById('r-name').value=''; rndrR(); toast(`Rolle "${n}" hinzugefügt`);
}
function addG(){
  const n=document.getElementById('g-name').value.trim();
  if(!n){alert('Pflichtfeld');return;}
  gruppen.push({id:gSeq++,name:n,leiter:document.getElementById('g-leit').value.trim(),tag:document.getElementById('g-tag').value});
  document.getElementById('g-name').value=''; document.getElementById('g-leit').value='';
  rndrG(); toast(`Gruppe "${n}" hinzugefügt`);
}
function delR(id){ if(members.some(m=>m.rolleId===id)){alert('Rolle wird noch verwendet.');return;} rollen=rollen.filter(r=>r.id!==id); rndrR(); toast('Gelöscht'); }
function delG(id){ if(members.some(m=>m.groupId===id)){alert('Gruppe hat noch Mitglieder.');return;} gruppen=gruppen.filter(g=>g.id!==id); rndrG(); toast('Gelöscht'); }
function refreshSel(){
  const rs=document.getElementById('nm-rol'); if(rs) rs.innerHTML=rollen.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')+'<option value="__n">+ Neue Rolle...</option>';
  const gs=document.getElementById('nm-grp'); if(gs) gs.innerHTML='<option value="0">— keine —</option>'+gruppen.map(g=>`<option value="${g.id}">${g.name}</option>`).join('')+'<option value="__n">+ Neue Gruppe...</option>';
  const gf=document.getElementById('m-gf'); if(gf) gf.innerHTML='<option value="">Alle Gruppen</option>'+gruppen.map(g=>`<option value="${g.id}">${g.name}</option>`).join('');
  const rf=document.getElementById('m-rf'); if(rf) rf.innerHTML='<option value="">Alle Rollen</option>'+rollen.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
}

// ═══════════════════════════════════════════════
// EINRICHTUNG
// ═══════════════════════════════════════════════
const SETUP={
  gemeinde:{title:'Gemeinde-Stammdaten',html:`
    <div class="setup-field"><label>Gemeindename *</label><input class="si" id="s-gn" value="Ev. Gemeinde Zürich"></div>
    <div class="setup-field"><label>Adresse</label><input class="si" value="Musterstrasse 1, 8001 Zürich"></div>
    <div class="setup-field"><label>Telefon</label><input class="si" placeholder="+41 44 123 45 67"></div>
    <div class="setup-field"><label>E-Mail</label><input class="si" placeholder="info@gemeinde.ch"></div>
    <div class="setup-field"><label>Website</label><input class="si" placeholder="https://gemeinde.ch"></div>
    <div class="setup-field"><label>Sprache</label><select class="ss"><option>Deutsch</option><option>Französisch</option><option>Italienisch</option></select></div>
    <div class="setup-field"><label>Lizenzplan</label><select class="ss"><option>Professional (CHF 299/Mt.)</option><option>Starter (CHF 149/Mt.)</option></select></div>`},
  benutzer:{title:'Benutzer & Rollen',html:`
    <div style="background:var(--bg);border-radius:8px;padding:12px;display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div class="m-av" style="background:var(--gold)">AJ</div>
      <div><div style="font-size:13px;font-weight:500">Andreas Jost</div><div style="font-size:11px;color:var(--text3)">Administrator</div></div>
      <span style="margin-left:auto;background:var(--green-bg);color:var(--green);font-size:11px;padding:2px 8px;border-radius:4px">Aktiv</span>
    </div>
    <div class="setup-field"><label>Neuen Benutzer einladen</label><div class="api-row"><input class="si" placeholder="E-Mail-Adresse"><button class="btn btn-primary">Einladen</button></div></div>
    <div class="setup-field"><label>Standard-Rolle</label><select class="ss"><option>Leiter</option><option>Mitarbeiter</option><option>Admin</option></select></div>`},
  twint:{title:'Twint / Payrexx',html:`
    <div style="background:var(--blue-bg);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--blue);margin-bottom:12px">Twint läuft über Payrexx. Konto auf payrexx.com erstellen, dann API-Key eintragen.</div>
    <div class="setup-field"><label>Payrexx Instance</label><input class="si" placeholder="meine-gemeinde"></div>
    <div class="setup-field"><label>API Key</label><div class="api-row"><input class="si" placeholder="pk_live_..." type="password"><button class="btn btn-ghost" onclick="document.getElementById('s-px-st').style.display='flex'">Testen</button></div>
    <div class="api-status as-warn" id="s-px-st" style="display:none">⚠ Kein Key — Payrexx-Konto erstellen und Key eintragen</div></div>
    <div class="setup-field"><label>Webhook URL</label><input class="si" value="https://ajconnect.ch/api/webhook/twint" readonly style="background:var(--bg)"></div>`},
  bank:{title:'Bankanbindung (ISO 20022)',html:`
    <div style="background:var(--amber-bg);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--amber);margin-bottom:12px">Phase 1: manueller camt.053 Import. Phase 2: direkte API-Anbindung (geplant).</div>
    <div class="setup-field"><label>Bank</label><select class="ss"><option>— wählen —</option><option>UBS</option><option>ZKB</option><option>Raiffeisen</option><option>PostFinance</option><option>Andere</option></select></div>
    <div class="setup-field"><label>IBAN</label><input class="si" placeholder="CH56 0483 5012 3456 7800 9"></div>
    <div class="setup-field"><label>Kontoinhaber</label><input class="si" placeholder="Ev. Gemeinde Zürich"></div>`},
  dms:{title:'DMS / Exoscale Genf',html:`
    <div style="background:var(--green-bg);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--green);margin-bottom:12px">100% Schweizer Datenhaltung auf Exoscale Genf. DSG-konform, Art. 5 DSG.</div>
    <div class="setup-field"><label>Access Key</label><div class="api-row"><input class="si" placeholder="EXO..." type="password"><button class="btn btn-ghost" onclick="document.getElementById('s-ex-st').style.display='flex'">Testen</button></div>
    <div class="api-status as-warn" id="s-ex-st" style="display:none">⚠ Nach Exoscale-Registrierung Key eintragen</div></div>
    <div class="setup-field"><label>Secret Key</label><input class="si" type="password" placeholder="..."></div>
    <div class="setup-field"><label>Bucket Name</label><input class="si" placeholder="ajconnect-gemeinde"></div>
    <div class="setup-field"><label>Region</label><select class="ss"><option>ch-gva-2 (Genf) — Empfohlen</option><option>ch-dk-2 (Zürich)</option></select></div>`},
  fibu:{title:'Finanzbuchhaltung',html:`
    <div class="setup-field"><label>Geschäftsjahr beginnt</label><select class="ss"><option>Januar</option><option>Juli</option><option>April</option></select></div>
    <div class="setup-field"><label>MWST</label><select class="ss"><option>Nein (unter CHF 100'000)</option><option>Ja</option></select></div>
    <div class="setup-field"><label>Kontenplan</label><select class="ss"><option>Kirchliche Buchhaltung CH</option><option>KMU Kontenplan</option><option>Eigener</option></select></div>`},
  email:{title:'E-Mail / SMTP',html:`
    <div class="setup-field"><label>SMTP-Server</label><input class="si" placeholder="smtp.infomaniak.com"></div>
    <div class="setup-field"><label>Port</label><select class="ss"><option>587 (TLS — Empfohlen)</option><option>465 (SSL)</option></select></div>
    <div class="setup-field"><label>Benutzername</label><input class="si" placeholder="info@ajconnect.ch"></div>
    <div class="setup-field"><label>Passwort</label><input class="si" type="password"></div>
    <div class="setup-field"><label>Absender-Name</label><input class="si" placeholder="Ev. Gemeinde Zürich"></div>
    <div style="background:var(--bg);border-radius:7px;padding:9px 11px;font-size:12px;color:var(--text2)">Empfehlung: Infomaniak (Genf) — DSG-konform, CH-Server.</div>`},
  datenschutz:{title:'Datenschutz (DSG)',html:`
    <div style="background:var(--red-bg);border-radius:8px;padding:10px 12px;font-size:12px;color:var(--red);margin-bottom:12px">Kirchenzugehörigkeit = besonders schützenswertes Datum (Art. 5 DSG).</div>
    <div class="setup-field"><label>AVV</label><select class="ss"><option>Standard AJ Connect AVV</option><option>Eigenen AVV hochladen</option></select></div>
    <div class="setup-field"><label>Datenschutzerklärung URL</label><input class="si" placeholder="https://gemeinde.ch/datenschutz"></div>
    <div class="setup-field"><label>Löschfrist inaktive Mitglieder</label><select class="ss"><option>3 Jahre nach Austritt</option><option>5 Jahre</option><option>10 Jahre</option></select></div>`},
  'm-mitglieder':{title:'Mitglieder-Einrichtung',html:`
    <div class="setup-field"><label>Pflichtfelder</label><div style="display:flex;flex-direction:column;gap:6px;margin-top:5px">
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" checked disabled style="width:14px;height:14px">Vorname / Nachname (immer Pflicht)</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" style="width:14px;height:14px">E-Mail</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" style="width:14px;height:14px">Telefon</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" style="width:14px;height:14px">Geburtsdatum</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" style="width:14px;height:14px">Adresse</label>
    </div></div>
    <div class="setup-field"><label>Standard-Status</label><select class="ss"><option>Besucher</option><option>Aktiv</option><option>Neu</option></select></div>
    <div class="setup-field"><label>Mitgliedsnummer</label><select class="ss"><option>Automatisch (ab M-001)</option><option>Manuell</option></select></div>`},
};

function openSetup(key){
  const cfg=SETUP[key];
  if(!cfg){ toast('Diese Einrichtung wird bald verfügbar sein'); return; }
  document.getElementById('setup-title').textContent=cfg.title;
  document.getElementById('setup-body').innerHTML=cfg.html;
  openMo('mo-setup');
}
function saveSetup(){
  const gn=document.getElementById('s-gn');
  if(gn&&gn.value) document.getElementById('g-name').textContent=gn.value;
  closeMo('mo-setup'); toast('Einstellungen gespeichert');
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
(function init(){
  const d=new Date();
  const days=['So','Mo','Di','Mi','Do','Fr','Sa'];
  const months=['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
  document.getElementById('date-chip').textContent=`${days[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
  ldCols(); bldGear(); refreshSel();
  mFilt=[...members]; updStats();
})();
