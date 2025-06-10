const calendarEl = document.getElementById("calendar");
const monthYearEl = document.getElementById("monthYear");
const streakEl = document.getElementById("streak");
const ytdEl = document.getElementById("ytd");

const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const cancelEdit = document.getElementById("cancelEdit");

let selectedDate = null;
let currentDate = new Date();
let data = JSON.parse(localStorage.getItem("routineData") || "{}");

// Activities and their emoji
const activities = {
  breathwork: "🧘",
  hydration: "💧",
  reading: "📖",
  mobility: "🤸",
  exercise: "🏋️",
  sauna: "🔥",
  cold: "🧊",
};

const requiredKeys = ["breathwork", "hydration", "reading", "mobility", "exercise"];

function getDateKey(date) {
  return date.toISOString().split("T")[0];
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  calendarEl.innerHTML = `
    <div class="font-bold">Sun</div>
    <div class="font-bold">Mon</div>
    <div class="font-bold">Tue</div>
    <div class="font-bold">Wed</div>
    <div class="font-bold">Thu</div>
    <div class="font-bold">Fri</div>
    <div class="font-bold">Sat</div>
  `;

  for (let i = 0; i < startDay; i++) {
    const blank = document.createElement("div");
    calendarEl.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const key = getDateKey(date);
    const entry = data[key] || {};
    const completed = requiredKeys.every((k) => entry[k]);

    const dayEl = document.createElement("div");
    dayEl.className = `calendar-day ${completed ? "complete" : "incomplete"}`;
    if (getDateKey(new Date()) === key) dayEl.classList.add("today");

    dayEl.innerHTML = `
      <div class="text-xs font-semibold">${day}</div>
      <div class="emoji-row">${Object.keys(entry)
        .filter((k) => entry[k] && activities[k])
        .map((k) => activities[k])
        .join(" ")}</div>
    `;
    dayEl.addEventListener("click", () => openEditModal(key));
    calendarEl.appendChild(dayEl);
  }

  monthYearEl.textContent = `${firstDay.toLocaleString("default", {
    month: "long",
  })} ${year}`;

  updateStats();
}

function updateStats() {
  let streak = 0;
  let ytd = 0;
  const todayKey = getDateKey(new Date());
  let current = new Date();

  // Check streak backward
  while (true) {
    const key = getDateKey(current);
    const entry = data[key];
    const ok = entry && requiredKeys.every((k) => entry[k]);
    if (ok) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  // YTD required-complete counter
  for (const [key, entry] of Object.entries(data)) {
    if (
      key.startsWith(new Date().getFullYear()) &&
      requiredKeys.every((k) => entry[k])
    ) {
      ytd++;
    }
  }

  streakEl.textContent = `🔥 Streak: ${streak} day${streak === 1 ? "" : "s"}`;
  ytdEl.textContent = `📆 YTD: ${ytd} day${ytd === 1 ? "" : "s"}`;
}

function openEditModal(dateKey) {
  selectedDate = dateKey;
  const entry = data[dateKey] || {};
  for (const el of editForm.elements) {
    if (el.type === "checkbox") {
      el.checked = !!entry[el.name];
    }
  }
  editModal.classList.add("show");
}

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(editForm);
  const result = {};
  for (const key of Object.keys(activities)) {
    result[key] = formData.get(key) === "on";
  }
  data[selectedDate] = result;
  localStorage.setItem("routineData", JSON.stringify(data));
  editModal.classList.remove("show");
  renderCalendar();
});

cancelEdit.addEventListener("click", () => {
  editModal.classList.remove("show");
});

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Initial render
renderCalendar();
