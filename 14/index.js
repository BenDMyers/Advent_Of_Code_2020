const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n');

const bitmaskRegex = /^mask = (?<newBitmask>[X01]*)$/;
const assignmentRegex = /^mem\[(?<address>(\d+))\] = (?<value>\d+)$/;

// Part 1
(function part1() {
	const memory = {};
	let bitmask = '';

	function maskValue(value) {
		const binaryValue = value
			.toString(2)
			.padStart(bitmask.length, '0');
		
		let maskedValue = '';
		for (let i = 0; i < binaryValue.length; i++) {
			if (bitmask[i] === 'X') {
				maskedValue += binaryValue[i];
			} else {
				maskedValue += bitmask[i];
			}
		}

		// let decimal = parseInt(maskedValue, 2);
		// console.table({bitmask, binaryValue, maskedValue, decimal})
		return parseInt(maskedValue, 2);
	}

	for (const line of input) {
		const bitmaskMatch = line.match(bitmaskRegex);
		const assignmentMatch = line.match(assignmentRegex);

		if (bitmaskMatch) {
			const {newBitmask} = bitmaskMatch.groups;
			bitmask = newBitmask;
		} else if (assignmentMatch) {
			const {address, value} = assignmentMatch.groups;
			let maskedValue = maskValue(parseInt(value));
			memory[address] = maskedValue;
		}
	}

	let writtenValues = Object.values(memory).reduce((a, b) => a + b);
	console.log(writtenValues);
})();


// Part 2
(function part2() {
	
})();