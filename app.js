const activities = [
  { id: 'breathwork', name: '🧘 Breathwork', required: true },
  { id: 'mobility', name: '🤸 Mobility', required: true },
  { id: 'hydration', name: '💧 Hydration', required: true },
  { id: 'supplements', name: '💊 Supplements', required: true },
  { id: 'cold', name: '🧊 Cold Plunge', required: false },
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
  const firstDay = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startWeekday = firstDay.getDay(); // Sunday = 0
  calendarGrid.innerHTML = '';
  monthLabel.textContent = firstDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const required = activities.filter(a => a.required);
  const rows = [];
  let row = [];

  for (let i = 0; i < startWeekday; i++) row.push(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(currentYear, currentMonth, d);
    const dateStr = date.toISOString().split('T')[0];
    const entry = data[dateStr] || {};
    const doneRequired = required.filter(a => entry[a.id]).length;

    let statusClass = 'none';
    if (doneRequired === required.length) statusClass = 'full';
    else if (doneRequired > 0) statusClass = 'partial';

    const bonus = [];
    if (entry['cold']) bonus.push('🧊');
    if (entry['sauna']) bonus.push('🔥');

    row.push({
      day: d,
      dateStr,
      statusClass,
      bonus: bonus.join(' ')
    });

    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }

  while (row.length < 7) row.push(null);
  rows.push(row);

  rows.forEach(week => {
    week.forEach(cell => {
      const div = document.createElement('div');
      if (!cell) {
        div.className = 'calendar-cell empty';
      } else {
        div.className = `calendar-cell ${cell.statusClass}`;
        div.innerHTML = `
          <div class="day-number">${cell.day}</div>
          <div class="bonus">${cell.bonus}</div>
        `;
        div.addEventListener('click', () => openEditModal(cell.dateStr));
      }
      calendarGrid.appendChild(div);
    });
  });
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
  while (true) {
    const ds = d.toISOString().split('T')[0];
    const entry = data[ds];
    if (!entry) break;
    const required = activities.filter(a => a.required);
    const completed = required.filter(a => entry[a.id]).length;
    if (completed === required.length) {
      streak++;
      d.setDate(d.getDate() - 1);
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
  streakCountEl.textContent = `${streak} day${streak !== 1 ? 's' : ''} in a row`;
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
});

saveBtn.addEventListener('click', saveToday);

renderToday();
renderCalendar();
renderStreak();
