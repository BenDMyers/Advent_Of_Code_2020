const fs = require('fs');

let [unprocessedRules, messages] = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')
	.map(line => line.split('\n'));

let maxMessageLength = messages.reduce((max, message) => Math.max(max, message.length), 0);

// Replace Rules 8 and 11
let rule8 = unprocessedRules.findIndex(rule => rule.startsWith('8:'));
let rule11 = unprocessedRules.findIndex(rule => rule.startsWith('11:'));
unprocessedRules[rule8] = '8: 42 | 42 8';
unprocessedRules[rule11] = '11: 42 31 | 42 11 31';

// Set up every rule's regex
let ruleDefinition = /^(?<ruleNumber>\d+): ("(?<character>\w)"|(?<refs>[\d\s\|]+))$/;
let rules = new Array(unprocessedRules.length);
while (unprocessedRules.length > 3) {
	// We're planning to remove elements from `unprocessedRules` while we iterate.
	// However, removing elements while evaluating left-to-right is a recipe for out-of-sync indices.
	// Iterating right-to-left lets us remove freely without having to sync our indices.
	// See https://coderwall.com/p/prvrnw/remove-items-from-array-while-iterating-over-it
	for (let i = unprocessedRules.length - 1; i >= 0; i--) {
		// console.log(i, unprocessedRules[i])
		let {ruleNumber, character, refs} = unprocessedRules[i].match(ruleDefinition).groups;
		let index = Number(ruleNumber);

		if ([0, 8, 11].includes(index)) continue;

		if (character) {
			rules[index] = character;
			unprocessedRules.splice(i, 1);
		} else {
			// Ensure every subrule has already been defined before trying to create this rule's regex
			let subrulesAreDefined = refs.match(/\d+/g).every((subruleNumber) => {
				let subruleIndex = Number(subruleNumber);
				return rules[subruleIndex];
			});

			if (subrulesAreDefined) {
				let options = refs.split(' | ');
				let rule = options.reduce((concatenatedGroups, option) => {
					let subrules = option
						.match(/\d+/g)
						.map((subruleNumber) => {
							let subruleIndex = Number(subruleNumber);
							// console.log(subruleIndex, rules[subruleIndex])
							return rules[subruleIndex];
						})
						.join('|');
					return `${concatenatedGroups}(${subrules})`;
				}, '');

				rules[index] = rule;
				unprocessedRules.splice(i, 1);
			}
		}
	}
}

let rule31 = rules[31];
let rule42 = rules[42];
rules[8] = `(${rule42})+`;
let rule11Options = [];
for (let i = 1; i < maxMessageLength; i++) {
	rule11Options.push(`((${rule42}){${i}}(${rule31}){${i}})`);
}
rules[11] = `(${rule11Options.join('|')})`;

rules[0] = `(${rules[8]}|${rules[11]})`;
while (rules[0].includes('(a|a)') || rules[0].includes('(b|b)')) {
	rules[0] = rules[0].replace(/\(a\|a\)/g, 'a');
	rules[0] = rules[0].replace(/\(b\|b\)/g, 'b');
	rules[0] = rules[0].replace(/\(a\)/g, 'a');
	rules[0] = rules[0].replace(/\(b\)/g, 'b');
}

console.log(rules[0])
let rule0 = new RegExp(`^${rules[0]}$`);

let matches = messages.filter(message => rule0.test(message));
console.log(matches);
console.log(matches.length)