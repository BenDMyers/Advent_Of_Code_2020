const fs = require('fs');

/**
 * @typedef {string[][]} Tile 10x10 grid of characters representing a piece of the map
 */

/** @type {{id: number, grid: Tile, connections: number[]}[]} */
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')
	.map(tileInput => {
		let [tileName, ...lines] = tileInput.split('\n');
		let id = Number(tileName.match(/\d+/));
		let grid = lines.map(line => line.split(''));
		return {id, grid, connections: []};
	});

let cornerTiles;

/**
 * @param {Tile} grid get all borders of the current tile
 * @returns {string[]} list of all borders, in order of top, bottom, left, right
 */
function getEdges(grid) {
	let top = grid[0].join('');
	let bottom = grid[grid.length - 1].join('');
	let left = grid.reduce((column, row) => column + row[0], '');
	let right = grid.reduceRight((column, row) => column + row[row.length - 1], '');
	return [top, bottom, left, right];
}

/**
 * Determines if and how two map tiles can connect
 * @param {Tile} gridA a map tile
 * @param {Tile} gridB another map tile
 * @returns {'top'|'bottom'|'left'|'right'|false} the edge of A that connects to B
 */
function compareTileEdges(gridA, gridB) {
	console.log({gridA, gridB})
	let orientations = ['top', 'bottom', 'left', 'right'];
	let aEdges = getEdges(gridA);
	let bEdges = getEdges(gridB);
	for (let a = 0; a < aEdges.length; a++) {
		let aEdge = aEdges[a];
		for (let b = 0; b < bEdges.length; b++) {
			let bEdge = bEdges[b];
			let bEdgeReversed = bEdge.split('').reverse().join('');
			if (aEdge === bEdge || aEdge === bEdgeReversed) {
				return orientations[a];
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

cornerTiles = input.filter(tile => tile.connections.length === 2);
let cornerTileProduct = cornerTiles.reduce((product, tile) => product * tile.id, 1);
console.log(cornerTileProduct);