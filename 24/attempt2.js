/*****************************************
 * Work in progress, not yet functional!
 ****************************************/

const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(instruction => instruction.match(/(e|ne|nw|se|sw|w)/g));

const vectors = {
	e:	[2, 0],
	ne:	[1, 1],
	nw:	[-1, 1],
	se:	[1, -1],
	sw:	[-1, -1],
	w:	[-2, 0]
};

/**
 * Represents the hexgrid-like floor's currently flipped tiles.
 * The map's entries are *currently* flipped.
 * Keys are coordinates, stringified ("horiz_offset,vert_offset")
 * Values are also coordinates, but as an array of two numbers for ease of use
 * @type {Map<String, {x: number, y: number}>}
 */
let flippedTiles = new Map();

// Get initial tile configuration
input.forEach((instructions) => {
	let x = 0;
	let y = 0;

	instructions.forEach((instruction) => {
		let [horizontalVector, verticalVector] = vectors[instruction];
		x += horizontalVector;
		y += verticalVector;
	});

	let coordinates = `${x},${y}`;

	if (flippedTiles.has(coordinates)) {
		flippedTiles.delete(coordinates);
	} else {
		flippedTiles.set(coordinates, {x, y});
	}
});


// Helper functions
/**
 * Gets all neighboring tiles for a given tile
 * @param {{x: number, y: number}} param0 tile's [horizontalOffset, verticalOffset]
 * @returns {{x: number, y: number}[]} list of all tiles which neighbor the provided tile
 */
function getNeighbors({x, y}) {
	return Object.values(vectors).map(([xVector, yVector]) => ({x: x + xVector, y: y + yVector}));
}

/**
 * Gets all *flipped* neighbor tiles for a given tile
 * @param {{x: number, y: number}} param0 tile's [horizontalOffset, verticalOffset]
 * @returns {{x: number, y: number}[]} list of all flipped tiles which neighbor the provided tile
 */
function getFlippedNeighbors({x, y}) {
	return getNeighbors({x, y}).filter(neighbor => flippedTiles.has(`${neighbor.x},${neighbor.y}`));
}

/**
 * Gets all *nflipped* neighbor tiles for a given tile
 * @param {{x: number, y: number}} param0 tile's [horizontalOffset, verticalOffset]
 * @returns {{x: number, y: number}[]} list of all unflipped tiles which neighbor the provided tile
 */
function getUnflippedNeighbors({x, y}) {
	return getNeighbors({x, y}).filter(neighbor => !flippedTiles.has(`${neighbor.x},${neighbor.y}`));
}

console.log(flippedTiles)

// Perform Conway's Hexagonal Game of Life
for (let i = 0; i < 1; i++) {
	/** @type {Map<string, {x: number, y: number}>} */
	const newTiles = new Map();

	/** @type {Map<string, {x: number, y: number}>} */
	const allUnflippedNeighbors = new Map();

	let staysFlippedCount = 0;
	let newlyFlippedCount = 0;

	flippedTiles.forEach((flippedTile) => {
		let flippedNeighbors = getFlippedNeighbors(flippedTile);

		if (flippedTile.x === 3 && flippedTile.y === 3) {
			console.log(flippedNeighbors)
		}

		if (flippedNeighbors.length === 0 || flippedNeighbors.length > 2) {
			staysFlippedCount++;
			newTiles.set(`${flippedTile.x},${flippedTile.y}`, flippedTile);
		}

		// Keep track of ALL unflipped neighbors - we'll do more with this soon
		let unflippedNeighbors = getUnflippedNeighbors(flippedTile);
		unflippedNeighbors.forEach(neighbor => allUnflippedNeighbors.set(`${neighbor.x},${neighbor.y}`, neighbor));
	});

	allUnflippedNeighbors.forEach(unflippedTile => {
		let flippedNeighbors = getFlippedNeighbors(unflippedTile);
		if (flippedNeighbors.length === 2) {
			newTiles.set(`${unflippedTile.x},${unflippedTile.y}`, unflippedTile);
			newlyFlippedCount++;
		}

		if (unflippedTile.x === 3 && unflippedTile.y === 3) {
			console.log('🐧');
		}
	});

	console.log({staysFlippedCount, newlyFlippedCount})
	console.log(newTiles, newTiles.size)
}