const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(num => Number.parseInt(num))
	.sort((a, b) => a - b);

input.unshift(0);

// Part 1
let oneJoltDifferenceCount = 0;
let threeJoltsDifferenceCount = 0;

let accumulatedRating = 0;
for (let adapterRating of input) {
	const difference = adapterRating - accumulatedRating;
	accumulatedRating = adapterRating;

	if (difference === 1) oneJoltDifferenceCount++;
	if (difference === 3) threeJoltsDifferenceCount++;
}

console.log(oneJoltDifferenceCount * threeJoltsDifferenceCount);


// Part 2
let target = input[input.length - 1];
const memoizedPaths = {};

/**
 * [Memoized] Finds how many different chains you could make with this adapter that get you to the largest adapter.
 * Adapters in a chain must go up by +1, +2, or +3 at a time.
 * @param {number} adapter the joltage rating for a given adapter
 * @returns {number} count of successful chains that can be made with this adapter
 */
function getChains(adapter) {
	if (adapter === target) {
		return 1;
	} else if (memoizedPaths[adapter] !== undefined) {
		return memoizedPaths[adapter];
	}

	const nextAdapterCandidates = input.filter(next => (next > adapter && next <= adapter + 3));
	const successfulBranches = nextAdapterCandidates.reduce((sum, candidate) => {
		return sum + getChains(candidate);
	}, 0);
	memoizedPaths[adapter] = successfulBranches;
	return successfulBranches;
}

getChains(0);
console.log(memoizedPaths[0]);