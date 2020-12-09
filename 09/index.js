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

for (let i = preambleLength; i < input.length; i++) {
	let current = input[i];
	if (!isValidSum(current)) {
		console.log(current);
		break;
	} else {
		preamble.shift();
		preamble.push(current);
	}
}