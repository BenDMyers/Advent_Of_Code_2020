const fs = require('fs');
const {rotate} = require('2d-array-rotation');

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

let cornerTiles;

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

// Part 1
(function part1() {
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
	console.log(cornerTileProduct)
})();


// Part 2
(function part2() {
	let gridLength = Math.sqrt(input.length);
	let tilePositions = new Array(gridLength).fill(new Array(gridLength));
	
	// Place and rotate the first corner
	let firstCorner = cornerTiles[0];
	let firstCornerOrientation = firstCorner.connections.map((connectionId) => {
		let connectedTile = input.find(tile => (tile.id === connectionId));
		return compareTileEdges(firstCorner.grid, connectedTile.grid);
	});
	let onTheTop = firstCornerOrientation.includes('top');
	let onTheBottom = firstCornerOrientation.includes('bottom');
	let onTheLeft = firstCornerOrientation.includes('left');
	let onTheRight = firstCornerOrientation.includes('right');

	if (onTheTop && onTheRight) {
		firstCorner.grid = rotate(firstCorner.grid, 90);
	} else if (onTheTop && onTheLeft) {
		firstCorner.grid = rotate(firstCorner.grid, 180);
	} else if (onTheBottom && onTheLeft) {
		firstCorner.grid = rotate(firstCorner.grid, 270);
	}

	tilePositions[0][0] = firstCorner;
	
	// Place and rotate everything else from the first row so it lines up with the tile to its left
	for (let i = 1; i < gridLength; i++) {
		let previousTile = cornerTiles[i - 1];
		let currentTileId = previousTile.connections.find((connectedTile) => {
			let currentTile = input.find(tile => (tile.id === connectedTile));
			return compareTileEdges(previousTile.grid, currentTile.grid) === 'right';
		});
		let currentTile = input.find(tile => (tile.id === currentTileId));
		let currentTileConnectedEdge = compareTileEdges(currentTileId.grid, previousTile.grid);
		if (currentTileConnectedEdge === 'bottom') {
			currentTile.grid = rotate(currentTile.grid, 90);
		} else if (currentTileConnectedEdge === 'right') {
			currentTile.grid = rotate(currentTile.grid, 180);
		} else if (currentTileConnectedEdge === 'top') {
			currentTile.grid = rotate(currentTile.grid, 270);
		}
		tilePositions[0][i] = currentTile;
	}
})();