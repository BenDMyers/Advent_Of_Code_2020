const fs = require('fs');
const {rotate} = require('2d-array-rotation');

/** @type {{id: number, grid: string[][]}[]} */
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')
	.map(tileInput => {
		let [tileName, ...lines] = tileInput.split('\n');
		let id = Number(tileName.match(/\d+/));
		let grid = lines.map(line => line.split(''));
		return {id, grid};
	});

function reverse(str) {
	return str.split('').reverse().join('');
}

function flipGridHorizontally(grid) {
	grid.forEach(row => row.reverse());
}

function flipGridVertically(grid) {
	grid.reverse();
}

function printMap() {
	let divider = '';
	for (let i = 0; i < mapLength; i++) {
		divider += '----------+'
	}
	console.log(divider);

	for (let R = 0; R < mapLength; R++) {
		for (let r = 0; r < 10; r++) {
			let row = '';
			for (let C = 0; C < mapLength; C++) {
				// console.log(map[R][C])
				if (map[R][C]) {
					row += map[R][C].grid[r].join('') + '|';
				} else {
					row += '          |';
				}
			}
			console.log(row);
		}
		console.log(divider)
	}
}

function getAvailableEdges() {
	/** @type {Map<string, {neighbor: 'top'|'right'|'bottom'|'left', row: number, column: number}} */
	let availableEdges = new Map();

	for (let row = 0; row < mapLength; row++) {
		for (let column = 0; column < mapLength; column++) {
			if (map[row][column]) continue;

			let topNeighbor = row > 0 && map[row - 1][column];
			let leftNeighbor = column > 0 && map[row][column - 1];
			let bottomNeighbor = row < mapLength - 1 && map[row + 1][column];
			let rightNeighbor = column < mapLength - 1 && map[row][column + 1];

			if (topNeighbor) {
				let topBorder = topNeighbor.grid[topNeighbor.grid.length - 1].join('');
				availableEdges.set(topBorder, {neighbor: 'top', row, column});
			}

			if (leftNeighbor) {
				let leftBorder = leftNeighbor.grid.reduce((col, r) => col + r[r.length - 1], '');
				availableEdges.set(leftBorder, {neighbor: 'left', row, column});
			}

			if (bottomNeighbor) {
				let bottomBorder = bottomNeighbor.grid[0].join('');
				availableEdges.set(bottomBorder, {neighbor: 'bottom', row, column});
			}

			if (rightNeighbor) {
				let rightBorder = rightNeighbor.grid.reduce((col, r) => col + r[0], '');
				availableEdges.set(rightBorder, {neighbor: 'right', row, column});
			}
		}
	}

	return availableEdges;
}

const origin = Math.sqrt(input.length);
const mapLength = (2 * origin) + 1;
/** @type {{id: number, grid: string[][]}[][]} */
const map = [];
for (let i = 0; i < mapLength; i++) {
	map.push(new Array(mapLength));
}


map[origin][origin] = input[0];
input.splice(0, 1);


