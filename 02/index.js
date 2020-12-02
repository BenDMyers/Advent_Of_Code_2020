const fs = require('fs');
const lines = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(passwordConfig => passwordConfig.match(/(?<leftBound>\d+)\-(?<rightBound>\d+) (?<requiredLetter>\w): (?<password>\w+)/));

// Part 1
let validFrequencyPasswords = 0;
for (let i = 0; i < lines.length; i++) {
	const {groups} = lines[i];
	const {leftBound, rightBound, requiredLetter, password} = groups;
	let frequency = 0;
	for (let j = 0; j < password.length; j++) {
		if (password[j] === requiredLetter) {
			frequency++;
		}
	}

	if (frequency >= leftBound && frequency <= rightBound) {
		validFrequencyPasswords++;
	}
}

console.log(validFrequencyPasswords)


// Part 2
let validPositionalPasswords = 0;
for (let i = 0; i < lines.length; i++) {
	const {groups} = lines[i];
	const {leftBound, rightBound, requiredLetter, password} = groups;

	if ((password[leftBound - 1] === requiredLetter) ^ (password[rightBound - 1] === requiredLetter)) {
		validPositionalPasswords++;
	}
}

console.log(validPositionalPasswords)