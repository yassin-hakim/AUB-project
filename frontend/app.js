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
    return `<section class="column" data-status="${status}"><h2>${title} <span class="column-count">${matching.length}</span></h2><div class="task-list">${matching.map((task) => `
      <article class="task-card">
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
    notice.textContent = error.message;
    board.innerHTML = "";
  }
}

function openDialog(task = null) {
  form.reset();
  formError.textContent = "";
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
  return {
    title: document.querySelector("#title").value.trim(),
    description: document.querySelector("#description").value.trim(),
    status: document.querySelector("#status").value,
    priority: document.querySelector("#priority").value,
    assignee: document.querySelector("#assignee").value.trim(),
    due_date: document.querySelector("#due-date").value || null,
    tags: document.querySelector("#tags").value.split(",").map((tag) => tag.trim()).filter(Boolean),
  };
}

document.querySelector("#new-task-button").addEventListener("click", () => openDialog());
document.querySelector("#close-dialog").addEventListener("click", () => dialog.close());
document.querySelector("#cancel-button").addEventListener("click", () => dialog.close());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.querySelector("#task-id").value;
  const response = await fetch(id ? `/tasks/${id}` : "/tasks", {
    method: id ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskPayload()),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    formError.textContent = error.detail?.[0]?.msg || error.detail || `Could not save task (${response.status})`;
    return;
  }
  dialog.close();
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

["#status-filter", "#priority-filter", "#overdue-filter"].forEach((selector) => document.querySelector(selector).addEventListener("change", loadTasks));
document.querySelector("#tag-filter").addEventListener("search", loadTasks);
document.querySelector("#tag-filter").addEventListener("change", loadTasks);
document.querySelector("#clear-filters").addEventListener("click", () => { document.querySelector(".filters").querySelectorAll("select, input").forEach((input) => { if (input.type === "checkbox") input.checked = false; else input.value = ""; }); loadTasks(); });

loadTasks();
