const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(num => Number.parseInt(num));

// Part 1
const preambleLength = 25;
const preamble = input.slice(0, preambleLength);

/**
 * Gets whether the current number is the sum of any two numbers in `preamble`
 * @param {number} num the current number from the input file
 * @returns {boolean}
 */
function isValidSum(num) {
	for (let i = 0; i < preambleLength; i++) {
		let summandIndex = preamble.lastIndexOf(num - preamble[i]);
		if (summandIndex > -1 && summandIndex !== i) {
			return true;
		}
	}

	return false;
} 

let invalidSum; // Saving in a variable to reuse for part 2

for (let i = preambleLength; i < input.length; i++) {
	let current = input[i];
	if (!isValidSum(current)) {
		invalidSum = current;
		break;
	} else {
		preamble.shift();
		preamble.push(current);
	}
}

console.log(invalidSum);

// Part 2

/**
 * Determines whether this index marks the beginning of a range of numbers that add up to `invalidSum`
 * @param {number} index index for input iteration
 * @returns {{min: number, max: number, contiguousSet: number[]}|false} a {min, max} object if this is a contiguous sum, or false otherwise
 */
function isContiguousSum(index) {
	let min = input[index];
	let max = input[index];
	let contiguousSet = [];

	// Alright, let's play blackjack!
	let rollingSum = 0;
	while (rollingSum < invalidSum || contiguousSet.length < 2) {
		rollingSum += input[index];
		
		// Track running minimum and maximum, as well as every number in this set so far
		min = Math.min(min, input[index]);
		max = Math.max(max, input[index]);
		contiguousSet.push(input[index]);

		index++;
	}

	if (rollingSum === invalidSum) {
		return {min, max, contiguousSet};
	} else {
		return false;
	}
}

for (let i = 0; i < input.length; i++) {
	let contiguous = isContiguousSum(i);
	if (contiguous) {
		console.log(contiguous);
		console.log(contiguous.min + contiguous.max);
		break;
	}
}