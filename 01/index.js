const fs = require('fs');
const lines = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(num => Number.parseInt(num));

// Part 1
for (let i = 0; i < lines.length - 1; i++) {
	for (let j = i + 1; j < lines.length; j++) {
		if (lines[i] + lines[j] === 2020) {
			console.table({
				i: lines[i],
				j: lines[j],
				product: lines[i] * lines[j]
			});
		}
	}
}

// Part 2
for (let i = 0; i < lines.length - 2; i++) {
	for (let j = i + 1; j < lines.length - 1; j++) {
		for (let k = j + 1; k < lines.length; k++)
		if (lines[i] + lines[j] + lines[k] === 2020) {
			console.table({
				i: lines[i],
				j: lines[j],
				k: lines[k],
				product: lines[i] * lines[j] * lines[k]
			});
		}
	}
}

// Generalized - take an arbitrary count of summands

/**
 * @param {number} numSummands number of summands which must add up to `requiredTotal`
 * @param {number} requiredTotal total which all summands must add up to
 * @param {number} sumSoFar current total of summands, compounded over recursive depth
 * @param {number} startingIndex where in the array this recursive level should start
 * @returns {number} product of all summands which add up to the required total
 */
function findProductOfSummands(numSummands, requiredTotal, sumSoFar = 0, startingIndex = 0) {
	for (let i = startingIndex; i <= lines.length - numSummands; i++) {
		if (numSummands === 1) { // Base case
			if (sumSoFar + lines[i] === requiredTotal) {
				return lines[i];
			} else {
				continue;
			}
		} else if (numSummands > 1) { // Recursive case
			const recursiveOutput = findProductOfSummands(numSummands - 1, requiredTotal, sumSoFar + lines[i], i + 1);
			if (recursiveOutput > 0) {
				return recursiveOutput * lines[i];
			}
		}
	}
	return -1; // no passing cases found at this depth
}

console.log('2 summands adding up to 2020', findProductOfSummands(2, 2020)); // Regression for part 1
console.log('***');
console.log('3 summands adding up to 2020', findProductOfSummands(3, 2020)); // Regression for part 2
console.log('***');
console.log('4 summands adding up to 2020', findProductOfSummands(4, 2020)); // New case
console.log('***');
console.log('2 summands adding up to 3098', findProductOfSummands(2, 3098)); // New case