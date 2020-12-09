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

let i = preambleLength;
while (isValidSum(input[i])) {
	preamble.shift();
	preamble.push(input[i]);
	i++;
}

let invalidSum = input[i]; // Saving in a variable to reuse for part 2
console.log(invalidSum);


// Part 2
let rollingSum = 0;
let contiguous = [];
let j = 0;

while (rollingSum !== invalidSum) {
	contiguous.push(input[j]);
	rollingSum += input[j];
	j++;

	while (rollingSum > invalidSum) {
		let lastIn = contiguous.shift();
		rollingSum -= lastIn;
	}
}

const min = Math.min(...contiguous);
const max = Math.max(...contiguous);
console.log(min + max);