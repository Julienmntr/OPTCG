const STORAGE = {
  decks: "op_tcg_tracker_v2_decks",
  tournaments: "op_tcg_tracker_v2_tournaments"
};

const DEFAULT_LEADERS = [
  ["OP01-001","Roronoa Zoro"],["OP01-002","Trafalgar Law"],["OP01-003","Crocodile"],
  ["OP01-060","Doflamingo"],["OP02-001","Edward Newgate"],["OP02-002","Kin'emon"],
  ["OP02-003","Ivankov"],["OP02-025","Smoker"],["OP02-049","Garp"],["OP02-058","Kaido"],
  ["OP03-001","Iceburg"],["OP03-040","Nami"],["OP03-077","Katakuri"],["OP03-099","Magellan"],
  ["OP04-001","Rebecca"],["OP04-019","Doflamingo"],["OP04-020","Issho"],["OP04-039","Perona"],
  ["OP04-058","Queen"],["OP04-060","Yamato"],["OP05-001","Luffy"],["OP05-002","Enel"],
  ["OP05-003","Gekko Moria"],["OP05-022","Ace"],["OP05-060","Sabo"],["OP05-098","Rosinante"],
  ["OP06-001","Vinsmoke Reiju"],["OP06-022","Hody Jones"],["OP06-042","Uta"],
  ["OP06-046","Yamato"],["OP06-047","Perona"],["OP07-001","Boa Hancock"],["OP07-019","Bonney"],
  ["OP07-020","Jewelry Bonney"],["OP07-038","Vegapunk"],["OP07-059","Lucci"],["OP07-079","Boa Hancock"],
  ["OP08-001","Monkey.D.Dragon"],["OP08-002","Vivi"],["OP08-021","Luffy"],["OP08-047","Crocodile"],
  ["OP08-058","Kalgara"],["OP08-063","King"],["OP09-001","Shanks"],["OP09-042","Buggy"],
  ["OP09-061","Luffy"],["OP10-001","Smoker"],["OP10-003","Jewelry Bonney"],["OP10-022","Trafalgar Law"],
  ["OP10-042","Shanks"],["OP10-058","Black Maria"],["OP11-001","Boa Hancock"],["OP11-002","Luffy"],
  ["OP11-003","Buggy"],["OP11-040","Luffy"],["OP11-054","Blackbeard"],["OP11-061","Koby"],
  ["OP12-001","Luffy"],["OP12-002","Bonney"],["OP12-020","Marco"],["OP12-042","Nami"],
  ["OP12-058","Kaido"],["OP13-001","Luffy"],["OP13-003","Monkey.D.Dragon"],["OP13-004","Sabo"],
  ["OP13-020","Shanks"],["OP13-079","Luffy"],["OP14-001","Buggy"],["OP14-020","Mihawk"],
  ["OP15-001","Ace"],["OP15-002","Sabo"],["OP15-003","Whitebeard"],["OP15-058","Enel"],
  ["OP16-001","Ace"],["OP16-020","Smoker"],["OP16-040","Luffy"],["OP16-058","Kaido"],
  ["OP17-001","Newgate"],["OP17-020","Shanks"],["OP17-039","Xebec"],["OP17-058","Kaido"],
  ["OP17-079","Luffy"],["OP17-099","Linlin"]
];

const state = {
  page: "home",
  subpage: null,
  tournamentId: null,
  editingRound: null,
  selectedDeckId: null
};

