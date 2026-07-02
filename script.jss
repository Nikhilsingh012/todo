const STORAGE_KEY = "todo-items-v1";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const clearCompletedBtn = document.getElementById("clear-completed");
const clearAllBtn = document.getElementById("clear-all");

let todos = loadTodos();
render();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: Date.now(),
  });

  saveTodos();
  render();
  form.reset();
  input.focus();
});

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
});

clearAllBtn.addEventListener("click", () => {
  const confirmed = confirm("Delete all tasks?");
  if (!confirmed) return;
  todos = [];
  saveTodos();
  render();
});

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  list.innerHTML = "";

  if (todos.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  for (const todo of todos) {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      saveTodos();
      render();
    });

    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = todo.text;
    span.title = "Double-click to edit";
    span.addEventListener("dblclick", () => startEdit(todo.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn";
    deleteBtn.textContent = "🗑";
    deleteBtn.title = "Delete task";
    deleteBtn.addEventListener("click", () => {
      todos = todos.filter((t) => t.id !== todo.id);
      saveTodos();
      render();
    });

    li.append(checkbox, span, deleteBtn);
    list.appendChild(li);
  }
}

function startEdit(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  const updated = prompt("Edit task:", todo.text);
  if (updated === null) return;

  const nextText = updated.trim();
  if (!nextText) {
    const shouldDelete = confirm("Task is empty. Delete it?");
    if (shouldDelete) {
      todos = todos.filter((t) => t.id !== id);
    }
  } else {
    todo.text = nextText;
  }

  saveTodos();
  render();
}
