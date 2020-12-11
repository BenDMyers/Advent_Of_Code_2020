# [Day 11](https://adventofcode.com/2020/day/11)

Day 11's input is a grid of characters, representing a seating chart, which resembles

```
L.LL.LL.LL
LLLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLLL
L.LLLLLL.L
L.LLLLL.LL
```

In this seating chart,

* **`.`** represents the floor, where no one sits
* **`L`** represents an open seat
* **`#`** represents an occupied seat

Seating charts update all at once in discrete steps, based on the following rules:

**Part 1:**

* Empty seats (`L`) are filled (switch to `#`) if none of their adjacent neighbors in any direction are occupied (`#`)
* Occupied seats (`#`) are vacated (switch to `L`) if at least 4 of their adjacent neighbors are also occupied (`#`)
* Otherwise, the cell does not change

Rinse and repeat until the seating chart reaches equilibrium and makes no more changes.

**Part 2:**

Part 2 introduces a *line of sight* requirement. An occupied seat is within line of sight if it could be reached by going in a straight line along any one of the eight directions without hitting another seat first.

* Empty seats (`L`) are filled (switch to `#`) if no occupied seats are within their line of sight.
* Occupied seats (`#`) are vacated (switch to `L`) if at least 5 occupied seats are within their line of sight.
* Otherwise, the cell does not change

Like Part 1, rinse and repeat until the seating chart reaches equilibrium and makes no more changes.

