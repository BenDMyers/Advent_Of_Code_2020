const fs = require('fs');
const {rotate} = require('2d-array-rotation');

const coordinatesRegex = /\((?<row>[-\d]+), (?<column>[-\d]+)\)/;

/**
 * @typedef {string[][]} Tile 10x10 grid of characters representing a piece of the map
 */

/** @type {Tile[]} */
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')
	.map(tileInput => {
		let [_, ...lines] = tileInput.split('\n');
		let grid = lines.map(line => line.split(''));
		return grid;
	});

/**
 * Gets all empty spaces that border a placed tile
 * @returns {Map<String, {top: String?, right: String?, bottom: String?, left: String?}>}
 */
function getAvailableSpaces() {
	/** @type {Map<String, {top: String?, right: String?, bottom: String?, left: String?}>} */
	let availableSpaces = new Map();

	map.forEach((grid, coordinates) => {
		const coords = coordinates.match(coordinatesRegex).groups;
		const row = Number(coords.row);
		const column = Number(coords.column);

		// Mark whether TOP border is available
		let topNeighborCoords = `(${row - 1}, ${column})`;
		if (!map.has(topNeighborCoords)) {
			let topBorder = grid[0].join('');
			if (!availableSpaces.has(topNeighborCoords)) {
				availableSpaces.set(topNeighborCoords, {bottom: topBorder});
			} else {
				let topNeighborSpace = availableSpaces.get(topNeighborCoords);
				topNeighborSpace.bottom = topBorder;
			}
		}

		// Mark whether BOTTOM border is available
		let bottomNeighborCoords = `(${row + 1}, ${column})`;
		if (!map.has(bottomNeighborCoords)) {
			let bottomBorder = grid[grid.length - 1].join('');
			if (!availableSpaces.has(bottomNeighborCoords)) {
				availableSpaces.set(bottomNeighborCoords, {top: bottomBorder});
			} else {
				let bottomNeighborSpace = availableSpaces.get(bottomNeighborCoords);
				bottomNeighborSpace.top = bottomBorder;
			}
		}

		// Mark whether LEFT border is available
		let leftNeighborCoords = `(${row}, ${column - 1})`;
		if (!map.has(leftNeighborCoords)) {
			let leftBorder = grid.reduce((col, rw) => col + rw[0], '');
			if (!availableSpaces.has(leftNeighborCoords)) {
				availableSpaces.set(leftNeighborCoords, {right: leftBorder});
			} else {
				let leftNeighborSpace = availableSpaces.get(leftNeighborCoords);
				leftNeighborSpace.right = leftBorder;
			}
		}

		// Mark whether RIGHT border is available
		let rightNeighborCoords = `(${row}, ${column + 1})`;
		if (!map.has(rightNeighborCoords)) {
			let rightBorder = grid.reduce((col, rw) => col + rw[rw.length - 1], '');
			if (!availableSpaces.has(rightNeighborCoords)) {
				availableSpaces.set(rightNeighborCoords, {left: rightBorder});
			} else {
				let rightNeighborSpace = availableSpaces.get(rightNeighborCoords);
				rightNeighborSpace.left = rightBorder;
			}
		}
	});

	return availableSpaces;
}

/**
 * Gets all the borders of a placed tile
 * @param {Tile} tile placed tile
 * @returns {{top: String, bottom: String, right: String, left: String}}
 */
function getBorders(tile) {
	let top = tile[0].join('');
	let bottom = tile[tile.length - 1].join('');
	let left = tile.reduce((border, row) => border + row[0], '');
	let right = tile.reduce((border, row) => border + row[row.length - 1], '');
	return {top, right, bottom, left};
}

/**
 * Prints the current map to the console
 */
function printMap() {
	let minX = 0, minY = 0, maxX = 0, maxY = 0;
	map.forEach((_, coordinates) => {
		const {row, column} = coordinates.match(coordinatesRegex).groups;
		minX = Math.min(minX, column);
		maxX = Math.max(maxX, column);
		minY = Math.min(minY, row);
		maxY = Math.max(maxY, row);
	});

	for (let r = minY; r <= maxY; r++) {
		for (let innerRow = 0; innerRow < 10; innerRow++) {
			let row = '';
			for (let c = minX; c <= maxX; c++) {
				let tile = map.get(`(${r}, ${c})`);
				let rowOfTile = tile[innerRow].join('');
				row += (rowOfTile + ' ');
			}
			console.log(row);
		}
		console.log('')
	}
}

/**
 * Fuses the tiles into one big grid, removing the border characters from each tile
 * @returns {string[][]} stitched grid
 */
function stitchMap() {
	let minX = 0, minY = 0, maxX = 0, maxY = 0;
	map.forEach((_, coordinates) => {
		const {row, column} = coordinates.match(coordinatesRegex).groups;
		minX = Math.min(minX, column);
		maxX = Math.max(maxX, column);
		minY = Math.min(minY, row);
		maxY = Math.max(maxY, row);
	});

	let stitchedGrid = [];
	for (let r = minY; r <= maxY; r++) {
		for (let innerRow = 1; innerRow < 9; innerRow++) {
			let row = [];
			for (let c = minX; c <= maxX; c++) {
				let tile = map.get(`(${r}, ${c})`);
				let rowOfTile = tile[innerRow];
				row.push(...rowOfTile.slice(1, -1));
			}
			stitchedGrid.push(row);
		}
	}
	return stitchedGrid;
}


