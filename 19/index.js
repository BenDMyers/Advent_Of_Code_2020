const {comparators} = require('generate-comparators');
const fs = require('fs');
let [rules, messages] = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')
	.map(line => line.split('\n'));

const characterRegex = /^"(?<character>\w)"$/;
const ruleRegex = /^(?<index>\d+):/;

const byRuleNumber = comparators((rule) => {
	const {index} = rule.match(ruleRegex).groups;
	return Number(index);
});

rules = rules
	.sort(byRuleNumber.asc)
	.map(rule => rule.slice(rule.indexOf(':') + 2));


// Part 1
(function part1() {
	/** @type {Object<string, string[]>} */
	const memoizedRules = {};

	/**
	 * 
	 * @param {number} ruleIndex rule number from the provided input
	 * @returns {string[]} all possible expressions that could apply to a given rule
	 */
	function evaluateRule(ruleIndex) {
		// Memoization
		if (memoizedRules[ruleIndex]) {
			// console.log(ruleIndex, 'memo', memoizedRules[ruleIndex]);
			return memoizedRules[ruleIndex];
		}

		let rule = rules[ruleIndex];

		// Handle rules which resolve to single characters, such as `"a"`
		let characterMatch = rule.match(characterRegex);
		if (characterMatch) {
			const {character} = characterMatch.groups;
			memoizedRules[ruleIndex] = [character];
			// console.log(ruleIndex, 'char', [character]);
			return [character];
		}

		// Handle rules which reference other rules
		let ruleOptions = rule.split(' | ');
		let possibleMessages = ruleOptions.map((ruleOption) => {
			let [firstSubrule, ...subrules] = ruleOption.split(' ');
			let optionMessages = subrules.reduce((messagePrefixes, subrule) => {
				let subruleSuffixes = evaluateRule(subrule);
				let messages = [];

				for (let prefix of messagePrefixes) {
					for (let suffix of subruleSuffixes) {
						messages.push(prefix + suffix);
					}
				}

				return messages.flat();
			}, evaluateRule(firstSubrule));

			return optionMessages;
		}).flat();

		memoizedRules[ruleIndex] = possibleMessages;
		// console.log(ruleIndex, 'refs', possibleMessages)
		return possibleMessages;
	}

	let validCandidates = evaluateRule(0);
	let sumOfValidExpressions = messages.reduce((sum, message) => {
		if (validCandidates.includes(message)) return sum + 1;
		else return sum;
	}, 0);
	console.log(sumOfValidExpressions);
})();


// Part 2
(function part2() {
	
})();