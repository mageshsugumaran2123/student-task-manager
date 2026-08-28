/* =====================================================
   STUDYTRACK
   Student Productivity Manager
   ===================================================== */


/* ===================== DOM ELEMENTS ===================== */

const taskModal = document.getElementById("taskModal");

const addTaskBtn = document.getElementById("addTaskBtn");
const mobileAddTask = document.getElementById("mobileAddTask");
const emptyAddBtn = document.getElementById("emptyAddBtn");

const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");

const taskForm = document.getElementById("taskForm");

const taskList = document.getElementById("taskList");

const searchInput = document.getElementById("searchInput");

const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");

const themeToggle = document.getElementById("themeToggle");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const overdueTasks = document.getElementById("overdueTasks");

const productivityScore =
    document.getElementById("productivityScore");

const progressBar =
    document.getElementById("progressBar");

const productivityMessage =
    document.getElementById("productivityMessage");

const upcomingTasks =
    document.getElementById("upcomingTasks");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* ===================== DATA ===================== */

let tasks =
    JSON.parse(localStorage.getItem("studyTrackTasks")) || [];


/* ===================== INITIALIZATION ===================== */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    renderTasks();

    updateDashboard();

});


/* ===================== MODAL ===================== */

function openModal() {

    taskModal.classList.add("active");

    document.body.style.overflow = "hidden";

    document.getElementById("taskTitle").focus();

}


function closeTaskModal() {

    taskModal.classList.remove("active");

    document.body.style.overflow = "auto";

    taskForm.reset();

}


/* Open modal buttons */

addTaskBtn.addEventListener("click", openModal);

mobileAddTask.addEventListener("click", openModal);

emptyAddBtn.addEventListener("click", openModal);


/* Close modal */

closeModal.addEventListener("click", closeTaskModal);

cancelBtn.addEventListener("click", closeTaskModal);


/* Close when clicking outside */

taskModal.addEventListener("click", (event) => {

    if (event.target === taskModal) {

        closeTaskModal();

    }

});


/* Close with Escape */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape" &&
        taskModal.classList.contains("active")) {

        closeTaskModal();

    }

});


/* ===================== ADD TASK ===================== */

taskForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const title =
        document.getElementById("taskTitle").value.trim();

    const description =
        document.getElementById("taskDescription").value.trim();

    const subject =
        document.getElementById("subject").value.trim();

    const category =
        document.getElementById("category").value;

    const deadline =
        document.getElementById("deadline").value;

    const priority =
        document.getElementById("priority").value;


    if (!title || !subject || !category || !deadline) {

        showToast("Please fill all required fields.");

        return;

    }


    const newTask = {

        id: Date.now(),

        title: title,

        description: description,

        subject: subject,

        category: category,

        deadline: deadline,

        priority: priority,

        completed: false,

        createdAt: new Date().toISOString()

    };


    tasks.push(newTask);


    saveTasks();

    renderTasks();

    updateDashboard();

    closeTaskModal();


    showToast("Task added successfully! 🎉");

});


/* ===================== SAVE TASKS ===================== */

function saveTasks() {

    localStorage.setItem(
        "studyTrackTasks",
        JSON.stringify(tasks)
    );

}


/* ===================== RENDER TASKS ===================== */

function renderTasks() {

    const searchTerm =
        searchInput.value.toLowerCase().trim();

    const status =
        statusFilter.value;

    const category =
        categoryFilter.value;


    const filteredTasks =
        tasks.filter((task) => {

            const matchesSearch =

                task.title
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                task.subject
                    .toLowerCase()
                    .includes(searchTerm)

                ||

                task.category
                    .toLowerCase()
                    .includes(searchTerm);


            const matchesCategory =
                category === "all" ||
                task.category === category;


            let matchesStatus = true;


            if (status === "pending") {

                matchesStatus =
                    !task.completed;

            }


            if (status === "completed") {

                matchesStatus =
                    task.completed;

            }


            if (status === "overdue") {

                matchesStatus =
                    isOverdue(task) &&
                    !task.completed;

            }


            if (status === "high") {

                matchesStatus =
                    task.priority === "High" &&
                    !task.completed;

            }


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );

        });


    /* Remove old tasks */

    const oldItems =
        taskList.querySelectorAll(".task-item");

    oldItems.forEach(item => item.remove());


    /* Empty state */

    if (filteredTasks.length === 0) {

        const emptyState =
            document.createElement("div");

        emptyState.className = "empty-tasks";


        if (tasks.length === 0) {

            emptyState.innerHTML = `

                <div class="empty-icon">
                    📚
                </div>

                <h3>No tasks yet</h3>

                <p>
                    Add your first academic task
                    to get started.
                </p>

                <button
                    class="primary-btn"
                    onclick="openModal()">
                    + Create Your First Task
                </button>

            `;

        } else {

            emptyState.innerHTML = `

                <div class="empty-icon">
                    🔍
                </div>

                <h3>No matching tasks</h3>

                <p>
                    Try changing your search or filters.
                </p>

            `;

        }


        taskList.appendChild(emptyState);

        return;

    }


    /* Sort tasks */

    filteredTasks.sort((a, b) => {

        if (a.completed !== b.completed) {

            return a.completed - b.completed;

        }

        return new Date(a.deadline) -
               new Date(b.deadline);

    });


    /* Create task elements */

    filteredTasks.forEach(task => {

        const taskElement =
            createTaskElement(task);

        taskList.appendChild(taskElement);

    });

}


