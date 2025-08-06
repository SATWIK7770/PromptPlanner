let editingTaskId = null;

const BASE_URL = 'http://127.0.0.1:3000';

document.addEventListener('DOMContentLoaded', function () {
    const today = new Date().toLocaleDateString('en-CA');
    document.getElementById('taskDate').value = today;
    document.getElementById('selectedDate').value = today;

    document.getElementById('taskForm').addEventListener('submit', addTask);
    document.getElementById('editForm').addEventListener('submit', saveEdit);
    document.getElementById('selectedDate').addEventListener('change', () =>{const selectedDate = document.getElementById('selectedDate').value;loadTasksForDate(selectedDate)});
    document.getElementById('promptForm').addEventListener('submit', handlePrompt); // Updated to form submit

    loadTasksForDate(today);
});

async function addTask(e) {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;

    if (title.trim() === "") return;

    await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date, time })
    });

    document.getElementById('taskForm').reset();
    document.getElementById('taskDate').value = new Date().toLocaleDateString('en-CA');
    const selectedDate = document.getElementById('selectedDate').value;
    loadTasksForDate(selectedDate);
}

async function loadTasksForDate(date) {
    const list = document.getElementById('tasksList');
    list.innerHTML = '';

    const res = await fetch(`${BASE_URL}/tasks/${date}`);
    const tasks = await res.json();

    if (tasks.length === 0) {
        list.innerHTML = '<p>No tasks for this date.</p>';
        return;
    }

    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'task';
        div.innerHTML = `
            <div class="title">${task.title}</div>
            <div class="time">${task.time}</div>
            <div>${task.description}</div>
            <button onclick="editTask('${task._id}')">Edit</button>
            <button onclick="deleteTask('${task._id}')">Delete</button>
        `;
        list.appendChild(div);
    });
}

async function editTask(id) {
    const selectedDate = document.getElementById('selectedDate').value;
    const res = await fetch(`${BASE_URL}/tasks/${selectedDate}`);
    const tasks = await res.json();
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    editingTaskId = id;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editDescription').value = task.description;
    document.getElementById('editDate').value = task.date;
    document.getElementById('editTime').value = task.time;

    document.getElementById('editBox').style.display = 'block';
}

async function saveEdit(e) {
    e.preventDefault();

    const updatedTask = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        date: document.getElementById('editDate').value,
        time: document.getElementById('editTime').value
    };

    await fetch(`${BASE_URL}/tasks/${editingTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
    });

    closeBox();
    const selectedDate = document.getElementById('selectedDate').value;
    loadTasksForDate(selectedDate);
}

async function deleteTask(id) {
    await fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'DELETE'
    });
    const selectedDate = document.getElementById('selectedDate').value;
    loadTasksForDate(selectedDate);
}

function closeBox() {
    document.getElementById('editBox').style.display = 'none';
    editingTaskId = null;
}

async function findMostSimilarTask(promptTitle , potentialTasks){
    let maxSimilarity = 0;
    let mostSimilarTask;

    for (const task of potentialTasks) {

        const res = await fetch('http://127.0.0.1:5000/similarity', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phrase1: promptTitle , phrase2: task.title })
        });

        const data = await res.json();
        let similarity = data.similarity;
        if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mostSimilarTask = task;
        }
    }
    return mostSimilarTask;
}

async function handlePrompt(e) {
    e.preventDefault();

    const promptTextarea = document.getElementById('promptInput');
    const prompt = promptTextarea.value.trim();
    if (!prompt) return;

    try {
        const res = await fetch(`${BASE_URL}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        if (!res.ok) {
            const errorData = await res.json();
            document.getElementById("agentMsg").innerText = errorData.error || `Server error: ${res.status}`;
            return;
        }

        const result = await res.json();

        if (result.error) {
            document.getElementById("agentMsg").innerText = result.error;
            return;
        }

        const { action, title, description, date, time, newTitle, newDescription, newDate, newTime } = result;

         if (!action || !['create', 'get', 'update', 'delete'].includes(action)) {
            document.getElementById("agentMsg").innerText = "Invalid action";
            return;
        }

        if (action === 'create') {
            if (title.trim() === "") return;
            if(time == null){
                document.getElementById("agentMsg").innerText = "time not specified";
                return;
            }

            await fetch(`${BASE_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, date, time })
            });

            document.getElementById('taskForm').reset();
            document.getElementById('taskDate').value = new Date().toLocaleDateString('en-CA');
            const selectedDate = document.getElementById('selectedDate').value;
            loadTasksForDate(selectedDate);
        }

        if (action === 'get') {
            if(date == null){
                document.getElementById("agentMsg").innerText = "date not mentioned";
                return;
            }
            document.getElementById('selectedDate').value = date;
            loadTasksForDate(date);
        }

        if (action === 'delete') {

            if(date == null){
                document.getElementById("agentMsg").innerText = "date not metioned";
                return;
            }

            const searchRes = await fetch(`${BASE_URL}/tasks/${date}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const tasks = await searchRes.json();

            let taskToDelete;

            if(time != null){
                taskToDelete = tasks.find(t => (t.date === date && t.time === time));
                if(taskToDelete == null){
                    document.getElementById("agentMsg").innerText = "task not found";
                    return;
                }
            }
            else{
                let potentialTasks = tasks.filter(t => (t.date === date));
                if(potentialTasks.length == 0){
                    document.getElementById("agentMsg").innerText = "task not found";
                    return;
                }
                taskToDelete = await findMostSimilarTask(title , potentialTasks);
            }

            if (taskToDelete) {
                await fetch(`${BASE_URL}/tasks/${taskToDelete._id}`, {
                    method: 'DELETE'
                });
                loadTasksForDate(date); 
            } else {
                document.getElementById("agentMsg").innerText = "task not found";
                return;
            }    
        }

        if (action === 'update') {

            if(date == null){
                document.getElementById("agentMsg").innerText = "date not mentioned";
                return;
            }
            
            const searchRes = await fetch(`${BASE_URL}/tasks/${date}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const tasks = await searchRes.json();
        
            let taskToUpdate;            

            if(time != null){
                taskToUpdate = tasks.find(t => t.date === date && t.time === time);   
                if(taskToUpdate == null){
                    document.getElementById("agentMsg").innerText = "task not found";
                    return;
                }
            }
            else{
                let potentialTasks = tasks.filter(t => (t.date === date));
                if(potentialTasks.length == 0){
                    document.getElementById("agentMsg").innerText = "task not found";
                    return;
                }

                taskToUpdate = await findMostSimilarTask(title , potentialTasks);                
            }

            if (taskToUpdate) {
                const updatedTask = {
                    title: newTitle || taskToUpdate.title,
                    description: newDescription || taskToUpdate.description,
                    date: newDate || date,
                    time: newTime || time
                };
                await fetch(`${BASE_URL}/tasks/${taskToUpdate._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedTask)
                });
                loadTasksForDate(date); 
            } else {
                document.getElementById("agentMsg").innerText = "task not found";
                return;

            }    
        }
    } catch (error) {
        document.getElementById("agentMsg").innerText = "failed to process prompt";
    }

    promptTextarea.value = '';
    document.getElementById("agentMsg").innerText = "";

}