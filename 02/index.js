const fs = require('fs');
const lines = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(passwordConfig => passwordConfig.match(/(?<minimumFrequency>\d+)\-(?<maximumFrequency>\d+) (?<requiredLetter>\w): (?<password>\w+)/));

// Part 1
let validPasswords = 0;
for (let i = 0; i < lines.length; i++) {
	const {groups} = lines[i];
	const {minimumFrequency, maximumFrequency, requiredLetter, password} = groups;
	let frequency = 0;
	for (let j = 0; j < password.length; j++) {
		if (password[j] === requiredLetter) {
			frequency++;
		}
	}

	if (frequency >= minimumFrequency && frequency <= maximumFrequency) {
		validPasswords++;
	}
}

console.log(validPasswords)