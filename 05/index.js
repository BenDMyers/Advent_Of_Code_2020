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

// Part 1 - Optimized
// The IDs are constructed so the backmost row will *always* have the highest IDs, and within the backmost row, the rightmost seat
// will have the highest ID. So that seat is the *only* seat we need to check.
function bySeatingOrder(seatA, seatB) {
	const seatAVertical = seatA.substring(0, 7); // first 7 characters
	const seatAHorizontal = seatA.substring(7); // last (3) characters
	const seatBVertical = seatB.substring(0, 7); // first 7 characters
	const seatBHorizontal = seatB.substring(7); // last (3) characters

	let rowComparison = seatAVertical.localeCompare(seatBVertical);
	if (rowComparison) {
		return rowComparison;
	} else {
		// Flipping the order because we want `R` to come before `L`
		return seatBHorizontal.localeCompare(seatAHorizontal);
	}
}
const sortedPasses = [...boardingPasses].sort(bySeatingOrder);
const farBackRightSeat = sortedPasses[0];
const farBackRightId = getSeatId(farBackRightSeat);
console.log(farBackRightId);



// Part 2
const occupiedSeats = [];
boardingPasses.forEach(pass => occupiedSeats.push(getSeatId(pass))); // track which seats are taken

// Problem specifies that our seat WILL have an occupied seat with an ID of 1 lower, and an occupied seat of ID 1 higher
// Turning that on its head, we can try to find the *lower* of those occupied seats.
// That'll be an ID where ID + 1 *does not exist*, but ID + 2 does
const leftNeighbor = occupiedSeats.find((seatId) => (!occupiedSeats.includes(seatId + 1) && occupiedSeats.includes(seatId + 2)));
console.log(leftNeighbor + 1);


// Part 2 - Optimized
const sortedIds = boardingPasses.map(getSeatId).sort((a, z) => a-z);
for (let i = 0; i < sortedIds.length - 1; i++) {
	const currentId = sortedIds[i];
	if (sortedIds[i + 1] === currentId + 2) {
		console.log(currentId + 1);
		break;
	}
}