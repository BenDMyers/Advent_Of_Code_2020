# [Day 20](https://adventofcode.com/2020/day/20) 🦕🗺

> Day 20's solutions are broken up into [`part1.js`](/20/part1.js) and [`part2.js`](/20/part2.js).

On Day 20, you're given a numbered list of tiles — each tile looks like:

```
Tile 2311:
..##.#..#.
##..#.....
#...##..#.
####.#...#
##.##.###.
##...#.###
.#.#.#..##
..#....#..
###...#.#.
..###..###
```

These tiles are all meant to be arranged in an n×n grid — the borders of one tile will line up with the borders of its neighbor tiles. However, the tiles may need to be rotated and/or flipped into the right orientation before they can line up with each other.

**Part 1** asks you to multiply the IDs of the four corner tiles together. **Part 2** asks you to stitch the tiles together and find a certain pattern in the image.

## Part 1: Corner Tiles

On the night that Day 20's puzzle opened, I was the 435th participant to solve Part 1, which I was pretty happy with. My solution for Part 1 didn't set me up to succeed at Part 2 at all, but I'm still pretty happy with it as a quick solution to the problem at hand.

One way to solve this problem would be to assemble the entire grid — and, spoiler alert, that's what I ended up doing for Part 2. However, as I was solving Part 1, I figured that assembling the grid would be complicated *(yep)* and that there had to be a more lightweight solution.

The input—or, at least, _my_ input—was constructed such that borders are unique to only a tile and its neighbor. This means that **for any given border at most one other tile will match.** This ended up being pretty crucial to both Part 1 and Part 2's solutions.

That implementation detail about the input lets us make the following conclusions:

1. Tiles in the middle of the map will have their borders line up with **exactly 4 other tiles.**
2. Edge tiles' borders line up with **exactly 3 other tiles.**
3. Corner tiles' borders line up with **exactly 2 other tiles.**

This means that you can compare any tile with the other tiles, and if you only get two candidates for neighbors, you know your tile is a corner. In pseudocode, this could look like:

```js
for (let i = 0; i < tiles.length - 1; i++) {
	let currentTile = tiles[i];
	let neighbors = 0;
	for (let j = i + 1; j < tiles.length; j++) {
		let neighborCandidate = tiles[j];

		// Compare currentTile's top, left, right, and bottom edges to neighborCandidate's
		// top, left, right, bottom, topReversed, leftReversed, rightReversed, and bottomReversed edges.
		// If ANY of them match, increment `neighbors`.
	}

	if (neighbors === 2) {
		// This is a corner tile
	}
}
```

For the full, decked-out solution, see [`part1.js`](/20/part1.js).

This way, we know for sure what the four corner tiles are without doing any map assembly. This works great… until you get to Part 2, which requires an assembled map.

## Part 2: Here There Be Sea Monsters

In Part 2, you need to find all `#`s in the assembled map that make up a sea monster pattern, which [looks familiar](https://en.wikipedia.org/wiki/File:Hoaxed_photo_of_the_Loch_Ness_monster.jpg):

```
                  # 
#    ##    ##    ###
 #  #  #  #  #  #   
```

(Those spaces in the pattern could either be `.`s or other `#`s. Additionally, the sea monster may be flipped and/or rotated.)

Finding these patterns, however… required an assembled map.

### Part 2, Part 1: Map Assembly

I tried a few different approaches until one panned out. Looking back on it, I think all of my approaches were sound, if a little overcomplicated, but each time, I forgot to handle tile-flipping. Each approach was a variation of the same idea: start with one tile, and iteratively add in tiles that could fit until no more tiles remained. The different approaches I tried were all variations on picking the starting tile (one of the designated corner tiles from Part 1) and on the data structure used to represent the grid (nodes with references to their neighbors, a two-dimensional array, or a `Map`). The solution I landed on in the end was choosing the first provided tile as an arbitrary starting point and representing the whole grid as a `Map` a la [my Conway hypercube solution from Day 17](/17#expressing-the-infinite).

Tracing [my solution](/20/part2.js#L162) step-by-step, we'd get something like:

1. Store the first provided tile in the map at `(0, 0)` and remove it from the list of available tiles.
2. Determine all spaces next to open borders.
3. Iterate through all remaining, unplaced tiles, testing every possible flip and rotation against the available borders.
	- If the unplaced tile matches an open border, store the unplaced tile in the map at the appropriate coordinate and remove that newly placed tile from the list of available tiles.
4. Repeat Steps 2 and 3 until all tiles have been placed.
5. Stitch the map together, removing each tile's borders.

This process frequently required grid rotation. Instead of writing my own two-dimensional array rotation algorithm, I pulled in the [`2d-array-rotation`](https://www.npmjs.com/package/2d-array-rotation) library's `rotate` function, which was super helpful. I especially appreciated that the `rotate` function returned new arrays instead of modifying values in-place — this made it easier to spin up an unflipped, horizontally flipped, vertically flipped, and horizontally/vertically flipped version of each tile knowing that I was starting from the same place each time.

In the past, I've been burned by trying to complete the whole solution at once, without making sure to test each step along the way. This time, I was careful to break up chunks of the code into functions — even if those functions might only get called once. Those helper functions ended up being:

* [`getAvailableSpaces`](/20/part2.js#L20): Get a `Map` of all empty spaces that border a placed tile. The key is the empty space's Cartesian coordinates, and the value is an object of the known required borders (`{top?, bottom?, left?, right?}`).
* [`getBorders`](/20/part2.js#L85): Given a tile, return an array of the tile's borders
* [`printMap`](/20/part2.js#L98): print the currently populated map to the console
* [`stitchMap`](/20/part2.js#L125): remove each tile's borders, and combine the tiles into one big two-dimensional array of characters

In retrospect, I might have even gone further and chunked even more out to functions.