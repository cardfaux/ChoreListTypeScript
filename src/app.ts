// Project Type
class Chore {
	constructor(
		public id: string,
		public chore: string,
		public note: string,
		public status?: 'Wesleigh' | 'Alexis' | 'Tommy'
	) {}
}

// Project State Management
type Listener = (items: Chore[]) => void;

class ProjectState {
	private listeners: Listener[] = [];
	private chores: Chore[] = [];
	private static instance: ProjectState;

	private constructor() {}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}

	addListener(listenerFn: Listener) {
		this.listeners.push(listenerFn);
	}

	addChore(_child: any, chore: string, note: string) {
		const newChore = new Chore(Math.random().toString(), chore, note, _child);

		this.chores.push(newChore);
		for (const listenerFn of this.listeners) {
			listenerFn(this.chores.slice());
		}
	}
}

const projectState = ProjectState.getInstance();

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

// ChoreList Class
class ChoreList {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLElement;
	assignedChores: Chore[];

	constructor(private type: 'Wesleigh' | 'Alexis' | 'Tommy') {
		this.templateElement = document.getElementById(
			'project-list'
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById('app')! as HTMLDivElement;
		this.assignedChores = [];

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = importedNode.firstElementChild as HTMLElement;
		this.element.id = `${this.type}-projects`;

		projectState.addListener((chores: Chore[]) => {
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

	private renderChores() {
		const listEl = document.getElementById(
			`${this.type}-projects-list`
		)! as HTMLUListElement;
		listEl.innerHTML = '';
		for (const choreItem of this.assignedChores) {
			const listItem = document.createElement('li');
			listItem.textContent = choreItem.chore;
			listEl.appendChild(listItem);
		}
	}

	private renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.textContent =
			this.type.toUpperCase() + "'S" + ' CHORES';
	}

	private attach() {
		this.hostElement.insertAdjacentElement('beforeend', this.element);
	}
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

		const childValidateable: Validateable = {
			value: enteredChild,
			required: true
		};
		const choreValidateable: Validateable = {
			value: enteredChore,
			required: true,
			minLength: 5
		};
		const noteValidateable: Validateable = {
			value: enteredNote,
			required: true,
			minLength: 5
		};

		if (
			!validate(childValidateable) ||
			!validate(choreValidateable) ||
			!validate(noteValidateable)
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
			projectState.addChore(child, chore, note);
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
const wesleighChoreList = new ChoreList('Wesleigh');
const alexisChoreList = new ChoreList('Alexis');
const tommyChoreList = new ChoreList('Tommy');
