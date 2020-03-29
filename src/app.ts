// Validation
interface Validateable {
	value: string;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
}

function validate(validatableInput: Validateable) {
	let isValid = true;
	if (validatableInput.required) {
		isValid = isValid && validatableInput.value.trim().length !== 0;
	}
	if (
		validatableInput.minLength != null &&
		typeof validatableInput.value === 'string'
	) {
		isValid =
			isValid && validatableInput.value.length >= validatableInput.minLength;
	}
	if (
		validatableInput.maxLength != null &&
		typeof validatableInput.value === 'string'
	) {
		isValid =
			isValid && validatableInput.value.length <= validatableInput.maxLength;
	}
	return isValid;
}

// AutoBind Decorator
function autobind(
	_target: any,
	_methodName: string,
	descriptor: PropertyDescriptor
) {
	const originalMethod = descriptor.value;
	const adjDescriptor: PropertyDescriptor = {
		configurable: true,
		get() {
			const boundFn = originalMethod.bind(this);
			return boundFn;
		}
	};
	return adjDescriptor;
}

// ChoreInput Class
class ChoreInput {
	// The Goal With This Class Is To Get Access To The Template With The Form And Render It In The Main Div
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLFormElement;
	childInputElement: HTMLInputElement;
	choreInputElement: HTMLInputElement;
	notesInputElement: HTMLInputElement;
	constructor() {
		this.templateElement = document.getElementById(
			'project-input'
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById('app')! as HTMLDivElement;

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = importedNode.firstElementChild as HTMLFormElement;
		this.element.id = 'user-input';

		this.childInputElement = this.element.querySelector(
			'#children'
		) as HTMLInputElement;
		this.choreInputElement = this.element.querySelector(
			'#chore'
		) as HTMLInputElement;
		this.notesInputElement = this.element.querySelector(
			'#notes'
		) as HTMLInputElement;

		this.configure();
		this.attach();
	}

	private gatherUserInput(): [string, string, string] | void {
		const enteredChild = this.childInputElement.value;
		const enteredChore = this.choreInputElement.value;
		const enteredNote = this.notesInputElement.value;

		if (
			validate({ value: enteredChild, required: true }) &&
			validate({ value: enteredChore, required: true, minLength: 5 }) &&
			validate({ value: enteredNote, required: true, minLength: 5 })
		) {
			alert('Invalid Input, Please Try Again!');
			return;
		} else {
			return [enteredChild, enteredChore, enteredNote];
		}
	}

	private clearInputs() {
		this.childInputElement.value = '';
		this.choreInputElement.value = '';
		this.notesInputElement.value = '';
	}

	@autobind
	private submitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.gatherUserInput();
		if (Array.isArray(userInput)) {
			const [child, chore, note] = userInput;
			console.log(child, chore, note);
			this.clearInputs();
		}
	}

	private configure() {
		this.element.addEventListener('submit', this.submitHandler);
	}

	private attach() {
		this.hostElement.insertAdjacentElement('afterbegin', this.element);
	}
}

const projectInput = new ChoreInput();
