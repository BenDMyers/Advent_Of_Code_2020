const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('')
	.map(num => Number(num));

console.log(input);

// Part 1
(function part1() {
	let cups = [...input];
	let currentCup = cups[0];

	for (let i = 0; i < 100; i++) {
		let cupCopy = [...cups];

		let currentCupIndex = cups.indexOf(currentCup);

		// Pick up three cups, wrapping around if need be
		let pickedUp = cups.splice(currentCupIndex + 1, 3);
		pickedUp.push(...cups.splice(0, 3 - pickedUp.length));

		// Determine new destination for current cup
		let destination = currentCup - 1;
		while (!cups.includes(destination)) {
			console.log('whee')
			destination--;
			if (destination <= 0) {
				console.log(destination, input.length, destination + input.length)
				destination = input.length;
			} 
		}
		let destinationIndex = cups.indexOf(destination);

		// Insert picked up cups right after the destination
		cups.splice(destinationIndex + 1, 0, ...pickedUp);

		console.table({move: i + 1, cups: cupCopy, pickedUp, destination, currentCup});

		// Pick new current cup
		currentCup = cups[(cups.indexOf(currentCup) + 1) % input.length];
	}

	let indexOf1 = cups.indexOf(1);
	let after1 = cups.slice(indexOf1 + 1);
	let before1 = cups.slice(0, indexOf1);
	console.log([...after1, ...before1].join(''))
})();


// Part 2
(function part2() {
	
})();