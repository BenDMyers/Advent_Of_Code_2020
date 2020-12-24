const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n');

let getFrequencies = str => {
	return str.split('').reduce((total, letter) => {
		total[letter] ? total[letter]++ : total[letter] = 1;
		return total;
	}, {});
};

/** @type {Set<String>} */
let flippedTiles = new Set();

// Part 1
(function part1() {

	input.forEach((directions) => {
		let verticalOffset = 0;
		let horizontalOffset = 0;

		while (directions !== '') {
			let direction = '';

			if (directions.startsWith('e') || directions.startsWith('w')) {
				direction = directions.charAt(0);
				directions = directions.substring(1);
			} else {
				direction = directions.substring(0, 2);
				directions = directions.substring(2);
			}

			switch (direction) {
				case 'e':
					horizontalOffset += 1;
					break;
				case 'ne':
					horizontalOffset += 0.5;
					verticalOffset += 0.5;
					break;
				case 'nw':
					horizontalOffset -= 0.5;
					verticalOffset += 0.5;
					break;
				case 'se':
					horizontalOffset += 0.5;
					verticalOffset -= 0.5;
					break;
				case 'sw':
					horizontalOffset -= 0.5;
					verticalOffset -= 0.5;
					break;
				case 'w':
					horizontalOffset -= 1;
					break;
			}
		}
		
		let flippedTile = `${horizontalOffset},${verticalOffset}`;

		if (flippedTiles.has(flippedTile)) {
			flippedTiles.delete(flippedTile);
		} else {
			flippedTiles.add(flippedTile);
		}
	});

	console.log(flippedTiles, flippedTiles.size);
})();


// Part 2
(function part2() {
	// flippedTiles = new Set(['0,0', '1,0', '1.5,0.5', '2,0']);
	/**
	 * Gets all of the tile's neighbors, split up into flipped and unflipped tiles
	 * @param {string} coords coordinate string of the format "<horiz_offset>,<vert_offset>"
	 * @returns {{flipped: string[], unflipped: string[]}}
	 */
	function getNeighbors(coords) {
		// console.log(coords)
		let [horizontalOffset, verticalOffset] = coords.split(',').map(x => Number(x));

		let east = `${horizontalOffset + 1},${verticalOffset}`;
		let northeast = `${horizontalOffset + 0.5},${verticalOffset + 0.5}`;
		let northwest = `${horizontalOffset - 0.5},${verticalOffset + 0.5}`;
		let southeast = `${horizontalOffset + 0.5},${verticalOffset - 0.5}`;
		let southwest = `${horizontalOffset - 0.5},${verticalOffset - 0.5}`;
		let west = `${horizontalOffset - 1},${verticalOffset}`;

		let flipped = [];
		let unflipped = [];

		(flippedTiles.has(east) ? flipped : unflipped).push(east);
		(flippedTiles.has(northeast) ? flipped : unflipped).push(northeast);
		(flippedTiles.has(northwest) ? flipped : unflipped).push(northwest);
		(flippedTiles.has(southeast) ? flipped : unflipped).push(southeast);
		(flippedTiles.has(southwest) ? flipped : unflipped).push(southwest);
		(flippedTiles.has(west) ? flipped : unflipped).push(west);

		return {flipped, unflipped};
	}

	// console.log(getNeighbors('1,0'))

	for (let i = 0; i < 100; i++) {
		let carriedOverFlippedTiles = [];
		let allUnflippedNeighbors = {};

		flippedTiles.forEach(flippedTile => {
			// console.log(flippedTile,)
			let neighbors = getNeighbors(flippedTile);

			// Decide which flipped tiles should NOT get flipped back over
			if (neighbors.flipped.length === 0 || neighbors.flipped.length > 2) {
				carriedOverFlippedTiles.push(flippedTile);
			}

			// Keep track of how many FLIPPED tiles an UNFLIPPED tile is a neighbor of
			neighbors.unflipped.forEach(unflippedTile => {
				allUnflippedNeighbors[unflippedTile] = (allUnflippedNeighbors[unflippedTile] || 0) + 1;
			});
		});

		let newlyFlippedTiles = [];
		for (coords in allUnflippedNeighbors) {
			if (allUnflippedNeighbors[coords] === 2) {
				newlyFlippedTiles.push(coords);
			}
		}
		console.log(carriedOverFlippedTiles)
		flippedTiles = new Set([...carriedOverFlippedTiles, ...newlyFlippedTiles]);
		// console.log(i + 1, flippedTiles.size)
	}

	console.log(flippedTiles.size);
})();