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

	/**
	 * Applies the current bitmask to the provided value.
	 * A `0` or `1` in the bitmask overrides the given bit in the `value`.
	 * An `X` preserves the `value`'s given bit at that spot.
	 * @param {number} value value to be masked, not yet bitstringed
	 * @returns {number} masked value, parsed as an integer
	 */
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

	/**
	 * Applies the current bitmask to the provided memory address.
	 * A `0` in the bitmask means the corresponding memory address bit is unchanged.
	 * A `1` means the corresponding memory address bit is set to `1`.
	 * An `X` means that bit is **floating** — i.e. it will later be treated as _both_ `0` and `1`.
	 * @param {number} address a memory address, not yet bitstringed
	 * @returns {string} the masked address, which _may_ contain `X`'s
	 */
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
	 * When a masked address's bit has an `X`, it is **floating**, meaning the value will be saved
	 * at both the address where the `X` was a `0` and the address where that `X` was a `1`.
	 * This function recursively calculates all possible addresses a floating address could map to.
	 * @param {string} maskedAddress
	 * @returns {string[]} list of every bitstring address a floating address could map to
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