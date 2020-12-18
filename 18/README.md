# [Day 18](https://adventofcode.com/2020/day/18)

In Day 18, your input file consists of a bunch of mathematical expressions with addition, multiplication, and parentheses such as:

```
(9 + (5 + 2 + 2 * 4) * (7 + 7 * 5 * 3) + 7) + 2 + 4 * 2 + 3 * (8 + 5)
3 + 5 + (9 + 2 * 5) + (6 * 4 + 8) * 9 + 3
6 + 4 * ((4 * 8 * 3 * 5) + 8 * 6 + 7 + 6 * (3 + 5 + 6 * 4)) * 2 * 7
4 * (9 * 2) + 2 + (3 + 2 * 5 * (5 * 3 + 9 * 5 * 9) + 4 + 9)
(9 * (7 * 7 * 2 + 3 + 8 + 8) + 5 + 5) + 9 * 6
4 + (2 + 2 * 6 + 3 * (9 * 8 * 3) * 2) * 2 * (8 + 7 * 3 * 9 + 2 + 4) + 7 + (4 * 7 + 3 + 2 + 4)
…
```

The goal is to evaluate each of these expressions and add up their totals. The problem is that PEMDAS doesn't apply here. In **Part 1**, addition and multiplication have the same precedence, and must be evaluated from left to right. In **Part 2**, addition has a higher operator precedence than multiplication.

## Parentheses and Recursion

Looking at the problem, I decided that the first thing I wanted to tackle was parentheses. This is because parentheses are expressions _within_ expressions, and they can contain their own parentheses, which contain _their_ own expressions, and on and on. If I were iterating through the whole expression from left to right, that kind of nesting would make parsing accurately very, very difficult — and so, parentheses had to come first. The fact that parentheticals _are_ expressions, let alone expressions which can contain parentheticals of their own, made them an ideal use case for recursion.

To tackle parentheses, I set up a `while` loop that would go for as long as the provided `expression` still had at least one `(` character. Inside this while loop, I…

1. Found the contents of the first set of parentheses in the expression.
2. Evaluated that first parenthetical as an expression.
3. Replaced the parenthetical's substring in `expression` with the value returned in step 2.

If the parenthetical found in step 1 contained parentheticals of its own, then step 2, which calls `evaluate` on the parenthetical, will recursively find those nested parentheticals and evaluate _them_. This way, I was able to tackle an arbitrary depth of parentheses.

As an example, take the initial expression `1 + (2 * 3) + (4 * (5 + 6))`. This `while` loop would do the following:

* Find the first remaining parenthetical, `(2 * 3)`
	* Evaluate the expression: `2 * 3` = `6`
	* Substitute that value into the expression in place of the parenthetical: `1 + (2 * 3) + (4 * (5 + 6))` becomes `1 + 6 + (4 * (5 + 6))`
* Find the first remaining parenthetical: `(4 * (5 + 6))`
	* Evaluate the expression `4 * (5 + 6)`
		* Find the first remaining parenthetical: `(5 + 6)`
			* Evaluate the expression: `5 + 6` = `11`
			* Substitute that value into the expression in place of the parenthetical: `4 * (5 + 6)` becomes `4 * 11`
	* Substitute that value into the expression in place of the parenthetical: `1 + 6 + (4 * (5 + 6))` becomes `1 + 6 + 44`

Finally, the expression has no more parentheses, and can be evaluated as it is: `1 + 6 + 44` = `51`.

The code to make all that happen, aside from the addition and multiplication parts, is below 👇🏻

```js
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

	// Just in case the parenthetical goes all the way to the end…
	return {
		start: firstOpenParenthesis,
		end: expression.length,
		expression: expression.slice(firstOpenParenthesis + 1, expression.length)
	};
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
 * Evaluates a mathematical expression with addition, multiplication, and parentheses, assuming that
 * addition and multiplication have equal precedences.
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

	// TODO: Handle addition and multiplication
}
```

## Custom Orders of Operations

With parenthetical recursion squared away, I was free to tackle addition and multiplication.

In **Part 1**, addition and multiplication have the same operator precedence, meaning the expression must be evaluated from left to right.

To accomplish this, I split my newly parenthesisless expression into an array of numbers and operators, so `1 + 2 * 3` would become `['1', '+', '2', '*', '3']`. I then used this loop to iterate through each of the numbers, find the operator which came before them, and apply that operation:

```js
for (let i = 2; i < terms.length; i += 2) {
	let term = Number(terms[i]);
	let operator = terms[i - 1];
	if (operator === '+') {
		value += term;
	} else {
		value *= term;
	}
}
```

This loop works because the numbers in the expression will be at all the even indices!

This loop brought the overall `evaluate` function to:

```js
/**
 * Evaluates a mathematical expression with addition, multiplication, and parentheses, assuming that
 * addition and multiplication have equal precedences.
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
	for (let i = 2; i < terms.length; i += 2) {
		let term = Number(terms[i]);
		let operator = terms[i - 1];
		if (operator === '+') {
			value += term;
		} else {
			value *= term;
		}
	}

	return value;
}
```

**Part 2**, where addition has a higher precedence than multiplication, required a moderately different approach. I still split up the expression into an array of numbers and operators, but from there, I tackled addition and multiplication separately.

To tackle addition, I set up a `while` loop that would go until my `terms` array had no more `+`'s. This loop would find the index of the first remaining `+`, get the numbers to either side of it, and add them together. Then it would splice that sum back into `terms` in place of the two summands and the `+`. That loop looked like:

```js
while (terms.includes('+')) {
	let firstPlus = terms.indexOf('+');
	let summand1 = Number(terms[firstPlus - 1]);
	let summand2 = Number(terms[firstPlus + 1]);
	terms.splice(firstPlus - 1, 3, summand1 + summand2);
}
```

Once this loop was finished, the only operations that remained were all multiplication. I was able to `reduce` over the remaining elements and multiply them together:

```js
let value = terms.reduce((product, value) => {
	if (value === '*') {
		return product;
	} else {
		return product * Number(value);
	}
}, 1);
```

This meant that my `evaluate` function for Part 2 looked like:

```js
/**
 * Evaluates a mathematical expression with addition, multiplication, and parentheses, assuming that
 * addition has a higher precedence than multiplication.
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

	// Step 2: There are no more parentheticals in this expression, so evaluate additions
	let terms = expression.split(' ');

	while (terms.includes('+')) {
		let firstPlus = terms.indexOf('+');
		let summand1 = Number(terms[firstPlus - 1]);
		let summand2 = Number(terms[firstPlus + 1]);
		terms.splice(firstPlus - 1, 3, summand1 + summand2);
	}

	// Step 3: Resolve multiplication
	let value = terms.reduce((product, value) => {
		if (value === '*') {
			return product;
		} else {
			return product * Number(value);
		}
	}, 1);

	return value;
}
```

Next time, I'll stick to PEMDAS! 😄