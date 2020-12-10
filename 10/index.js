const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(num => Number.parseInt(num))
	.sort((a, b) => a - b);

input.push(input[input.length - 1] + 3);
console.log(input)

// Part 1
let oneJoltDifferenceCount = 0;
let threeJoltsDifferenceCount = 0;

let accumulatedRating = 0;
for (let adapterRating of input) {
	const difference = adapterRating - accumulatedRating;
	accumulatedRating = adapterRating;

	if (difference === 1) oneJoltDifferenceCount++;
	if (difference === 3) threeJoltsDifferenceCount++;
	console.log(difference)
}

console.log(oneJoltDifferenceCount, threeJoltsDifferenceCount, oneJoltDifferenceCount * threeJoltsDifferenceCount);