// ---- INTERFACES FOR THE DROG AND DROP START--------

interface DraggableChores {
	dragStart(event: DragEvent): void;
	dragEnd(event: DragEvent): void;
}

interface DropChores {
	dragOver(event: DragEvent): void;
	dropChore(event: DragEvent): void;
	dragLeave(event: DragEvent): void;
}

// ---- INTERFACES FOR THE DROG AND DROP END--------

// ---- BASE CLASS FOR A CHORE START --------
class Chore {
	constructor(
		public id: string,
		public chore: string,
		public note: string,
		public whichBox: 'Wesleigh' | 'Alexis' | 'Tommy' | 'Finished'
	) {}
}

// ---- BASE CLASS FOR A CHORE END --------

// ------ THE STATE FOR THE CHORES START ----------

type ListenerFunction<T> = (items: T[]) => void;

class State<T> {
	protected listeners: ListenerFunction<T>[] = [];

	public addListener(listenerFn: ListenerFunction<T>) {
		this.listeners.push(listenerFn);
	}
}

class ChoreState extends State<Chore> {
	private chores: Chore[] = [];
	private static instance: ChoreState;

	private constructor() {
		super();
	}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ChoreState();
		return this.instance;
	}

	public addChore(child: any, chore: string, note: string) {
		const newChore = new Chore(Math.random().toString(), chore, note, child);

		this.chores.push(newChore);
		this.updateListeners();
	}

	public moveChore(
		choreId: string,
		newBox: 'Wesleigh' | 'Alexis' | 'Tommy' | 'Finished'
	) {
		const chore = this.chores.find((chore) => chore.id === choreId);
		if (chore && chore.whichBox !== newBox) {
			chore.whichBox = newBox;
			this.updateListeners();
		}
	}

	private updateListeners() {
		for (const listenerFn of this.listeners) {
			listenerFn(this.chores.slice());
		}
	}
}

const choreState = ChoreState.getInstance();

// ------ THE STATE FOR THE CHORES END ----------

// ---------VALIDATION FOR THE INPUTS START -------------
interface ValidationLogic {
	value: string;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
}

function validateInputs(validateInput: ValidationLogic) {
	let isValid = true;
	if (validateInput.required) {
		isValid = isValid && validateInput.value.trim().length !== 0;
	}
	if (
		validateInput.minLength != null &&
		typeof validateInput.value === 'string'
	) {
		isValid = isValid && validateInput.value.length >= validateInput.minLength;
	}
	if (
		validateInput.maxLength != null &&
		typeof validateInput.value === 'string'
	) {
		isValid = isValid && validateInput.value.length <= validateInput.maxLength;
	}
	return isValid;
}

// ---------VALIDATION FOR THE INPUTS END -------------

// ------- COMPONENT BASECLASS START --------------
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

	abstract addListeners(): void;
	abstract renderContent(): void;
}

// ------- COMPONENT BASECLASS END --------------

// -------------- CHOREITEM CLASS EXTENDING FROM THE COMPONENT CLASS START ---------
class ChoreItem extends Component<HTMLUListElement, HTMLLIElement>
	implements DraggableChores {
	private chore: Chore;

	constructor(hostId: string, chore: Chore) {
		super('single-chore', hostId, false, chore.id);
		this.chore = chore;

		this.addListeners();
		this.renderContent();
	}

	public dragStart(event: DragEvent) {
		event.dataTransfer!.setData('text/plain', this.chore.id);
		event.dataTransfer!.effectAllowed = 'move';
	}

	public dragEnd(_event: DragEvent) {
		console.log('DragEnd');
	}

	public addListeners() {
		this.element.addEventListener('dragstart', this.dragStart.bind(this));
		this.element.addEventListener('dragend', this.dragEnd.bind(this));
	}

	public renderContent() {
		this.element.querySelector('h2')!.textContent = this.chore.chore;
		this.element.querySelector('p')!.textContent = this.chore.note;
	}
}

// -------------- CHOREITEM CLASS EXTENDING FROM THE COMPONENT CLASS END ---------

