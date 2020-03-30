"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class Chore {
    constructor(id, chore, note, status) {
        this.id = id;
        this.chore = chore;
        this.note = note;
        this.status = status;
    }
}
class ProjectState {
    constructor() {
        this.listeners = [];
        this.chores = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
    addChore(_child, chore, note) {
        const newChore = new Chore(Math.random().toString(), chore, note, _child);
        this.chores.push(newChore);
        for (const listenerFn of this.listeners) {
            listenerFn(this.chores.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
function validate(validatableInput) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.trim().length !== 0;
    }
    if (validatableInput.minLength != null &&
        typeof validatableInput.value === 'string') {
        isValid =
            isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (validatableInput.maxLength != null &&
        typeof validatableInput.value === 'string') {
        isValid =
            isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    return isValid;
}
function autobind(_target, _methodName, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}
class ChoreList {
    constructor(type) {
        this.type = type;
        this.templateElement = document.getElementById('project-list');
        this.hostElement = document.getElementById('app');
        this.assignedChores = [];
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        projectState.addListener((chores) => {
            const relevantChores = chores.filter((chore) => {
                if (this.type === 'Alexis' || 'Alexis') {
                    return chore.status === this.type;
                }
                return;
            });
            this.assignedChores = relevantChores;
            this.renderChores();
        });
        this.attach();
        this.renderContent();
    }
    renderChores() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = '';
        for (const choreItem of this.assignedChores) {
            const listItem = document.createElement('li');
            listItem.textContent = choreItem.chore;
            listEl.appendChild(listItem);
        }
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent =
            this.type.toUpperCase() + "'S" + ' CHORES';
    }
    attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}
class ChoreInput {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = 'user-input';
        this.childInputElement = this.element.querySelector('#children');
        this.choreInputElement = this.element.querySelector('#chore');
        this.notesInputElement = this.element.querySelector('#notes');
        this.configure();
        this.attach();
    }
    gatherUserInput() {
        const enteredChild = this.childInputElement.value;
        const enteredChore = this.choreInputElement.value;
        const enteredNote = this.notesInputElement.value;
        const childValidateable = {
            value: enteredChild,
            required: true
        };
        const choreValidateable = {
            value: enteredChore,
            required: true,
            minLength: 5
        };
        const noteValidateable = {
            value: enteredNote,
            required: true,
            minLength: 5
        };
        if (!validate(childValidateable) ||
            !validate(choreValidateable) ||
            !validate(noteValidateable)) {
            alert('Invalid Input, Please Try Again!');
            return;
        }
        else {
            return [enteredChild, enteredChore, enteredNote];
        }
    }
    clearInputs() {
        this.childInputElement.value = '';
        this.choreInputElement.value = '';
        this.notesInputElement.value = '';
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [child, chore, note] = userInput;
            projectState.addChore(child, chore, note);
            this.clearInputs();
        }
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}
__decorate([
    autobind
], ChoreInput.prototype, "submitHandler", null);
const projectInput = new ChoreInput();
const wesleighChoreList = new ChoreList('Wesleigh');
const alexisChoreList = new ChoreList('Alexis');
const tommyChoreList = new ChoreList('Tommy');
//# sourceMappingURL=app.js.map