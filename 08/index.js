const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n');

// Part 1
let accumulator = 0;
let index = 0;

const instructions = input.map(instruction => {
	const [operation, argument] = instruction.split(' ');
	return {
		operation,
		argument: Number.parseInt(argument),
		visited: false
	};
});

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