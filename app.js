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

const calendarGrid = document.getElementById('calendar-grid');
const monthLabel = document.getElementById('month-label');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const editModal = document.getElementById('edit-modal');
const editDateTitle = document.getElementById('edit-date-title');
const editChecklist = document.getElementById('edit-checklist');
const editSaveBtn = document.getElementById('edit-save');
const cancelBtn = document.querySelector('.cancel-btn');

let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

function renderCalendar() {
  calendarGrid.innerHTML = '';
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  monthLabel.textContent = new Date(currentYear, currentMonth).toLocaleDateString('default', {
    month: 'long',
    year: 'numeric'
  });

  // Fill empty cells
  for (let i = 0; i < firstDay; i++) {
    calendarGrid.innerHTML += `<div class="calendar-cell empty"></div>`;
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

renderCalendar();