function load(key, fallback=[]) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function decks() { return load(STORAGE.decks); }
function tournaments() { return load(STORAGE.tournaments); }
function uid(prefix="id") { return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function esc(v="") { return String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function leaderLabel(code) {
  const found = DEFAULT_LEADERS.find(x => x[0] === code);
  return found ? `${found[0]} — ${found[1]}` : code;
}
function formatDate(s) {
  if (!s) return "";
  const d = new Date(s + "T12:00:00");
  return d.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"});
}
function today() { return new Date().toISOString().slice(0,10); }

function setPage(page) {
  state.page = page; state.subpage = null; state.tournamentId = null; state.editingRound = null;
  render();
}
document.addEventListener("click", e => {
  const nav = e.target.closest("[data-nav]");
  if (nav) setPage(nav.dataset.nav);
});

function render() {
  const app = document.getElementById("app");
  if (state.page === "home") app.innerHTML = renderHome();
  if (state.page === "decks") app.innerHTML = renderDecks();
  if (state.page === "reports") app.innerHTML = renderReports();
  if (state.page === "stats") app.innerHTML = renderStats();
  updateNav();
  bindPageEvents();
}
function updateNav() {
  document.querySelectorAll(".nav-item").forEach(x => x.classList.toggle("active", x.dataset.nav === state.page));
}

function renderHome() {
  const ts = tournaments().slice().sort((a,b)=>b.date.localeCompare(a.date));
  const last = ts[0];
  return `
    <h1>One Piece TCG Tracker</h1>
    <p class="subtitle">Suivi simple de tes tournois et de tes matchs.</p>
    <button class="btn primary" id="newTournament">＋ Nouveau tournoi</button>

    ${last ? `
      <div class="section-title">Dernier tournoi</div>
      <div class="card clickable" id="openLast" data-id="${last.id}">
        <div class="report-header">
          <div>
            <strong>${esc(last.deckName)}</strong>
            <div class="muted small">${esc(last.deckLeader)} · ${formatDate(last.date)}</div>
          </div>
          <div class="score-box"><div class="score">${scoreOf(last)}</div><div class="muted small">${last.rounds.length} rondes</div></div>
        </div>
      </div>` : `
      <div class="empty card">Aucun tournoi enregistré pour le moment.</div>
    `}

    <div class="section-title">Accès rapide</div>
    <div class="nav-grid">
      <button class="btn big-action" data-nav="decks"><strong>🃏 Decklists</strong><span class="muted small">Créer et gérer tes decks</span></button>
      <button class="btn big-action" data-nav="reports"><strong>📋 Rapports</strong><span class="muted small">Voir tes anciens tournois</span></button>
      <button class="btn big-action" data-nav="stats"><strong>📊 Statistiques</strong><span class="muted small">Decks et matchups cumulés</span></button>
    </div>
  `;
}

function renderDecks() {
  if (state.subpage === "newDeck") return renderNewDeck();
  const ds = decks();
  return `
    <h1>Decklists</h1>
    <p class="subtitle">Tes decks enregistrés.</p>
    <button class="btn primary" id="newDeck">＋ Nouveau deck</button>
    <div class="section-title">${ds.length ? "Mes decks" : ""}</div>
    ${ds.length ? ds.map(d => `
      <div class="card deck-card">
        <div class="deck-avatar">${esc(d.leader || "LEADER")}</div>
        <div style="flex:1">
          <strong>${esc(d.name)}</strong>
          <div class="muted small">${esc(leaderLabel(d.leader))}</div>
          <div class="muted small">${d.cards.length} lignes importées</div>
        </div>
        <button class="btn secondary" style="width:auto" data-delete-deck="${d.id}">Suppr.</button>
      </div>
    `).join("") : `<div class="empty card">Aucun deck. Crée ton premier deck pour pouvoir lancer un tournoi.</div>`}
  `;
}

function renderNewDeck() {
  return `
    <button class="back" id="backDecks">← Decklists</button>
    <h1>Nouveau deck</h1>
    <p class="subtitle">Enregistre un deck pour pouvoir le sélectionner lors d'un tournoi.</p>
    <div class="card stack">
      <div><label>Nom du deck</label><input id="deckName" placeholder="Ex. Xebec"></div>
      <div>
        <label>Leader</label>
        <select id="deckLeader">${leaderOptions()}</select>
      </div>
      <div>
        <label>Decklist</label>
        <textarea id="deckList" placeholder="1xOP17-039&#10;4xOP17-001&#10;4xOP17-045&#10;..."></textarea>
        <div class="muted small" style="margin-top:6px">Format : quantité + x + code carte.</div>
      </div>
      <button class="btn primary" id="saveDeck">Enregistrer le deck</button>
    </div>
  `;
}

function leaderOptions(selected="") {
  return `<option value="">Choisir un leader...</option>` +
    DEFAULT_LEADERS.slice().sort((a,b)=>a[0].localeCompare(b[0])).map(([c,n]) =>
      `<option value="${c}" ${selected===c?"selected":""}>${esc(c)} — ${esc(n)}</option>`).join("");
}

function renderTournamentCreate() {
  return `
    <button class="back" id="backHome">← Accueil</button>
    <h1>Nouveau tournoi</h1>
    <p class="subtitle">Choisis d'abord le deck utilisé, puis le nombre de rounds.</p>
    <div class="card stack">
      <div><label>Date du tournoi</label><input type="date" id="tDate" value="${today()}"></div>
      <div>
        <label>Deck joué</label>
        <select id="tDeck">
          <option value="">Choisir un deck...</option>
          ${decks().map(d=>`<option value="${d.id}">${esc(d.name)} — ${esc(d.leader)}</option>`).join("")}
        </select>
      </div>
      <div>
        <label>Nombre de rounds</label>
        <input type="number" id="tRounds" min="1" max="20" value="7">
      </div>
      <button class="btn primary" id="createTournament">Créer le tournoi</button>
    </div>
    ${decks().length ? "" : `<div class="notice">Tu dois créer au moins un deck avant de créer un tournoi.</div>`}
  `;
}

function renderTournament() {
  const t = tournaments().find(x=>x.id===state.tournamentId);
  if (!t) return renderHome();
  const roundIndex = state.editingRound ?? firstOpenRound(t);
  const r = t.rounds[roundIndex];
  return `
    <button class="back" id="backHome">← Accueil</button>
    <div class="hero">
      <div class="muted small">${esc(t.deckName)}</div>
      <div class="hero-title">${esc(t.deckLeader)}</div>
      <div class="hero-score">${scoreOf(t)}</div>
      <div class="muted small">${t.rounds.filter(x=>x.result).length}/${t.rounds.length} rondes enregistrées</div>
    </div>

    <div class="tabs">
      ${t.rounds.map((x,i)=>`<button class="pill ${i===roundIndex?"active":""}" data-round="${i}">R${i+1}${x.result ? (x.result==="win"?" ✓":" ✕") : ""}</button>`).join("")}
    </div>

    ${renderRoundForm(t,r,roundIndex)}
  `;
}

function firstOpenRound(t) {
  const i = t.rounds.findIndex(r=>!r.result);
  return i >= 0 ? i : t.rounds.length-1;
}

function renderRoundForm(t,r,i) {
  return `
    <div class="card">
      <div class="row-between">
        <div>
          <div class="muted small">Ronde</div>
          <h2 style="margin-bottom:0">${i+1} / ${t.rounds.length}</h2>
        </div>
        <span class="badge blue">${esc(t.deckName)}</span>
      </div>

      <div class="section-title">Leader adverse</div>
      <select id="opponentLeader">${leaderOptions(r.opponentLeader)}</select>

      <div class="section-title">Résultat du Dé</div>
      <div class="choice-grid">
        <button class="choice ${r.dice==="win"?"selected":""}" data-choice="dice" data-value="win">Dé gagné</button>
        <button class="choice ${r.dice==="loss"?"selected":""}" data-choice="dice" data-value="loss">Dé perdu</button>
      </div>

      <div class="section-title">Qui commence ?</div>
      <div class="choice-grid">
        <button class="choice ${r.first==="me"?"selected":""}" data-choice="first" data-value="me">1er</button>
        <button class="choice ${r.first==="opp"?"selected":""}" data-choice="first" data-value="opp">2e</button>
      </div>

      <div class="section-title">Résultat</div>
      <div class="choice-grid">
        <button class="choice win ${r.result==="win"?"selected":""}" data-choice="result" data-value="win">VICTOIRE</button>
        <button class="choice loss ${r.result==="loss"?"selected":""}" data-choice="result" data-value="loss">DÉFAITE</button>
      </div>

      <div class="section-title">Commentaire</div>
      <textarea id="roundComment" placeholder="Facultatif...">${esc(r.comment || "")}</textarea>

      <div class="grid2" style="margin-top:14px">
        <button class="btn secondary" id="prevRound" ${i===0?"disabled":""}>← Ronde précédente</button>
        <button class="btn secondary" id="nextRound" ${i===t.rounds.length-1?"disabled":""}>Ronde suivante →</button>
      </div>
      <button class="btn primary" id="saveRound" style="margin-top:10px">Enregistrer la ronde</button>
    </div>
  `;
}

function renderReports() {
  if (state.subpage === "reportDetail") return renderReportDetail();
  const ts = tournaments().slice().sort((a,b)=>b.date.localeCompare(a.date));
  return `
    <h1>Rapports</h1>
    <p class="subtitle">Historique de tes tournois.</p>
    ${ts.length ? ts.map(t=>`
      <div class="card clickable" data-open-report="${t.id}">
        <div class="report-header">
          <div>
            <strong>${esc(t.deckName)}</strong>
            <div class="muted small">${esc(t.deckLeader)} · ${formatDate(t.date)}</div>
          </div>
          <div class="score-box"><div class="score">${scoreOf(t)}</div><div class="muted small">${t.rounds.length} rondes</div></div>
        </div>
      </div>`).join("") : `<div class="empty card">Aucun rapport enregistré.</div>`}
  `;
}

function renderReportDetail() {
  const t = tournaments().find(x=>x.id===state.tournamentId);
  if (!t) return renderReports();
  return `
    <button class="back" id="backReports">← Rapports</button>
    <div class="hero">
      <div class="muted small">${formatDate(t.date)}</div>
      <div class="hero-title">${esc(t.deckName)}</div>
      <div class="muted">${esc(t.deckLeader)}</div>
      <div class="hero-score">${scoreOf(t)}</div>
    </div>
    ${t.rounds.map((r,i)=>`
      <div class="card">
        <div class="row-between">
          <strong>Ronde ${i+1}</strong>
          ${r.result ? `<span class="badge ${r.result==="win"?"win":"loss"}">${r.result==="win"?"Victoire":"Défaite"}</span>` : `<span class="badge">Non jouée</span>`}
        </div>
        ${r.result ? `
          <div class="muted small" style="margin-top:8px">${esc(leaderLabel(r.opponentLeader))}</div>
          <div class="row" style="margin-top:9px;flex-wrap:wrap">
            <span class="badge">${r.dice==="win"?"Dé gagné":"Dé perdu"}</span>
            <span class="badge">${r.first==="me"?"1er":"2e"}</span>
          </div>
          ${r.comment ? `<p class="small" style="margin:10px 0 0">${esc(r.comment)}</p>` : ""}
        ` : ""}
      </div>
    `).join("")}
  `;
}

function renderStats() {
  const ts = tournaments();
  const ds = decks();
  const rows = ds.map(d=>{
    const games = [];
    ts.filter(t=>t.deckId===d.id).forEach(t=>t.rounds.forEach(r=>{
      if(r.result) games.push(r);
    }));
    const wins = games.filter(r=>r.result==="win").length;
    return {d,games,wins,losses:games.length-wins};
  }).filter(x=>x.games.length);

  return `
    <h1>Statistiques</h1>
    <p class="subtitle">Les résultats sont cumulés sur tous les rapports enregistrés pour chaque deck.</p>
    ${rows.length ? rows.map(x=>`
      <div class="card clickable" data-stat-deck="${x.d.id}">
        <div class="row-between">
          <div><strong>${esc(x.d.name)}</strong><div class="muted small">${esc(x.d.leader)}</div></div>
          <div class="score-box"><div class="score">${x.wins}-${x.losses}</div><div class="muted small">${x.games.length} parties</div></div>
        </div>
      </div>
    `).join("") : `<div class="empty card">Aucune partie enregistrée. Les statistiques apparaîtront après tes premiers rapports.</div>`}
    ${state.subpage==="statsDeck" ? renderDeckStats() : ""}
  `;
}

function renderDeckStats() {
  const d = decks().find(x=>x.id===state.selectedDeckId);
  if(!d) return "";
  const games = [];
  tournaments().filter(t=>t.deckId===d.id).forEach(t=>t.rounds.forEach(r=>{if(r.result) games.push(r)}));
  const groups = {};
  games.forEach(r=>{
    const k = r.opponentLeader || "Inconnu";
    groups[k] ||= {games:0,wins:0};
    groups[k].games++;
    if(r.result==="win") groups[k].wins++;
  });
  const sorted = Object.entries(groups).sort((a,b)=>b[1].games-a[1].games);
  return `
    <div class="card">
      <button class="back" id="closeStatsDeck">← Tous les decks</button>
      <h2>${esc(d.name)}</h2>
      <div class="stat-grid">
        <div class="stat"><strong>${games.length}</strong><span>Parties</span></div>
        <div class="stat"><strong>${games.filter(r=>r.result==="win").length}</strong><span>Victoires</span></div>
        <div class="stat"><strong>${games.filter(r=>r.result==="loss").length}</strong><span>Défaites</span></div>
      </div>
      <div class="section-title">Matchups cumulés</div>
      ${sorted.length ? `<table class="table-like"><tbody>${sorted.map(([leader,x])=>{
        const losses=x.games-x.wins;
        return `<tr><td>${esc(leaderLabel(leader))}</td><td>${x.wins}-${losses}</td></tr>`;
      }).join("")}</tbody></table>` : `<div class="empty">Aucun matchup.</div>`}
    </div>
  `;
}

function scoreOf(t) {
  const w=t.rounds.filter(r=>r.result==="win").length;
  const l=t.rounds.filter(r=>r.result==="loss").length;
  return `${w}-${l}`;
}

function bindPageEvents() {
  document.getElementById("newTournament")?.addEventListener("click",()=>{state.subpage="createTournament"; document.getElementById("app").innerHTML=renderTournamentCreate(); bindPageEvents();});
  document.getElementById("backHome")?.addEventListener("click",()=>{state.subpage=null; state.tournamentId=null; render();});
  document.getElementById("openLast")?.addEventListener("click",e=>openReportOrTournament(e.currentTarget.dataset.id));

  document.getElementById("newDeck")?.addEventListener("click",()=>{state.subpage="newDeck"; render();});
  document.getElementById("backDecks")?.addEventListener("click",()=>{state.subpage=null; render();});
  document.getElementById("saveDeck")?.addEventListener("click",saveDeck);
  document.querySelectorAll("[data-delete-deck]").forEach(b=>b.addEventListener("click",()=>{
    const id=b.dataset.deleteDeck;
    if(confirm("Supprimer ce deck ? Les rapports existants seront conservés.")){
      save(STORAGE.decks,decks().filter(d=>d.id!==id)); render();
    }
  }));

  document.getElementById("createTournament")?.addEventListener("click",createTournament);

  document.querySelectorAll("[data-round]").forEach(b=>b.addEventListener("click",()=>{
    saveCurrentRound(false);
    state.editingRound=Number(b.dataset.round);
    render();
  }));
  document.querySelectorAll("[data-choice]").forEach(b=>b.addEventListener("click",()=>{
    b.parentElement.querySelectorAll(".choice").forEach(x=>x.classList.remove("selected"));
    b.classList.add("selected");
  }));
  document.getElementById("saveRound")?.addEventListener("click",()=>saveCurrentRound(true));
  document.getElementById("prevRound")?.addEventListener("click",()=>{saveCurrentRound(false); state.editingRound--; render();});
  document.getElementById("nextRound")?.addEventListener("click",()=>{saveCurrentRound(false); state.editingRound++; render();});

  document.querySelectorAll("[data-open-report]").forEach(b=>b.addEventListener("click",()=>{
    state.tournamentId=b.dataset.openReport; state.subpage="reportDetail"; render();
  }));
  document.getElementById("backReports")?.addEventListener("click",()=>{state.subpage=null; render();});

  document.querySelectorAll("[data-stat-deck]").forEach(b=>b.addEventListener("click",()=>{
    state.selectedDeckId=b.dataset.statDeck; state.subpage="statsDeck"; render();
  }));
  document.getElementById("closeStatsDeck")?.addEventListener("click",()=>{state.subpage=null; state.selectedDeckId=null; render();});
}

function saveDeck() {
  const name=document.getElementById("deckName").value.trim();
  const leader=document.getElementById("deckLeader").value;
  const list=document.getElementById("deckList").value.trim();
  if(!name || !leader) return alert("Indique un nom de deck et un leader.");
  const cards=list ? list.split(/\n+/).map(x=>x.trim()).filter(Boolean) : [];
  const ds=decks();
  ds.push({id:uid("deck"),name,leader,cards,createdAt:new Date().toISOString()});
  save(STORAGE.decks,ds);
  state.subpage=null;
  render();
}

function createTournament() {
  const date=document.getElementById("tDate").value;
  const deckId=document.getElementById("tDeck").value;
  const roundCount=Number(document.getElementById("tRounds").value);
  const d=decks().find(x=>x.id===deckId);
  if(!date || !d || !roundCount) return alert("Complète la date, le deck et le nombre de rounds.");
  const t={
    id:uid("tour"),
    date, deckId:d.id, deckName:d.name, deckLeader:d.leader,
    rounds:Array.from({length:roundCount},()=>({opponentLeader:"",dice:"",first:"",result:"",comment:""})),
    createdAt:new Date().toISOString()
  };
  const ts=tournaments(); ts.push(t); save(STORAGE.tournaments,ts);
  state.tournamentId=t.id; state.editingRound=0; state.subpage="tournament";
  renderTournamentIntoApp();
}

function renderTournamentIntoApp() {
  document.getElementById("app").innerHTML=renderTournament(); bindPageEvents();
  updateNav();
}

function openReportOrTournament(id) {
  const t=tournaments().find(x=>x.id===id);
  if(!t) return;
  if(t.rounds.some(r=>!r.result)) {
    state.tournamentId=id; state.editingRound=firstOpenRound(t); state.subpage="tournament"; renderTournamentIntoApp();
  } else {
    state.tournamentId=id; state.subpage="reportDetail"; render();
  }
}

function saveCurrentRound(showNext=true) {
  if(!state.tournamentId) return;
  const ts=tournaments();
  const t=ts.find(x=>x.id===state.tournamentId);
  if(!t) return;
  const i=state.editingRound ?? 0;
  const r=t.rounds[i];
  const op=document.getElementById("opponentLeader");
  if(op) r.opponentLeader=op.value;
  const dice=document.querySelector('[data-choice="dice"].selected');
  const first=document.querySelector('[data-choice="first"].selected');
  const result=document.querySelector('[data-choice="result"].selected');
  const comment=document.getElementById("roundComment");
  if(dice) r.dice=dice.dataset.value;
  if(first) r.first=first.dataset.value;
  if(result) r.result=result.dataset.value;
  if(comment) r.comment=comment.value.trim();
  save(STORAGE.tournaments,ts);
  if(showNext && r.result) {
    const next=t.rounds.findIndex((x,idx)=>idx>i && !x.result);
    if(next>=0) state.editingRound=next;
    else if(t.rounds.every(x=>x.result)) { state.subpage="tournament"; }
    renderTournamentIntoApp();
  }
}

render();
