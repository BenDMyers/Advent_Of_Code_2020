const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(num => Number.parseInt(num))
	.sort((a, b) => a - b);

input.unshift(0);
input.push(input[input.length - 1] + 3);
// console.log(input)

// Part 1
let oneJoltDifferenceCount = 0;
let threeJoltsDifferenceCount = 0;

let accumulatedRating = 0;
for (let adapterRating of input) {
	const difference = adapterRating - accumulatedRating;
	accumulatedRating = adapterRating;

	if (difference === 1) oneJoltDifferenceCount++;
	if (difference === 3) threeJoltsDifferenceCount++;
	// console.log(difference)
}

// console.log(
// 	oneJoltDifferenceCount,
// 	threeJoltsDifferenceCount,
// 	oneJoltDifferenceCount * threeJoltsDifferenceCount
// );

// Part 2
// let memoizedBranches = {};
// function getSuccessfulBranches(adapter, index) {
// 	if (memoizedBranches[index] !== undefined) {
// 		return memoizedBranches[index];
// 	} else if (index === input.length - 1) {
// 		return 2;
// 	}

// 	const candidates = input.slice(index + 1, index + 4);

// 	let totalBranches = 0;
// 	if (candidates.includes(adapter + 1)) {
// 		console.log('DONKEY', adapter + 1);
// 		totalBranches += getSuccessfulBranches(adapter + 1, candidates.indexOf(adapter + 1));
// 	}
// 	if (candidates.includes(adapter + 2)) {
// 		console.log('SHREK', adapter + 2)
// 		totalBranches += getSuccessfulBranches(adapter + 2, candidates.indexOf(adapter + 2));
// 	}
// 	if (candidates.includes(adapter + 3)) {
// 		console.log('FIONA', adapter + 3)
// 		totalBranches += getSuccessfulBranches(adapter + 3, candidates.indexOf(adapter + 3));
// 	}
// 	console.log({totalBranches})

// 	memoizedBranches[index] = (totalBranches > 0) ? totalBranches + 1 : totalBranches;
// 	return (totalBranches > 0) ? totalBranches + 1 : totalBranches;
// }

// const successfulBranches = getSuccessfulBranches(0, 0);
// console.log(memoizedBranches)
// console.log(successfulBranches);

// let root = {index: 0, value: 0};

// function expandNode(adapter, tree) {
// 	console.table({adapter})
// 	if (adapter === input[input.length - 1]) return 1;

// 	let successfulPaths = 0;
// 	const nextAdapterCandidates = input.filter(next => (next > adapter && next <= adapter + 3));
// 	console.log(JSON.stringify(tree), JSON.stringify(nextAdapterCandidates))
// 	nextAdapterCandidates.forEach(candidate => {
// 		const downstreamBranches = expandNode(candidate, [...tree, adapter]);
// 		console.table({tree, adapter, candidate, downstreamBranches})
// 		if (downstreamBranches > - 1) {
// 			successfulPaths += downstreamBranches;
// 		}
// 	});
// 	return successfulPaths - 1;
// }

// console.log(expandNode(0, []))
let target = input[input.length - 1];

function getChains(adapter) {
	if (adapter === target) return [[adapter]];

	const nextAdapterCandidates = input.filter(next => (next > adapter && next <= adapter + 3));

	let chains = [];
	for (let candidate of nextAdapterCandidates) {
		let candidateChains = getChains(candidate);
		if (Array.isArray(candidateChains)) {
			candidateChains.forEach(chain => {
				chains.push([adapter, ...chain])
			});
		}
	}

	if (chains.length) return chains;
}

const validChains = getChains(0);
console.log(validChains.length);