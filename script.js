// Elements
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const dueDateInput = document.getElementById("due-date");
const priorityInput = document.getElementById("priority");
const todoTableBody = document.querySelector("#todo-table tbody");
const filterStatus = document.getElementById("filter-status");
const deleteAllBtn = document.getElementById("delete-all-btn");
const infoPanel = document.querySelector(".info-panel");

const userForm = document.getElementById("user-form");
const userNameInput = document.getElementById("user-name");
const userLinkInput = document.getElementById("user-link");
const welcomeMsg = document.getElementById("welcome-msg");

// Data Model
let todos = [];
let userProfile = { name: "", link: "" };

// Load from localStorage
window.onload = function () {
  const storedTodos = localStorage.getItem("todos");
  if (storedTodos) {
    todos = JSON.parse(storedTodos);
  }
  const storedUser = localStorage.getItem("userProfile");
  if (storedUser) {
    userProfile = JSON.parse(storedUser);
    greetUser();
  }
  renderTodos();
};

// Save Todos
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Save User Profile
function saveUserProfile() {
  localStorage.setItem("userProfile", JSON.stringify(userProfile));
}

// Greet User
function greetUser() {
  if (userProfile.name) {
    let linkText = userProfile.link
      ? `<a href="${escapeHtml(userProfile.link)}" target="_blank" rel="noopener noreferrer">Your Link</a>`
      : "";
    welcomeMsg.innerHTML = `Hello, <strong>${escapeHtml(
      userProfile.name
    )}</strong>! ${linkText}`;
    userNameInput.value = userProfile.name;
    userLinkInput.value = userProfile.link || "";
  } else {
    welcomeMsg.textContent = "";
  }
}

// Validate date string format YYYY-MM-DD and not past date (optional)
function isValidDate(dateStr) {
  const date = new Date(dateStr);
  return (
    date instanceof Date &&
    !isNaN(date) &&
    dateStr.match(/^\d{4}-\d{2}-\d{2}$/) !== null
  );
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => {
    return (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ] || m
    );
  });
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Add Todo
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const task = todoInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;

  if (!task) {
    showInfo("Task cannot be empty", true);
    return;
  }
  if (dueDate && !isValidDate(dueDate)) {
    showInfo("Please enter a valid due date", true);
    return;
  }

  const newTodo = {
    id: Date.now(),
    task,
    dueDate: dueDate || "No due date",
    priority,
    status: "pending",
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();

  todoForm.reset();
  showInfo("Task added successfully!");
});

// Delete all
deleteAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    todos = [];
    saveTodos();
    renderTodos();
    showInfo("All tasks deleted.");
  }
});

// Filter change
filterStatus.addEventListener("change", () => {
  renderTodos();
});

// Toggle complete and delete button actions
function addActionListeners() {
  const completeBtns = document.querySelectorAll(".action-complete");
  completeBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const todoId = Number(e.target.closest("tr").dataset.id);
      toggleComplete(todoId);
    })
  );

  const deleteBtns = document.querySelectorAll(".action-delete");
  deleteBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const todoId = Number(e.target.closest("tr").dataset.id);
      deleteTodo(todoId);
    })
  );
}

// Toggle complete
function toggleComplete(id) {
  todos = todos.map((todo) =>
    todo.id === id
      ? {
          ...todo,
          status: todo.status === "pending" ? "completed" : "pending",
        }
      : todo
  );
  saveTodos();
  renderTodos();
  showInfo("Task status updated.");
}

// Delete todo
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
  showInfo("Task deleted.");
}

// Render Todos function
function renderTodos() {
  const filter = filterStatus.value;
  let filteredTodos = todos;

  if (filter === "pending") {
    filteredTodos = todos.filter((todo) => todo.status === "pending");
  } else if (filter === "completed") {
    filteredTodos = todos.filter((todo) => todo.status === "completed");
  } else if (filter === "high") {
    filteredTodos = todos.filter((todo) => todo.priority === "high");
  } else if (filter === "medium") {
    filteredTodos = todos.filter((todo) => todo.priority === "medium");
  } else if (filter === "low") {
    filteredTodos = todos.filter((todo) => todo.priority === "low");
  }

  if (filteredTodos.length === 0) {
    todoTableBody.innerHTML =
      '<tr><td colspan="5" class="no-tasks">No tasks found</td></tr>';
    return;
  }

  todoTableBody.innerHTML = filteredTodos
    .map((todo) => {
      return `
        <tr data-id="${todo.id}">
          <td class="${
            todo.status === "completed" ? "status-completed" : ""
          }">${escapeHtml(todo.task)}</td>
          <td>${todo.dueDate}</td>
          <td class="priority-${todo.priority}">${capitalizeFirstLetter(
        todo.priority
      )}</td>
          <td class="status-${todo.status}">${capitalizeFirstLetter(
        todo.status
      )}</td>
          <td>
            <button class="action-btn action-complete" title="Toggle Complete">${
              todo.status === "pending" ? "✔️" : "↩️"
            }</button>
            <button class="action-btn action-delete" title="Delete Task">🗑️</button>
          </td>
        </tr>
      `;
    })
    .join("");

  addActionListeners();
}

// Show informative messages
function showInfo(message, isError = false) {
  infoPanel.textContent = message;
  infoPanel.style.color = isError ? "#ff6b6b" : "#b19cd9";
  setTimeout(() => {
    infoPanel.textContent = "";
  }, 3000);
}

// User profile form submission
userForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = userNameInput.value.trim();
  const link = userLinkInput.value.trim();

  if (!name) {
    alert("Please enter your name.");
    return;
  }

  userProfile.name = name;
  userProfile.link = link;
  saveUserProfile();
  greetUser();
  showInfo("User info saved!");
});