const todoInput = document.getElementById("todo-input");
const deadlineInput = document.getElementById("deadline-input");
const categoryInput = document.getElementById("category-input");
const addButton = document.getElementById("add-button");
const todoList = document.getElementById("todo-list");
const statusMessage = document.getElementById("status-message");

const DEFAULT_CATEGORY = "未分類";
const TODO_TABLE = "todos";
const REFRESH_INTERVAL_MS = 10000;

let supabaseClient;
let todos = [];
let isLoading = false;

function showStatus(message, type = "info") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.className = "status-message";
}

function validateConfig() {
  if (!window.SUPABASE_CONFIG) {
    throw new Error("config.js が読み込まれていません。");
  }

  const { url, anonKey } = window.SUPABASE_CONFIG;

  if (!url || url.includes("YOUR_SUPABASE_URL")) {
    throw new Error("config.js の Supabase URL を設定してください。");
  }

  if (!anonKey || anonKey.includes("YOUR_SUPABASE_ANON_KEY")) {
    throw new Error("config.js の anon key を設定してください。");
  }

  return { url, anonKey };
}

function sortTodosByDeadline(todoItems) {
  return [...todoItems].sort((a, b) => {
    if (!a.deadline && !b.deadline) {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }

    if (!a.deadline) {
      return 1;
    }

    if (!b.deadline) {
      return -1;
    }

    const deadlineCompare = a.deadline.localeCompare(b.deadline);

    if (deadlineCompare !== 0) {
      return deadlineCompare;
    }

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

function getDeadlineClass(deadline) {
  if (!deadline) {
    return "";
  }

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const deadlineDate = new Date(`${deadline}T00:00:00`);
  const diffTime = deadlineDate.getTime() - todayStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "deadline-urgent";
  }

  if (diffDays <= 3) {
    return "deadline-soon";
  }

  return "";
}

function createField(label, value) {
  const field = document.createElement("div");
  const fieldLabel = document.createElement("span");
  const fieldValue = document.createElement("span");

  field.className = "todo-field";
  fieldLabel.className = "todo-label";
  fieldValue.className = "todo-value";

  fieldLabel.textContent = label;
  fieldValue.textContent = value;

  field.appendChild(fieldLabel);
  field.appendChild(fieldValue);

  return field;
}

function renderTodos() {
  todoList.innerHTML = "";

  if (todos.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = "ToDo はまだありません。上の入力欄から追加してください。";
    todoList.appendChild(emptyItem);
    return;
  }

  const sortedTodos = sortTodosByDeadline(todos);

  sortedTodos.forEach((todo) => {
    const listItem = document.createElement("li");
    const content = document.createElement("div");
    const deleteButton = document.createElement("button");
    const deadlineClass = getDeadlineClass(todo.deadline);

    content.className = "todo-content";
    deleteButton.textContent = "削除";
    deleteButton.type = "button";

    if (deadlineClass) {
      listItem.classList.add(deadlineClass);
    }

    content.appendChild(createField("やること", todo.text));
    content.appendChild(createField("締切", todo.deadline || "未設定"));
    content.appendChild(createField("カテゴリ", todo.category || DEFAULT_CATEGORY));

    deleteButton.addEventListener("click", async () => {
      await deleteTodo(todo.id);
    });

    listItem.appendChild(content);
    listItem.appendChild(deleteButton);
    todoList.appendChild(listItem);
  });
}

async function fetchTodos(showLoadingMessage = true) {
  if (showLoadingMessage) {
    showStatus("ToDo を読み込み中です...");
  }

  const { data, error } = await supabaseClient
    .from(TODO_TABLE)
    .select("id, text, deadline, category, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  todos = data ?? [];
  renderTodos();

  if (showLoadingMessage) {
    clearStatus();
  }
}

async function addTodo() {
  const todoText = todoInput.value.trim();
  const deadline = deadlineInput.value || null;
  const category = categoryInput.value.trim() || DEFAULT_CATEGORY;

  if (todoText === "" || isLoading) {
    return;
  }

  isLoading = true;
  addButton.disabled = true;
  showStatus("ToDo を追加しています...");

  try {
    const { error } = await supabaseClient.from(TODO_TABLE).insert({
      text: todoText,
      deadline,
      category
    });

    if (error) {
      throw error;
    }

    todoInput.value = "";
    deadlineInput.value = "";
    categoryInput.value = "";

    await fetchTodos(false);
    showStatus("ToDo を追加しました。", "success");
  } catch (error) {
    showStatus(`追加に失敗しました: ${error.message}`, "error");
  } finally {
    isLoading = false;
    addButton.disabled = false;
  }
}

async function deleteTodo(todoId) {
  if (isLoading) {
    return;
  }

  isLoading = true;
  addButton.disabled = true;
  showStatus("ToDo を削除しています...");

  try {
    const { error } = await supabaseClient
      .from(TODO_TABLE)
      .delete()
      .eq("id", todoId);

    if (error) {
      throw error;
    }

    await fetchTodos(false);
    showStatus("ToDo を削除しました。", "success");
  } catch (error) {
    showStatus(`削除に失敗しました: ${error.message}`, "error");
  } finally {
    isLoading = false;
    addButton.disabled = false;
  }
}

function registerEnterKey(target) {
  target.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      addTodo();
    }
  });
}

async function initializeApp() {
  try {
    const { url, anonKey } = validateConfig();

    supabaseClient = window.supabase.createClient(url, anonKey);

    await fetchTodos();
    window.setInterval(() => {
      fetchTodos(false).catch((error) => {
        showStatus(`自動更新に失敗しました: ${error.message}`, "error");
      });
    }, REFRESH_INTERVAL_MS);
  } catch (error) {
    showStatus(error.message, "error");
  }
}

addButton.addEventListener("click", addTodo);
registerEnterKey(todoInput);
registerEnterKey(deadlineInput);
registerEnterKey(categoryInput);

initializeApp();
