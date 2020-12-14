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
	const memory = {};
	let bitmask = '';

	function maskAddress(address) {
		const binaryAddress = address
			.toString(2)
			.padStart(bitmask.length, '0');

		let maskedAddress = '';
		for (let i = 0; i < binaryAddress.length; i++) {
			if (bitmask[i] === '0') {
				maskedAddress += binaryAddress[i];
			} else {
				maskedAddress += bitmask[i];
			}
		}

		return maskedAddress;
	}

	/**
	 * 
	 * @param {string} maskedAddress 
	 */
	function getFloatingAddresses(maskedAddress) {
		if (!maskedAddress.includes('X')) return [maskedAddress];
		else return [
			...getFloatingAddresses(maskedAddress.replace('X', '0')),
			...getFloatingAddresses(maskedAddress.replace('X', '1')),
		];
	}

	for (const line of input) {
		const bitmaskMatch = line.match(bitmaskRegex);
		const assignmentMatch = line.match(assignmentRegex);

		if (bitmaskMatch) {
			const {newBitmask} = bitmaskMatch.groups;
			bitmask = newBitmask;
		} else if (assignmentMatch) {
			const {address, value} = assignmentMatch.groups;
			let maskedAddress = maskAddress(parseInt(address));
			let floatingAddresses = getFloatingAddresses(maskedAddress);
			floatingAddresses.forEach(addr => memory[addr] = Number(value));
		}
	}

	let writtenValues = Object.values(memory).reduce((a, b) => a + b);
	console.log(writtenValues);
})();