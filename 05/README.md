# [Day 5](https://adventofcode.com/2020/day/5)

Day 5 is about [binary space partitioning](https://en.wikipedia.org/wiki/Binary_space_partitioning). Your input file is a list of lines that look like

```
BBFFBBFLRL
BFFFBBBRLL
FFBBFFFLLR
FBFBFFBRRL
```

Each line represents a boarding pass, whose row and column are meant to be determined with binary space partitioning. The first seven characters tell you how to partition the 128 rows, and the last three characters tell you how to partition the eight columns.

**Part 1** tells you how to find a seat's unique identifier, based on its row and column — `(8 * row) + column)` — and asks you to find the highest ID of the provided boarding passes.

**Part 2** asks you to find your seat, which will be missing from the list of boarding passes. The catch is that *lots* of seats could be missing — but you *do* know that the seat IDs to either side of your seat's ID will be occupied.
## Initial Passes

### Part 1

To kick things off, I wrote a [`getSeatId`](/05/index.js#L7) function that takes a boarding pass, steps through each letter, and determines which row and column the seat is at. It does this by keeping track of two variables, representing the upper and lower bounds. Based on each character in the pass, it updates either the upper bound or the lower bound to the halfway point — much like a lot of the standard algorithms for binary searches. It does this for both the row and the column. Then it returns `(8 * row) + column`. I was pretty happy with this function and reused it for Part 2, as well as my more optimized solutions.

My approach for determining the highest ID of the set was to combine an [`Array.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) with a [`Math.max`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max). It looked like:


```js
const highestSeat = boardingPasses.reduce((highestSeatId, boardingPass) => {
	let seatId = getSeatId(boardingPass);
	return Math.max(seatId, highestSeatId);
}, 0);
```

This code keeps a running current maximum seat ID (`highestSeatId`). It steps through each of the provided boarding passes, and calculates their seat ID. If that seat ID is higher than the running maximum, then it returns the seat ID. Otherwise, it returns the running maximum.

Because `reduce` steps through each element of the `boardingPasses` array, this approach has a **linear (`O(n)`) runtime complexity**.

If the array was already sorted from *back-to-front* and *right-to-left*, we'd be able to pluck the first boarding pass from the array, get its ID, and call it a day. This is because the IDs are constructed such that the backmost row will always have the highest ID. However, [Node's native sorting algorihm is, on average, **loglinear (`O(n log n)`)**](https://blog.shovonhasan.com/time-space-complexity-of-array-sort-in-v8/). While the lookup and ID calculation *after* the sort would be **constant time**, the sorting alone gives this approach a bigger `O()` than our linear approach.

### Part 2

Your boarding pass will not be in the provided input, but the passes with IDs one lower and one higher than yours *will*. I decided to reframe this as trying find your neighbor with the lower ID.

The original framing:
* **ID - 1:** the occupied seat before yours
* **ID:** your seat, not listed among the boarding passes
* **ID + 1:** the occupied seat after yours

My reframing:
* **ID:** the occupied seat before yours
* **ID + 1:** your seat, not listed among the boarding passes
* **ID + 2:** the occupied seat after yours

This reframing let me use an approach where I could `find` an ID among the provided passes, such that ID + 1 did not exist, but ID + 2 *did*. I could then add 1 to the lower neighbor's ID to get your ID:

```js
const occupiedSeats = [];
boardingPasses.forEach(pass => occupiedSeats.push(getSeatId(pass))); // track which seats are taken

const leftNeighbor = occupiedSeats.find((seatId) => (!occupiedSeats.includes(seatId + 1) && occupiedSeats.includes(seatId + 2)));
console.log(leftNeighbor + 1);
```

Constructing the `occupiedSeats` array required stepping through each of the provided boarding passes, which was a **linear (`O(n)`) process**.
Finding the occupied seat before yours was a **quadratic (`O(n²)`) process**:
* In the worst case scenario, `find` has to step through each item in `occupiedSeats` to see whether that item meets the given condition. 
* For each step in `find`, this process makes two `includes` checks to confirm that your ID isn't present, but that the ID after yours is. Each of those `includes` checks can end up looping through the whole array.

## Presorting Part 2

My solution to Part 1 operated in linear (`O(n)`) runtime, which I'm pretty happy with. However, my solution to Part 2 operated in quadratic (`O(n²)`) runtime.

The underlying source of runtime complexity here is that the boarding passes — and therefore, their IDs — can be listed in any order. If you keep them in the order they're given to you, you have no idea where to find any relevant seats, so you *have* to traverse the whole array to find the adjacent seats. By presorting our input before we traverse, we can rely on heuristics that reduce the program's runtime complexity.

My presorted approach looked like this:

```js
const sortedIds = boardingPasses.map(getSeatId).sort((a, z) => a-z);
for (let i = 0; i < sortedIds.length - 1; i++) {
	const currentId = sortedIds[i];
	if (sortedIds[i + 1] === currentId + 2) {
		console.log(currentId + 1);
		break;
	}
}
```

There are three possible contributors to the runtime complexity here:

1. **`map`-ing over `boardingPasses` to create an array of seat IDs.** Because `map` visits every element of `boardingPasses` to create the new array of IDs, this part of the program has a **linear runtime (`O(n)`)**.

2. **Sorting the array of IDs.** For large arrays such as this, [Node uses the quicksort algorithm](https://blog.shovonhasan.com/time-space-complexity-of-array-sort-in-v8/), which has an ***average* runtime complexity of `O(n log n)`**. In the worst cases, quicksort *can* reach up to `O(n²)`, but this is rare.

3. **Iterating over the array to find the occupied seat before ours.** Because the seats are now arranged from least to greatest, we know that the seat after ours will immediately follow the seat before ours. For any given candidate for the seat before ours, we only have to check the next occupied seat, instead of the whole array. There's only one loop through the array here, so this part of the program has a **linear `O(n)` runtime complexity**.

The most expensive part of this new approach is the sorting. However, the sorting's average runtime is `O(n log n)` and is `O(n²)` at *worst*, which is a definite improvement over my original approach that was always `O(n²)`.