/**
 * Representation of all assembled tiles.
 * Keys are coordinate strings relative to the origin `(0, 0)`.
 * @type {Map<String, Tile>}
 */
const map = new Map();

let firstTile = input.shift();
map.set('(0, 0)', firstTile);

while (input.length > 0) {
	let availableSpaces = getAvailableSpaces();
	for (let t = input.length - 1; t >= 0; t--) {
		const originalTile = input[t];
	
		// Unflipped
		availableSpaces.forEach((space, coords) => {
			for (let angle = 0; angle < 360; angle += 90) {
				/** @type {Tile} */
				let testTile = rotate(originalTile, angle);
				let testBorders = getBorders(testTile);
	
				let topMatches = (!space.top) || (space.top === testBorders.top);
				let rightMatches = (!space.right) || (space.right === testBorders.right);
				let bottomMatches = (!space.bottom) || (space.bottom === testBorders.bottom);
				let leftMatches = (!space.left) || (space.left === testBorders.left);
	
				if (topMatches && rightMatches && bottomMatches && leftMatches) {
					availableSpaces.delete(coords);
					input.splice(t, 1);
					map.set(coords, testTile);
				}
			}
		});
	
		// Flipped horizontally
		const flippedHorizontally = originalTile.map(row => [...row].reverse());
		availableSpaces.forEach((space, coords) => {
			for (let angle = 0; angle < 360; angle += 90) {
				/** @type {Tile} */
				let testTile = rotate(flippedHorizontally, angle);
				let testBorders = getBorders(testTile);
	
				let topMatches = (!space.top) || (space.top === testBorders.top);
				let rightMatches = (!space.right) || (space.right === testBorders.right);
				let bottomMatches = (!space.bottom) || (space.bottom === testBorders.bottom);
				let leftMatches = (!space.left) || (space.left === testBorders.left);
	
				if (topMatches && rightMatches && bottomMatches && leftMatches) {
					availableSpaces.delete(coords);
					input.splice(t, 1);
					map.set(coords, testTile);
				}
			}
		});
	
		// Flipped vertically
		const flippedVertically = [...originalTile].reverse();
		availableSpaces.forEach((space, coords) => {
			for (let angle = 0; angle < 360; angle += 90) {
				/** @type {Tile} */
				let testTile = rotate(flippedVertically, angle);
				let testBorders = getBorders(testTile);
	
				let topMatches = (!space.top) || (space.top === testBorders.top);
				let rightMatches = (!space.right) || (space.right === testBorders.right);
				let bottomMatches = (!space.bottom) || (space.bottom === testBorders.bottom);
				let leftMatches = (!space.left) || (space.left === testBorders.left);
	
				if (topMatches && rightMatches && bottomMatches && leftMatches) {
					availableSpaces.delete(coords);
					input.splice(t, 1);
					map.set(coords, testTile);
				}
			}
		});
	
		// Flipped both ways
		const flippedBothWays = [...originalTile].reverse().map(row => [...row].reverse());
		availableSpaces.forEach((space, coords) => {
			for (let angle = 0; angle < 360; angle += 90) {
				/** @type {Tile} */
				let testTile = rotate(flippedBothWays, angle);
				let testBorders = getBorders(testTile);
	
				let topMatches = (!space.top) || (space.top === testBorders.top);
				let rightMatches = (!space.right) || (space.right === testBorders.right);
				let bottomMatches = (!space.bottom) || (space.bottom === testBorders.bottom);
				let leftMatches = (!space.left) || (space.left === testBorders.left);
	
				if (topMatches && rightMatches && bottomMatches && leftMatches) {
					availableSpaces.delete(coords);
					input.splice(t, 1);
					map.set(coords, testTile);
				}
			}
		});
	}
}

const stitched = stitchMap();
const seaMonsterSpottings = JSON.parse(JSON.stringify(stitched));

const seaMonsterPattern = [
	'                  # '.split(''),
	'#    ##    ##    ###'.split(''),
	' #  #  #  #  #  #   '.split('')
];

/**
 * Determines whether this cell matches the sea monster pattern
 * @param {string[][]} testMap the stitched map
 * @param {string[][]} seaMonster the currently tested orientation of the sea monster
 * @param {number} originRow the row of the top-left cell to apply the sea monster pattern to
 * @param {number} originColumn the column of the top-left cell to apply the sea monster pattern to
 * @returns {boolean} whether this cell is the top-left corner of a sea monster
 */
function isSeaMonster(testMap, seaMonster, originRow, originColumn) {
	for (let seaMonsterRow = 0; seaMonsterRow < seaMonster.length; seaMonsterRow++) {
		for (let seaMonsterColumn = 0; seaMonsterColumn < seaMonster[0].length; seaMonsterColumn++) {
			let appliesSeaMonsterMask = seaMonster[seaMonsterRow][seaMonsterColumn] === '#';
			let mapShowsDot = testMap[originRow + seaMonsterRow][originColumn + seaMonsterColumn] === '.';
			if (appliesSeaMonsterMask && mapShowsDot) {
				return false;
			}
		}
	}
	return true;
}

