const fs = require('fs');
const rules = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')

////// Part 1
const innerBagRegex = /[\d\s]+(?<color>[\w\s]+) bag[s]*/g;

// Parse the provided rules - figure out which bags can go in which other bags
const allowedNesting = {};
for (const rule of rules) {
	const [outerBag, allInnerBags] = rule.split(' bags contain ');
	if (!allowedNesting[outerBag]) {
		allowedNesting[outerBag] = [];
	}

	if (allInnerBags !== 'no other bags.') {
		let matches;
		while (matches = innerBagRegex.exec(allInnerBags)) {
			allowedNesting[outerBag].push(matches[1]);
		}
	}
}

// Traverse all provided colors, and figure out whether they can eventually carry shiny gold
const memoized = {};
function canContainShinyGoldBag(color) {
	if (memoized[color] !== undefined) {
		return memoized[color];
	}

	if (allowedNesting[color].includes('shiny gold')) {
		memoized[color] = true;
		return true;
	}

	for (let i = 0; i < allowedNesting[color].length; i++) {
		if (canContainShinyGoldBag(allowedNesting[color][i])) {
			memoized[color] = true;
			return true;
		}
	}

	return false;
}

Object.keys(allowedNesting).forEach(canContainShinyGoldBag);
console.log(memoized)

// Count up how many starting bags could carry shiny gold
console.log(Object.values(memoized).filter(memo => memo === true).length);

////// Part 2

// Parse how many of each bag goes in any particular bag
const nestedBagCounts = {};
for (const rule of rules) {
	const [outerBag, allInnerBags] = rule.split(' bags contain ');
	if (!nestedBagCounts[outerBag]) {
		nestedBagCounts[outerBag] = [];
	}

	allInnerBags
		.split(/\sbag[s,.\s]*/) // split the list of nested colors into just the count and the color name
		.filter(s => s) // remove any empty elements
		.forEach(bagCount => {
			const matches = bagCount.match(/(\d+)\s(.*)/);
			if (matches) {
				const [, count, color] = matches;
				nestedBagCounts[outerBag].push({color, count});
			}
		});
}

const memoizedBagCounts = {};
function getNumberOfNestedBags(color) {
	if (memoizedBagCounts[color] !== undefined) {
		return memoizedBagCounts[color];
	}

	let count = 0;
	for (let nested of nestedBagCounts[color]) {
		count += (nested.count * getNumberOfNestedBags(nested.color));
	}

	return count + 1;
}

const totalBags = getNumberOfNestedBags('shiny gold') - 1;
console.log(totalBags)