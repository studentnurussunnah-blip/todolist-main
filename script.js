// Elemen DOM
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const totalTasksElement = document.getElementById("totalTasks");
const completedTasksElement = document.getElementById("completedTasks");
const filterButtons = document.querySelectorAll(".filter-btn");
const scriptUrlInput = document.getElementById("scriptUrl");
const saveConfigBtn = document.getElementById("saveConfigBtn");
const testConnectionBtn = document.getElementById("testConnectionBtn");
const loadTasksBtn = document.getElementById("loadTasksBtn");
const configStatus = document.getElementById("configStatus");
const appStatus = document.getElementById("appStatus");

// State aplikasi
let tasks = [];
let currentFilter = "all";
let scriptUrl = "";
let isOnlineMode = false;

// Inisialisasi konfigurasi
function initConfig() {
  // Coba muat URL dari localStorage
  const savedScriptUrl = localStorage.getItem("todoScriptUrl");

  if (savedScriptUrl) {
    scriptUrlInput.value = savedScriptUrl;
    scriptUrl = savedScriptUrl;
    isOnlineMode = true;
    showStatus("info", "Mode: Online (Apps Script)");
  } else {
    showStatus(
      "info",
      "Mode: Offline (Local Storage) - Masukkan URL Apps Script"
    );
  }
}

// Simpan konfigurasi
function saveConfig() {
  scriptUrl = scriptUrlInput.value.trim();

  if (!scriptUrl) {
    showConfigStatus("error", "Masukkan URL Apps Script terlebih dahulu");
    return;
  }

  localStorage.setItem("todoScriptUrl", scriptUrl);
  isOnlineMode = true;
  showConfigStatus("success", "URL berhasil disimpan!");
  showStatus("info", "Mode: Online (Apps Script)");
}

// Test koneksi ke Apps Script
async function testConnection() {
  if (!isOnlineMode) {
    showConfigStatus("error", "Harap simpan URL Apps Script terlebih dahulu");
    return;
  }

  showConfigStatus("info", "Menguji koneksi ke Apps Script...");
  testConnectionBtn.innerHTML = '<span class="loading"></span> Testing...';
  testConnectionBtn.disabled = true;

  try {
    const url = `${scriptUrl}?action=test`;
    const response = await fetch(url);

    if (response.ok) {
      showConfigStatus("success", "Koneksi ke Apps Script berhasil!");
    } else {
      throw new Error("Connection failed");
    }
  } catch (error) {
    console.error("Connection test error:", error);
    showConfigStatus(
      "error",
      "Gagal terhubung ke Apps Script. Periksa URL dan deployment."
    );
  } finally {
    testConnectionBtn.innerHTML = '<i class="fas fa-wifi"></i> Test Koneksi';
    testConnectionBtn.disabled = false;
  }
}

