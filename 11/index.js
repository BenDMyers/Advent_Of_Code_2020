const fs = require('fs');
let input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(line => line.split(''));

console.log(input);

// Part 1
function getOccupiedNeighbors(row, column) {
	let occupiedNeighbors = 0;
	
	for (let r = -1; r <= 1; r++) {
		for (let c = -1; c <= 1; c++) {
			let neighborRow = row + r;
			let neighborColumn = column + c;
			let rowInBounds = neighborRow >= 0 && neighborRow < input.length;
			let columnInBounds = neighborColumn >= 0 && neighborColumn < input[0].length;

			if (!(r === 0 && c === 0) && rowInBounds && columnInBounds && input[neighborRow][neighborColumn] === '#') {
				occupiedNeighbors++;
			}
		}
	}

	return occupiedNeighbors;
}

function step() {
	let changesMade = false;
	let newSeating = [];

	for (let r = 0; r < input.length; r++) {
		newSeating.push([]);
		for (let c = 0; c < input[r].length; c++) {
			let occupiedNeighbors = getOccupiedNeighbors(r, c);
			if (input[r][c] === 'L' && occupiedNeighbors === 0) {
				changesMade = true;
				newSeating[r].push('#');
			} else if (input[r][c] === '#' && occupiedNeighbors >= 4) {
				changesMade = true;
				newSeating[r].push('L');
			} else {
				newSeating[r].push(input[r][c]);
			}
		}
	}

	input = newSeating;
	return changesMade;
}

// this is unholy
while(step()) {}

let finalOccupied = 0;
for (let r = 0; r < input.length; r++) {
	for (let c = 0; c < input[r].length; c++) {
		if (input[r][c] === '#') {
			finalOccupied++;
		}
	}
}
console.log(finalOccupied);