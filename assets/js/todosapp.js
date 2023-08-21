
const todoForm = document.querySelector('#todoForm');
const todoInput = document.querySelector('.new-todo');
const todoList = document.querySelector('.todoList');
const countItem = document.querySelector('#countItem')
const optionActor = document.querySelector('#actor-id');
const optionAssignee = document.querySelector('#assigne-id');
todoForm.addEventListener("submit",addTodo);
let todos=[];
let users=[];
const prefixUrl = "https://todorestapi-20432433159e.herokuapp.com/api/todos/"
const usersUrl = "https://todorestapi-20432433159e.herokuapp.com/api/users/"

const requestCreateUrl=`${prefixUrl}create/`
const requestUpdateUrl=`${prefixUrl}update/`
const requestDeleteUrl=`${prefixUrl}delete/`
async function loadingData(){
    todos= await fetch(`${prefixUrl}`).then(x=>x.json())
    users= await fetch(`${usersUrl}`).then(x=>x.json())
    renderTodos()
}
function renderTodos() {
    for (const user of users) {
        optionActor.innerHTML += `<option value="${user.id}">${user.username}</option>`
        optionAssignee.innerHTML += `<option value="${user.id}">${user.username}</option>`
    }
    for (const todo of todos) {
        todoList.innerHTML += 
        `<li data-id="${todo.id}" class="${todo.completed ? 'completed' : ''}">
            <input type="checkbox" class="todo">
            <label>${todo.title}</label>
            <input type="edit" class="edit-button" value="${todo.title}">
            <button class="delete-button">x</button>
        </li>`
        bindClicks();
    }
};
function addTodo() {
    let todo = {
        title: todoInput.value,
        completed:false,
        actor:optionActor.value,
        assignee:optionAssignee.value
    };
    fetch(`${requestCreateUrl}`,{
        method:"POST",
        body:JSON.stringify(todo),
        headers:{
            'Content-type': 'application/json;'
        },
    })
    .then(x => x.json())
    .then(todo => {
        todoList.innerHTML += `<li data-id="${todo.id}" class="${todo.completed ? 'completed' : ''}">
        <input type="checkbox" class="todo">
        <label>${todo.title}</label>
        <input type="edit" class="edit-button" value="${todo.title}">
        <button class="delete-button">x</button>
        </li>`
    })
};
async function findTodo(id) {
    const response = await fetch(`${prefixUrl}${id}/`).then(x=>x.json())
    return response
}
function markTodo(id,check,todo) {
    fetch(`${requestUpdateUrl}${id}/`, {
        method: 'PUT',
        body: JSON.stringify({
            title: todo.title,
            completed: check,
            actor:todo.actor,
            assignee:todo.assignee,
        }),
        headers: {
            'Content-type': 'application/json;'
        }
    })
}
function editTodo(id,newTodo,todo) {
    fetch(`${requestUpdateUrl}${id}/`, {
        method: 'PUT',
        body: JSON.stringify({
            title: newTodo === null ? todo.title : newTodo,
            completed: todo.completed,
            actor:todo.actor,
            assignee:todo.assignee,
        }),
        headers: {
            'Content-type': 'application/json;'
        }
    })
}
function showTodoEdit() {
    this.parentElement.classList.add('editing');
    this.style.display = "none";
    const currValue = this.nextElementSibling.value;
    this.nextElementSibling.value = '';
    this.nextElementSibling.value = currValue;
    this.nextElementSibling.focus();
}
function bindClicks() {
    for (const btn of document.querySelectorAll('.delete-button')) {
        btn.addEventListener('click', async function(e) {
            const targetEl = e.target.parentElement;
            const foundTodo= await findTodo(targetEl.dataset.id);
            fetch(`${requestDeleteUrl}${foundTodo.id}/`, {
                method: 'DELETE'
            });
            targetEl.remove()
        });
    }
    for (const btn of document.querySelectorAll('label')) {
        btn.addEventListener('click', async function(e) {
            const targetEl = e.target.parentElement;
            targetEl.classList.toggle("completed");
            const foundTodo= await findTodo(targetEl.dataset.id);
            markTodo(targetEl.dataset.id, targetEl.classList.contains("completed"), foundTodo)
        });
    }
    document.querySelectorAll('label').forEach(x => x.addEventListener('dblclick', showTodoEdit));
    document.querySelectorAll('.edit-button').forEach(x => x.addEventListener('keydown',  async function (e) {
        const targetEl = e.target.parentElement;
        const foundTodo= await findTodo(targetEl.dataset.id);
        let newTodo;
        if(e.key === 'Enter') {
            this.previousElementSibling.innerText = this.value;
            newTodo=this.value
            this.parentElement.classList.remove('editing');
            this.previousElementSibling.style.display = 'block';
            editTodo(targetEl.dataset.id,newTodo,foundTodo);
        }
        
    }));
};
loadingData();
