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
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

const tabButtons = document.querySelectorAll('.tab-btn');
const tabs = document.querySelectorAll('.tab');
const todayDateEl = document.getElementById('today-date');
const todayStatusEl = document.getElementById('today-status');
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
const cancelBtn = document.querySelector('.cancel-btn');
const streakChain = document.getElementById('streak-chain');
const streakCountEl = document.getElementById('streak-count');

let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

function renderToday() {
  todayDateEl.textContent = today.toLocaleDateString();
  form.innerHTML = '';
  activities.forEach(act => {
    form.innerHTML += `
      <label class="flex items-center gap-2">
        <input type="checkbox" name="${act.id}" ${data[todayStr]?.[act.id] ? 'checked' : ''}>
        <span>${act.name}</span>
      </label>`;
  });
  updateTodayStatus();
}

function updateTodayStatus() {
  const entry = data[todayStr] || {};
  const required = activities.filter(a => a.required);
  const doneRequired = required.filter(a => entry[a.id]).length;
  todayStatusEl.className = 'status-indicator';
  if (doneRequired === required.length) {
    todayStatusEl.classList.add('full');
  } else if (doneRequired > 0) {
    todayStatusEl.classList.add('partial');
  } else {
    todayStatusEl.classList.add('none');
  }
}

function saveToday() {
  if (!data[todayStr]) data[todayStr] = {};
  activities.forEach(act => {
    const box = form.querySelector(`[name="${act.id}"]`);
    data[todayStr][act.id] = box.checked;
  });
  localStorage.setItem(storageKey, JSON.stringify(data));
  updateTodayStatus();
  renderCalendar();
  renderStreak();
  alert('Saved!');
}
function renderCalendar() {
  calendarGrid.innerHTML = '';
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthDate = new Date(currentYear, currentMonth);
  monthLabel.textContent = monthDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  for (let i = 0; i < firstDay; i++) {
    const cell = document.createElement('div');
    cell.classList.add('calendar-cell', 'empty');
    calendarGrid.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    const entry = data[dateStr] || {};
    const required = activities.filter(a => a.required);
    const doneRequired = required.filter(a => entry[a.id]).length;

    const cell = document.createElement('div');
    cell.classList.add('calendar-cell');
    cell.dataset.date = dateStr;

    // Completion background color
    if (doneRequired === required.length) {
      cell.classList.add('full');
    } else if (doneRequired > 0) {
      cell.classList.add('partial');
    } else if (Object.keys(entry).length > 0) {
      cell.classList.add('none');
    }

    // Highlight today
    if (dateStr === todayStr) {
      cell.classList.add('today');
    }

    cell.innerHTML = `<div class="day-number">${day}</div>`;

    // Bonus indicators
    if (entry['cold']) cell.innerHTML += `<div class="bonus">🧊</div>`;
    if (entry['sauna']) cell.innerHTML += `<div class="bonus">🔥</div>`;

    calendarGrid.appendChild(cell);
  }
}

function openEditModal(dateStr) {
  editDateTitle.textContent = `Edit ${new Date(dateStr).toLocaleDateString()}`;
  editChecklist.innerHTML = '';
  activities.forEach(act => {
    editChecklist.innerHTML += `
      <label class="flex items-center gap-2">
        <input type="checkbox" name="${act.id}" ${data[dateStr]?.[act.id] ? 'checked' : ''}>
        <span>${act.name}</span>
      </label>`;
  });
  editModal.dataset.date = dateStr;
  editModal.classList.add('open');
}

function closeModal() {
  editModal.classList.remove('open');
}

editSaveBtn.addEventListener('click', () => {
  const dateStr = editModal.dataset.date;
  if (!data[dateStr]) data[dateStr] = {};
  activities.forEach(act => {
    const box = editChecklist.querySelector(`[name="${act.id}"]`);
    data[dateStr][act.id] = box.checked;
  });
  localStorage.setItem(storageKey, JSON.stringify(data));
  renderCalendar();
  renderStreak();
  closeModal();
});

cancelBtn.addEventListener('click', closeModal);

calendarGrid.addEventListener('click', e => {
  const cell = e.target.closest('.calendar-cell');
  if (cell && !cell.classList.contains('empty')) {
    openEditModal(cell.dataset.date);
  }
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
  streakChain.innerHTML = Array(streak).fill('<span class="chain-link">🔥</span>').join('');
  streakCountEl.textContent = `${streak} day${streak !== 1 ? 's' : ''} in a row`;
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabs.forEach(t => t.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.remove('hidden');
  });
});

saveBtn.addEventListener('click', saveToday);

renderToday();
renderCalendar();
renderStreak();