while (input.length > 0) {
	let availableEdges = getAvailableEdges();
	for (let i = input.length - 1; i >= 0; i--) {
		let cell = input[i];
		let topBorder = cell.grid[0].join('');
		let leftBorder = cell.grid.reduce((col, r) => col + r[0], '');
		let bottomBorder = cell.grid[cell.grid.length - 1].join('');
		let rightBorder = cell.grid.reduce((col, r) => col + r[r.length - 1], '');
	
		if (availableEdges.has(topBorder)) {
			let neighboringPiece = availableEdges.get(topBorder);
			switch (neighboringPiece.neighbor) {
				case 'left':
					cell.grid = rotate(cell.grid, 90);
					break;
				case 'bottom':
					cell.grid = rotate(cell.grid, 180);
					break;
				case 'right':
					cell.grid = rotate(cell.grid, 270);
					break;
			}
			input.splice(i, 1);
			map[neighboringPiece.row][neighboringPiece.column] = cell;
		} else if (availableEdges.has(leftBorder)) {
			let neighboringPiece = availableEdges.get(leftBorder);
			switch (neighboringPiece.neighbor) {
				case 'bottom':
					cell.grid = rotate(cell.grid, 90);
					break;
				case 'right':
					cell.grid = rotate(cell.grid, 180);
					break;
				case 'top':
					cell.grid = rotate(cell.grid, 270);
					break;
			}
			input.splice(i, 1);
			map[neighboringPiece.row][neighboringPiece.column] = cell;
		} else if (availableEdges.has(bottomBorder)) {
			let neighboringPiece = availableEdges.get(bottomBorder);
			switch (neighboringPiece.neighbor) {
				case 'right':
					cell.grid = rotate(cell.grid, 90);
					break;
				case 'top':
					cell.grid = rotate(cell.grid, 180);
					break;
				case 'left':
					cell.grid = rotate(cell.grid, 270);
					break;
			}
			input.splice(i, 1);
			map[neighboringPiece.row][neighboringPiece.column] = cell;
		} else if (availableEdges.has(rightBorder)) {
			let neighboringPiece = availableEdges.get(rightBorder);
			switch (neighboringPiece.neighbor) {
				case 'top':
					cell.grid = rotate(cell.grid, 90);
					break;
				case 'left':
					cell.grid = rotate(cell.grid, 180);
					break;
				case 'bottom':
					cell.grid = rotate(cell.grid, 270);
					break;
			}
			input.splice(i, 1);
			map[neighboringPiece.row][neighboringPiece.column] = cell;
		} else if (availableEdges.has(reverse(topBorder))) {
			flipGridHorizontally(cell.grid);
			let neighboringPiece = availableEdges.get(reverse(topBorder));
			switch (neighboringPiece.neighbor) {
				case 'left':
					cell.grid = rotate(cell.grid, 90);
					break;
				case 'bottom':
					cell.grid = rotate(cell.grid, 180);
					break;
				case 'right':
					cell.grid = rotate(cell.grid, 270);
					break;
			}
			input.splice(i, 1);
			map[neighboringPiece.row][neighboringPiece.column] = cell;
		} else if (availableEdges.has(reverse(leftBorder))) {
			flipGridVertically(cell.grid);
			let neighboringPiece = availableEdges.get(reverse(leftBorder));
			switch (neighboringPiece.neighbor) {
				case 'bottom':
					cell.grid = rotate(cell.grid, 90);
					break;
				case 'right':
					cell.grid = rotate(cell.grid, 180);
					break;
				case 'top':
					cell.grid = rotate(cell.grid, 270);
					break;
			}
			input.splice(i, 1);
			map[neighboringPiece.row][neighboringPiece.column] = cell;
		} else if (availableEdges.has(reverse(bottomBorder))) {
			flipGridHorizontally(cell.grid);
			let neighboringPiece = availableEdges.get(reverse(bottomBorder));
			switch (neighboringPiece.neighbor) {
				case 'right':
					cell.grid = rotate(cell.grid, 90);
					break;
				case 'top':
					cell.grid = rotate(cell.grid, 180);
					break;
				case 'left':
					cell.grid = rotate(cell.grid, 270);
					break;
			}
			input.splice(i, 1);
			map[neighboringPiece.row][neighboringPiece.column] = cell;
		} else if (availableEdges.has(reverse(rightBorder))) {
			flipGridVertically(cell.grid);
			let neighboringPiece = availableEdges.get(reverse(rightBorder));
			switch (neighboringPiece.neighbor) {
				case 'top':
					cell.grid = rotate(cell.grid, 90);
					break;
				case 'left':
					cell.grid = rotate(cell.grid, 180);
					break;
				case 'bottom':
					cell.grid = rotate(cell.grid, 270);
					break;
			}
			input.splice(i, 1);
			map[neighboringPiece.row][neighboringPiece.column] = cell;
		}
	}

	printMap();

	console.log('\n\n')
}

// console.log(getAvailableEdges());
printMap();