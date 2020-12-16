const fs = require('fs');
const [ruleSection, yourTicketSection, nearbyTicketSection] = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n');

const ruleRegex = /^(?<ruleName>[\w\s]*): (?<range1Start>\d+)-(?<range1End>\d+) or (?<range2Start>\d+)-(?<range2End>\d+)$/;

// Part 1
(function part1() {
	const rules = ruleSection.split('\n').map(line => {
		const {ruleName, range1Start, range1End, range2Start, range2End} = line.match(ruleRegex).groups;
		return {
			ruleName,
			range1Start: Number(range1Start),
			range1End: Number(range1End),
			range2Start: Number(range2Start),
			range2End: Number(range2End)
		};
	});

	const nearbyTickets = nearbyTicketSection.split('\n');
	nearbyTickets.shift(); // remove the "nearby tickets:" header

	let errorRate = 0;
	nearbyTickets.forEach((ticket) => {
		const fields = ticket.split(',');
		fields.forEach((field) => {
			let fieldValue = Number(field);
			let inRange = rules.some(({range1Start, range1End, range2Start, range2End}) => {
				return (range1Start <= fieldValue && fieldValue <= range1End) || (range2Start <= fieldValue && fieldValue <= range2End);
			});
			if (!inRange) {
				errorRate += fieldValue;
			}
		});

	});

	console.log(errorRate);
})();


// Part 2
(function part2() {
	
})();