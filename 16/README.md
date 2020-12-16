# [Day 16](https://adventofcode.com/2020/day/16)

Day 17's input is broken up into three sections: rules, *your* ticket, and a list of nearby tickets. Tickets are comma-separated lists of numbers, corresponding to the provided rules.

```
class: 0-1 or 4-19
row: 0-5 or 8-19
seat: 0-13 or 16-19

your ticket:
11,12,13

nearby tickets:
3,9,18
15,1,5
5,14,9
```

While the rules _are_ consistently ordered for each of the nearby tickets, that order is not the same as the rules section at the top of the input file.

In **Part 1**, you're asked to iterate through each of the nearby tickets and sum up all of the fields that don't fall in _any_ rule's ranges.

In **Part 2**, you need to find the actual order for each rule in the nearby tickets section. For instance, the above input file's tickets have to go `row, class, seat`. Then, you need to multiply together each of the fields in *your* ticket whose rules start with `departure`.

## The Return of Named Capturing Groups

The first piece of the solution required parsing the provided rules into a format we could use. Every rule starts with a name and then provides two possible ranges. This means we have five pieces of information to extract for each rule: the rule's name, the start of the first range, the end of the first range, the start of the second range, and the end of the second range.

I wrote a quick little regex to match that pattern, including [named capturing groups](/02/) to help me more easily extract the information I needed.

```js
/^(?<ruleName>[\w\s]*): (?<range1Start>\d+)-(?<range1End>\d+) or (?<range2Start>\d+)-(?<range2End>\d+)$/
```

From there, I decided to represent each rule as an object with those five properties. As an alternative, I could have represented it as an object with a `ruleName` and a `range` property, where `range` is an array of all numbers found within the array. This wouldn't have been the most memory-efficient solution, but in hindsight, it could have made later "in range" checks much simpler.

## Holy Nested Array Operations, Batman!

I suspect there's probably a more efficient way to solve this problem. As it stands my solution iterates over arrays a _lot_, and often in nested scenarios.

Sketching out the array operations and other loops in each of my solutions, I get:

**Part 1:**

* `ruleSection.split` - split the rules section up into multiple lines
* `.map` - match each rule to the regex, and create an array of rule objects

* `nearbyTickets.split` - split the nearby tickets section up into multiple lines
* `.shift` - remove an excess heading
* `.forEach` - iterate over each ticket
	* `.split` - split a given ticket into each of its fields
		* `.forEach` - iterate over each field
			* `rules.some` - iterate over each rule to determine whether the field is any of the rules' ranges


