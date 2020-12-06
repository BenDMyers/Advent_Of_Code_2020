const fs = require('fs');
const groups = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')

// Part 1
const groupUniqueAnswerSum = groups.reduce((sum, group) => {
	const answers = group.replace(/\n/g, '').split('');
	const uniqueAnswers = new Set(answers);
	return sum + uniqueAnswers.size;
}, 0);

console.log(groupUniqueAnswerSum);