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
	/** @type {{ruleName: string, range1End: string, range1Start: string, range2End: string, range2Start: string}[]} */
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

	const validTickets = nearbyTickets.filter((ticket) => {
		const fields = ticket.split(',');
		return fields.every((field) => {
			let fieldValue = Number(field);
			return rules.some(({range1Start, range1End, range2Start, range2End}) => (range1Start <= fieldValue && fieldValue <= range1End) || (range2Start <= fieldValue && fieldValue <= range2End));
		});
	});

	let ruleOrder = rules.map(() => [...rules]);

	// Rule out certain rules for certain fields using nearby tickets
	for (let ticket = 0; ticket < validTickets.length; ticket++) {
		let fields = validTickets[ticket].split(',');
		for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
			let field = Number(fields[fieldIndex]);
			ruleOrder[fieldIndex] = ruleOrder[fieldIndex].filter((rule) => {
				const {range1Start, range1End, range2Start, range2End} = rule;
				return (range1Start <= field && field <= range1End) || (range2Start <= field && field <= range2End);
			});
		}
	}

	// Dedupe and apply remain logic puzzle... logic
	while (ruleOrder.some(fieldRules => fieldRules.length > 1)) {
		const lockedInRules = ruleOrder.filter(fieldRules => fieldRules.length === 1).map(fieldRule => fieldRule[0].ruleName);
		ruleOrder = ruleOrder.map((fieldRules) => {
			if (fieldRules.length > 1) {
				return fieldRules.filter(rule => !lockedInRules.includes(rule.ruleName));
			} else {
				return fieldRules;
			}
		});
	}

	// Add up the value of the "departure" fields on your ticket
	let yourTicket = yourTicketSection.split('\n')[1].split(',').map(num => Number(num));
	let yourDepartureFields = 1;

	for (let i = 0; i < ruleOrder.length; i++) {
		let {ruleName} = ruleOrder[i][0];
		if (ruleName.includes('departure')) {
			yourDepartureFields *= yourTicket[i];
		}
	}

	console.log(yourDepartureFields);
})();