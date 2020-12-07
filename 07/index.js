const fs = require('fs');
const rules = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n');

// Assemble tree with given rules
const outerBagRegex = /([\w\s]+\w) bags contain/;
const innerBagRegex = /(?<count>\d+) (?<color>[\w\s]+\w) bags?[,.]/g;

const nestingRules = {};

for (let rule of rules) {
	const outerBag = rule.match(outerBagRegex)[1];
	nestingRules[outerBag] = [];

	const innerBagMatches = rule.matchAll(innerBagRegex);
	for (let match of innerBagMatches) {
		const {count, color} = match.groups;
		nestingRules[outerBag].push({count, color});
	}
}

const allColors = Object.keys(nestingRules);


// Part 1: Determine whether a given bag color can eventually contain a shiny gold bag

/** @type {Object<string, boolean>} */
const containsShinyGoldMemoized = {};

/**
 * Get whether a shiny gold bag could be nested inside a bag of the given color [memoized]
 * @param {string} color bag color
 * @returns {boolean} whether this bag could contain a shiny gold bag
 */
function containsShinyGold(color) {
	// Leverage memoization
	if (containsShinyGoldMemoized[color] !== undefined) {
		return containsShinyGoldMemoized[color];
	}

	const nestedBags = nestingRules[color];
	for (let bag of nestedBags) {
		if (bag.color === 'shiny gold' || containsShinyGold(bag.color)) {
			containsShinyGoldMemoized[color] = true;
			return true;
		}
	}

	containsShinyGoldMemoized[color] = false;
	return false;
}

const allowedNestingCount = allColors.reduce(
	(count, color) => containsShinyGold(color) ? (count + 1) : count, 
	0
);
console.log(allowedNestingCount);



// Part 2: Determine how many bags can be found inside a single shiny gold bag

/** @type {Object<string, number>} */
const countNestedBagsMemoized = {};

/**
 * Gets the total number of bags nested inside the provided color [memoized]
 * @param {string} color bag color
 * @returns {number} count of bags nested inside one bag of the provided color
 */
function countNestedBags(color) {
	if (countNestedBagsMemoized[color] !== undefined) {
		return countNestedBagsMemoized[color];
	}

	const nestedBags = nestingRules[color];
	const nestedBagCount = nestedBags.reduce((count, bag) => {
		return count + (bag.count * (1 + countNestedBags(bag.color)));
	}, 0);

	countNestedBagsMemoized[color] = nestedBagCount;
	return nestedBagCount;
}

console.log(countNestedBags('shiny gold'));