**Part 2:** (some parts are moved around and don't necessarily reflect the order of the code)

* `ruleSection.split` - split the rules section up into multiple lines
* `.map` - match each rule to the regex, and create an array of rule objects
* `.map` - Create a list of `rules.length` copies of `rules`

* `nearbyTickets.split` - split the nearby tickets section up into multiple lines
* `.shift` - remove an excess heading
* `.filter` - whittle down tickets to only valid tickets
	* `.split` - split a given ticket into each of its fields
		* `.every` - determine whether every field is valid...
			* `.some` - ...by checking that the field matches at least one of the provided rules' ranges

* `for` - iterate over each valid ticket
	* `.split` - split a ticket into its various fields
	* `for` - iterate over each field
		* `ruleOrder[fieldIndex].filter` - whittle down which rules could apply to a given field

* `while` - iterate until each rule has been locked in
	* `ruleOrder.some` - determine whether any rules have not been locked in yet
	* `ruleOrder.filter` - get all locked-in rules
	* `.map` - convert locked-in rules to their rule names
	* `ruleOrder.map` - iterate over rules
		* `.filter` - whittle down rules to the rules that aren't locked-in yet
			* `lockedInRules.includes` - determine whether a given rule is locked-in already

* `yourTicketSection.split` - split the "your ticket" section into its two lines
* `[1].split` - split your ticket into its different fields
* `.map` - convert those fields into numbers

* `for` - iterate over all rules, which are locked-in now

This is a lot of loops and array operations, many of which iterate through the same elements, and I'm confident this could be tightened up and made more efficient. I might play around with that another time.

## Solving Logic Puzzles Programmatically

I thought Part 2 was super fun! The key element of this puzzle is figuring out which rules apply to which ticket fields, sort of like solving a logic puzzle. The question is… how do you write _code_ to solve a logic puzzle like this?

My first approach to solving this looked like:

```js
let ruleOrder = new Array(rules.length);

for (let ticket = 0; ticket < validTickets.length; ticket++) {
	let fields = validTickets[ticket].split(',').map(num => Number(num));
	for (let field = 0; field < fields.length; field++) {
		let fieldValue = fields[field];
		let applicableRules = rules.filter(({range1Start, range1End, range2Start, range2End}) => (range1Start <= fieldValue && fieldValue <= range1End) || (range2Start <= fieldValue && fieldValue <= range2End));
		console.log(field, fieldValue, applicableRules)
		if (applicableRules.length === 1) { // This field could only ever apply to this one rule
			ruleOrder[field] = applicableRules[0].ruleName;
		}
	}
	console.log(ruleOrder)
}
```

In summary, this approach iterates over each field, and if only one rule could apply, that rule is put in its respective index in the `ruleOrder` array. What I learned, however, is that it's completely possible for the rules and fields to be written such that for any given field, multiple rules *could* apply. A working solution really needed to consider which rules were applicable to the other fields. Back to the drawing board.

Instead of adding rules to the `ruleOrder` array when I was certain that's where they belonged, I decided to **disqualify** rules when I was certain they _didn't_ apply.

Let's consider the provided example:

```
class: 0-1 or 4-19
row: 0-5 or 8-19
seat: 0-13 or 16-19

nearby tickets:
3,9,18
15,1,5
5,14,9
```

Before we start iterating through the nearby tickets, the three rules (`class`, `row`, and `seat`) could be in any order. I initalized an array that would duplicate my `rules` array `rules.length` times to reflect this uncertainty.

```
[
	[class, row, seat],
	[class, row, seat],
	[class, row, seat]
]
```

Then, I iterated through the tickets. As I iterated through the tickets, I internally iterated through each of their fields, disqualifying any rules that weren't applicable. For instance, say we start with that first nearby ticket, `3,9,18`. `3` is out of range for the `class` rule, but it's in range for `row` and `seat`. `9` could be in any of the three rules' ranges, so no disqualification here. `18` could likewise be in any of the three rules, so no disqualification here. After the first ticket, my `ruleOrder` array looked like

```
[
	[row, seat],
	[class, row, seat],
	[class, row, seat]
]
```

In the second ticket, `15,1,5`, the `15` is out of the range of `seat`, and the `1` and `5` don't disqualify any of the rules.

```
[
	[row],
	[class, row, seat],
	[class, row, seat]
]
```

In the final ticket, `5,14,9`, the `5` doesn't disqualify any rules, but we already know by now that the first rule has to be `row` anyways. `14` disqualifies the `seat` rule. `9` doesn't disqualify any rules.

At the end of the tickets provided in the input file, we're left with

```
[
	[row],
	[class, row],
	[class, row, seat]
]
```

That's as much information as the input file can give us. We now need to use what we have and start consolidating our rules. First off, we know that `row` has to be the first rule. We can now eliminate `row` from all other fields' rule candidates:

```
[
	[row],
	[class],
	[class, seat]
]
```

After consolidating `row`, we can see that the second rule has to be `class`, so we consolidate `class` candidates:

```
[
	[row],
	[class],
	[seat]
]
```

At this point, each array within `ruleOrder` has exactly one element, so we know we've landed on the final rule order 🙌🏻

We can take this approach and generalize it:

1. **First, assume any rule could be in any spot.** I accomplished this by creating an array of `rules` clones: `let ruleOrder = rules.map(() => [...rules]);`

2. **Iterate through the input tickets, and disqualify as many rules as you can.**
```js
// Rule out certain rules for certain fields using nearby tickets
for (let ticket = 0; ticket < validTickets.length; ticket++) {
	let fields = validTickets[ticket].split(',');
	for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
		let field = Number(fields[fieldIndex]);

		// Perform disqualification
		ruleOrder[fieldIndex] = ruleOrder[fieldIndex].filter((rule) => {
			const {range1Start, range1End, range2Start, range2End} = rule;
			return (range1Start <= field && field <= range1End) || (range2Start <= field && field <= range2End);
		});
	}
}
```

3. **As long as any rules have not been locked in, consolidate by removing locked-in rules as candidates for other fields.**
```js
// Dedupe and apply remaining logic puzzle... logic
while (ruleOrder.some(fieldRules => fieldRules.length > 1)) {
	// Find which rules have already been locked in
	const lockedInRules = ruleOrder.filter(fieldRules => fieldRules.length === 1).map(fieldRule => fieldRule[0].ruleName);

	ruleOrder = ruleOrder.map((fieldRules) => {
		if (fieldRules.length > 1) {
			// Remove any rules which are already locked in
			return fieldRules.filter(rule => !lockedInRules.includes(rule.ruleName));
		} else {
			return fieldRules;
		}
	});
}
```

Once you have the final rule order, you can use it to get the `departure` rules and multiply those fields from your ticket together.

If you hadn't guessed, I had a lot of fun with that one.