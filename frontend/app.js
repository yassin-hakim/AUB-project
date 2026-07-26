const board = document.querySelector("#board");
const notice = document.querySelector("#notice");
const dialog = document.querySelector("#task-dialog");
const form = document.querySelector("#task-form");
const formError = document.querySelector("#form-error");
const columns = [
  ["ToDo", "To Do"],
  ["InProgress", "In Progress"],
  ["Done", "Done"],
];

let tasks = [];
let editingTask = null;

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;",
  }[character]));
}

function dateLabel(task) {
  if (!task.due_date) return "No due date";
  const overdue = task.status !== "Done" && task.due_date < new Date().toISOString().slice(0, 10);
  return `<span class="${overdue ? "overdue" : ""}">${overdue ? "Overdue: " : "Due: "}${escapeHtml(task.due_date)}</span>`;
}

function render() {
  board.innerHTML = columns.map(([status, title]) => {
    const matching = tasks.filter((task) => task.status === status);
    return `<section class="column" data-status="${status}"><h2>${title} <span class="column-count">${matching.length}</span></h2><div class="task-list" data-drop-status="${status}">${matching.map((task) => `
      <article class="task-card" draggable="true" data-task-id="${task.id}">
        <h3>${escapeHtml(task.title)}</h3>
        ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ""}
        <div class="metadata"><span>${escapeHtml(task.priority)}</span><span>${task.assignee ? `• ${escapeHtml(task.assignee)}` : ""}</span>${dateLabel(task)}</div>
        ${task.tags.length ? `<div class="tag-list">${task.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
        <div class="card-actions"><button data-action="edit" data-id="${task.id}">Edit</button><button data-action="delete" data-id="${task.id}" class="delete">Delete</button></div>
      </article>`).join("") || "<p>No tasks here.</p>"}</div></section>`;
  }).join("");
}

function currentFilters() {
  const query = new URLSearchParams();
  const status = document.querySelector("#status-filter").value;
  const priority = document.querySelector("#priority-filter").value;
  const tag = document.querySelector("#tag-filter").value.trim();
  const overdue = document.querySelector("#overdue-filter").checked;
  if (status) query.set("status", status);
  if (priority) query.set("priority", priority);
  if (tag) query.set("tag", tag);
  if (overdue) query.set("overdue", "true");
  return query;
}

async function loadTasks() {
  notice.textContent = "Loading tasks…";
  try {
    const response = await fetch(`/tasks?${currentFilters()}`);
    if (!response.ok) throw new Error(`Could not load tasks (${response.status})`);
    tasks = await response.json();
    notice.textContent = tasks.length ? "" : "No tasks match these filters.";
    render();
  } catch (error) {
    notice.textContent = "";
    const message = document.createElement("span");
    message.textContent = error.message;
    const retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.className = "text-button";
    retryButton.textContent = "Retry";
    retryButton.addEventListener("click", loadTasks);
    notice.append(message, " ", retryButton);
    render();
  }
}

function openDialog(task = null) {
  form.reset();
  formError.textContent = "";
  editingTask = task;
  document.querySelector("#dialog-title").textContent = task ? "Edit task" : "New task";
  document.querySelector("#task-id").value = task?.id ?? "";
  document.querySelector("#title").value = task?.title ?? "";
  document.querySelector("#description").value = task?.description ?? "";
  document.querySelector("#status").value = task?.status ?? "ToDo";
  document.querySelector("#priority").value = task?.priority ?? "Medium";
  document.querySelector("#assignee").value = task?.assignee ?? "";
  document.querySelector("#due-date").value = task?.due_date ?? "";
  document.querySelector("#tags").value = task?.tags.join(", ") ?? "";
  dialog.showModal();
  document.querySelector("#title").focus();
}

function taskPayload() {
  const payload = {
    title: document.querySelector("#title").value.trim(),
    description: document.querySelector("#description").value.trim(),
    status: document.querySelector("#status").value,
    priority: document.querySelector("#priority").value,
    assignee: document.querySelector("#assignee").value.trim(),
    due_date: document.querySelector("#due-date").value || null,
    tags: document.querySelector("#tags").value.split(",").map((tag) => tag.trim()).filter(Boolean),
  };
  if (!editingTask) return payload;
  return Object.fromEntries(Object.entries(payload).filter(
    ([key, value]) => JSON.stringify(value) !== JSON.stringify(editingTask[key]),
  ));
}

document.querySelector("#new-task-button").addEventListener("click", () => openDialog());
document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-button").addEventListener("click", () => dialog.close());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.querySelector("#task-id").value;
  const payload = taskPayload();
  if (id && Object.keys(payload).length === 0) {
    dialog.close();
    return;
  }
  const response = await fetch(id ? `/tasks/${id}` : "/tasks", {
    method: id ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    formError.textContent = error.detail?.[0]?.msg || error.detail || `Could not save task (${response.status})`;
    return;
  }
  dialog.close();
  editingTask = null;
  loadTasks();
});

board.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const task = tasks.find((item) => item.id === Number(button.dataset.id));
  if (button.dataset.action === "edit" && task) openDialog(task);
  if (button.dataset.action === "delete" && confirm(`Delete “${task.title}”?`)) {
    const response = await fetch(`/tasks/${task.id}`, { method: "DELETE" });
    if (!response.ok) notice.textContent = `Could not delete task (${response.status})`;
    else loadTasks();
  }
});

board.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".task-card");
  if (!card) return;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", card.dataset.taskId);
  card.classList.add("dragging");
});

board.addEventListener("dragend", (event) => {
  event.target.closest(".task-card")?.classList.remove("dragging");
});

board.addEventListener("dragover", (event) => {
  if (event.target.closest(".task-list")) event.preventDefault();
});

board.addEventListener("drop", async (event) => {
  const list = event.target.closest(".task-list");
  if (!list) return;
  event.preventDefault();
  const task = tasks.find((item) => item.id === Number(event.dataTransfer.getData("text/plain")));
  const status = list.dataset.dropStatus;
  if (!task || task.status === status) return;
  const response = await fetch(`/tasks/${task.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    notice.textContent = error.detail || `Could not move task (${response.status})`;
    return;
  }
  notice.textContent = "";
  loadTasks();
});

["#status-filter", "#priority-filter", "#overdue-filter"].forEach((selector) => document.querySelector(selector).addEventListener("change", loadTasks));
document.querySelector("#tag-filter").addEventListener("search", loadTasks);
document.querySelector("#tag-filter").addEventListener("change", loadTasks);
document.querySelector("#clear-filters").addEventListener("click", () => { document.querySelector(".filters").querySelectorAll("select, input").forEach((input) => { if (input.type === "checkbox") input.checked = false; else input.value = ""; }); loadTasks(); });

loadTasks();
