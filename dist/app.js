"use strict";
class Chore {
    constructor(id, chore, note, status) {
        this.id = id;
        this.chore = chore;
        this.note = note;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ChoreState extends State {
    constructor() {
        super();
        this.chores = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ChoreState();
        return this.instance;
    }
    addChore(child, chore, note) {
        const newChore = new Chore(Math.random().toString(), chore, note, child);
        this.chores.push(newChore);
        this.updateListeners();
    }
    moveChore(choreId, newStatus) {
        const chore = this.chores.find((chore) => chore.id === choreId);
        if (chore && chore.status !== newStatus) {
            chore.status = newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.chores.slice());
        }
    }
}
const choreState = ChoreState.getInstance();
function validateInputs(validateInput) {
    let isValid = true;
    if (validateInput.required) {
        isValid = isValid && validateInput.value.trim().length !== 0;
    }
    if (validateInput.minLength != null &&
        typeof validateInput.value === 'string') {
        isValid = isValid && validateInput.value.length >= validateInput.minLength;
    }
    if (validateInput.maxLength != null &&
        typeof validateInput.value === 'string') {
        isValid = isValid && validateInput.value.length <= validateInput.maxLength;
    }
    return isValid;
}
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtBeginning) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
    }
}
class ChoreItem extends Component {
    constructor(hostId, chore) {
        super('single-chore', hostId, false, chore.id);
        this.chore = chore;
        this.addListeners();
        this.renderContent();
    }
    dragStart(event) {
        event.dataTransfer.setData('text/plain', this.chore.id);
        event.dataTransfer.effectAllowed = 'move';
    }
    dragEnd(_event) {
        console.log('DragEnd');
    }
    addListeners() {
        this.element.addEventListener('dragstart', this.dragStart.bind(this));
        this.element.addEventListener('dragend', this.dragEnd.bind(this));
    }
    renderContent() {
        this.element.querySelector('h2').textContent = this.chore.chore;
        this.element.querySelector('p').textContent = this.chore.note;
    }
}
class ChoreList extends Component {
    constructor(type) {
        super('chore-list', 'app', false, `${type}-Chores`);
        this.type = type;
        this.assignedChores = [];
        this.addListeners();
        this.renderContent();
    }
    dragOver(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul');
            listEl.classList.add('droppable');
        }
    }
    dropChore(event) {
        const choreId = event.dataTransfer.getData('text/plain');
        choreState.moveChore(choreId, 'Finished');
    }
    dragLeave(_event) {
        const listEl = this.element.querySelector('ul');
        listEl.classList.remove('droppable');
    }
    addListeners() {
        this.element.addEventListener('dragover', this.dragOver.bind(this));
        this.element.addEventListener('dragleave', this.dragLeave.bind(this));
        this.element.addEventListener('drop', this.dropChore.bind(this));
        choreState.addListener((chores) => {
            const appliedChores = chores.filter((chore) => {
                if (this.type === 'Alexis') {
                    return chore.status === this.type;
                }
                if (this.type === 'Wesleigh') {
                    return chore.status === this.type;
                }
                if (this.type === 'Tommy') {
                    return chore.status === this.type;
                }
                if (this.type === 'Finished') {
                    return chore.status === this.type;
                }
                return;
            });
            this.assignedChores = appliedChores;
            this.renderChores();
        });
    }
    renderContent() {
        const listId = `${this.type}-chores-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent =
            this.type.toUpperCase() + "'S" + ' CHORES';
        if (this.type === 'Finished') {
            this.element.querySelector('h2').textContent =
                this.type.toUpperCase() + ' CHORES';
        }
    }
    renderChores() {
        const listEl = document.getElementById(`${this.type}-chores-list`);
        listEl.innerHTML = '';
        for (const choreItem of this.assignedChores) {
            new ChoreItem(this.element.querySelector('ul').id, choreItem);
        }
    }
}
class ChoreInput extends Component {
    constructor() {
        super('chore-input', 'app', true, 'user-input');
        this.childInputElement = this.element.querySelector('#children');
        this.choreInputElement = this.element.querySelector('#chore');
        this.notesInputElement = this.element.querySelector('#notes');
        this.addListeners();
    }
    addListeners() {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }
    userInputs() {
        const enteredChild = this.childInputElement.value;
        const enteredChore = this.choreInputElement.value;
        const enteredNote = this.notesInputElement.value;
        const childValidation = {
            value: enteredChild,
            required: true
        };
        const choreValidation = {
            value: enteredChore,
            required: true,
            minLength: 5
        };
        const noteValidation = {
            value: enteredNote,
            required: true,
            minLength: 5
        };
        if (!validateInputs(childValidation) ||
            !validateInputs(choreValidation) ||
            !validateInputs(noteValidation)) {
            alert('INVALID INPUTS!!');
            return;
        }
        else {
            return [enteredChild, enteredChore, enteredNote];
        }
    }
    renderContent() { }
    clearInputs() {
        this.childInputElement.value = '';
        this.choreInputElement.value = '';
        this.notesInputElement.value = '';
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.userInputs();
        if (Array.isArray(userInput)) {
            const [child, chore, note] = userInput;
            choreState.addChore(child, chore, note);
            this.clearInputs();
        }
    }
}
const choreInput = new ChoreInput();
const wesleighChoreList = new ChoreList('Wesleigh');
const alexisChoreList = new ChoreList('Alexis');
const tommyChoreList = new ChoreList('Tommy');
const finishedChores = new ChoreList('Finished');
//# sourceMappingURL=app.js.map