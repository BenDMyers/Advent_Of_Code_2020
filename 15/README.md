# [Day 15](https://adventofcode.com/2020/day/15)

In Day 15's puzzle, you're playing a memory game. You start with a few numbers, provided in the input file. From there, each subsequent number is based on the number which came before it. If this was the first time that previous number had come up, the subsequent number will be `0`. Otherwise, if that previous number had come up before, the subsequent number will be however many turns it's been since that number last came up.

For instance, if your starting numbers are `0,3,6`, the first few turns look like:

* **Turn 1:** `0` (provided starting number)
* **Turn 2:** `3` (provided starting number)
* **Turn 3:** `6` (provided starting number)
* **Turn 4:** `0` (prior to Turn 3, `6` had never been seen before)
* **Turn 5:** `3` (prior to Turn 4, `0` was last seen on Turn 1, and Turn 4 minus Turn 1 is 3)
* **Turn 6:** `3` (prior to Turn 5, `3` was last seen on Turn 2, and Turn 5 minus Turn 2 is 3)
* **Turn 7:** `1` (prior to Turn 6, `3` was last seen on Turn 5, and Turn 6 minus Turn 5 is 1)
* **Turn 8:** `0` (prior to Turn 7, `1` had never been seen before)

And so on.

**Part 1** asks you to find the value of Turn 2,020, and **Part 2** asks for the value of Turn 30,000,000.

## Objects Over Arrays

An intuitive approach might be to keep track of used numbers in an array — after all, we *are* dealing with sequences. The trouble is that an array approach balloons in memory required and in runtime complexity.

Let's look at memory first. If you append your responses to an array, by the end of Part 2, that array will be storing 30 million values. That's a _lot_. What's more, many of those values will have been duplicated many, many times. Consider how many zeroes alone your array would have after Part 2, even though at any given moment, you only need the most recent one. We can't remove the extra zeroes, though, because that would mess with getting the indices for other numbers.

Array solutions are algorithmically complex, too. Iterating from 0 to 30 million is a linear `O(n)` process, but finding the previous occurence of a number (which you'd probably use [`lastIndexOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/lastIndexOf) for) introduces a nested linear process that makes this approach **quadratic (`O(n²)`)**. That _might_ be fine when you're only counting up to 2,020, but it absolutely won't work in a timely manner when you're counting up to 30 million.

To solve this problem efficiently, we only need to keep track of the last time a given number showed up. If the number showed up again, we could override its most recent index in our store. I decided to go with an object, where the keys were the number that came up, and the values were that number's most recent index.

That approach looked like:

```js
const spoken = {};

let previousNumber = 0;
let turn = 0;

// Initialize with provided input
for (; turn < input.length; turn++) {
	spoken[input[turn]] = turn;
	previousNumber = input[turn];
}

// Keep going
for (; turn < 2020; turn++) {
	let previousNumberLastSpoken = spoken[previousNumber];
	spoken[previousNumber] = turn - 1;

	if (previousNumberLastSpoken >= 0) {
		let age = turn - 1 - previousNumberLastSpoken;
		previousNumber = age;
	} else {
		previousNumber = 0;
	}
}

console.log(previousNumber);
```

This approach has a **linear (`O(n)`) runtime** — the only opportunity for algorithmic growth is in the `for`-loop. This worked pretty quickly when counting up to 2,020… but it turns out I'd need a bit more optimization to count to 30,000,000.

## Maps Over Objects

When I unlocked Part 2, my first instinct was to rerun my solution to Part 1, just plugging in 30,000,000 instead of 2,020. The program ran for a few minutes, only getting halfway, before I decided to turn it off and optimize. Step 1, however, was figuring out what was making this so slow.

I added some console logs in my `for` loop that would output every 1 million turns. Because my approach was linear, I expected that each 1 million turns would take about the same amount of time. Running the program, however, I saw an observable, significant slowdown as the turns got higher and higher. This was worrisome.

I also perused the Advent of Code channel on the [Party Corgi Network](https://www.partycorgi.com/) Discord server, and although people were being careful not to give away their solutions, it did seem like their working solutions weren't too different from mine. The approach seemed sound… so what was missing?

I had a hunch that object lookup might not be as fast as I had thought, and that `Map` might be faster. I wasn't sure, because I haven't had a use case for `Map`s in JavaScript that objects couldn't solve yet.

I was encouraged by the following entry in [MDN's `Map` docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map):

| | Map | Object |
| **Performance** | Performs better in scenarios involving frequent additions and removals of key-value pairs. | Not optimized for frequent additions and removals of key-value pairs. |

That _frequent_ is the key word here. Objects might have constant-time lookup, but that'll still be slower than `Map`'s lookup if you're frequently adding new properties. This clarifies a huge question I'd had about `Map`s, which is what their use case was if JavaScript already supports objects.

That was all I needed! I retooled the solution to use the same logic, but consume a `Map` instead of an object. I ran my code one more time… and it finished in just a few seconds.