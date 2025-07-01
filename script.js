
    
    const URL = "https://jsonplaceholder.typicode.com/todos";
    const todoList = document.getElementById("todoList");
    const addTodoForm = document.getElementById("addTodoForm");
    const todoTitleInput = document.getElementById("todoTitle");
    const todoDueDateInput = document.getElementById("todoDueDate");
    const todoCompletedCheckbox = document.getElementById("todoCompleted");
    const addTodoMessage = document.getElementById("addTodoMessage");
    const filterCreatedDate = document.getElementById("filterCreatedDate");
    const filterDueDate = document.getElementById("filterDueDate");
    const paginationControls = document.getElementById("paginationControls");

    
    let allTodos = [];
    let currentPage = 1;
    const pageSize = 10;

    
    function getTodayDate() {
      const today = new Date();
      return today.toISOString().split("T")[0];
    }

    function getRandomPastDate() {
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString().split("T")[0];
    }

    function getRandomFutureDate() {
      const daysLater = Math.floor(Math.random() * 30) + 1;
      const date = new Date();
      date.setDate(date.getDate() + daysLater);
      return date.toISOString().split("T")[0];
    }

   
    (async () => {
      try {
        const response = await fetch(URL);
        const data = await response.json();
        allTodos = data.map(todo => ({
          ...todo,
          createdDate: getRandomPastDate(),
          dueDate: getRandomFutureDate()
        }));
        renderTodos();
      } catch (err) {
        console.error("Error fetching todos:", err);
      }
    })();

    //  Add new todo
    addTodoForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const title = todoTitleInput.value.trim();
      const completed = todoCompletedCheckbox.checked;
      const dueDate = todoDueDateInput.value || "Not set";
      const createdDate = getTodayDate();
      if (!title) return;
      allTodos.unshift({
        id: allTodos.length + 1,
        title,
        completed,
        createdDate,
        dueDate
      });
      renderTodos();
      addTodoForm.reset();
      addTodoMessage.textContent = "Todo added!";
      addTodoMessage.className = "text-success";
      setTimeout(() => (addTodoMessage.textContent = ""), 2000);
    });

    //  Render current page todos
    function renderTodos() {
      todoList.innerHTML = "";
      const start = (currentPage - 1) * pageSize;
      const paginated = allTodos.slice(start, start + pageSize);
      paginated.forEach(todo => addTodoToDOM(todo));
      renderPaginationControls(Math.ceil(allTodos.length / pageSize));
    }

    //  Add individual todo to DOM
    function addTodoToDOM(todo) {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.setAttribute("data-created", todo.createdDate);
      li.setAttribute("data-due", todo.dueDate);
      li.innerHTML = `
        <div>
          <strong>${todo.title}</strong><br>
          <small>Status: <span class="${todo.completed ? "text-success" : "text-warning"}">
            ${todo.completed ? "Completed" : "Pending"}</span></small><br>
          <small>Created: ${todo.createdDate}</small><br>
          <small>Due: ${todo.dueDate}</small>
        </div>`;
      todoList.appendChild(li);
    }

    //  Filtering 
    document.getElementById("searchTodo").addEventListener("input", filterTodos);
    document.getElementById("clearSearch").addEventListener("click", () => {
      document.getElementById("searchTodo").value = "";
      filterCreatedDate.value = "";
      filterDueDate.value = "";
      renderTodos();
    });
    filterCreatedDate.addEventListener("change", filterTodos);
    filterDueDate.addEventListener("change", filterTodos);

    function filterTodos() {
      const searchText = document.getElementById("searchTodo").value.toLowerCase();
      const createdFilter = filterCreatedDate.value;
      const dueFilter = filterDueDate.value;

      const filtered = allTodos.filter(todo => {
        const matchTitle = todo.title.toLowerCase().includes(searchText);
        const matchCreated = createdFilter ? todo.createdDate === createdFilter : true;
        const matchDue = dueFilter ? todo.dueDate === dueFilter : true;
        return matchTitle && matchCreated && matchDue;
      });

      todoList.innerHTML = "";
      filtered.forEach(addTodoToDOM);
    }

    // Pagination 
    function renderPaginationControls(totalPages) {
      paginationControls.innerHTML = "";

      const createButton = (text, page, disabled = false, active = false) => {
        const btn = document.createElement("button");
        btn.className = `btn btn-sm mx-1 ${active ? "btn-primary" : "btn-outline-primary"}`;
        btn.textContent = text;
        btn.disabled = disabled;
        btn.addEventListener("click", () => {
          currentPage = page;
          renderTodos();
        });
        return btn;
      };

      paginationControls.appendChild(createButton("«", currentPage - 1, currentPage === 1));
      paginationControls.appendChild(createButton("1", 1, false, currentPage === 1));

      if (currentPage > 4) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.className = "mx-1";
        paginationControls.appendChild(dots);
      }

      const startPage = Math.max(2, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);
      for (let i = startPage; i <= endPage; i++) {
        paginationControls.appendChild(createButton(i, i, false, currentPage === i));
      }

      if (currentPage < totalPages - 3) {
        const dots = document.createElement("span");
        dots.textContent = "...";
        dots.className = "mx-1";
        paginationControls.appendChild(dots);
      }

      if (totalPages > 1) {
        paginationControls.appendChild(createButton(totalPages, totalPages, false, currentPage === totalPages));
      }

      paginationControls.appendChild(createButton("»", currentPage + 1, currentPage === totalPages));
    }
  