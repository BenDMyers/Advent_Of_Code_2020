const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(num => Number.parseInt(num))
	.sort((a, b) => a - b);

input.unshift(0);
input.push(input[input.length - 1] + 3);

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

console.log(
	oneJoltDifferenceCount,
	threeJoltsDifferenceCount,
	oneJoltDifferenceCount * threeJoltsDifferenceCount
);


// Part 2
let target = input[input.length - 1];
const memoizedPaths = {};

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