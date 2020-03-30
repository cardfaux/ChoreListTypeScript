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
type Listener<T> = (items: T[]) => void;

class State<T> {
	protected listeners: Listener<T>[] = [];

	addListener(listenerFn: Listener<T>) {
		this.listeners.push(listenerFn);
	}
}

class ProjectState extends State<Chore> {
	private chores: Chore[] = [];
	private static instance: ProjectState;

	private constructor() {
		super();
	}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
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

// Component BaseClass
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateElement: HTMLTemplateElement;
	hostElement: T;
	element: U;

	constructor(
		templateId: string,
		hostElementId: string,
		insertAtStart: boolean,
		newElementId?: string
	) {
		this.templateElement = document.getElementById(
			templateId
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById(hostElementId)! as T;

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);
		this.element = importedNode.firstElementChild as U;
		if (newElementId) {
			this.element.id = newElementId;
		}

		this.attach(insertAtStart);
	}

	private attach(insertAtBeginning: boolean) {
		this.hostElement.insertAdjacentElement(
			insertAtBeginning ? 'afterbegin' : 'beforeend',
			this.element
		);
	}

	abstract configure(): void;
	abstract renderContent(): void;
}

// ChoreItem Class
class ChoreItem extends Component<HTMLUListElement, HTMLLIElement> {
	private chore: Chore;

	constructor(hostId: string, chore: Chore) {
		super('single-project', hostId, false, chore.id);
		this.chore = chore;

		this.configure();
		this.renderContent();
	}

	configure() {}

	renderContent() {
		this.element.querySelector('h2')!.textContent = this.chore.chore;
		this.element.querySelector('p')!.textContent = this.chore.note;
	}
}

// ChoreList Class
class ChoreList extends Component<HTMLDivElement, HTMLElement> {
	assignedChores: Chore[];

	constructor(private type: 'Wesleigh' | 'Alexis' | 'Tommy') {
		super('project-list', 'app', false, `${type}-projects`);
		this.assignedChores = [];

		this.configure();
		this.renderContent();
	}

	configure() {
		projectState.addListener((chores: Chore[]) => {
			const relevantChores = chores.filter((chore) => {
				if (this.type === 'Alexis') {
					return chore.status === this.type;
				}
				if (this.type === 'Wesleigh') {
					return chore.status === this.type;
				}
				if (this.type === 'Tommy') {
					return chore.status === this.type;
				}
				return;
			});
			this.assignedChores = relevantChores;
			this.renderChores();
		});
	}

	renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.textContent =
			this.type.toUpperCase() + "'S" + ' CHORES';
	}

	private renderChores() {
		const listEl = document.getElementById(
			`${this.type}-projects-list`
		)! as HTMLUListElement;
		listEl.innerHTML = '';
		for (const choreItem of this.assignedChores) {
			new ChoreItem(this.element.querySelector('ul')!.id, choreItem);
		}
	}
}

// ChoreInput Class
class ChoreInput extends Component<HTMLDivElement, HTMLFormElement> {
	// The Goal With This Class Is To Get Access To The Template With The Form And Render It In The Main Div
	childInputElement: HTMLInputElement;
	choreInputElement: HTMLInputElement;
	notesInputElement: HTMLInputElement;
	constructor() {
		super('project-input', 'app', true, 'user-input');

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
	}

	configure() {
		this.element.addEventListener('submit', this.submitHandler);
	}

	renderContent() {}

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
}

const projectInput = new ChoreInput();
const wesleighChoreList = new ChoreList('Wesleigh');
const alexisChoreList = new ChoreList('Alexis');
const tommyChoreList = new ChoreList('Tommy');
