/* ---------- Config ---------- */
const activities = [
  { id: 'breathwork',  name: 'Breathwork / Mindfulness', required: true,  emoji: '🧘' },
  { id: 'mobility',    name: 'Mobility / Stretching',     required: true,  emoji: '🤸' },
  { id: 'hydration',   name: 'Hydration Upon Waking',     required: true,  emoji: '💧' },
  { id: 'supplements', name: 'Supplements',               required: true,  emoji: '💊' },
  { id: 'cold',        name: 'Cold Plunge',               required: true,  emoji: '🧊' },
  { id: 'sauna',       name: 'Sauna',                     required: false, emoji: '🔥' },
  { id: 'workout',     name: 'Workout / Exercise',        required: true,  emoji: '🏋️' },

  /* ―― Optional “high-performer” add-ons ―― */
  { id: 'journal',     name: 'Gratitude Journal',         required: false, emoji: '📓' },
  { id: 'reading',     name: '10 Pages Reading',          required: false, emoji: '📚' },
  { id: 'planning',    name: 'Daily Planning',            required: false, emoji: '🗒️' }
];

/* ---------- DOM refs ---------- */
const dataKey         = 'routineTrackerData';
const todayDateEl     = document.getElementById('today-date');
const activityListEl  = document.getElementById('activity-list');
const saveBtn         = document.getElementById('save-btn');
const navButtons      = document.querySelectorAll('nav button');
const calendarGrid    = document.getElementById('calendar-grid');
const monthLabel      = document.getElementById('month-label');
const prevMonthBtn    = document.getElementById('prev-month');
const nextMonthBtn    = document.getElementById('next-month');
const streakChain     = document.getElementById('streak-chain');
const streakCountEl   = document.getElementById('streak-count');
const editDialog      = document.getElementById('edit-dialog');
const editDateLabel   = document.getElementById('edit-date-label');
const editActivityList= document.getElementById('edit-activity-list');
const editSaveBtn     = document.getElementById('edit-save-btn');

/* ---------- State ---------- */
let data = JSON.parse(localStorage.getItem(dataKey) || '{}');
const todayStr   = new Date().toISOString().split('T')[0];
let currentMonth = new Date(todayStr).getMonth();
let currentYear  = new Date(todayStr).getFullYear();

/* ---------- Init ---------- */
renderTodayView();
renderCalendar();
renderStreak();

navButtons.forEach(btn => btn.addEventListener('click', switchView));
saveBtn      .addEventListener('click', saveToday);
prevMonthBtn .addEventListener('click', () => changeMonth(-1));
nextMonthBtn .addEventListener('click', () => changeMonth( 1));

/* ---------- Today view ---------- */
function renderTodayView() {
  todayDateEl.textContent = formatDate(todayStr);
  activityListEl.innerHTML = '';
  activities.forEach(act => {
    const li   = document.createElement('li');
    const box  = document.createElement('input');
    box.type   = 'checkbox';
    box.id     = act.id;
    box.checked= data[todayStr]?.[act.id] || false;
    const lab  = document.createElement('label');
    lab.htmlFor= act.id;
    lab.textContent = `${act.emoji} ${act.name}`;
    li.append(box, lab);
    activityListEl.appendChild(li);
  });
}

function saveToday() {
  if (!data[todayStr]) data[todayStr] = {};
  activities.forEach(act => data[todayStr][act.id] = document.getElementById(act.id).checked);
  localStorage.setItem(dataKey, JSON.stringify(data));

  renderCalendar();
  renderStreak();
  alert('Saved!');
}

/* ---------- Navigation ---------- */
function switchView(e) {
  const tgt = e.target.getAttribute('data-view');
  document.querySelector('.view:not(.hidden)').classList.add('hidden');
  document.getElementById(`${tgt}-view`).classList.remove('hidden');
  navButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-view') === tgt));
}

/* ---------- Calendar ---------- */
function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  if (currentMonth > 11){ currentMonth = 0;  currentYear++; }
  renderCalendar();
}

function renderCalendar() {
  const first = new Date(currentYear, currentMonth, 1);
  const days  = new Date(currentYear, currentMonth + 1, 0).getDate();
  calendarGrid.innerHTML = '';
  monthLabel.textContent = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  /* Fill leading blanks */
  for (let i = 0; i < first.getDay(); i++) calendarGrid.appendChild(document.createElement('div'));

  for (let d = 1; d <= days; d++) {
    const dateObj = new Date(currentYear, currentMonth, d);
    const dateStr = dateObj.toISOString().split('T')[0];

    const cell   = document.createElement('div');
    cell.className = `day-cell ${getStatus(dateStr)}`;
    cell.dataset.date = dateStr;
    cell.innerHTML = `<span class="day-number">${d}</span><span class="emoji">${statusEmoji(getStatus(dateStr))}</span>`;
    cell.addEventListener('click', () => openEdit(dateStr));
    calendarGrid.appendChild(cell);
  }
}

function getStatus(dateStr) {
  const entry = data[dateStr];
  if (!entry) return 'none';
  const required = activities.filter(a => a.required);
  const doneReq  = required.filter(a => entry[a.id]).length;

  if (doneReq === 0)                 return 'none';
  if (doneReq === required.length)   return 'full';
  return 'partial';
}
const statusEmoji = s => s === 'full' ? '✅' : s === 'partial' ? '🟡' : '❌';

/* ---------- Streak ---------- */
function renderStreak() {
  let streak = 0;
  let d = new Date(todayStr);
  while (getStatus(d.toISOString().split('T')[0]) === 'full') {
    streak++; d.setDate(d.getDate() - 1);
  }
  streakChain.innerHTML = '';
  for (let i = 0; i < streak; i++) {
    const link = document.createElement('span');
    link.className = 'chain-link';
    link.textContent = '🔗';
    streakChain.appendChild(link);
  }
  streakCountEl.textContent = `${streak} day${streak === 1 ? '' : 's'} in a row`;
}

/* ---------- Edit dialog ---------- */
function openEdit(dateStr) {
  editDateLabel.textContent = `Edit ${formatDate(dateStr)}`;
  editActivityList.innerHTML = '';
  activities.forEach(act => {
    const li  = document.createElement('li');
    const box = document.createElement('input');
    box.type  = 'checkbox';
    box.id    = `edit-${act.id}`;
    box.checked = data[dateStr]?.[act.id] || false;
    const lab = document.createElement('label');
    lab.htmlFor = box.id;
    lab.textContent = `${act.emoji} ${act.name}`;
    li.append(box, lab);
    editActivityList.appendChild(li);
  });

  editSaveBtn.onclick = () => {
    if (!data[dateStr]) data[dateStr] = {};
    activities.forEach(act => data[dateStr][act.id] = document.getElementById(`edit-${act.id}`).checked);
    localStorage.setItem(dataKey, JSON.stringify(data));
    renderCalendar();
    renderStreak();
  };
  editDialog.showModal();
}

/* ---------- Helpers ---------- */
const formatDate = s => new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
