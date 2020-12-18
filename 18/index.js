const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n');

// console.log(input);

// Part 1
(function part1() {
	/**
	 * Finds the first parenthetical sub-expression in the provided
	 * @param {string} expression mathematical expression
	 * @returns {{start: number, end: number, expression: string}} objects representing the first parenthetical expression
	 * 		BEN: You chose the *first* parenthetical because you didn't want to deal with post-replacement indices
	 */
	function getParentheticalExpression(expression) {
		let firstOpenParenthesis = expression.indexOf('(');

		let openParenthesisCount = 0;
		for (let i = firstOpenParenthesis; i < expression.length; i++) {
			if (expression.charAt(i) === '(') {
				openParenthesisCount++;
			} else if (expression.charAt(i) === ')') {
				openParenthesisCount--;
				if (openParenthesisCount === 0) {
					return {
						start: firstOpenParenthesis,
						end: i,
						expression: expression.substring(firstOpenParenthesis + 1, i)
					};
				}
			}
		}

		return {start: firstOpenParenthesis, end: expression.length, expression: expression.slice(firstOpenParenthesis + 1, expression.length)};
	}

	/**
	 * Replaces a substring of a provided string with a new substring, based on indices
	 * @param {string} original whole string to start out with
	 * @param {number} start starting index to splice out
	 * @param {number} end ending index to splice out
	 * @param {string} newSubstring new substring to splice in
	 */
	function replaceSubstring(original, start, end, newSubstring) {
		let before = original.slice(0, start);
		let after = original.slice(end + 1);
		return before + newSubstring + after;
	}

	/**
	 * 
	 * @param {string} expression mathematical expression
	 * @returns {number} value of expression
	 */
	function evaluate(expression) {
		// Step 1: Find and evaluate all parenthetical expressions
		let hasParenthetical = expression.includes('(');
		while (hasParenthetical) {
			let parenthetical = getParentheticalExpression(expression);
			let evaluatedParenthetical = evaluate(parenthetical.expression);
			expression = replaceSubstring(expression, parenthetical.start, parenthetical.end, evaluatedParenthetical);
			hasParenthetical = expression.includes('(');
		}

		// Step 2: There are no more parentheticals in this expression, so evaluate left-to-right
		let terms = expression.split(' ');
		let value = Number(terms[0]); // set initial value
		let currentOperand = '';
		for (let i = 1; i < terms.length; i++) {
			if (terms[i] === '+') {
				currentOperand = '+';
			} else if (terms[i] === '*') {
				currentOperand = '*';
			} else {
				let term = Number(terms[i]);
				if (currentOperand === '+') {
					value += term;
				} else {
					value *= term;
				}
			}
		}

		// console.log({expression, value})
		return value;
	}

	let sumOfAllExpressions = 0;
	input.forEach((expression) => {
		sumOfAllExpressions += evaluate(expression);
	});
	console.log(sumOfAllExpressions);
})();


// Part 2
(function part2() {
	
})();