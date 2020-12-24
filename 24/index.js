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

// Part 1
(function part1() {
	let flippedTiles = new Set();

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
	
})();