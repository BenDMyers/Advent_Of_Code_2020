const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split(',');

// Part 1
(function part1() {
	const spoken = {};

	let previousNumber = 0;
	let turn = 0;

	// Initialize with provided input
	for (; turn < input.length; turn++) {
		spoken[input[turn]] = turn;
		previousNumber = input[turn];
	}

	// Keep going
	for (; turn < 2020; turn++) {
		let previousNumberLastSpoken = spoken[previousNumber];
		spoken[previousNumber] = turn - 1;

		if (previousNumberLastSpoken >= 0) {
			let age = turn - 1 - previousNumberLastSpoken;
			previousNumber = age;
		} else {
			previousNumber = 0;
		}
	}

	console.log(previousNumber);
})();


// Part 2
(function part2() {
	
})();