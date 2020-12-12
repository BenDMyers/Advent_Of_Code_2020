const { log } = require('console');
const fs = require('fs');
const input = fs.readFileSync(`${__dirname}/.input`, 'utf-8').split('\n')

const cardinalDirections = {0: 'E', 90: 'N', 180: 'W', 270: 'S'};

// Part 1
(function part1() {
	let north = 0;
	let east = 0;
	let angle = 0;

	input.forEach(instruction => {
		let action = instruction.charAt(0);
		let amount = Number(instruction.substring(1));
	
		// Instead of handling `F` in the `switch` below, we'll just pretend it was a `N`/`S`/`E`/`W` instruction the whole time!
		if (action === 'F') {
			action = cardinalDirections[angle];
		}
		
		switch (action) {
			case 'N':
				north += amount;
				break;
			case 'S':
				north -= amount;
				break;
			case 'E':
				east += amount;
				break;
			case 'W':
				east -= amount;
				break;
			case 'L':
				angle = (angle + amount) % 360;
				break;
			case 'R':
				angle = (angle - amount + 360) % 360;
				break;
		}
	});
	
	console.log(Math.abs(north) + Math.abs(east));
})();


// Part 2
(function part2() {
	let shipNorth = 0;
	let shipEast = 0;

	// Treat these two values as relative to the ship, and not as any fixed position in space
	let waypointNorth = 1;
	let waypointEast = 10;

	input.forEach(instruction => {
		let action = instruction.charAt(0);
		let amount = Number(instruction.substring(1));

		let rotationCount;

		switch (action) {
			case 'N':
				waypointNorth += amount;
				break;
			case 'S':
				waypointNorth -= amount;
				break;
			case 'E':
				waypointEast += amount;
				break;
			case 'W':
				waypointEast -= amount;
				break;
			case 'L':
				rotationCount = amount/90;
				for (let i = 0; i < rotationCount; i++) {
					[waypointEast, waypointNorth] = [-1 * waypointNorth, waypointEast];
				}
				break;
			case 'R':
				rotationCount = amount/90;
				for (let i = 0; i < rotationCount; i++) {
					[waypointEast, waypointNorth] = [waypointNorth, -1 * waypointEast];
				}
				break;
			case 'F':
				shipNorth += (amount * waypointNorth);
				shipEast += (amount * waypointEast);
				break;
		}
	});

	console.log(Math.abs(shipNorth) + Math.abs(shipEast));
})();