// Unflipped sea monster
for (let angle = 0; angle < 360; angle += 90) {
	/** @type {String[][]} */
	let seaMonster = rotate(seaMonsterPattern, angle);

	for (let row = 0; row <= stitched.length - seaMonster.length; row++) {
		for (let column = 0; column <= stitched[0].length - seaMonster[0].length; column++) {
			if (isSeaMonster(stitched, seaMonster, row, column)) {
				for (let seaMonsterRow = 0; seaMonsterRow < seaMonster.length; seaMonsterRow++) {
					for (let seaMonsterColumn = 0; seaMonsterColumn < seaMonster[0].length; seaMonsterColumn++) {
						let appliesSeaMonsterMask = seaMonster[seaMonsterRow][seaMonsterColumn] === '#';
						if (appliesSeaMonsterMask) {
							seaMonsterSpottings[row + seaMonsterRow][column + seaMonsterColumn] = '🦕';
						}
					}
				}
			}
		}
	}
}

// Horizontally flipped sea monster
let horizontallyFlippedSeaMonster = seaMonsterPattern.map(row => [...row].reverse());
for (let angle = 0; angle < 360; angle += 90) {
	/** @type {String[][]} */
	let seaMonster = rotate(horizontallyFlippedSeaMonster, angle);

	for (let row = 0; row <= stitched.length - seaMonster.length; row++) {
		for (let column = 0; column <= stitched[0].length - seaMonster[0].length; column++) {
			if (isSeaMonster(stitched, seaMonster, row, column)) {
				for (let seaMonsterRow = 0; seaMonsterRow < seaMonster.length; seaMonsterRow++) {
					for (let seaMonsterColumn = 0; seaMonsterColumn < seaMonster[0].length; seaMonsterColumn++) {
						let appliesSeaMonsterMask = seaMonster[seaMonsterRow][seaMonsterColumn] === '#';
						if (appliesSeaMonsterMask) {
							seaMonsterSpottings[row + seaMonsterRow][column + seaMonsterColumn] = '🦕';
						}
					}
				}
			}
		}
	}
}

// Vertically flipped sea monster
let verticallyFlippedSeaMonster = [...seaMonsterPattern].reverse();
for (let angle = 0; angle < 360; angle += 90) {
	/** @type {String[][]} */
	let seaMonster = rotate(verticallyFlippedSeaMonster, angle);

	for (let row = 0; row <= stitched.length - seaMonster.length; row++) {
		for (let column = 0; column <= stitched[0].length - seaMonster[0].length; column++) {
			if (isSeaMonster(stitched, seaMonster, row, column)) {
				for (let seaMonsterRow = 0; seaMonsterRow < seaMonster.length; seaMonsterRow++) {
					for (let seaMonsterColumn = 0; seaMonsterColumn < seaMonster[0].length; seaMonsterColumn++) {
						let appliesSeaMonsterMask = seaMonster[seaMonsterRow][seaMonsterColumn] === '#';
						if (appliesSeaMonsterMask) {
							seaMonsterSpottings[row + seaMonsterRow][column + seaMonsterColumn] = '🦕';
						}
					}
				}
			}
		}
	}
}

// Horizontally and vertically flipped sea monster
let doublyFlippedSeaMonster = [...seaMonsterPattern].reverse().map(row => [...row].reverse());
for (let angle = 0; angle < 360; angle += 90) {
	/** @type {String[][]} */
	let seaMonster = rotate(doublyFlippedSeaMonster, angle);

	for (let row = 0; row <= stitched.length - seaMonster.length; row++) {
		for (let column = 0; column <= stitched[0].length - seaMonster[0].length; column++) {
			if (isSeaMonster(stitched, seaMonster, row, column)) {
				for (let seaMonsterRow = 0; seaMonsterRow < seaMonster.length; seaMonsterRow++) {
					for (let seaMonsterColumn = 0; seaMonsterColumn < seaMonster[0].length; seaMonsterColumn++) {
						let appliesSeaMonsterMask = seaMonster[seaMonsterRow][seaMonsterColumn] === '#';
						if (appliesSeaMonsterMask) {
							seaMonsterSpottings[row + seaMonsterRow][column + seaMonsterColumn] = '🦕';
						}
					}
				}
			}
		}
	}
}

let seaMonsterSpacesCount = 0;
let roughWavesCount = 0;
for (let r = 0; r < seaMonsterSpottings.length; r++) {
	console.log(seaMonsterSpottings[r].join('').replace(/\./g, '. ').replace(/#/g, '🌊'));
	seaMonsterSpacesCount += seaMonsterSpottings[r].filter(space => space === '🦕').length;
	roughWavesCount += seaMonsterSpottings[r].filter(space => space === '#').length;
}
console.log(seaMonsterSpacesCount, roughWavesCount);