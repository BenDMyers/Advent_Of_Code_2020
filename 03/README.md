# [Day 3](https://adventofcode.com/2020/day/3)

In this puzzle, your input is a grid like the one below:

```
..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#
```

This is meant to represent a pattern that replicates infinitely horizontally.

```
..##.........##.........##.........##.........##.........##.......  --->
#...#...#..#...#...#..#...#...#..#...#...#..#...#...#..#...#...#..
.#....#..#..#....#..#..#....#..#..#....#..#..#....#..#..#....#..#.
..#.#...#.#..#.#...#.#..#.#...#.#..#.#...#.#..#.#...#.#..#.#...#.#
.#...##..#..#...##..#..#...##..#..#...##..#..#...##..#..#...##..#.
..#.##.......#.##.......#.##.......#.##.......#.##.......#.##.....  --->
.#.#.#....#.#.#.#....#.#.#.#....#.#.#.#....#.#.#.#....#.#.#.#....#
.#........#.#........#.#........#.#........#.#........#.#........#
#.##...#...#.##...#...#.##...#...#.##...#...#.##...#...#.##...#...
#...##....##...##....##...##....##...##....##...##....##...##....#
.#..#...#.#.#..#...#.#.#..#...#.#.#..#...#.#.#..#...#.#.#..#...#.#  --->
```

**Part 1** asks you to start at the top left corner and move through the grid **one space down, and three to the right** at a time until you reach the bottom of the grid. As you do, track how many pound signs you encounter. **Part 2** asks the same thing, except multiple times at different slopes.

I opted to parse the file into a two dimensional array called grid, such that `grid[r][c]` would get me the character at row `r` and column `c`.

I think the crux of this challenge is choosing how to represent the infinitely-extending horizontal pattern. You could, for instance, calculate a two-dimensional array that loops a couple times horizontally. You could calculate the number of repetitions required with something like:

```js
const numStepsRequired = Math.ceil(grid.length / yOffset);
const requiredGridWidth = numStepsRequired * xOffset;
const numHorizontalRepetitionsRequired = Math.ceil(requiredGridWidth * grid[0].length);
```

However, this will end up creating a bigger array than you need, which can be memory-intensive, and you have to make sure you're setting up the repetitions properly.

Instead of duplicating the grid, I opted to treat the repeating patterns as horizontal wraparounds — making it a great use case for the [modulo operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder). Anytime the tobogganist's `x` value was incremented, I modulo'd the new value with the grid width to wrap it back around to the relevant place in the grid.

In Part 2, the only logic that needed to change were providing different `xOffset` and `yOffset` values. I put the logic from Part 1 into a function, and called it with the new offsets.