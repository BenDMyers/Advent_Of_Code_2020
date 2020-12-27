const fs = require('fs');

const [unprocessedRules, messages] = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')
	.map(line => line.split('\n'));

const characterRegex = /^(?<rule>\d+): "(?<character>\w)"$/;
const nestedRulesRegex = /^(?<rule>\d+): (?<subrules>[\d\s\|]+)$/;

/** @type {Map<string, string>} */
const resolvedRegexes = new Map();

// Start with the character assignments
unprocessedRules
	.filter(characterRule => characterRegex.test(characterRule))
	.forEach(characterRule => {
		const {rule, character} = characterRule.match(characterRegex).groups;
		resolvedRegexes.set(rule, character);
	});

// Then handle the rules that reference other rules
let recursiveRules = unprocessedRules
	.filter(nestedRule => nestedRulesRegex.test(nestedRule))
	// .filter(nestedRule => ['0:', '8:', '11:'].every(ruleNumber => !nestedRule.startsWith(ruleNumber)));

while (recursiveRules.length > 0) {
	for (let i = recursiveRules.length - 1; i >= 0; i--) {
		const {rule, subrules} = recursiveRules[i].match(nestedRulesRegex).groups;
		const allSubrulesResolved = subrules.match(/\d+/g).every(subrule => resolvedRegexes.has(subrule));
		if (allSubrulesResolved) {
			let joinedRegex;
			if (subrules.includes('|')) {
				joinedRegex = subrules
					.split(' | ')
					.map(subset => subset.match(/\d+/g).map(subrule => resolvedRegexes.get(subrule)).join(''))
					.map(group => `(${group})`)
					.join('|');
				joinedRegex = `(${joinedRegex})`;
			} else {
				joinedRegex = `${subrules.match(/\d+/g).map(subrule => resolvedRegexes.get(subrule)).join('')}`;
			}

			resolvedRegexes.set(rule, joinedRegex);
			recursiveRules.splice(i, 1);
		}
	}
}

console.log(resolvedRegexes)

// Build up Rules 8 and 11
// let rule31 = resolvedRegexes.get('31');
// let rule42 = resolvedRegexes.get('42');

// let rule8 = `(${rule42}+)`;
// let rule11 = ``;

// // Build Rule 0 and test the messages
// // let rule0 = new RegExp(`^${rule8}|${rule11}$`);
let rule0 = new RegExp(resolvedRegexes.get(0));
let matchingMessageCount = messages.filter(message => rule0.test(message)).length;
console.log(matchingMessageCount);

// ((((b(a(bb|ab)|b((a|b)(a|b)))|a(b(bb)|a(bb|a(a|b))))b|(((aa|ab)a|(bb)b)b|(((a|b)a|bb)a)a)a))(((b(a(bb|ab)|b((a|b)(a|b)))|a(b(bb)|a(bb|a(a|b))))b|(((aa|ab)a|(bb)b)b|(((a|b)a|bb)a)a)a)(b(b(a(ba)|b(aa))|a(b(ab|(a|b)a)|a(ba|ab)))|a(b((ab|(a|b)a)b|((a|b)a|bb)a)|a((ba)b|(ba|bb)a)))))