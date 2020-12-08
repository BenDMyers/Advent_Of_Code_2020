const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n');

// Part 2
const originalInstructions = input.map(instruction => {
	const [operation, argument] = instruction.split(' ');
	return {
		operation,
		argument: Number.parseInt(argument),
		visited: false
	};
});

/**
 * Get the accumulator, if the instructions successfully terminate
 * @param {{operation: string, argument: string, visited: boolean}[]} instructions
 * @returns {number|false} the accumulator, if the instructions successfully terminate, and false otherwise
 */
function getTermination(instructions) {
	let accumulator = 0;
	let index = 0;

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
	} while (index < instructions.length && !instructions[index].visited);

	if (index >= instructions.length) {
		return accumulator;
	} else {
		return false;
	}
}

for (let i = 0; i < originalInstructions.length; i++) {
	if (originalInstructions[i].operation === 'acc') {
		continue;
	}

	// Create a parallel dimension version of `originalInstructions` where this one `jmp` was a `nop` or vice versa

	/** @type {{operation: string, argument: string, visited: boolean}[]} */
	const deepClone = JSON.parse(JSON.stringify(originalInstructions));
	deepClone[i].operation = (deepClone[i].operation === 'jmp') ? 'nop' : 'jmp';

	// Put the parallel dimension to the test
	const termination = getTermination(deepClone);
	if (termination !== false) {
		console.log(termination);
		break;
	}
}