/* ===================== CREATE TASK ELEMENT ===================== */

function createTaskElement(task) {

    const taskItem =
        document.createElement("div");

    taskItem.className = "task-item";


    const overdue =
        isOverdue(task);


    taskItem.innerHTML = `

        <!-- CHECKBOX -->

        <div
            class="task-check ${
                task.completed ? "completed" : ""
            }"
            onclick="toggleTask(${task.id})">

            ${
                task.completed
                    ? "✓"
                    : ""
            }

        </div>


        <!-- DETAILS -->

        <div class="task-details">

            <h4 class="${
                task.completed
                    ? "completed-text"
                    : ""
            }">

                ${escapeHTML(task.title)}

            </h4>


            ${
                task.description
                    ? `
                        <div class="task-description">
                            ${escapeHTML(task.description)}
                        </div>
                      `
                    : ""
            }


            <div class="task-meta">

                <span class="badge">

                    📚 ${escapeHTML(task.subject)}

                </span>


                <span class="badge">

                    ${getCategoryIcon(task.category)}
                    ${escapeHTML(task.category)}

                </span>


                <span class="priority ${
                    task.priority.toLowerCase()
                }">

                    ${getPriorityIcon(task.priority)}
                    ${task.priority}

                </span>

            </div>

        </div>


        <!-- DATE -->

        <div class="task-date ${
            overdue && !task.completed
                ? "overdue"
                : ""
        }">

            ${
                task.completed
                    ? "Completed ✓"
                    : formatDeadline(task.deadline)
            }

        </div>


        <!-- ACTIONS -->

        <div class="task-actions">

            <button
                class="task-action delete"
                onclick="deleteTask(${task.id})"
                title="Delete task">

                🗑️

            </button>

        </div>

    `;


    return taskItem;

}


/* ===================== TOGGLE TASK ===================== */

function toggleTask(id) {

    const task =
        tasks.find(task => task.id === id);


    if (!task) return;


    task.completed =
        !task.completed;


    saveTasks();

    renderTasks();

    updateDashboard();


    if (task.completed) {

        showToast("Task completed! 🎉");

    } else {

        showToast("Task marked as pending.");

    }

}


/* ===================== DELETE TASK ===================== */

function deleteTask(id) {

    const task =
        tasks.find(task => task.id === id);


    if (!task) return;


    const confirmDelete =
        confirm(
            `Delete "${task.title}"?`
        );


    if (!confirmDelete) return;


    tasks =
        tasks.filter(task => task.id !== id);


    saveTasks();

    renderTasks();

    updateDashboard();


    showToast("Task deleted.");

}


/* ===================== DASHBOARD ===================== */

function updateDashboard() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const pending =
        tasks.filter(
            task => !task.completed
        ).length;


    const overdue =
        tasks.filter(
            task =>
                isOverdue(task) &&
                !task.completed
        ).length;


    totalTasks.textContent =
        total;


    pendingTasks.textContent =
        pending;


    completedTasks.textContent =
        completed;


    overdueTasks.textContent =
        overdue;


    updateProductivity(
        total,
        completed
    );


    updateUpcomingTasks();

}


/* ===================== PRODUCTIVITY ===================== */

