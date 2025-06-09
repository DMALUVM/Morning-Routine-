const activities = [
  { id: 'breathwork', name: '🧘 Breathwork', required: true },
  { id: 'mobility', name: '🤸 Mobility', required: true },
  { id: 'hydration', name: '💧 Hydration', required: true },
  { id: 'supplements', name: '💊 Supplements', required: true },
  { id: 'cold', name: '🧊 Cold Plunge', required: true },
  { id: 'sauna', name: '🔥 Sauna', required: false },
  { id: 'workout', name: '🏋️ Workout', required: true }
];

const storageKey = 'routineData';
let data = JSON.parse(localStorage.getItem(storageKey) || '{}');
const todayStr = new Date().toISOString().split('T')[0];

const tabButtons = document.querySelectorAll('.tab-btn');
const tabs = document.querySelectorAll('.tab');
const todayDateEl = document.getElementById('today-date');
const form = document.getElementById('routine-form');
const saveBtn = document.getElementById('save-btn');
const calendarGrid = document.getElementById('calendar-grid');
const monthLabel = document.getElementById('month-label');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const editModal = document.getElementById('edit-modal');
const editDateTitle = document.getElementById('edit-date-title');
const editChecklist = document.getElementById('edit-checklist');
const editSaveBtn = document.getElementById('edit-save');
const streakChain = document.getElementById('streak-chain');
const streakCountEl = document.getElementById('streak-count');

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let editingDate = null;

function renderToday() {
  todayDateEl.textContent = new Date().toLocaleDateString();
  form.innerHTML = '';
  activities.forEach(act => {
    const label = document.createElement('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.name = act.id;
    box.checked = data[todayStr]?.[act.id] || false;
    label.appendChild(box);
    label.append(` ${act.name}`);
    form.appendChild(label);
  });
}

function saveToday() {
  if (!data[todayStr]) data[todayStr] = {};
  activities.forEach(act => {
    const box = form.querySelector(`[name=${act.id}]`);
    data[todayStr][act.id] = box.checked;
  });
  localStorage.setItem(storageKey, JSON.stringify(data));
  renderCalendar();
  renderStreak();
  alert("Saved!");
}

function renderCalendar() {
  const first = new Date(currentYear, currentMonth, 1);
  const days = new Date(currentYear, currentMonth + 1, 0).getDate();
  calendarGrid.innerHTML = '';
  monthLabel.textContent = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  for (let i = 0; i < first.getDay(); i++) {
    const spacer = document.createElement('div');
    calendarGrid.appendChild(spacer);
  }

  for (let d = 1; d <= days; d++) {
    const date = new Date(currentYear, currentMonth, d);
    const dateStr = date.toISOString().split('T')[0];
    const status = getStatus(dateStr);
    const cell = document.createElement('div');
    cell.className = `calendar-cell ${status}`;
    cell.innerHTML = `<strong>${d}</strong><span>${statusEmoji(status)}</span>`;
    cell.addEventListener('click', () => openEditModal(dateStr));
    calendarGrid.appendChild(cell);
  }
}

function getStatus(dateStr) {
  const entry = data[dateStr];
  if (!entry) return 'none';
  const req = activities.filter(a => a.required);
  const done = req.filter(a => entry[a.id]).length;
  if (done === 0) return 'none';
  if (done === req.length) return 'full';
  return 'partial';
}

function statusEmoji(s) {
  return s === 'full' ? '✅' : s === 'partial' ? '🟡' : '❌';
}

function openEditModal(dateStr) {
  editingDate = dateStr;
  editDateTitle.textContent = `Edit ${new Date(dateStr).toLocaleDateString()}`;
  editChecklist.innerHTML = '';
  activities.forEach(act => {
    const label = document.createElement('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.name = act.id;
    box.checked = data[dateStr]?.[act.id] || false;
    label.appendChild(box);
    label.append(` ${act.name}`);
    editChecklist.appendChild(label);
  });
  editModal.showModal();
}

editSaveBtn.addEventListener('click', () => {
  if (!data[editingDate]) data[editingDate] = {};
  activities.forEach(act => {
    const box = editChecklist.querySelector(`[name=${act.id}]`);
    data[editingDate][act.id] = box.checked;
  });
  localStorage.setItem(storageKey, JSON.stringify(data));
  renderCalendar();
  renderStreak();
});

function renderStreak() {
  let streak = 0;
  let d = new Date(todayStr);
  while (getStatus(d.toISOString().split('T')[0]) === 'full') {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  streakChain.innerHTML = '';
  for (let i = 0; i < streak; i++) {
    const link = document.createElement('span');
    link.className = 'chain-link';
    link.textContent = '🔗';
    streakChain.appendChild(link);
  }
  streakCountEl.textContent = `${streak} day${streak !== 1 ? 's' : ''} in a row`;
}

// Events
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});
prevMonthBtn.addEventListener('click', () => { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } renderCalendar(); });
nextMonthBtn.addEventListener('click', () => { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } renderCalendar(); });
saveBtn.addEventListener('click', saveToday);

// Init
renderToday();
renderCalendar();
renderStreak();
