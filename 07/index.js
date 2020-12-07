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