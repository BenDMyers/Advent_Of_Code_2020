const fs = require('fs');

let [unprocessedRules, messages] = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')
	.map(line => line.split('\n'));

let rules = new Array(unprocessedRules.length);

// Handle character rules
let characterRegex = /^(?<ruleNumber>\d+): "(?<character>\w)"$/;
for (let i = unprocessedRules.length - 1; i >= 0; i--) {
	let rule = unprocessedRules[i];
	if (characterRegex.test(rule)) {
		let {ruleNumber, character} = rule.match(characterRegex).groups;
		let ruleIndex = Number(ruleNumber);
		rules[ruleIndex] = character;
		unprocessedRules.splice(i, 1);
	}
}

// Handle rules which reference other rules
while (unprocessedRules.length > 0) {
	for (let i = unprocessedRules.length - 1; i >= 0; i--) {
		let rule = unprocessedRules[i];
		// console.log(rule)
		let [ruleNumber, ruleDefinition] = rule.split(': ');
		let ruleIndex = Number(ruleNumber);

		let allSubrulesDefined = ruleDefinition.match(/\d+/g).every(subrule => rules[Number(subrule)]);
		if (!allSubrulesDefined) continue;

		if (ruleDefinition.includes('|')) {
			console.log('giraffe', ruleIndex, ruleDefinition);
			let subruleOptions = ruleDefinition.split(' | ');
			let evaluatedSubruleOptions = subruleOptions.map(option => assembleSubrules(...option.split(' ')));
			if (evaluatedSubruleOptions[0] === evaluatedSubruleOptions[1]) {
				rules[ruleIndex] = evaluatedSubruleOptions[0];
				console.log('pipe', ruleIndex, rules[ruleIndex]);
			} else {
				rules[ruleIndex] = `(${evaluatedSubruleOptions.join('|')})`;
				console.log('clean', ruleIndex, rules[ruleIndex]);
			}
		} else {
			console.log('donkey', ruleIndex, ruleDefinition)
			rules[ruleIndex] = assembleSubrules(ruleDefinition.split(' '));
		}

		unprocessedRules.splice(i, 1);
	}
}

function assembleSubrules(...subrules) {
	return subrules
		.map(subrule => rules[Number(subrule)])
		.join('');
}

console.log(rules);