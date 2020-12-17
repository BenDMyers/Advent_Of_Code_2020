# [Day 17](https://adventofcode.com/2020/day/17)

[*Conway's Game of Life*](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) is a [cellular automaton](https://en.wikipedia.org/wiki/Cellular_automaton) that usually takes place on an infinite, two-dimensional grid. Cells are either active or inactive. From one tick of the game to the next, an active cell will stay active if it has exactly 2 or 3 active neighbors, and an inactive cell will become active if it has exactly 3 active neighbors.

Day 17 of Advent of Code takes Conway's Game of Life and upscales it to the third and fourth dimensions. Your input file is a square grid of `.` and `#`, representing the `z=0` level of your Conway cube/hypercube's initial configuration. It might look something like

```
.#.
..#
###
```

Each `.` represents an inactive cell, and each `#` is an active cell. As with the two-dimensional Conway's Game of Life, active cells with 2 or 3 active neighbors remain active, and inactive cells with exactly 3 active neighbors will become active.

**Part 1** asks you how many cells are active after six ticks in a three-dimensional Conway's Game of Life system. **Part 2** asks how many cells will be active after six ticks in a four-dimensional Conway's Game of Life system.

## Expressing the Infinite

How do you represent infinitely large three- or four-dimensional space?

I considered representing this space as a [multidimensional array](https://www.geeksforgeeks.org/multidimensional-array-in-javascript/) — but then, how big do I make it?

Do I start with the same size as the initial input, and expand each array whenever a cell just outside the bounds becomes active? Then I'd have to update every array on that given face of the cube to support the new length, and I'd have to make sure my indices remained in sync.

Alternatively, I could figure that after six ticks, the cube couldn't possibly expand by any more than 6 spaces on any given side, and initialize the cube as `(cubeLength + 6 + 6)³` (or, for Part 2, `(cubeLength + 6 + 6)⁴`). This would prevent expansions and their ensuing index syncs, but then the cube/hypercube would take up a lot of memory for what is mostly empty space.

Instead, I decided to express this gridlike space not as arrays, but as a single, flat object. The keys in this `conwayCube` object represented a cell's Cartesian coordinates — so `'(0, 0, 0, 0)'`. If a cell was active, its coordinates could be found as a key in `conwayCube`. If the cell was inactive, it was nowhere to be found in the `conwayCube` object. The values in this object just needed to be anything truthy, but I opted to store the cell's `{x, y, z}`, which made iterating over the object to get the space's current ranges easier.

```js
// Populate Conway cube with initial configs
for (let y = input.length - 1; y >= 0; y--) {
	for (let x = 0; x < input[y].length; x++) {
		if (input[y][x] === '#') {
			conwayCube[`(${x}, ${y}, 0)`] = {x, y, z: 0};
		}
	}
}
```

The object approach meant I didn't need to make any decisions about initial grid sizes, or perform any length syncs anytime I need to expand my bounds. Expanding bounds was as minimal as adding the cell's key to the `conwayCube` object, which is a constant-time operation.

The next step required going through several ticks of the Conway system. Each tick required figuring out which cells were in range to possibly update, iterating through those cells, and determining whether they would be active or inactive.

1. **Determine which cells are in range to possibly update.** I figured the Conway system could only expand by 1 in each direction per tick. For instance, if our `x`'s range from `0` to `3`, then after the next tick, the range of `x`'s could stretch to `-1` to `4` at _most_. Doing this calculation for all axes gave me a rectangular prism of the only cells I needed to check.
```js
let activeCells = Object.values(conwayCube);

// Get the ranges for the next iteration of the cube
let minX = activeCells[0].x;
let maxX = activeCells[0].x;
let minY = activeCells[0].y;
let maxY = activeCells[0].y;
let minZ = activeCells[0].z;
let maxZ = activeCells[0].z;

for (let cell of activeCells) {
	minX = Math.min(minX, cell.x);
	maxX = Math.max(maxX, cell.x);
	minY = Math.min(minY, cell.y);
	maxY = Math.max(maxY, cell.y);
	minZ = Math.min(minZ, cell.z);
	maxZ = Math.max(maxZ, cell.z);
}
```

2. **Iterate through the range of cells to check.**
```js
// Iterate through every possible cell in the new range and determine activity
for (let x = minX - 1; x <= maxX + 1; x++) {
	for (let y = minY - 1; y <= maxY + 1; y++) {
		for (let z = minZ - 1; z <= maxZ + 1; z++) {
			// TODO
		}
	}
}
```

3. **Determine whether a given cell should be active or inactive after this tick.** I started by creating a helper function that would take a cell's coordinates, iterate through all of the cell's neighbors, and return how many of them are active this tick:
```js
/**
 * Gets how many neighboring cells of a given cell are active
 * @param {number} cellX the x coordinate of the current cell
 * @param {number} cellY the y coordinate of the current cell
 * @param {number} cellZ the z coordinate of the current cell
 * @returns {number} the number of active neighbors
 */
function getActiveNeighbors(cellX, cellY, cellZ) {
	let activeNeighbors = 0;
	for (let x = cellX - 1; x <= cellX + 1; x++) {
		for (let y = cellY - 1; y <= cellY + 1; y++) {
			for (let z = cellZ - 1; z <= cellZ + 1; z++) {
				let isOrigin = (x === cellX) && (y === cellY) && (z === cellZ);
				if (conwayCube[`(${x}, ${y}, ${z})`] && !isOrigin) {
					activeNeighbors++;
				}
			}
		}
	}
	return activeNeighbors;
}
```
Once that function was ready, I called it in my triply-nested for-loop from step 2:
```js
// Iterate through every possible cell in the new range and determine activity
for (let x = minX - 1; x <= maxX + 1; x++) {
	for (let y = minY - 1; y <= maxY + 1; y++) {
		for (let z = minZ - 1; z <= maxZ + 1; z++) {
			let activeNeighbors = getActiveNeighbors(x, y, z);

			if (conwayCube[`(${x}, ${y}, ${z})`]) { // Cell was already active
				if (activeNeighbors === 2 || activeNeighbors === 3) {
					newConwayCube[`(${x}, ${y}, ${z})`] = {x, y, z};
				}
			} else { // Cell was inactive
				if (activeNeighbors === 3) {
					newConwayCube[`(${x}, ${y}, ${z})`] = {x, y, z};
				}
			}
		}
	}
}
```

As I iterated through each possible cell, I stored active cells in a `newConwayCube` variable. At the end of each tick, I reassigned `conwayCube` to `newConwayCube`. As [I mentioned on Day 11](11#cellular-automata-and-in-place-changes), when calculating the next tick of a cellular automaton, I prefer to store my results in a new place, rather than try to make my calculations in-place. This ensures that I don't accidentally spoiler later cells' calculations.

When put all together, my ticks looked like:

```js
// Step through 6 iterations of the Conway cube
for (let i = 0; i < 6; i++) {
	let activeCells = Object.values(conwayCube);
	let newConwayCube = {};

	// Get the ranges for the next iteration of the cube
	let minX = activeCells[0].x;
	let maxX = activeCells[0].x;
	let minY = activeCells[0].y;
	let maxY = activeCells[0].y;
	let minZ = activeCells[0].z;
	let maxZ = activeCells[0].z;

	for (let cell of activeCells) {
		minX = Math.min(minX, cell.x);
		maxX = Math.max(maxX, cell.x);
		minY = Math.min(minY, cell.y);
		maxY = Math.max(maxY, cell.y);
		minZ = Math.min(minZ, cell.z);
		maxZ = Math.max(maxZ, cell.z);
	}

	// Iterate through every possible cell in the new range and determine activity
	for (let x = minX - 1; x <= maxX + 1; x++) {
		for (let y = minY - 1; y <= maxY + 1; y++) {
			for (let z = minZ - 1; z <= maxZ + 1; z++) {
				let activeNeighbors = getActiveNeighbors(x, y, z);

				if (conwayCube[`(${x}, ${y}, ${z})`]) { // Cell was already active
					if (activeNeighbors === 2 || activeNeighbors === 3) {
						newConwayCube[`(${x}, ${y}, ${z})`] = {x, y, z};
					}
				} else { // Cell was inactive
					if (activeNeighbors === 3) {
						newConwayCube[`(${x}, ${y}, ${z})`] = {x, y, z};
					}
				}
			}
		}
	}

	conwayCube = newConwayCube;
}
```

## Transitioning to Hyperspace

When Part 2 took the problem from three dimensions to four, I figured my approach to Part 1 would scale to fit these new requirements. Had I gone with an array approach, I would have needed to update my multidimensional data structure to support a fourth array, and update any logic that may have pertained to expanding the arrays' bounds.

Instead, I only needed to make two updates to my Part 1 solution to get it up and running for Part 2:

1. Update the cells' keys to include the fourth coordinate.

2. Update all triple for-loops to include a fourth loop.

That was it! I was so sure there'd be a catch, but there wasn't.

Knowing that I had to account for four dimensions made me extra relieved that I was using the object approach, and only storing active cells. This meant, no matter how far my Conway system expanded, I was only storing exactly what I needed and no more—an effective counter against the ballooning growth of four axes.