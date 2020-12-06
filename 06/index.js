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

// Part 2
/**
 * Gets the intersection of two `Set`s
 * @param {Set<String>} a first `Set`
 * @param {Set<String>} b second `Set`
 * @returns {Set<String>} intersection of `a` and `b` (a `Set` of every element in both `a` and `b`)
 */
function intersection(a, b) {
	return new Set([...a].filter(aItem => b.has(aItem)));
}

const groupUnanimousAnswerSum = groups.reduce((sum, group) => {
	const allAnswers = group.split('\n');
	const firstSetOfAnswers = new Set(allAnswers[0].split(''));

	const unanimousAnswers = allAnswers.reduce((consensus, answers) => {
		const uniqueAnswers = new Set(answers.split(''));
		return intersection(consensus, uniqueAnswers);
	}, firstSetOfAnswers);

	return sum + unanimousAnswers.size;
}, 0);

console.log(groupUnanimousAnswerSum);