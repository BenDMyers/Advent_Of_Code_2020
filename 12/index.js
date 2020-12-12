const fs = require('fs');

const cardinalDirections = {0: 'E', 90: 'N', 180: 'W', 270: 'S'};

let north = 0;
let east = 0;
let angle = 0;

fs.readFileSync(`${__dirname}/.input`, 'utf-8').split('\n')
	// Part 1
	.forEach(instruction => {
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

		// console.table({instruction, action, amount, angle, east, north});
	});

	console.log(Math.abs(north) + Math.abs(east));