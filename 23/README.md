# [Day 23](https://adventofcode.com/2020/day/23)

> **Note:** I split up my solutions to today's puzzle into [`part1.js`](/23/part1.js) and [`part2.js`](/23/part2.js) for the sake of a clean slate.

In Day 23, you're given a list of cups, each represented by a number from **1** to **9**, arranged in a circle in clockwise order. For instance, an input of `389125467` means your cups go **3, 8, 9, 1, 2, 5, 4, 6, 7** before looping back around to **3**.

The rules of Day 23's game are:

> Before starting, designate the first cup in your list as the **current cup**.
> Each move, do the following:
> * Pick up the **three cups** that are immediately **clockwise** of the **current cup**. They are removed from the circle; cup spacing is adjusted as necessary to maintain the circle.
> * Select a **destination cup**: the cup with a **label** equal to the **current cup's** label minus one. If this would select one of the cups that was just picked up, keep subtracting one until you find a cup that wasn't just picked up. If at any point in this process the value goes below the lowest value on any cup's label, it **wraps around** to the highest value on any cup's label instead.
> * Place the cups you just picked up so that they are **immediately clockwise** of the destination cup. They keep the same order as when they were picked up.
> * Selects a new **current cup**: the cup which is immediately clockwise of the current cup.

(the above is adapted from the text of the [Day 23](https://adventofcode.com/2020/day/23) puzzle)

**Part 1** asks you to perform **100 moves** on your provided nine cups, and output the order of all cups after Cup 1. **Part 2** adds **Cups 10 through 1,000,000** into your circle, asks you to perform **10,000,000 moves**, and then get the product of the two cups immediately clockwise of Cup 1.

## The Part 1 Approach: Arrays

My first thought was to solve this problem using arrays and array methods. Namely, removing a chunk of three elements from the circle seemed like a perfect use case for [`splice`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice). Inserting the elements back into the circle _also_ seemed like a strong use case for `splice`. Win–win.

The one bit of logic that seemed weird—which, in hindsight, should have been a warning sign—was the **wraparound** logic. `splice` doesn't wrap around, so I had to emulate that behavior by grabbing what you can from the end of the array, and then getting the remainder from the start of the array:

```js
// Pick up three cups, wrapping around if need be
let pickedUp = cups.splice(currentCupIndex + 1, 3);
pickedUp.push(...cups.splice(0, 3 - pickedUp.length));
```

This worked alright for Part 1, but in hindsight, it's not really what arrays are best suited for. A data structure with circularity built into it would be a stronger fit, but we'll get to that.

This array-based approach looked like:

```js
let currentCup = cups[0];

for (let i = 0; i < 100; i++) {
	let currentCupIndex = cups.indexOf(currentCup);

	// Pick up three cups, wrapping around if need be
	let pickedUp = cups.splice(currentCupIndex + 1, 3);
	pickedUp.push(...cups.splice(0, 3 - pickedUp.length));

	// Determine new destination for current cup
	let destination = currentCup - 1;
	while (!cups.includes(destination)) {
		destination--;
		if (destination <= 0) {
			destination = input.length;
		} 
	}
	let destinationIndex = cups.indexOf(destination);

	// Insert picked up cups right after the destination
	cups.splice(destinationIndex + 1, 0, ...pickedUp);

	// Pick new current cup
	currentCup = cups[(cups.indexOf(currentCup) + 1) % input.length];
}
```

When I unlocked Part 2, I—perhaps naïvely—decided to try my solution from Part 1 and see how well or how poorly it scaled. The answer was "very poorly." It took the program _minutes_ to complete the first 100,000 moves, so it would be reaching 10,000,000 moves anytime soon.

The culprit here was all of the array methods, which were **linear (`O(n)`) runtime** at best. The `cups.indexOf()`, `cups.includes()`, and especially `cups.splice()` calls were _fine_ when we only had 9 elements to consider, but we absolutely don't want to iterate over a million elements 10 million times. This is especially wasteful, because for each of those array operations, we only ever care about the vast, vast minority of the elements of the array.

Speeding up the program requires finding a way to represent the million cups that **efficiently splices the circle**, extracting the three cups we need without iterating over cups we don't care about. You shouldn't have to instantiate an entirely new circle just to remove and/or reinsert those three cups.

For that, we turn to…

## Circular Linked Lists

A *linked list* is a data structure comprised of nodes, such that each node has a value and a reference to the node after it. When the linked list is set up, you only need to store a reference to the first node in the chain, called the _head_, because you can use that to traverse the rest of the chain.

Linked lists are ideal for extracting sublists efficiently, because the only nodes that are affected are the sublist and the node right before that sublist. The same is true for inserting nodes back into the list — the only nodes that are affected are again the sublist and the node right before where the sublist is getting inserted.

A *circular linked list* is the same as a linked list, with the one extra requirement that the last node of the list, called the *tail*, contains a reference to the head instead of terminating. You still need to hold onto a reference to the head node to be able to use the list in a program, but the choice of which node is the head is ultimately arbitrary.

You can create a circular linked list like so (my actual solution looks a little different for reasons we'll get to):

```js
/** @type {Cup} */
let headCup = null;

/** @type {Cup} */
let previousCup = null;
for (let i = 0; i < NUM_CUPS; i++) {
	/** @type {Cup} */
	let newCup = {
		label: (i < input.length) ? input[i] : i + 1,
		next: null
	};

	if (i === 0) headCup = nextCup;
	if (previousCup) previousCup.next = newCup;
	previousCup = newCup;
}

// Make it circular
previousCup.next = headCup;
```

Each cup is instantiated as an object with a `label` property (a number) and a `next` property (which starts out as `null`). I always hold on to the previously created cup. When the _current_ cup is created, I go back to the previous cup and update its `next` property to point to the current cup. Then at the end, I take the most recently created cup and set its `next` to the first cup, which makes the whole thing circular.

Extractions and reinsertions are now much more efficient than `splice`, because we only need to update references instead of recreating the whole circle. However, when I ran my program, **it was still incredibly sluggish.** There had to be something I was missing, something that was still slowing the program down significantly.

When you extract from, or reinsert into, a linked list, you need a reference to the node that comes before the extraction/reinsertion. It's finding this node that turned out to be the culprit. Traversing a linked list is inherently a linear process: you start at the first node and you keep following the chain until you find the node you want. This is no faster than an array search, and it meant that for each of my 10,000,000 moves, I was still performing up to a million lookups.

To make this program faster, I not only needed the efficient extractions and reinsertions. **I also needed efficient lookups.**

## The Linked List/Map Combo

If you have a bunch of data and you want efficient lookups, you turn to an object or a [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), which have **constant time (`O(1)`) lookups**. [On a previous day](/15#maps-over-objects), I learned that `Map`s will perform better than objects in cases where you anticipate many frequent updates, so I've opted for a `Map` again.

As I was creating each cup node in the circular linked list, I made sure to store that node in my `Map` as well — the keys were the cup's label, and the values were the nodes themselves.

```js
/** @type {Map<number, Cup>} */
let cups = new Map();

/** @type {Cup} */
let previousCup = null;
for (let i = 0; i < NUM_CUPS; i++) {
	/** @type {Cup} */
	let newCup = {
		label: (i < input.length) ? input[i] : i + 1,
		next: null
	};

	cups.set(newCup.label, newCup);

	if (previousCup) previousCup.next = newCup;
	previousCup = newCup;
}

// Make it circular
previousCup.next = cups.get(input[0]);
```

This meant that anytime we need to **find** a cup, such as when we're finding where to extract or reinsert nodes, we can call `cups.get()`, and get the relevant cup node in **constant runtime**. Because we're still using the linked list approach at the same time, we can still perform extractions and reinsertions efficiently using references (also **constant runtime**). This hybrid linked list/map approach really gives us the best of both worlds when it comes to insertion/extraction and lookups.