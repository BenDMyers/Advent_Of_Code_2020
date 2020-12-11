# [Day 10](https://adventofcode.com/2020/day/10)

Day 10's input file is a list of numbers, each representing a "joltage" adapter. Each adapter can be chained to an adapter with a joltage rating 1, 2, or 3 higher. For instance, if you have an adapter rated `3`, the next adapter in the chain must be a `4`, `5`, or `6`.

**Part 1** asks you to chain *all* of the adapters together. It then asks you to count how many times the joltage went up by 1 and how many times it went up by 3, and to multiply those two numbers together. **Part 2** asks you to find how many possible chains get you from your lowest joltage adapter up to your highest joltage adapter.

## Part 1: Presorting

Part 1 asks you to chain every adapter together. Because each link in the chain can only increase in joltage, we have to go through each of them in order, from least to greatest voltage. The easiest way to do this is to sort the input array in numerical order before trying to iterate through it. I'm leaning on [Node.js's native quicksort-based `sort()` implementation](https://blog.shovonhasan.com/time-space-complexity-of-array-sort-in-v8/), which has a loglinear average runtime complexity (`Θ(n log n)`).

Once the array is sorted, the solution boiled down to iterating over the array of adapter ratings, comparing each rating to the one before it. If the difference was 1, that was a tally for `oneJoltDifferenceCount`. If the difference was 3, that tally went to `threeJoltsDifferenceCount`.

```js
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
```

## Part 2: Maybe the Real Friends Were the Memoization We Made Along the Way

I tried several different approaches to Part 2 that didn't pan out for a variety of reasons. You can see each of them in all their glory in the [graveyard of unsuccessful attempts](#graveyard-of-unsuccessful-attempts) below.

I thought pretty early that [memoization](https://en.wikipedia.org/wiki/Memoization) might be necessary — after all, the puzzle mentions that your input file, with nearly a hundred adapters, will have several *trillions* of successful combinations. That means that if you're doing any nested approach like tree-building and/or recursion, your adapters, especially the higher-joltage adapters, will end up getting checked for viable chains a few trillion times. This is tremendously inefficient, and can benefit a lot from being memoized.

I tried my hand at a recursive approach that would calculate, treelike, how many branches were valid. This... didn't work. Looking back on that attempt, it may genuinely have come down to an error where I was getting an index from one array, rather than from the full input array. Without that hindsight, though, I became thought that my *memoization* might not be working, misdiagnosing the problem, so I tried a few other things. I built a tree of nodes and fell for the same miscounting issues.

The first solution that worked with the sample inputs involved building up an array of arrays, where the inner arrays represented a given chain of adapters. While this worked for the sample set, my program choked on the full input, ending in a heap overflow. It turns out creating a few trillion arrays, each with up to nearly 100 elements, wasn't the optimal solution.

I resolved to get this memoization working properly. The pivotal realization for me was when I realized I didn't so much need to count successful branches so much as count how often the last adapter was reached. That's a subtle reframing, but it helped me realize exactly why I'd been miscounting: I was handling incrementing at each adapter in the chain, where I only needed/wanted to increment at the end of the chain. I retooled my solution and reimplemented memoization, and the code ran nearly instantly.

```js
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
```

### Graveyard of Unsuccessful Attempts

Saved for posterity.

#### First approach at memoization

```js
let memoizedBranches = {};
function getSuccessfulBranches(adapter, index) {
	if (memoizedBranches[index] !== undefined) {
		return memoizedBranches[index];
	} else if (index === input.length - 1) {
		return 1;
	}

	const candidates = input.slice(index + 1, index + 4);

	let totalBranches = 0;
	if (candidates.includes(adapter + 1)) {
		totalBranches += getSuccessfulBranches(adapter + 1, candidates.indexOf(adapter + 1));
	}
	if (candidates.includes(adapter + 2)) {
		totalBranches += getSuccessfulBranches(adapter + 2, candidates.indexOf(adapter + 2));
	}
	if (candidates.includes(adapter + 3)) {
		totalBranches += getSuccessfulBranches(adapter + 3, candidates.indexOf(adapter + 3));
	}

	memoizedBranches[index] = (totalBranches > 0) ? totalBranches + 1 : totalBranches;
	return (totalBranches > 0) ? totalBranches + 1 : totalBranches;
}

const successfulBranches = getSuccessfulBranches(0, 0);
```

**Why it didn't work:** Getting the index of the next adapters from `candidates`, instead of the original `input` array. Trying to add 1 to the branch count at the last hour for... reasons?

#### Tree assembly

```js
let root = {index: 0, value: 0};

function expandNode(adapter, tree) {
	console.table({adapter})
	if (adapter === input[input.length - 1]) return 1;

	let successfulPaths = 0;
	const nextAdapterCandidates = input.filter(next => (next > adapter && next <= adapter + 3));
	console.log(JSON.stringify(tree), JSON.stringify(nextAdapterCandidates))
	nextAdapterCandidates.forEach(candidate => {
		const downstreamBranches = expandNode(candidate, [...tree, adapter]);
		if (downstreamBranches > -1) {
			successfulPaths += downstreamBranches;
		}
	});
	return successfulPaths - 1;
}

console.log(expandNode(0, []))
```

**Why this didn't work:** In my haste to avoid any off-by-one errors, I prematurely subtracted 1 leading to many (read: all) successful branches being discounted.

#### Generating arrays for each successful chain

```js
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
```

**Why it didn't work:** This created several trillion arrays, each up to nearly 100 elements long, so the program quit due to a heap error. Super inefficient.