// Panggil API Apps Script
async function callAppsScript(action, params = {}) {
  if (!isOnlineMode) {
    throw new Error("Apps Script URL not configured");
  }

  const urlParams = new URLSearchParams({
    action: action,
    ...params,
  });

  const url = `${scriptUrl}?${urlParams.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Muat tugas dari Apps Script
async function loadTasksFromServer() {
  if (!isOnlineMode) {
    showConfigStatus(
      "error",
      "Harap konfigurasi URL Apps Script terlebih dahulu"
    );
    return;
  }

  showConfigStatus("info", "Memuat tugas dari server...");
  loadTasksBtn.innerHTML = '<span class="loading"></span> Memuat...';
  loadTasksBtn.disabled = true;

  try {
    const result = await callAppsScript("getTasks");

    if (result.success) {
      tasks = result.tasks.map((task) => ({
        id: task.id,
        text: task.text,
        completed: task.completed,
        createdAt: task.createdAt || new Date().toISOString(),
      }));

      saveTasksToLocal();
      updateStats();
      renderTasks();
      showConfigStatus(
        "success",
        `Berhasil memuat ${tasks.length} tugas dari server`
      );
    } else {
      throw new Error(result.error || "Failed to load tasks");
    }
  } catch (error) {
    console.error("Error loading tasks:", error);
    showConfigStatus("error", "Gagal memuat tugas: " + error.message);

    // Fallback ke localStorage
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = savedTasks;
    updateStats();
    renderTasks();
  } finally {
    loadTasksBtn.innerHTML = '<i class="fas fa-sync"></i> Muat Tugas';
    loadTasksBtn.disabled = false;
  }
}

// Tambah tugas ke server
async function addTaskToServer(taskText) {
  if (!isOnlineMode) {
    return { success: false, offline: true };
  }

  try {
    const result = await callAppsScript("addTask", { text: taskText });
    return result;
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, error: error.message };
  }
}

// Update tugas di server
async function updateTaskOnServer(id, text, completed) {
  if (!isOnlineMode) {
    return { success: false, offline: true };
  }

  try {
    const result = await callAppsScript("updateTask", {
      id: id,
      text: text,
      completed: completed.toString(),
    });
    return result;
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: error.message };
  }
}

// Hapus tugas dari server
async function deleteTaskFromServer(id) {
  if (!isOnlineMode) {
    return { success: false, offline: true };
  }

  try {
    const result = await callAppsScript("deleteTask", { id: id });
    return result;
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: error.message };
  }
}

// Tampilkan pesan status
function showStatus(type, message) {
  appStatus.textContent = message;
  appStatus.className = "status-message " + type;
  setTimeout(() => {
    appStatus.style.display = "none";
  }, 5000);
}

function showConfigStatus(type, message) {
  configStatus.textContent = message;
  configStatus.className = "status-message " + type;
  setTimeout(() => {
    configStatus.style.display = "none";
  }, 5000);
}

// Fungsi untuk menyimpan tugas ke localStorage
function saveTasksToLocal() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateStats();
}

// Fungsi untuk memperbarui statistik
function updateStats() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  totalTasksElement.textContent = totalTasks;
  completedTasksElement.textContent = completedTasks;

  // Tampilkan atau sembunyikan empty state
  if (tasks.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }
}

// Fungsi untuk menambahkan tugas baru
async function addTask(taskText) {
  if (taskText.trim() === "") {
    showStatus("error", "Silakan masukkan tugas!");
    return;
  }

  const newTask = {
    id: "local_" + Date.now(),
    text: taskText,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  // Coba simpan ke server jika online
  if (isOnlineMode) {
    showStatus("info", "Menyimpan ke server...");
    const result = await addTaskToServer(taskText);

    if (result.success) {
      newTask.id = result.id;
      showStatus("success", "Tugas berhasil ditambahkan ke server");
    } else if (result.offline) {
      showStatus("info", "Tugas ditambahkan secara lokal");
    } else {
      showStatus("warning", "Tugas ditambahkan secara lokal (server error)");
    }
  }

  tasks.push(newTask);
  saveTasksToLocal();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
}

// Fungsi untuk menghapus tugas
async function deleteTask(id) {
  if (isOnlineMode) {
    const result = await deleteTaskFromServer(id);
    if (result.success) {
      showStatus("success", "Tugas dihapus dari server");
    }
  }

  tasks = tasks.filter((task) => task.id !== id);
  saveTasksToLocal();
  renderTasks();
}

// Fungsi untuk mengubah status tugas (selesai/belum)
async function toggleTaskCompletion(id) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;

  const newCompleted = !task.completed;

  if (isOnlineMode) {
    const result = await updateTaskOnServer(id, task.text, newCompleted);
    if (result.success) {
      showStatus("success", "Status tugas diperbarui di server");
    }
  }

  task.completed = newCompleted;
  saveTasksToLocal();
  renderTasks();
}

// Fungsi untuk mengedit tugas
async function editTask(id) {
  const task = tasks.find((task) => task.id === id);
  if (!task) return;

  const newText = prompt("Edit tugas:", task.text);
  if (newText !== null && newText.trim() !== "") {
    if (isOnlineMode) {
      const result = await updateTaskOnServer(
        id,
        newText.trim(),
        task.completed
      );
      if (result.success) {
        showStatus("success", "Tugas diperbarui di server");
      }
    }

    task.text = newText.trim();
    saveTasksToLocal();
    renderTasks();
  }
}

// Fungsi untuk merender daftar tugas berdasarkan filter
function renderTasks() {
  // Filter tugas berdasarkan filter yang aktif
  let filteredTasks = tasks;
  if (currentFilter === "pending") {
    filteredTasks = tasks.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((task) => task.completed);
  }

  // Kosongkan daftar tugas
  taskList.innerHTML = "";

  // Jika tidak ada tugas setelah filter, tampilkan empty state
  if (filteredTasks.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";
    emptyMessage.innerHTML = `
                    <i class="fas fa-${
                      currentFilter === "completed"
                        ? "check-circle"
                        : "clipboard-list"
                    }"></i>
                    <h3>Tidak ada tugas ${getFilterText()}</h3>
                    <p>${getEmptyStateMessage()}</p>
                `;
    taskList.appendChild(emptyMessage);
    return;
  }

  // Tambahkan setiap tugas ke daftar
  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.className = `task-item ${task.completed ? "completed" : ""}`;

    taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${
                      task.completed ? "checked" : ""
                    }>
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        <button class="edit-btn" title="Edit tugas"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" title="Hapus tugas"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;

    // Tambahkan event listeners untuk elemen tugas
    const checkbox = taskItem.querySelector(".task-checkbox");
    const editBtn = taskItem.querySelector(".edit-btn");
    const deleteBtn = taskItem.querySelector(".delete-btn");

    checkbox.addEventListener("change", () => toggleTaskCompletion(task.id));
    editBtn.addEventListener("click", () => editTask(task.id));
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(taskItem);
  });
}

// Fungsi untuk mendapatkan teks filter
function getFilterText() {
  switch (currentFilter) {
    case "all":
      return "";
    case "pending":
      return "yang belum selesai";
    case "completed":
      return "yang sudah selesai";
    default:
      return "";
  }
}

// Fungsi untuk mendapatkan pesan empty state berdasarkan filter
function getEmptyStateMessage() {
  switch (currentFilter) {
    case "all":
      return "Tambahkan tugas baru untuk memulai";
    case "pending":
      return "Semua tugas telah selesai!";
    case "completed":
      return "Belum ada tugas yang selesai";
    default:
      return "Tambahkan tugas baru untuk memulai";
  }
}

// Event listener untuk tombol tambah
addBtn.addEventListener("click", () => {
  addTask(taskInput.value);
});

// Event listener untuk menekan Enter di input
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask(taskInput.value);
  }
});

// Event listener untuk tombol filter
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Hapus kelas active dari semua tombol filter
    filterButtons.forEach((btn) => btn.classList.remove("active"));

    // Tambahkan kelas active ke tombol yang diklik
    button.classList.add("active");

    // Update filter saat ini
    currentFilter = button.getAttribute("data-filter");

    // Render ulang tugas
    renderTasks();
  });
});

// Event listener untuk tombol konfigurasi
saveConfigBtn.addEventListener("click", saveConfig);
testConnectionBtn.addEventListener("click", testConnection);
loadTasksBtn.addEventListener("click", loadTasksFromServer);

// Inisialisasi aplikasi
function init() {
  initConfig();

  // Muat tugas dari localStorage
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = savedTasks;

  updateStats();
  renderTasks();
}

// Jalankan inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", init);