function updateProductivity(
    total,
    completed
) {

    let score = 0;


    if (total > 0) {

        score =
            Math.round(
                (completed / total) * 100
            );

    }


    productivityScore.textContent =
        `${score}%`;


    progressBar.style.width =
        `${score}%`;


    if (total === 0) {

        productivityMessage.textContent =
            "Start adding tasks to begin 🚀";

    }

    else if (score === 100) {

        productivityMessage.textContent =
            "Amazing! All tasks completed 🏆";

    }

    else if (score >= 75) {

        productivityMessage.textContent =
            "Excellent progress! Keep going 🚀";

    }

    else if (score >= 50) {

        productivityMessage.textContent =
            "You're doing great! Stay consistent 💪";

    }

    else if (score >= 25) {

        productivityMessage.textContent =
            "Good start! Keep pushing forward 📚";

    }

    else {

        productivityMessage.textContent =
            "Time to get productive! 🔥";

    }

}


/* ===================== UPCOMING DEADLINES ===================== */

function updateUpcomingTasks() {

    const pending =
        tasks
            .filter(task => !task.completed)
            .sort(
                (a, b) =>
                    new Date(a.deadline) -
                    new Date(b.deadline)
            )
            .slice(0, 4);


    upcomingTasks.innerHTML = "";


    if (pending.length === 0) {

        upcomingTasks.innerHTML = `

            <div class="empty-state">
                No upcoming deadlines 🎉
            </div>

        `;

        return;

    }


    pending.forEach(task => {

        const item =
            document.createElement("div");

        item.className =
            "upcoming-item";


        const type =
            getDeadlineType(task.deadline);


        item.innerHTML = `

            <div class="upcoming-info">

                <strong>
                    ${escapeHTML(task.title)}
                </strong>

                <span>
                    ${escapeHTML(task.subject)}
                    • ${escapeHTML(task.category)}
                </span>

            </div>


            <span class="deadline ${type.className}">

                ${type.text}

            </span>

        `;


        upcomingTasks.appendChild(item);

    });

}


/* ===================== DEADLINE FUNCTIONS ===================== */

function getTodayDate() {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    return today;

}


function parseDate(dateString) {

    const [
        year,
        month,
        day
    ] = dateString
        .split("-")
        .map(Number);


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    date.setHours(
        0,
        0,
        0,
        0
    );


    return date;

}


function isOverdue(task) {

    if (task.completed) {

        return false;

    }


    const deadline =
        parseDate(task.deadline);


    return deadline <
           getTodayDate();

}


function getDaysDifference(dateString) {

    const deadline =
        parseDate(dateString);

    const today =
        getTodayDate();


    const difference =
        deadline - today;


    return Math.round(
        difference /
        (1000 * 60 * 60 * 24)
    );

}


function getDeadlineType(dateString) {

    const days =
        getDaysDifference(dateString);


    if (days < 0) {

        return {

            text:
                `Overdue ${Math.abs(days)}d`,

            className:
                "today"

        };

    }


    if (days === 0) {

        return {

            text: "Today",

            className: "today"

        };

    }


    if (days === 1) {

        return {

            text: "Tomorrow",

            className: "tomorrow"

        };

    }


    return {

        text:
            `In ${days} days`,

        className: "future"

    };

}


function formatDeadline(dateString) {

    const deadline =
        parseDate(dateString);


    const options = {

        day: "2-digit",

        month: "short",

        year: "numeric"

    };


    return deadline.toLocaleDateString(
        "en-IN",
        options
    );

}


/* ===================== ICONS ===================== */

function getPriorityIcon(priority) {

    const icons = {

        High: "🔴",

        Medium: "🟡",

        Low: "🟢"

    };


    return icons[priority] || "⚪";

}


function getCategoryIcon(category) {

    const icons = {

        Assignment: "📚",

        "Lab Work": "🧪",

        Project: "💻",

        Exam: "📝",

        Study: "📖",

        Other: "📌"

    };


    return icons[category] || "📌";

}


/* ===================== SEARCH & FILTER ===================== */

searchInput.addEventListener(
    "input",
    renderTasks
);


statusFilter.addEventListener(
    "change",
    renderTasks
);


categoryFilter.addEventListener(
    "change",
    renderTasks
);


/* ===================== DARK MODE ===================== */

themeToggle.addEventListener(
    "click",
    toggleTheme
);


function toggleTheme() {

    document.body.classList.toggle("dark");


    const darkMode =
        document.body.classList.contains("dark");


    localStorage.setItem(
        "studyTrackTheme",
        darkMode
            ? "dark"
            : "light"
    );


    themeToggle.textContent =
        darkMode
            ? "☀️"
            : "🌙";

}


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "studyTrackTheme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeToggle.textContent =
            "☀️";

    }

}


/* ===================== TOAST ===================== */

function showToast(message) {

    toastMessage.textContent =
        message;


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* ===================== SECURITY ===================== */

/*
   Prevent HTML injection when users enter
   task names and descriptions.
*/

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}