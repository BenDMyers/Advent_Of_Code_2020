const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n');

// Part 1
(function part1() {
	const earliestDeparture = Number(input[0]);
	const busPeriods = input[1]
		.split(',')
		.map(num => Number(num))
		.filter(num => Number.isInteger(num));

	let wait = 0;
	while (!busPeriods.find(period => ((earliestDeparture + wait) % period === 0))) {
		wait++;
	}

	let busNumber = busPeriods.find(period => ((earliestDeparture + wait) % period === 0));
	console.log(busNumber * wait);
})();


// Part 2
(function part2() {
	
})();