// ===== Seleção dos elementos =====
const input = document.getElementById("new-task"); // campo de texto
const btnAdd = document.getElementById("add-task"); // botão "Adicionar"
const inputDate = document.getElementById("task-date");
// ===== Evento: pressionar Enter dentro do input =====
input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnAdd.click(); // simula clique no botão
});

const listTodo = document.getElementById("list-todo"); // lista onde tarefas vão aparecer
const listDoing = document.getElementById("list-doing");
const listDone = document.getElementById("list-done");

let tasks = []; // array para armazenar tarefas
// Função para renderizar as tarefas na tela
// retorna dias até a data (0 = hoje, negativos = já passou). null se sem data
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const today = new Date();
  // zera horas para comparar só a data
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffMs = d.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
function renderTasks() {
  listTodo.innerHTML = "";
  listDoing.innerHTML = "";
  listDone.innerHTML = "";

  tasks.forEach((t) => {
    const li = document.createElement("li");
    li.className = "card " + t.status;
    // Habilita arrastar o cartão
    li.draggable = true;

    li.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", t.id); // guarda o id da tarefa
      li.classList.add("dragging");
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
    });

    // Texto da tarefa
    const span = document.createElement("span");
    span.textContent = t.text;
    li.appendChild(span);

    // Duplo clique para editar o texto
    span.addEventListener("dblclick", () => {
      const novoTexto = prompt("Editar tarefa:", t.text);
      if (novoTexto && novoTexto.trim() !== "") {
        t.text = novoTexto.trim();
        renderTasks();
        saveTasks();
      }
    });

    if (t.date) {
      const small = document.createElement("small");
      small.textContent = "Prazo: " + t.date;
      li.appendChild(small);
    }
    // aplica classe visual conforme a proximidade do prazo
    const d = daysUntil(t.date);
    if (d !== null) {
      if (d < 0) li.classList.add("overdue"); // vencido
      else if (d <= 2) li.classList.add("due-soon"); // próximo (até 2 dias)
    }

    const btnDelete = document.createElement("button");
    btnDelete.textContent = "X";
    btnDelete.addEventListener("click", () => {
      tasks = tasks.filter((task) => task.id !== t.id);
      renderTasks();
      saveTasks();
    });

    const btnNext = document.createElement("button");
    btnNext.textContent = "→";
    btnNext.addEventListener("click", () => {
      if (t.status === "todo") t.status = "doing";
      else if (t.status === "doing") t.status = "done";
      else t.status = "todo"; // volta para o início
      renderTasks();
      saveTasks();
    });

    li.appendChild(btnDelete);
    li.appendChild(btnNext);

    if (t.status === "todo") listTodo.appendChild(li);
    if (t.status === "doing") listDoing.appendChild(li);
    if (t.status === "done") listDone.appendChild(li);
  });
}

// ==== Funções para salvar e carregar do localStorage ====
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const data = localStorage.getItem("tasks");
  if (data) {
    tasks = JSON.parse(data);
    renderTasks();
  }
}
loadTasks();

// ===== Evento: clique no botão Adicionar =====
btnAdd?.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;

  tasks.unshift({
    id: Date.now(),
    text,
    date: inputDate.value, // salva o prazo escolhido
    status: "todo",
  });

  renderTasks();
  saveTasks();

  // limpa o formulário
  input.value = "";
  inputDate.value = "";
  input.focus();
});

// ===== Drag & Drop nas colunas =====
document.querySelectorAll(".column").forEach((col) => {
  col.addEventListener("dragover", (e) => {
    e.preventDefault(); // permite soltar
    col.classList.add("drag-over"); // (se tiver CSS) destaca a coluna
  });

  col.addEventListener("dragleave", () => {
    col.classList.remove("drag-over");
  });

  col.addEventListener("drop", (e) => {
    e.preventDefault();
    col.classList.remove("drag-over");

    const id = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => String(t.id) === id);
    if (!task) return;

    if (col.querySelector("#list-todo")) task.status = "todo";
    if (col.querySelector("#list-doing")) task.status = "doing";
    if (col.querySelector("#list-done")) task.status = "done";

    renderTasks();
    saveTasks();
  });
});

// atualiza contadores nos títulos
const countTodo = tasks.filter((t) => t.status === "todo").length;
const countDoing = tasks.filter((t) => t.status === "doing").length;
const countDone = tasks.filter((t) => t.status === "done").length;

if (listTodo.previousElementSibling) listTodo.previousElementSibling.textContent = `A Fazer (${countTodo})`;
if (listDoing.previousElementSibling) listDoing.previousElementSibling.textContent = `Em Progresso (${countDoing})`;
if (listDone.previousElementSibling) listDone.previousElementSibling.textContent = `Concluído (${countDone})`;
