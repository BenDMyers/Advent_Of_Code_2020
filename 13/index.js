const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n');

// Part 1
(function part1() {
	const earliestDeparture = Number(input[0]);
	const buses = input[1]
		.split(',')
		.map(num => Number(num))
		.filter(num => Number.isInteger(num));

	let wait = 0;
	while (!buses.find(period => ((earliestDeparture + wait) % period === 0))) {
		wait++;
	}

	let busNumber = buses.find(period => ((earliestDeparture + wait) % period === 0));
	console.log(busNumber * wait);
})();


// Part 2
(function part2() {
	/**
	 * The modular inverse of `A mod C` is a number `B` such that `AB mod C === 1`, assuming `A` and `C` are coprime.
	 * Given that `A` and `C`, this finds that `B`.
	 * @param {BigInt} num
	 * @param {BigInt} modulo
	 * @returns {BigInt} the modular inverse of `num MOD modulo`
	 */
	function getModularMultiplicativeInverse(num, modulo) {
		for (let i = 0n; i < modulo; i++) {
			if ((num * i) % modulo === 1n) {
				return i;
			}
		}
	}

	/**
	 * Applies the Chinese Remainer Theorem to get alignment timestamp
	 * @see https://www.geeksforgeeks.org/chinese-remainder-theorem-set-2-implementation/
	 * @param {{interval: BigInt, index: BigInt}[]} buses list of all buses with scheduled arrival intervals
	 * @returns {BigInt} time at which all buses arrive `index` minutes apart
	 */
	function getAlignmentTime(buses) {
		let intervalProduct = buses.reduce((product, bus) => product * bus.interval, 1n);

		let alignmentTime = 0n;
		for (let i = 0; i < buses.length; i++) {
			let {interval, index} = buses[i];
			let partialProduct = BigInt(intervalProduct / interval);
			let modularInverse = getModularMultiplicativeInverse(partialProduct, interval);
			alignmentTime = alignmentTime + (index * modularInverse * partialProduct);
		}

		return alignmentTime % BigInt(intervalProduct);
	}

	/** @type {{interval: number, index: number}[]} */
	const buses = input[1]
		.split(',')
		.reduce((scheduledBuses, bus, index) => {
			let interval = Number(bus);
			if (Number.isInteger(interval)) {
				scheduledBuses.push({
					index: BigInt(interval - index),
					interval: BigInt(interval)}
				);
			}
			return scheduledBuses;
		}, []);

	let alignmentTime = getAlignmentTime(buses);
	console.log(alignmentTime)
})();