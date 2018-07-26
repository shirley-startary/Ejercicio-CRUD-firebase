const taskInput = document.getElementById('new-task');
const addButton = document.getElementsByTagName('Button')[0];
const inCompletedTaskList = document.getElementById('incomplete-tasks');
const completedTaskList = document.getElementById('completed-tasks');

let refTask;

const init = () => {
  addButton.addEventListener('click', sendTaskFirebase);
    refTask = firebase.database().ref().child('tasks');
  getTaskOfFirebase();
}

const createNewTaskElement = (taskString) => {
  // console.log(taskString);
  //Creando los elementos
  const listItem = document.createElement('li');
  const checkbox = document.createElement('input'); //checkbox
  const label = document.createElement('label');
  const editInput = document.createElement('input'); // Texto a editar
  const editButton = document.createElement('button');
  const deleteButton = document.createElement('button');

  checkbox.type = 'checkbox';
  editInput.type = 'text';

  editButton.innerHTML = 'Edit &#9998;';
  editButton.className = 'edit';
  deleteButton.innerHTML = 'Delete &#x1F5D1;';
  deleteButton.className = 'delete';

  label.innerHTML = taskString;

  listItem.appendChild(checkbox);
  listItem.appendChild(label);
  listItem.appendChild(editInput);
  listItem.appendChild(editButton);
  listItem.appendChild(deleteButton);

  return listItem;
}


const addTask = (key, taskCollection) => {
  // console.log('key: ', key , ' taskCollection: ', taskCollection);
  // console.log(taskCollection.contenidoTask);
  const listItem = createNewTaskElement(taskCollection.contenidoTask);
  listItem.setAttribute('data-keytask', key);
  // console.log(listItem);
  if (taskCollection.status == 'completed') {
    listItem.querySelector('input[type=checkbox]').setAttribute('checked',true);
    completedTaskList.appendChild(listItem);
  } else {
    // listItem.querySelector('input[type=checkbox]').setAttribute('checked',false);
    inCompletedTaskList.appendChild(listItem);
  }

  bindTaskEvents(listItem, taskCompleted)
}

const taskCompleted = () => {
  const listItem = event.target.parentNode;
  const keyListItem = event.target.parentNode.dataset.keytask;
  const refTaskToCompleted = refTask.child(keyListItem);
  refTaskToCompleted.once('value', (snapshot) => {
    const data = snapshot.val();
    console.log(event.target.checked);
    if (event.target.checked) {
      completedTaskList.appendChild(listItem);
      refTaskToCompleted.update({
        status: 'completed'
      })
    } else {
      inCompletedTaskList.appendChild(listItem);

      refTaskToCompleted.update({
        status: 'incompleted'
      })
    }
  })


}

const bindTaskEvents = (taskListItem, checkboxEventHandle) => {
  const checkbox = taskListItem.querySelector('input[type=checkbox]');
  const editButton = taskListItem.querySelector('button.edit');
  const deleteButton = taskListItem.querySelector('button.delete');

  editButton.addEventListener('click', editTask);

  deleteButton.addEventListener('click', deleteTask);

  checkbox.addEventListener('change', checkboxEventHandle);
}

const editTask = () => {
  const listItem = event.target.parentNode;
  const keyListItem = event.target.parentNode.dataset.keytask;
  const editInput = listItem.querySelector('input[type=text]')
  const label  = listItem.querySelector('label');
  const editButton = event.target;
  const containsClass = listItem.classList.contains('editMode');

  const refTaskToEdit = refTask.child(keyListItem);
  refTaskToEdit.once('value', (snapshot) => {
    const data = snapshot.val();

    if (containsClass) {
      console.log(containsClass, listItem);
      refTaskToEdit.update({
        contenidoTask: editInput.value
      })
      editButton.innerHTML = 'Edit ';
      listItem.classList.remove('editMode');
      editInput.value = '';
    } else {
      console.log(containsClass, listItem)
      editButton.innerHTML = 'Save ';
      editInput.value = data.contenidoTask;
      listItem.classList.add('editMode')
    }

  })

}

const deleteTask = () => {
  const keyListItem = event.target.parentNode.dataset.keytask;
  const refTaskToDelete = refTask.child(keyListItem);
  refTaskToDelete.remove();
}

const getTaskOfFirebase = () => {
  refTask.on('value', (snapshot) => {
    inCompletedTaskList.innerHTML = '';
    completedTaskList.innerHTML = '';
    const data = snapshot.val()
    for (var key in data) {
      addTask(key, data[key])
    }
  })
}

const sendTaskFirebase = () => {
  refTask.push({
    contenidoTask : taskInput.value,
    status : 'incomplete'
  });
  taskInput.value = '';
}

window.onload = init
