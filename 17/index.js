const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(line => line.split(''));

// console.log(input);

// Part 1
(function part1() {
	/** @type {Object<string, {x: number, y: number, z: number}>} */
	let conwayCube = {};

	// Populate Conway cube with initial configs
	for (let y = input.length - 1; y >= 0; y--) {
		for (let x = 0; x < input[y].length; x++) {
			if (input[y][x] === '#') {
				conwayCube[`(${x}, ${y}, 0)`] = {x, y, z: 0};
			}
		}
	}

	console.log(conwayCube);

	/**
	 * Gets how many neighboring cells of a given cell are active
	 * @param {number} cellX the x coordinate of the current cell
	 * @param {number} cellY the y coordinate of the current cell
	 * @param {number} cellZ the z coordinate of the current cell
	 * @returns {number} the number of active neighbors
	 */
	function getActiveNeighbors(cellX, cellY, cellZ) {
		let activeNeighbors = 0;
		for (let x = cellX - 1; x <= cellX + 1; x++) {
			for (let y = cellY - 1; y <= cellY + 1; y++) {
				for (let z = cellZ - 1; z <= cellZ + 1; z++) {
					let isOrigin = (x === cellX) && (y === cellY) && (z === cellZ);
					if (conwayCube[`(${x}, ${y}, ${z})`] && !isOrigin) {
						activeNeighbors++;
					}
				}
			}
		}
		return activeNeighbors;
	}

	// Step through 6 iterations of the Conway cube
	for (let i = 0; i < 6; i++) {
		let activeCells = Object.values(conwayCube);
		let newConwayCube = {};

		// Get the ranges for the next iteration of the cube
		let minX = activeCells[0].x;
		let maxX = activeCells[0].x;
		let minY = activeCells[0].y;
		let maxY = activeCells[0].y;
		let minZ = activeCells[0].z;
		let maxZ = activeCells[0].z;

		for (let cell of activeCells) {
			minX = Math.min(minX, cell.x);
			maxX = Math.max(maxX, cell.x);
			minY = Math.min(minY, cell.y);
			maxY = Math.max(maxY, cell.y);
			minZ = Math.min(minZ, cell.z);
			maxZ = Math.max(maxZ, cell.z);
		}

		// Iterate through every possible cell in the new range and determine activity
		for (let x = minX - 1; x <= maxX + 1; x++) {
			for (let y = minY - 1; y <= maxY + 1; y++) {
				for (let z = minZ - 1; z <= maxZ + 1; z++) {
					let activeNeighbors = getActiveNeighbors(x, y, z);

					if (conwayCube[`(${x}, ${y}, ${z})`]) { // Cell was already active
						if (activeNeighbors === 2 || activeNeighbors === 3) {
							newConwayCube[`(${x}, ${y}, ${z})`] = {x, y, z};
						}
					} else { // Cell was inactive
						if (activeNeighbors === 3) {
							newConwayCube[`(${x}, ${y}, ${z})`] = {x, y, z};
						}
					}
				}
			}
		}

		conwayCube = newConwayCube;
	}

	console.log(Object.values(conwayCube).length);
})();


// Part 2
(function part2() {
	/** @type {Object<string, {x: number, y: number, z: number, w: number}>} */
	let conwayCube = {};

	// Populate Conway cube with initial configs
	for (let y = input.length - 1; y >= 0; y--) {
		for (let x = 0; x < input[y].length; x++) {
			if (input[y][x] === '#') {
				conwayCube[`(${x}, ${y}, 0, 0)`] = {x, y, z: 0, w: 0};
			}
		}
	}

	console.log(conwayCube);

	/**
	 * Gets how many neighboring cells of a given cell are active
	 * @param {number} cellX the x coordinate of the current cell
	 * @param {number} cellY the y coordinate of the current cell
	 * @param {number} cellZ the z coordinate of the current cell
	 * @param {number} cellW the w coordinate of the current cell, representing its hypercube
	 * @returns {number} the number of active neighbors
	 */
	function getActiveNeighbors(cellX, cellY, cellZ, cellW) {
		let activeNeighbors = 0;
		for (let x = cellX - 1; x <= cellX + 1; x++) {
			for (let y = cellY - 1; y <= cellY + 1; y++) {
				for (let z = cellZ - 1; z <= cellZ + 1; z++) {
					for (let w = cellW - 1; w <= cellW + 1; w++) {
						let isOrigin = (x === cellX) && (y === cellY) && (z === cellZ) && (w === cellW);
						if (conwayCube[`(${x}, ${y}, ${z}, ${w})`] && !isOrigin) {
							activeNeighbors++;
						}
					}
				}
			}
		}
		return activeNeighbors;
	}

	// Step through 6 iterations of the Conway cube
	for (let i = 0; i < 6; i++) {
		let activeCells = Object.values(conwayCube);
		let newConwayCube = {};

		// Get the ranges for the next iteration of the cube
		let minX = activeCells[0].x;
		let maxX = activeCells[0].x;
		let minY = activeCells[0].y;
		let maxY = activeCells[0].y;
		let minZ = activeCells[0].z;
		let maxZ = activeCells[0].z;
		let minW = activeCells[0].w;
		let maxW = activeCells[0].w;

		for (let cell of activeCells) {
			minX = Math.min(minX, cell.x);
			maxX = Math.max(maxX, cell.x);
			minY = Math.min(minY, cell.y);
			maxY = Math.max(maxY, cell.y);
			minZ = Math.min(minZ, cell.z);
			maxZ = Math.max(maxZ, cell.z);
			minW = Math.min(minW, cell.w);
			maxW = Math.max(maxW, cell.w);
		}

		// Iterate through every possible cell in the new range and determine activity
		for (let x = minX - 1; x <= maxX + 1; x++) {
			for (let y = minY - 1; y <= maxY + 1; y++) {
				for (let z = minZ - 1; z <= maxZ + 1; z++) {
					for (let w = minW - 1; w <= maxW + 1; w++) {
						let activeNeighbors = getActiveNeighbors(x, y, z, w);
	
						if (conwayCube[`(${x}, ${y}, ${z}, ${w})`]) { // Cell was already active
							if (activeNeighbors === 2 || activeNeighbors === 3) {
								newConwayCube[`(${x}, ${y}, ${z}, ${w})`] = {x, y, z, w};
							}
						} else { // Cell was inactive
							if (activeNeighbors === 3) {
								newConwayCube[`(${x}, ${y}, ${z}, ${w})`] = {x, y, z, w};
							}
						}
					}
				}
			}
		}

		conwayCube = newConwayCube;
	}

	console.log(Object.values(conwayCube).length);
})();