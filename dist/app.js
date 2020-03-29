"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
        if (validate({ value: enteredChild, required: true }) &&
            validate({ value: enteredChore, required: true, minLength: 5 }) &&
            validate({ value: enteredNote, required: true, minLength: 5 })) {
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
            console.log(child, chore, note);
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
//# sourceMappingURL=app.js.map