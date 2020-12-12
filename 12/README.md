# [Day 12](https://adventofcode.com/2020/day/12)

In Day 12, you're asked to navigate a ship in a [Cartesian plane](https://en.wikipedia.org/wiki/Cartesian_coordinate_system). Your input file consists of navigation instructions in the form of `<action><amount>`, such as:

```
F10
N3
F7
R90
F11
```

In **Part 1**, the actions mean:

| Action | Meaning |
|:------:|---------|
| **N**  | Move the ship north `amount` spaces  |
| **E**  | Move the ship east `amount` spaces   |
| **S**  | Move the ship south `amount` spaces  |
| **W**  | Move the ship west `amount` spaces   |
| **L**  | Turn the ship left `amount` degrees  |
| **R**  | Turn the ship right `amount` degrees |
| **F**  | Move the ship `amount` spaces in whichever direction the ship is facing |

Fortunately for us mathwise, the angles are only ever in 90° increments.

In **Part 2**, the ship is following a waypoint, which is always positioned relative to the ship, and which moves along with the ship. The same instructions now have different meanings:

| Action | Meaning |
|:------:|---------|
| **N**  | Move the waypoint north `amount` spaces  |
| **E**  | Move the waypoint east `amount` spaces   |
| **S**  | Move the waypoint south `amount` spaces  |
| **W**  | Move the waypoint west `amount` spaces   |
| **L**  | Rotate the waypoint `amount` degrees counterclockwise around the ship |
| **R**  | Rotate the waypoint `amount` degrees clockwise around the ship |
| **F**  | Move the ship `amount` spaces in the direction of the waypoint |

For the most part, solving both parts of the puzzle was pretty straightforward. A `switch` statement with a case for each action came in handy here. In Part 1, I sidestepped the need for the `switch` statement to have an `'F'` (forward) case by reassigning the action to `'N'`, `'E'`, `'S'`, or `'W'` depending on the ship's current `angle`.

The main thing that gave grief was rotating the waypoint around the ship in Part 2.
## Rotating a Point Around the Origin

I think my trigonometry teacher would be disappointed in me for how long it took to figure out how to rotate the waypoint clockwise or counterclockwise around the ship.

Because the waypoint is always relative to the ship (it's more like a vector than fixed positions in space), we can treat the ship as the waypoint's origin, `(0, 0)`.

There is a generalized trigonometric solution to rotating a point around the origin. However, doing this in JavaScript means dealing with floating-point precision, which seemed unnecessary for this problem. Besides, the rotation amount would only ever be a multiple of 90°—there had to be a way to do this keeping these nice, clean whole numbers.

I figured the solution would *probably* involve transposing the waypoint's horizontal and vertical values and flipping signs, but I wasn't sure exactly how that would work—until I reread the prompt and realized they had given an example:

> - …The waypoint stays 10 units east and 4 units north of the ship.
> - `R90` rotates the waypoint around the ship clockwise 90 degrees, moving it to **4 units east and 10 units south** of the ship…

In other words, the vector between the ship and its waypoint was originally `<10, 4>`, but after rotating the waypoint 90° clockwise around the ship, the waypoint vector became `<4, -10>`. A generalized format of this that a 90° rotation clockwise turns `<east, north>` into `<north, -east>`. From there, I figured that a 90° rotation counterclockwise would turn `<east, north>` into `<-east, north>`—swapping where the negative sign goes.

Instead of figuring out how the waypoint vector changes for 90°, 180°, 270° rotations both clockwise and counterclockwise, I decided to treat it in the code as rotating by 90° several times.

With any kind of variable swapping, you need some sort of `temp` variable to hold onto one of the values during your reassignments. I came up with a tidy way of doing this swap using array destructuring with assignment:

```js
// Clockwise rotation
[waypointEast, waypointNorth] = [waypointNorth, -1 * waypointEast];
```

This was a fun one-line solution to that particular need that I'm pretty happy with.

## IIFEs

Many people who solve Advent of Code problems structure their code to solve both parts of the puzzle at the same time. I personally prefer to split them out—that makes it a lot easier for me to reason about the particular puzzle I'm solving at that moment. However, this means that I've been cluttering my scope with similarly named variables and functions for both halves—for [yesterday's puzzle](/11/), I had `input1`/`input2` and `stepPart1()`/`stepPart2()`, for instance.

Starting today, I decided to use [*immediately-invoked function expressions*](https://flaviocopes.com/javascript-iife/), or *IIFEs*. Both of parts of the puzzle run in their own IIFE, meaning they each have their own scope to play around in without polluting the namespace for the other part.

Since I don't have a ton of experience with IIFEs yet, I ran into a pretty fundamental bug in my implementation:

I started with my IIFE for Part 1...

```js
(function part1() {
	// …
})()
```

Everything so far was working fine, and I got my solution. Then I started my IIFE for Part 2…

```js
(function part1() {
	// …
})()

(function part2() {})()
```

Immediately, my program crashed, giving this error:

```
(function part2() {
^

TypeError: (intermediate value)(intermediate value)(intermediate value)(intermediate value)(intermediate value)(...) is not a function
```

…Huh? How could this crash? My IIFE syntax for Part 2 was the same as my IIFE syntax for Part 1. It was empty, so there shouldn't have been any checks that should cause an error. What was wrong?

I decided to google the error message. The first response was a [Stack Overflow question about IIFEs](https://stackoverflow.com/questions/42036349/uncaught-typeerror-intermediate-value-is-not-a-function), which seemed promising. There, Stack Overflow user Josh Cozier breaks down the problem:

* The first IIFE is evaluated and returns a value (in my case, `undefined`)
* JavaScript reaches the second IIFE, but interprets it as an invocation of the first IIFE's value, so it tries to do `undefined(function part2() { … })`. This, understandably, doesn't work.

The way to fix this is by making sure that Part 1's IIFE has a semicolon at the end, marking the end of the expression. This is one of the few times in JavaScript where the semicolon is nonoptional.

```js
(function part1() {
	// …
})();

(function part2() {
	// …
})();
```

Now that I've got two IIFEs working well with each other, I'm definitely going to carry this pattern over into following days.