const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n');

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

/*****************************************
 * Work in progress, not yet functional!
 ****************************************/
(function part2() {
	/**
	 * Get the count of the tile's flipped neighbors
	 * @param {string} coords coordinate string of the format "<horiz_offset>,<vert_offset>"
	 * @returns {number}
	 */
	function getFlippedNeighbors(coords) {
		// console.log(coords)
		let [horizontalOffset, verticalOffset] = coords.split(',').map(x => Number(x));
		let flippedNeighbors = 0;

		let east = `${horizontalOffset + 1},${verticalOffset}`;
		let northeast = `${horizontalOffset + 0.5},${verticalOffset + 0.5}`;
		let northwest = `${horizontalOffset - 0.5},${verticalOffset + 0.5}`;
		let southeast = `${horizontalOffset + 0.5},${verticalOffset - 0.5}`;
		let southwest = `${horizontalOffset - 0.5},${verticalOffset - 0.5}`;
		let west = `${horizontalOffset - 1},${verticalOffset}`;

		if (flippedTiles.has(east)) flippedNeighbors++;
		if (flippedTiles.has(northeast)) flippedNeighbors++;
		if (flippedTiles.has(northwest)) flippedNeighbors++;
		if (flippedTiles.has(southeast)) flippedNeighbors++;
		if (flippedTiles.has(southwest)) flippedNeighbors++;
		if (flippedTiles.has(west)) flippedNeighbors++;

		return flippedNeighbors;
	}

	for (let i = 1; i <= 100; i++) {
		let westernBounds = 0;
		let easternBounds = 0;
		let northernBounds = 0;
		let southernBounds = 0;

		flippedTiles.forEach(coords => {
			let [horizontalOffset, verticalOffset] = coords.split(',').map(x => Number(x));
			westernBounds = Math.min(horizontalOffset, westernBounds);
			easternBounds = Math.max(horizontalOffset, easternBounds);
			southernBounds = Math.min(verticalOffset, southernBounds);
			northernBounds = Math.max(verticalOffset, northernBounds);
		});

		let nextDay = new Set();

		for (let horiz = westernBounds - 1; horiz <= easternBounds + 1; horiz += 0.5) {
			for (let vert = southernBounds - 1; vert <= northernBounds + 1; vert += 0.5) {
				let isFlipped = flippedTiles.has(`${horiz},${vert}`);
				let flippedNeighbors = getFlippedNeighbors(`${horiz},${vert}`);

				if (isFlipped && (flippedNeighbors === 0 || flippedNeighbors > 2)) {
					nextDay.add(`${horiz},${vert}`);
				}

				if (!isFlipped && flippedNeighbors === 2) {
					nextDay.add(`${horiz},${vert}`);
				}
			}
		}

		flippedTiles = nextDay;
		console.log(i, nextDay.size);
	}

	console.log(flippedTiles.size);
})();