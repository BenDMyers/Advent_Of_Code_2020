const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(line => line.split(''));

let input1 = JSON.parse(JSON.stringify(input));
let input2 = JSON.parse(JSON.stringify(input));

// Part 1

/**
 * Determines how many of the current seat's immediate neighbors (up to 8) are occupied
 * @param {number} row current seat's row
 * @param {number} column current seat's column
 * @returns {number} count of adjacent occupied neighbors
 */
function getOccupiedNeighbors(row, column) {
	let occupiedNeighbors = 0;
	
	for (let r = -1; r <= 1; r++) {
		for (let c = -1; c <= 1; c++) {
			let neighborRow = row + r;
			let neighborColumn = column + c;
			let rowInBounds = neighborRow >= 0 && neighborRow < input1.length;
			let columnInBounds = neighborColumn >= 0 && neighborColumn < input1[0].length;

			if (!(r === 0 && c === 0) && rowInBounds && columnInBounds && input1[neighborRow][neighborColumn] === '#') {
				occupiedNeighbors++;
			}
		}
	}

	return occupiedNeighbors;
}

/**
 * Causes a new iteration of seating changes.
 * Empty seats (`L`) are filled if they have no occupied adjacent neighbors.
 * Occupied seats (`#`) are vacated if they have at least 4 occupied adjacent neighbors.
 * @returns {boolean} whether any seating changes were made during this step
 */
function stepPart1() {
	let changesMade = false;
	let newSeating = [];

	for (let r = 0; r < input1.length; r++) {
		newSeating.push([]);
		for (let c = 0; c < input1[r].length; c++) {
			let occupiedNeighbors = getOccupiedNeighbors(r, c);
			if (input1[r][c] === 'L' && occupiedNeighbors === 0) {
				changesMade = true;
				newSeating[r].push('#');
			} else if (input1[r][c] === '#' && occupiedNeighbors >= 4) {
				changesMade = true;
				newSeating[r].push('L');
			} else {
				newSeating[r].push(input1[r][c]);
			}
		}
	}

	input1 = newSeating;
	return changesMade;
}

// this is unholy
while(stepPart1()) {}

let finalOccupied = 0;
for (let r = 0; r < input1.length; r++) {
	for (let c = 0; c < input1[r].length; c++) {
		if (input1[r][c] === '#') {
			finalOccupied++;
		}
	}
}
console.log(finalOccupied);


// Part 2

/**
 * Recursively determines whether an occupied chair exists along a given line of sight
 * @param {number} row the current row of whichever element we're looking at along a particular line of sight
 * @param {number} column the current column of whichever element we're looking at along a particular line sight
 * @param {function} updateRow function to get the row of the next element along this line of sight
 * @param {function} updateColumn function to get the column of the next element along this line of sight
 * @returns {boolean} whether an occupied chair is within this line of sight
 */
function hasOccupiedSeatInLineOfSight(row, column, updateRow, updateColumn) {
	let rowOutOfBounds = row < 0 || row >= input2.length;
	let columnOutOfBounds = column < 0 || column >= input[0].length;

	if (rowOutOfBounds || columnOutOfBounds) return false;
	if (input2[row][column] === 'L') return false;
	if (input2[row][column] === '#') return true;

	return hasOccupiedSeatInLineOfSight(updateRow(row), updateColumn(column), updateRow, updateColumn);
}

const up = r => r - 1;
const down = r => r + 1;
const left = c => c - 1;
const right = c => c + 1;
const noop = x => x;

/**
 * Gets the number of occupied (`#`) seats within a given seat's line of sight in all 8 directions
 * @param {number} row row of the current seat
 * @param {number} column column of the current seat
 * @returns {number} the number of occupied seats within this seat's line of sight
 */
function getOccupiedSeatsWithinLineOfSight(row, column) {
	let occupiedSeatsInSight = 0;

	if (hasOccupiedSeatInLineOfSight(row - 1,	column - 1, 	up,		left))	occupiedSeatsInSight++;		// Northwest
	if (hasOccupiedSeatInLineOfSight(row - 1,	column, 		up, 	noop))	occupiedSeatsInSight++;		// North
	if (hasOccupiedSeatInLineOfSight(row - 1,	column + 1,		up, 	right))	occupiedSeatsInSight++;		// Northeast

	if (hasOccupiedSeatInLineOfSight(row,		column - 1,		noop, 	left))	occupiedSeatsInSight++;		// West
	if (hasOccupiedSeatInLineOfSight(row,		column + 1,		noop, 	right))	occupiedSeatsInSight++;		// East

	if (hasOccupiedSeatInLineOfSight(row + 1,	column - 1,		down, 	left))	occupiedSeatsInSight++;		// Southwest
	if (hasOccupiedSeatInLineOfSight(row + 1,	column,			down, 	noop))	occupiedSeatsInSight++;		// South
	if (hasOccupiedSeatInLineOfSight(row + 1,	column + 1,		down, 	right))	occupiedSeatsInSight++;		// Southeast

	return occupiedSeatsInSight;
}

/**
 * Causes a new iteration of seating changes.
 * Empty seats (`L`) are filled if there are no occupied seats in sight.
 * Occupied seats (`#`) are vacated if there are at least 5 occupied seats in sight.
 * @returns {boolean} whether any seating changes were made during this step
 */
function stepPart2() {
	let changesMade = false;
	let newSeating = [];
	let withinSight = [];

	for (let r = 0; r < input2.length; r++) {
		newSeating.push([]);
		withinSight.push([]);
		for (let c = 0; c < input2[r].length; c++) {
			let occupiedNeighbors = getOccupiedSeatsWithinLineOfSight(r, c);
			withinSight[r].push(occupiedNeighbors);
			if (input2[r][c] === 'L' && occupiedNeighbors === 0) {
				changesMade = true;
				newSeating[r].push('#');
			} else if (input2[r][c] === '#' && occupiedNeighbors >= 5) {
				changesMade = true;
				newSeating[r].push('L');
			} else {
				newSeating[r].push(input2[r][c]);
			}
		}
	}

	input2 = newSeating;
	return changesMade;
}

while (stepPart2()) {}

let finalOccupied2 = 0;
for (let r = 0; r < input2.length; r++) {
	for (let c = 0; c < input2[r].length; c++) {
		if (input2[r][c] === '#') {
			finalOccupied2++;
		}
	}
}
console.log(finalOccupied2);