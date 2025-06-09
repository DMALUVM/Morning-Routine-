// --- Config: Define your habits ---
const activities = [
  { id: 'breathwork',  name: '🧘 Breathwork / Mindfulness', required: true },
  { id: 'mobility',    name: '🤸 Mobility / Stretching',     required: true },
  { id: 'hydration',   name: '💧 Hydration Upon Waking',     required: true },
  { id: 'supplements', name: '💊 Supplements',               required: true },
  { id: 'cold',        name: '🧊 Cold Plunge',               required: true },
  { id: 'sauna',       name: '🔥 Sauna',                     required: false },
  { id: 'workout',     name: '🏋️ Workout / Exercise',        required: true }
];

const storageKey = 'morningRoutineData';
let data = JSON.parse(localStorage.getItem(storageKey) || '{}');
const todayStr = new Date().toISOString().split('T')[0];

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabs = document.querySelectorAll('.tab');
const todayDateEl = document.getElementById('today-date');
const form = document.getElementById('routine-form');
const saveBtn = document.getElementById('save-btn');

// Render Today View
function renderToday() {
  todayDateEl.textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  form.innerHTML = '';
  activities.forEach(act => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = act.id;
    checkbox.checked = data[todayStr]?.[act.id] || false;
    label.appendChild(checkbox);
    label.append(` ${act.name}`);
    form.appendChild(label);
  });
}

// Save today's routine
function saveToday() {
  if (!data[todayStr]) data[todayStr] = {};
  activities.forEach(act => {
    const checkbox = form.querySelector(`[name=${act.id}]`);
    data[todayStr][act.id] = checkbox.checked;
  });
  localStorage.setItem(storageKey, JSON.stringify(data));
  renderCalendar();
  renderStreak();
  alert("Routine saved!");
}

// Tab switching
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Event Bindings
saveBtn.addEventListener('click', saveToday);

// Initial Render
renderToday();
// Calendar logic
const calendarGrid = document.getElementById('calendar-grid');
const monthLabel = document.getElementById('month-label');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));

function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
}

function renderCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  calendarGrid.innerHTML = '';
  monthLabel.textContent = firstDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // Blank starting cells
  for (let i = 0; i < firstDay.getDay(); i++) {
    const spacer = document.createElement('div');
    calendarGrid.appendChild(spacer);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const cell = document.createElement('div');
    cell.className = `calendar-cell ${getDayStatus(dateStr)}`;
    cell.innerHTML = `<strong>${day}</strong><span>${statusEmoji(getDayStatus(dateStr))}</span>`;
    cell.addEventListener('click', () => openEditModal(dateStr));
    calendarGrid.appendChild(cell);
  }
}

function getDayStatus(dateStr) {
  const entry = data[dateStr];
  if (!entry) return 'none';
  const required = activities.filter(a => a.required);
  const completed = required.filter(a => entry[a.id]).length;
  if (completed === 0) return 'none';
  if (completed === required.length) return 'full';
  return 'partial';
}

function statusEmoji(status) {
  if (status === 'full') return '✅';
  if (status === 'partial') return '🟡';
  return '❌';
}

// Modal edit logic
const editModal = document.getElementById('edit-modal');
const editDateTitle = document.getElementById('edit-date-title');
const editChecklist = document.getElementById('edit-checklist');
const editSaveBtn = document.getElementById('edit-save');
let editingDate = null;

function openEditModal(dateStr) {
  editingDate = dateStr;
  editDateTitle.textContent = `Edit ${new Date(dateStr).toLocaleDateString()}`;
  editChecklist.innerHTML = '';

  activities.forEach(act => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = act.id;
    checkbox.checked = data[dateStr]?.[act.id] || false;
    label.appendChild(checkbox);
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
// Streak tracker
const streakChain = document.getElementById('streak-chain');
const streakCountEl = document.getElementById('streak-count');

function renderStreak() {
  let streak = 0;
  let date = new Date(todayStr);

  while (true) {
    const str = date.toISOString().split('T')[0];
    if (getDayStatus(str) === 'full') {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
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

// Final rendering after loading app
renderCalendar();
renderStreak();
