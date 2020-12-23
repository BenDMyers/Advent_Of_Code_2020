const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('')
	.map(num => Number(num));

console.log(input);

// Part 1
(function part1() {
	let cups = [...input];
	let currentCup = cups[0];

	for (let i = 0; i < 100; i++) {
		let currentCupIndex = cups.indexOf(currentCup);

		// Pick up three cups, wrapping around if need be
		let pickedUp = cups.splice(currentCupIndex + 1, 3);
		pickedUp.push(...cups.splice(0, 3 - pickedUp.length));

		// Determine new destination for current cup
		let destination = currentCup - 1;
		while (!cups.includes(destination)) {
			destination--;
			if (destination <= 0) {
				destination = input.length;
			} 
		}
		let destinationIndex = cups.indexOf(destination);

		// Insert picked up cups right after the destination
		cups.splice(destinationIndex + 1, 0, ...pickedUp);

		// Pick new current cup
		currentCup = cups[(cups.indexOf(currentCup) + 1) % input.length];
	}

	let indexOf1 = cups.indexOf(1);
	let after1 = cups.slice(indexOf1 + 1);
	let before1 = cups.slice(0, indexOf1);
	console.log([...after1, ...before1].join(''));
})();

/**
 * @typedef {Object} Cup
 * @property {number} label
 * @property {Cup} next
 * @property {boolean} pickedUp
 */

// Part 2
const NUM_CUPS = 1000000;
// const NUM_CUPS = input.length;
const NUM_MOVES = 10000000;
// const NUM_MOVES = 100;
(function part2() {
	// Prepare input as a circular linked list, grafted to a map for instant look up
	/** @type {Map<number, Cup}> */
	let cupMap = new Map();

	/** @type {Cup} */
	let headCup = {
		label: input[0],
		next: null,
		pickedUp: false
	};
	cupMap.set(headCup.label, headCup);

	let currentCup = headCup;
	let i = 1;
	for (; i < input.length; i++) {
		/** @type {Cup} */
		let nextCup = {
			label: input[i],
			next: null,
			pickedUp: false
		};
		cupMap.set(nextCup.label, nextCup);
		currentCup.next = nextCup;
		currentCup = nextCup;
	}
	while (cupMap.size < NUM_CUPS) {
		/** @type {Cup} */
		let nextCup = {
			label: i,
			next: null,
			pickedUp: false
		};
		cupMap.set(nextCup.label, nextCup);
		currentCup.next = nextCup;
		currentCup = nextCup;
		i++;
	}
	currentCup.next = headCup;

	/**
	 * Extracts the three cups clockwise of the current cup from the circular linked list
	 * @param {Cup} currentCup the cup BEFORE the three cups that'll get picked up
	 * @returns {Cup} the first of the three cups to be picked up
	 */
	function pickUp(currentCup) {
		let firstPickedUp = currentCup.next;
		let secondPickedUp = firstPickedUp.next;
		let thirdPickedUp = secondPickedUp.next;

		// Mark as picked up
		firstPickedUp.pickedUp = true;
		secondPickedUp.pickedUp = true;
		thirdPickedUp.pickedUp = true;

		// Close the gap
		currentCup.next = thirdPickedUp.next;
		thirdPickedUp.next = null;

		// print(firstPickedUp);

		// Return the head of the plucked sublist
		return firstPickedUp;
	}

	function print(head) {
		let printout = '';
		let current = head;
		do {
			printout += current.label + ' ';
			current = current.next;
		} while (current && current !== head)
		console.log('👑', printout)
	}

	currentCup = headCup;
	for (let i = 0; i < NUM_MOVES + 20; i++) {
		if (cupMap.get(1).next.label === 934001) {
			console.log('🕺', i)
		}
		// if (i)
		// print(currentCup);
		// Pick up three cups, wrapping around if need be
		let firstPickedUp = pickUp(currentCup);
		// if (i === 5 || i ===) {
			// }
			
		// Determine new destination for current cup
		let destination = currentCup.label - 1;
			
		while (!destination || cupMap.get(destination).pickedUp) {
			if (destination <= 0) {
				// console.log('⚾️', destination)
				destination += NUM_CUPS;
			} else {
				destination--;
			}
			// if (destination <= 0) {
			// 	destination = NUM_CUPS;
			// }
			// console.log(destination, cupMap.get(destination))
		}
		// console.log(currentCup.label, firstPickedUp, destination)
		let destinationNode = cupMap.get(destination);

		// Insert picked up cups right after the destination
		let afterDestination = destinationNode.next;
		destinationNode.next = firstPickedUp;
		let secondPickedUp = firstPickedUp.next;
		let thirdPickedUp = secondPickedUp.next;
		firstPickedUp.pickedUp = false;
		secondPickedUp.pickedUp = false;
		thirdPickedUp.pickedUp = false;
		thirdPickedUp.next = afterDestination;

		// Pick new current cup
		currentCup = currentCup.next;
	}

	// print(currentCup)
	let one = cupMap.get(1);
	// console.dir(one, {depth: 10})
	// console.dir(cupMap.get(934001), {depth: 10})
	// console.dir(cupMap.get(159792), {depth: 10})
	console.log(one.next.label, one.next.next.label, one.next.label * one.next.next.label);
})();