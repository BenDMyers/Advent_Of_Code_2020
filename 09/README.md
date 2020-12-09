# [Day 9](https://adventofcode.com/2020/day/9)

For Day 9, your input file contains many lines of numbers. **Part 1** asks you to find the first number, starting at the 26th number in the series, which *isn't* a sum of any two of the previous 25 numbers. **Part 2** asks you to find the contiguous set of numbers which add up to your answer to Part 1, and get the sum of the minimum and maximum values in that set.

Whew. No sweat. We can do this. Let's tackle part 1 first.

## Part 1 with Queues

The crux of Part 1 is keeping track of which 25 numbers preceded any given number—what the problem calls the *preamble*. Let's look at how the preamble changes between index `n` and index `n + 1`:

* The earliest number in `n`'s preamble (`n - 25`) goes away.
* The number at index `n` is added to `n + 1`'s preamble.

Because the oldest entry goes away and the newest entry is tacked on at the end, the preamble is *Last In/First Out (LIFO)*. In other words, we can represent it with a *queue*.

First, I initialize `preamble` with the first 25 numbers in my input file:

```js
const preambleLength = 25;
const preamble = input.slice(0, preambleLength);
```

Then, starting at index 25, I step through each number from the input. As I do, I continuously update my `preamble` - kicking the oldest number out and appending the most recent number to the end each time:

```js
let i = preambleLength;
while (isValidSum(input[i])) {
	preamble.shift();
	preamble.push(input[i]);
	i++;
}
console.log(input[i]);
```

This means that whenever I reach any given index in `input`, I already have a readymade list of the previous 25 items, all up to date.

From there, the problem I'm trying to solve changes. I now need to know whether any two items in `preamble` add up to `input[i]`. To do that, I wrote that `isValidSum` function that's getting called in the `while` loop's condition:

```js
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
```

The nice thing about this `isValidSum` function is that it needs no context about the outer looping throughout `input`. It only needs the `preamble` and an arbitrary number, and that arbitrary number *happens* to be an individual number from the inputs. Modular solutions to modular problems.

## Part 2, First Approach: Playing Blackjack

I stored the results of part 1 in a variable called `invalidSum`. In part 2, we needed to find the contiguous slice of `input` where each number adds up to `invalidSum`.

To address this, I again looped through the `input` array. For each element at any index `n`, I took an approach that felt a lot like playing [blackjack](https://en.wikipedia.org/wiki/Blackjack). I created a `rollingSum` variable, and then iterated over the next elements, adding each one to `rollingSum` until it was greater than or equal to `invalidSum`. If it was exactly equal, I output it; otherwise, I started over from index `n + 1`.

For posterity's sake, here's the whole source code for this approach:

```js
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
```

I felt like there had to be a way to make this logic more concise. I also felt like I was retraversing ranges of numbers too many times. I wasn't sure what I could do better though, until I realized:

This was another queue problem.

## Part 2, Second Approach: Queues Again

Consider the following scenario: you're trying to see whether `a` and its next few values add up to some `X`. You've added `a + b + c` so far, but you're still below `X`. You add `d` — `a + b + c + d` — and suddenly, you're *over* `X`. `a` clearly won't work out here. What do you do? You try `b`. Since `a + b + c` was under, `b + c` will *definitely* be under. But we can try `b + c + d`, in which case, one of three things will happen:

1. `b + c + d` equals `X`, and we can stop here! 🎉
2. `b + c + d` is less than `X`, and we need to try `b + c + d + e`.
3. `b + c + d` is greater than `X`. `b` can't be our start, we need to move onto testing starting at `c`. Specifically, we'll try `c + d`.
	* If `c + d` doesn't shake out, `c` can't be our start, so we move onto `d`.

The general flow here is:
* Whenever you're less than `X`, go ahead and add the next item in the list
* Whenever you're over `X`, move onto the next starting letter by offloading the current starting level.

This is all a Last In/First Out operation, so we can use a queue.

```js
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
```

Here, the `contiguous` array is our queue. `rollingSum` represents the sum of all numbers in our queue at any given moment. I didn't need to track `rollingSum` in its own variable — I could have done something like `contiguous.reduce((a, b) => a + b, 0)`, but adding to and subtracting from a number seemed like it would be faster than array operations, and I liked the developer ergonomics of having this quantity expressed as a number.