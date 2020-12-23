// const input = [3, 8, 9, 1, 2, 5, 4, 6, 7]; // Sample input
const input = [3, 1, 5, 6, 7, 9, 8, 2, 4]; // Actual input
// const NUM_CUPS = input.length;
const NUM_CUPS = 1000000;
// const NUM_MOVES = 100;
const NUM_MOVES = 10000000;

/**
 * @typedef {Object} Cup cup node which appears in a circular linked list
 * @property {number} label cup label, which is also its key in the map
 * @property {Cup} next next cup in the linked list
 */

 /**
  * Builds a circular linked list where every node is also stored in a Map for fast lookup
  * @returns {Map<number, Cup>} map of all nodes in the linked list
  */
function buildLinkedList() {
	/** @type {Map<number, Cup>} */
	let cups = new Map();

	/** @type {Cup} */
	let previousCup = null;
	for (let i = 0; i < NUM_CUPS; i++) {
		/** @type {Cup} */
		let newCup = {
			label: (i < input.length) ? input[i] : i + 1,
			next: null
		};

		cups.set(newCup.label, newCup);

		if (previousCup) previousCup.next = newCup;
		previousCup = newCup;
	}

	// Make it circular
	previousCup.next = cups.get(input[0]);

	return cups;
}

/**
 * Extract a sublist of three cups from the linked list.
 * @param {number} current label of current cup (will start picking up cups immediately clockwise)
 * @returns {Cup} first picked-up cup (which has a reference to the second cup, which in turn has a reference to the third cup)
 */
function pickUp(currentLabel) {
	let currentCup = cups.get(currentLabel);
	let firstPickedUp = currentCup.next;
	let secondPickedUp = firstPickedUp.next;
	let thirdPickedUp = secondPickedUp.next;

	// We need to close the gap, i.e. point currentCup's `next` property to the cup following the third picked-up cup
	currentCup.next = thirdPickedUp.next;

	thirdPickedUp.next = null;
	return firstPickedUp;
}

/**
 * Finds the first available destination label to insert the cups at.
 * @param {number} currentLabel label of current cup
 * @param {Cup} firstPickedUp first picked-up cup (which has a reference to the second cup, which in turn has a reference to the third cup)
 * @returns {number} label of the destination cup
 */
function getDestination(currentLabel, firstPickedUp) {
	let secondPickedUp = firstPickedUp.next;
	let thirdPickedUp = secondPickedUp.next;

	let destination = (currentLabel - 1 <= 0) ? (currentLabel - 1 + NUM_CUPS) : (currentLabel - 1);
	while (firstPickedUp.label === destination || secondPickedUp.label === destination || thirdPickedUp.label === destination) {
		destination = (destination - 1 <= 0) ? (destination - 1 + NUM_CUPS) : (destination - 1);
	}

	return destination;
}

/**
 * Inserts the picked-up sublist at the provided destination
 * @param {number} destinationLabel label of destination cup
 * @param {Cup} firstPickedUp first picked-up cup (which has a reference to the second cup, which in turn has a reference to the third cup)
 */
function insert(destinationLabel, firstPickedUp) {
	let destination = cups.get(destinationLabel);
	let secondPickedUp = firstPickedUp.next;
	let thirdPickedUp = secondPickedUp.next;

	thirdPickedUp.next = destination.next;
	destination.next = firstPickedUp;
}

/**
 * Prints the order of cups in a circular linked list or a noncircular sublist, used for debugging
 * @param {Cup} headCup head node of a linked list of cups
 */
function printCups(headCup) {
	let printout = '';
	let current = headCup;
	do {
		printout += `${current.label} `;
		current = current.next;
	} while (current && (current !== headCup))
	console.log(printout)
}

let cups = buildLinkedList();

let currentCupIndex = input[0];
for (let i = 0; i < NUM_MOVES; i++) {
	let firstPickedUp = pickUp(currentCupIndex);
	let destination = getDestination(currentCupIndex, firstPickedUp);
	insert(destination, firstPickedUp);
	currentCupIndex = cups.get(currentCupIndex).next.label;
}

let one = cups.get(1);
console.log(one.next.label * one.next.next.label);