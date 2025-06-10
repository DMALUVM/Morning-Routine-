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
const today = new Date(2025, 5, 9); // June 9, 2025
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
  monthLabel.textContent = new Date(currentYear, currentMonth).toLocaleDateString('default', { month: 'long', year: 'numeric' });

  // Empty cells for start of month
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.innerHTML += '<div class="calendar-cell empty"></div>';
  }

  // Days
  const required = activities.filter(a => a.required);
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

    calendarGrid.innerHTML += `
      <div class="calendar-cell ${statusClass} ${dateStr === todayStr ? 'today' : ''}" data-date="${dateStr}">
        <div class="day-number">${d}</div>
        <div class="bonus">${bonus.join(' ')}</div>
      </div>`;
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
  editModal.classList.add('open');
}

function closeModal() {
  editModal.classList.remove('open');
}

editSaveBtn.addEventListener('click', () => {
  const dateStr = new Date(editDateTitle.textContent.replace('Edit ', '')).toISOString().split('T')[0];
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