// -------------- CHORELIST CLASS EXTENDING FROM THE COMPONENT CLASS START -----------
class ChoreList extends Component<HTMLDivElement, HTMLElement>
	implements DropChores {
	assignedChores: Chore[];

	constructor(private type: 'Wesleigh' | 'Alexis' | 'Tommy' | 'Finished') {
		super('chore-list', 'app', false, `${type}-Chores`);
		this.assignedChores = [];

		this.addListeners();
		this.renderContent();
	}

	public dragOver(event: DragEvent) {
		if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
			event.preventDefault();
			const listEl = this.element.querySelector('ul')!;
			listEl.classList.add('droppable');
		}
	}

	public dropChore(event: DragEvent) {
		const choreId = event.dataTransfer!.getData('text/plain');
		choreState.moveChore(choreId, 'Finished');
	}

	public dragLeave(_event: DragEvent) {
		const listEl = this.element.querySelector('ul')!;
		listEl.classList.remove('droppable');
	}

	public addListeners() {
		this.element.addEventListener('dragover', this.dragOver.bind(this));
		this.element.addEventListener('dragleave', this.dragLeave.bind(this));
		this.element.addEventListener('drop', this.dropChore.bind(this));

		choreState.addListener((chores: Chore[]) => {
			const appliedChores = chores.filter((chore) => {
				if (this.type === 'Alexis') {
					return chore.whichBox === this.type;
				}
				if (this.type === 'Wesleigh') {
					return chore.whichBox === this.type;
				}
				if (this.type === 'Tommy') {
					return chore.whichBox === this.type;
				}
				if (this.type === 'Finished') {
					return chore.whichBox === this.type;
				}
				return;
			});
			this.assignedChores = appliedChores;
			this.renderChores();
		});
	}

	public renderContent() {
		const listId = `${this.type}-chores-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.textContent =
			this.type.toUpperCase() + "'S" + ' CHORES';
		if (this.type === 'Finished') {
			this.element.querySelector('h2')!.textContent =
				this.type.toUpperCase() + ' CHORES';
		}
	}

	private renderChores() {
		const listEl = document.getElementById(
			`${this.type}-chores-list`
		)! as HTMLUListElement;
		listEl.innerHTML = '';
		for (const choreItem of this.assignedChores) {
			new ChoreItem(this.element.querySelector('ul')!.id, choreItem);
		}
	}
}

// -------------- CHORELIST CLASS EXTENDING FROM THE COMPONENT CLASS END -----------

// ---------- CHOREINPUT CLASS EXTENDING FROM THE COMPONENT CLASS START --------
class ChoreInput extends Component<HTMLDivElement, HTMLFormElement> {
	childInputElement: HTMLInputElement;
	choreInputElement: HTMLInputElement;
	notesInputElement: HTMLInputElement;
	constructor() {
		super('chore-input', 'app', true, 'user-input');

		this.childInputElement = this.element.querySelector(
			'#children'
		) as HTMLInputElement;
		this.choreInputElement = this.element.querySelector(
			'#chore'
		) as HTMLInputElement;
		this.notesInputElement = this.element.querySelector(
			'#notes'
		) as HTMLInputElement;

		this.addListeners();
	}

	public addListeners() {
		this.element.addEventListener('submit', this.submitHandler.bind(this));
	}

	private userInputs(): [string, string, string] | void {
		const enteredChild = this.childInputElement.value;
		const enteredChore = this.choreInputElement.value;
		const enteredNote = this.notesInputElement.value;

		const childValidation: ValidationLogic = {
			value: enteredChild,
			required: true
		};
		const choreValidation: ValidationLogic = {
			value: enteredChore,
			required: true,
			minLength: 5
		};
		const noteValidation: ValidationLogic = {
			value: enteredNote,
			required: true,
			minLength: 5
		};

		if (
			!validateInputs(childValidation) ||
			!validateInputs(choreValidation) ||
			!validateInputs(noteValidation)
		) {
			alert('INVALID INPUTS!!');
			return;
		} else {
			return [enteredChild, enteredChore, enteredNote];
		}
	}

	public renderContent() {}

	private clearInputs() {
		this.childInputElement.value = '';
		this.choreInputElement.value = '';
		this.notesInputElement.value = '';
	}

	private submitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.userInputs();
		if (Array.isArray(userInput)) {
			const [child, chore, note] = userInput;
			choreState.addChore(child, chore, note);
			this.clearInputs();
		}
	}
}

// ---------- CHOREINPUT CLASS EXTENDING FROM THE COMPONENT CLASS END --------

// ------- RENDERING THE COMPONENTS START -------------

const choreInput = new ChoreInput();
const wesleighChoreList = new ChoreList('Wesleigh');
const alexisChoreList = new ChoreList('Alexis');
const tommyChoreList = new ChoreList('Tommy');
const finishedChores = new ChoreList('Finished');

// ------- RENDERING THE COMPONENTS END -------------
