const fs = require('fs');

/** @type {{id: number, grid: string[][], connections: number[]}[]} */
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')
	.map(tileInput => {
		let [tileName, ...lines] = tileInput.split('\n');
		let id = Number(tileName.match(/\d+/));
		let grid = lines.map(line => line.split(''));
		return {id, grid, connections: []};
	});

// Part 1
(function part1() {
	/**
	 * @param {string[][]} grid
	 * @returns {string[]}
	 */
	function getEdges(grid) {
		let top = grid[0].join('');
		let bottom = grid[grid.length - 1].join('');
		let left = grid.reduce((column, row) => column + row[0], '');
		let right = grid.reduceRight((column, row) => column + row[row.length - 1], '');
		return [top, bottom, left, right];
	}

	function compareTileEdges(gridA, gridB) {
		let aEdges = getEdges(gridA);
		let bEdges = getEdges(gridB);
		for (let aEdge of aEdges) {
			for (let bEdge of bEdges) {
				let bEdgeReversed = bEdge.split('').reverse().join('');
				if (aEdge === bEdge || aEdge === bEdgeReversed) {
					return true;
				}
			}
		}
		return false;
	}

	for (let i = 0; i < input.length - 1; i++) {
		let tile = input[i];
		for (let j = i + 1; j < input.length; j++) {
			let comparedTile = input[j];
			let tilesConnect = compareTileEdges(tile.grid, comparedTile.grid);
			if (tilesConnect) {
				tile.connections.push(comparedTile.id);
				comparedTile.connections.push(tile.id);
			}
		}
	}

	let cornerTiles = input.filter(tile => tile.connections.length === 2);
	let cornerTileProduct = cornerTiles.reduce((product, tile) => product * tile.id, 1);
	console.log(cornerTileProduct)
})();


// Part 2
(function part2() {
	
})();