The grid structure and the rules for updating any given cell make this a [*cellular automaton*](https://mathworld.wolfram.com/CellularAutomaton.html). I was given the chance to play with cellular automata a bit in college, and they're super fun!

## Cellular Automata and In-Place Changes

One of the questions I've been asking myself every day as I go through these challenges is whether I should mutate the original input data structure, or create a clone. In this case, I landed solidly in the camp of creating a clone for each step, namely to solve one specific problem.

Consider the following small seating chart:

```
....
.LL.
....
```

Per the rules of Part 1 listed above, both of these empty seats should be filled in the next step because neither of them currently have any occupied neighbors. Say we update the leftmost open seat accordingly:

```
....
.#L.
....
```

When we get to the rightmost open seat and run our adjacent occupied seat checks, we'll find the occupied seat that we just set. There's no real good way to know for sure whether that seat was already occupied or whether we set it in this step.

To remedy this, I iterated over my `input` grid, calculated each cell's new value, and stuck it in the same spot in a `newSeating` variable. Because the `input` grid remained unchanged, I could each cell's new value without any knock-on effect from previous seat value calculations. After I had iterated over the entire `input` grid, I was free to reassign `input` to `newSeating` to be used in the next step.

## Abstracting Line of Sight

In part 2, seats fill and vacate based on occupied seats within their line of sight, not just adjacent to them. This posed a good question: what's the best way to traverse a grid in eight different directions like a chess queen, let alone stopping when you reach another seat or the edges of the grid?

One way to do this is to write eight different loops, one for each direction. As you do, you track the row and column for the current cell along this direction. If you hit a `#`, you increment some `occupiedSeatsInSight` value and break the loop. If you instead hit a `L` or reach the edge, you break the loop without incrementing `occupiedSeatsInSight`. Otherwise, you move to the next cell along that direction.

This is totally doable, but it requires setting up similar loops for each direction, updating the bounds checks (if you're moving northwest, you want to make sure the row and column never go below `0`, but if you're going southeast, you don't want either to go beyond the grid's length), and updating the row and column incrementing/decrementing to pick the next cell to check. It's doable, but it'll lead to code duplication, with a lot of potential for forgetting necessary changes during the copy–paste.

I decided to create an abstraction around this problem, starting with a function called [`hasOccupiedSeatInLineOfSight`](/11/index.js#L83). This function takes the row and column of a cell, as well as `updateRow` and `updateColumn` functions — more on those in a moment. `hasOccupiedSeatInLineOfSight` first determines whether it is out of bounds, in which case, it returns `false`. It then checks whether this cell has an empty chair (`L`), in which case, it also returns `false`. These are the only two ways that a given line of sight could *not* have an occupied chair. Likewise, if the cell *is* an occupied seat, it returns `true`. Finally, if none of the above are true, this function recursively calls itself, but with the coordinates for the next cell along this line of sight. It uses those `updateRow` and `updateColumn` functions to get the coordinates for the next cell.

```js
/**
 * Recursively determines whether an occupied chair exists along a given line of sight
 * @param {number} row the current row of whichever element we're looking at along a particular line of sight
 * @param {number} column the current column of whichever element we're looking at along a particular line sight
 * @param {function} updateRow function to get the row of the next element along this line of sight
 * @param {function} updateColumn function to get the column of the next element along this line of sight
 * @returns {boolean} whether an occupied chair is within this line of sight
 */
function hasOccupiedSeatInLineOfSight(row, column, updateRow, updateColumn) {
	let rowOutOfBounds = row < 0 || row >= input2.length;
	let columnOutOfBounds = column < 0 || column >= input[0].length;

	if (rowOutOfBounds || columnOutOfBounds) return false;
	if (input2[row][column] === 'L') return false;
	if (input2[row][column] === '#') return true;

	return hasOccupiedSeatInLineOfSight(updateRow(row), updateColumn(column), updateRow, updateColumn);
}
```

Let's say that we wanted to check whether any occupied seats were in our line of sight to the northeast, assuming we're currently in row `r` and column `c`. Because we're looking to the north, each cell along the line of sight decrements its row, so we can use the `updateRow` function `row => row - 1`. Because we're looking eastward, each cell along the line of sight increments its column, so we can use the `updateColumn` function `column => column + 1`:

```js
// This determines whether any seats are occupied within our line of sight to the northeast
hasOccupiedSeatInLineOfSight(r - 1, c + 1, row => row - 1, column => column + 1);
```

We can abstract those row/column updaters into descriptively named helper functions:

```js
const up = r => r - 1;
const down = r => r + 1;
const left = c => c - 1;
const right = c => c + 1;
const noop = x => x;

// This determines whether any seats are occupied within our line of sight to the northeast
hasOccupiedSeatInLineOfSight(r - 1, c + 1, up, right);
```

This `hasOccupiedSeatInLineOfSight` function is helpful, but it only tells us that an occupied seat was spied in one direction. We want to find how many directions that's true for given a certain cell. For this we have [`getOccupiedSeatsWithinLineOfSight`](/11/index.js#L108)

```js
/**
 * Gets the number of occupied (`#`) seats within a given seat's line of sight in all 8 directions
 * @param {number} row row of the current seat
 * @param {number} column column of the current seat
 * @returns {number} the number of occupied seats within this seat's line of sight
 */
function getOccupiedSeatsWithinLineOfSight(row, column) {
	let occupiedSeatsInSight = 0;

	if (hasOccupiedSeatInLineOfSight(row - 1,	column - 1, 	up,		left))		occupiedSeatsInSight++;		// Northwest
	if (hasOccupiedSeatInLineOfSight(row - 1,	column, 		up, 	noop))		occupiedSeatsInSight++;		// North
	if (hasOccupiedSeatInLineOfSight(row - 1,	column + 1,		up, 	right))		occupiedSeatsInSight++;		// Northeast

	if (hasOccupiedSeatInLineOfSight(row,		column - 1,		noop, 	left))		occupiedSeatsInSight++;		// West
	if (hasOccupiedSeatInLineOfSight(row,		column + 1,		noop, 	right))		occupiedSeatsInSight++;		// East

	if (hasOccupiedSeatInLineOfSight(row + 1,	column - 1,		down, 	left))		occupiedSeatsInSight++;		// Southwest
	if (hasOccupiedSeatInLineOfSight(row + 1,	column,			down, 	noop))		occupiedSeatsInSight++;		// South
	if (hasOccupiedSeatInLineOfSight(row + 1,	column + 1,		down, 	right))		occupiedSeatsInSight++;		// Southeast

	return occupiedSeatsInSight;
}
```

With this function in place, we finally have a way to determine how many occupied cells are within sight of any given cell, and a way that I personally find a little easier to eyeball. 🎉