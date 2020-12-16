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