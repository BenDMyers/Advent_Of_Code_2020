# [Day 1](https://adventofcode.com/2020/day/1)

In Day 1's puzzle, you're given a list of numbers.

**Part 1** asks you to find the lone pair of numbers in that list that add up to `2020`, and then output their product. I opted for a nested `for`-loop at first. I wanted to avoid two possible gotchas:

* I didn't want to add any element of the array to *itself.* For instance, if our array is `[1010, ...]`, and we check the sum where `i = 0` and `j = 0`, we'd get `1010 + 1010 = 2020`. However, this isn't a true pair of elements. **This solution should never check any case where `i === j`.**

* As a light performance boost, **don't recheck any pairs that have already been checked.**

To address both of these, I initialized `j` (the inner loop's index) to 1 greater than `i` (the outer loop's). This ensures `i !== j` and, because `j` is *always* after `i`, we can guarantee this is a fresh pair we haven't looked at before.

My solution to part 1 ended up looking like:

```js
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
```

Because `j` always starts out as `i + 1`, we check that `i < lines.length - 1`. In my 1,000-line input file, this means that the last pair to be checked will be `i = 998`, `j = 999`.

**Part 2** is pretty similar, except it asks you to find the lone *triplet* that adds up to 2020, and output its product. The nested `for`-loop worked pretty well for the first part, so I added a third loop.

```js
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
```

Now `i` goes from `0` to `997`, `j` goes from `1` to `998`, and `k` goes from `2` to `999`.

## Generalized Solution

At this point, the puzzle was solved, but I didn't feel like my solution was complete. For one thing, `2020` is a magic number here. What if we needed to specify a different, non-hardcoded number? For another, what if we wanted to check groupings of more than three numbers - groupings of an arbitrary size?

Nesting an arbitrary number of `for`-loops isn't exactly feasible... without a recursive solution. To create a generalized solution, I started with a function. This function taken in the expected sum (`requiredTotal`), a starting index in the array (`startingIndex`), the accumulated sum so far (`sumSoFar`), and the number of required summands remaining (`numSummands`).

```js
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
console.log('3 summands adding up to 2020', findProductOfSummands(3, 2020)); // Regression for part 2
```

Each call of `findProductOfSummands` represents a nested `for`-loop. `numSummands` represents how many more levels of nesting are left, where `1` means the innermost loop. This means that a `findProductOfSummands` call with `numSummands = 3` (the outermost loop) will call `findProductOfSummands` with `numSummands = 2` (an inner loop), which will call `findProductOfSummands` with `numSummands = 1` (the innermost loop, i.e. the base case).

Along the way, each level passes down the sum so far at each level of nesting. If the innermost loop finds an element whose value, when added to the total across all levels of nesting, makes `requiredTotal`, it returns that number (`-1` if it gets to the end of the list with no matches). The level which called that base case will return its *own* indexed value multiplied by the base case's result, and so forth, all the way up the chain until finally, the whole accumulated product is returned.