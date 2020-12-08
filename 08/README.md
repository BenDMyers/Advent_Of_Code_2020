# [Day 8](https://adventofcode.com/2020/day/8)

> **Today's two pieces are split up into [`part1.js`](/08/part1.js) and [`part2.js`](/08/part2.js).**

For Day 8, your input is a program comprised of a series of instructions, where each instruction contains an `operation` (`acc`, `jmp`, or `nop`) and an `argument` (a positive or negative integer). Additionally, the program tracks a running `accumulator` value.

An example instruction set would be:

```
nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6
```

These operations mean the following:

| Operation | Meaning |
|-----------|---------|
| `acc` | Add the `argument` to the global, running `accumulator` value (which starts at `0`). Then move to the next instruction. |
| `jmp` | Move forward or backward a number of instructions equal to `argument`. |
| `nop` | Move to the next instruction. |

However, the input file as given won't ever terminate. Our job is not so much to deal with the [halting problem](https://en.wikipedia.org/wiki/Halting_problem) so much as ride its waves.

**Part 1** asks you to find the value of the running `accumulator` variable at the moment the program reaches its first repeated instruction.

**Part 2** tells you there's one parallel dimension version of these instructions where a single flip from a `jmp` to a `nop` or from a `nop` to a `jmp` will cause the program to terminate successfully. This part of the day's puzzle asks you to find the `accumulator`'s value after that one version terminates.

## Part 1

[Part 1](/08/part1.js) was solved with a pretty minimalist solution — execute the program in a `do..while` loop set to execute until it revisits an instruction (visits were tracked by setting `visited: true` on each instruction's object). Inside the loop, each instruction was handled by a `switch` statement:

```js
do {
	const currentInstruction = instructions[index];
	currentInstruction.visited = true;

	switch (currentInstruction.operation) {
		case 'acc':
			accumulator += currentInstruction.argument;
			index++;
			break;
		case 'jmp':
			index += currentInstruction.argument;
			break;
		case 'nop':
			index++;
			break;
	}
} while (!instructions[index].visited);

console.log(accumulator);
```

## Part 2

To solve [Part 2](/08/part2.js), I reran the instructions a bunch of times, each time replacing a `jmp` with a `nop` or vice versa. To make this easier on myself, I took the `do..while`/`switch` setup from Part 1 and put it in a function.

Here, the main question I asked myself was whether to mutate my original set of instructions between and during runs, or to create a deep clone of the instructions for each run. Inspired by modern state management libraries that emphasize nonmutation, I landed on deep cloning — opting not to have to go back and reset my changes to the array between every run. If the array of instructions had been bigger or longer-lived, or if memory was more of a concern, then it'd be more worthwhile to keep all changes in-place.