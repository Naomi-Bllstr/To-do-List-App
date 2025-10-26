document.getElementById("H1").textContent="TO-DO LIST";

document.addEventListener("DOMContentLoaded", ()=>{
    const addTask=document.getElementById("addTask");
    const addtaskbtn=document.getElementById("addtaskbtn");
    const tasklist=document.getElementById("tasklist");
    const clearbtn=document.getElementById("clearbtn");
    const alarmTimeInput = document.getElementById("alarm-time");

    addTask.addEventListener("input", () => {
        if (addTask.value.trim() !== "") {
            alarmTimeInput.classList.add("show");
        } else {
            alarmTimeInput.classList.remove("show");
        }
    });

    addtaskbtn.addEventListener("click", () => {
        alarmTimeInput.classList.remove("show");
    });

    let tasks= JSON.parse(localStorage.getItem("tasks")) ||[];


    function renderTasks(taskArrayWithIndices = tasks.map((task, index) => ({ task, index }))) {
        tasklist.innerHTML="";
        taskArrayWithIndices.forEach(({task,index}) => {
            const listitems = document.createElement("li");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = task.completed;
            checkbox.addEventListener("change", () => toggleTaskCompletion(index));

            const taskText = document.createElement("span");
            taskText.textContent = task.text;
            if (task.alarmTime) {
                const alarmLabel = document.createElement("small");
                alarmLabel.textContent = `${new Date(task.alarmTime).toLocaleString()}`;
                alarmLabel.style.marginLeft = "10px";
                taskText.appendChild(alarmLabel);
            }

            if (task.completed) {
                taskText.classList.add('completed');
            }
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.addEventListener("click", () => editTask(index));


            
            const deletebtn = document.createElement("button");
            deletebtn.textContent = "x";
            deletebtn.addEventListener("click", () => deleteTask(index));
            
            const buttonGroup = document.createElement("span");
            buttonGroup.classList.add("button-group");
            buttonGroup.appendChild(deletebtn);
            buttonGroup.appendChild(editBtn);

            listitems.appendChild(checkbox);
            listitems.appendChild(taskText);
            listitems.appendChild(buttonGroup);
            tasklist.appendChild(listitems);

        });
        saveTasks();
    }

    function showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    }

    function showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }


    function addTaskfunc() { 
        const taskText= addTask.value.trim(); 
        const alarmTimeValue = alarmTimeInput.value;
        
        const alarmTime = alarmTimeValue ? new Date(alarmTimeValue).toISOString() : null;

        if (taskText !== "" && !tasks.some(task => task.text === taskText)) { 
            tasks.push({ text: taskText, completed: false, alarmTime: alarmTime }); 
            addTask.value="";
            alarmTimeInput.value = "";
            

            renderTasks();
            if (alarmTime) {
                scheduleAlarm(taskText, alarmTime);
            }
        } else if (taskText ===""){
            showError("Please enter a task");
        } else {
            showError("Task already exist!");
        }
        
    }

    function scheduleAlarm(taskText, alarmTime) {
        const time = new Date(alarmTime).getTime();
        const now = Date.now();
        const timeDiff = time - now;

        if (timeDiff > 0) {
            setTimeout(() => {
                showNotification(`⏰ Reminder: "${taskText}" is due now!`);
           
            }, timeDiff);
        }
    }


    function deleteTask(index) {
        if (tasks.splice(index, 1)){
            confirm("Are you sure to delete this task?");
        }
        renderTasks();
    }

    function editTask(index) {
        const task = tasks[index];

        const newTaskText = prompt("Edit your task:", task.text);

        if (newTaskText === null || newTaskText.trim() === "") {
            return;
        }
        if (tasks.some((t, i) => i !== index && t.text === newTaskText.trim())) {
            showError("Task already exists!");
            return;
        }
        task.text = newTaskText.trim();
        const newAlarmTime = prompt("Edit alarm time (YYYY-MM-DDTHH:MM) or leave blank(ex. 2025-10-13T08:30):", task.alarmTime ? task.alarmTime.slice(0, 16) : "");
        if (newAlarmTime) {
            const date = new Date(newAlarmTime);
            if (!isNaN(date.getTime()) && date.getTime() > Date.now()) {
                task.alarmTime = date.toISOString();
                scheduleAlarm(task.text, task.alarmTime);
            } else {
                showError("Invalid or past alarm time.");
            }
        } else {
            task.alarmTime = null; 
        }
        renderTasks();
    }


    function toggleTaskCompletion(index) {
        tasks[index].completed = !tasks[index].completed;
        
        if (tasks[index].completed) {
            showNotification("Task is Complete!");
        }
        renderTasks();
    }
    

    function filterTask(filterType) {
        let filteredTasksWithIndices=[];
        switch (filterType) {
            case 'all':
                filteredTasksWithIndices=tasks.map((task, index) => ({ task, index }));
                break;
            case 'active':
                filteredTasksWithIndices=tasks
                    .map((task, index) => ({ task, index }))
                    .filter(({ task }) => !task.completed);
                break;
            case 'completed':
                filteredTasksWithIndices=tasks
                    .map((task, index) => ({ task, index }))
                    .filter(({ task }) => task.completed);
                break;   
        }
        renderTasks(filteredTasksWithIndices);

    }
   
    function clearTasks() {
        if(confirm("Are you sure to clear all task?")) {
            tasks=[];
            renderTasks();
        }
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    addtaskbtn.addEventListener("click",addTaskfunc);
    addTask.addEventListener("keypress", (e)=> {
        if (e.key === "Enter") {
            addTaskfunc();
            alarmTimeInput.classList.remove("show");
        }
    });

    clearbtn.addEventListener("click", clearTasks);
    
    document.getElementById('filter-all').addEventListener('click', () => filterTask('all'));
    document.getElementById('filter-active').addEventListener('click', () => filterTask('active'));
    document.getElementById('filter-completed').addEventListener('click', () => filterTask('completed'));



    renderTasks();

    tasks.forEach(task => {
        if (task.alarmTime) {
            scheduleAlarm(task.text, task.alarmTime);
        }
    });

});