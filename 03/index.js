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