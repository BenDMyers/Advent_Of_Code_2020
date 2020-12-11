const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(line => line.split(''));

let input1 = JSON.parse(JSON.stringify(input));
let input2 = JSON.parse(JSON.stringify(input));

// Part 1
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

function step() {
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
while(step()) {}

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

function getOccupiedSeatsWithinLineOfSight(row, column) {
	let occupiedSeatsInSight = 0;

	if (hasOccupiedSeatInLineOfSight(row - 1, column - 1, up, left)) occupiedSeatsInSight++;
	if (hasOccupiedSeatInLineOfSight(row - 1, column, up, noop)) occupiedSeatsInSight++;
	if (hasOccupiedSeatInLineOfSight(row - 1, column + 1, up, right)) occupiedSeatsInSight++;
	if (hasOccupiedSeatInLineOfSight(row, column - 1, noop, left)) occupiedSeatsInSight++;
	if (hasOccupiedSeatInLineOfSight(row, column + 1, noop, right)) occupiedSeatsInSight++;
	if (hasOccupiedSeatInLineOfSight(row + 1, column - 1, down, left)) occupiedSeatsInSight++;
	if (hasOccupiedSeatInLineOfSight(row + 1, column, down, noop)) occupiedSeatsInSight++;
	if (hasOccupiedSeatInLineOfSight(row + 1, column + 1, down, right)) occupiedSeatsInSight++;

	return occupiedSeatsInSight;
}

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