const fs = require('fs');
const boardingPasses = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')

// Part 1
/**
 * @param {string} boardingPass Binary space partitioning specification for a seat.
 * The first 7 characters will be `F` or `B`, to partition the seat vertically from `0` to `128`.
 * The last 3 characters will be `L` or `R`, to partition the seat horizontally from `0` to `7`.
 * @returns {number} the seat's unique identifier
 */
function getSeatId(boardingPass) {
	const verticalPartition = boardingPass.substring(0, 7); // first 7 characters
	const horizontalPartition = boardingPass.substring(7); // last (3) characters

	let row;

	let minimumRow = 0, maximumRow = 127;
	for (let i = 0; i < verticalPartition.length; i++) {
		let char = verticalPartition[i];

		if (i === verticalPartition.length - 1) {
			if (char === 'F') {
				row = minimumRow;
			} else if (char === 'B') {
				row = maximumRow;
			}
		} else {
			if (char === 'F') {
				maximumRow = Math.floor((minimumRow + maximumRow) / 2);
			} else if (char === 'B') {
				minimumRow = Math.ceil((minimumRow + maximumRow) / 2);
			}
		}
	}

	let column;

	let minimumColumn = 0, maximumColumn = 7;
	for (let i = 0; i < horizontalPartition.length; i++) {
		let char = horizontalPartition[i];

		if (i === horizontalPartition.length - 1) {
			if (char === 'L') {
				column = minimumColumn;
			} else if (char === 'R') {
				column = maximumColumn;
			}
		} else {
			if (char === 'L') {
				maximumColumn = Math.floor((minimumColumn + maximumColumn) / 2);
			} else if (char === 'R') {
				minimumColumn = Math.ceil((minimumColumn + maximumColumn) / 2);
			}
		}
	}

	return (8 * row) + column;
}

const highestSeat = boardingPasses.reduce((highestSeatId, boardingPass) => {
	let seatId = getSeatId(boardingPass);
	return Math.max(seatId, highestSeatId);
}, 0);

console.log(highestSeat);