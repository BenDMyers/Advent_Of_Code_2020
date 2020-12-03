const fs = require('fs');
const grid = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(row => row.split(''));

// Part 1
let x = 0, y = 0;
let encounters = 0;

while (y < grid.length) {
	if (grid[y][x] === '#') {
		encounters++
	}

	x = (x + 3) % grid[0].length;
	y++;
}

console.log(encounters);

// Part 2
function testSlope(xOffset, yOffset) {
	let x = 0, y = 0;
	let encounters = 0;

	while (y < grid.length) {
		if (grid[y][x] === '#') {
			encounters++
		}

		x = (x + xOffset) % grid[0].length;
		y += yOffset;
	}

	return encounters;
}

const firstTest = testSlope(1, 1);
const secondTest = testSlope(3, 1);
const thirdTest = testSlope(5, 1);
const fourthTest = testSlope(7, 1);
const fifthTest = testSlope(1, 2);

console.log(firstTest * secondTest * thirdTest * fourthTest * fifthTest);