# [Day 7](https://adventofcode.com/2020/day/7)

In Day 7, your input is a list of rules about which bags can be nested inside other bags, like:

```
light red bags contain 1 bright white bag, 2 muted yellow bags.
dark orange bags contain 3 bright white bags, 4 muted yellow bags.
bright white bags contain 1 shiny gold bag.
muted yellow bags contain 2 shiny gold bags, 9 faded blue bags.
shiny gold bags contain 1 dark olive bag, 2 vibrant plum bags.
dark olive bags contain 3 faded blue bags, 4 dotted black bags.
vibrant plum bags contain 5 faded blue bags, 6 dotted black bags.
faded blue bags contain no other bags.
dotted black bags contain no other bags.
```

**Part 1** asks you to find how many bag colors contain a shiny gold bag somewhere in their depths of nesting. **Part 2** asks you how many total bags are nested inside a single shiny gold bag.

When I tried this closer to midnight, I attempted to use a tool I'd used twice before — named capturing groups (see [Day 2](/02/) and [Day 4](/04/)). I came up with a solution using `String.split` that, while functional, I wasn't quite happy with, so I came back and refactored the next day. The [file as you see it today](/07/index.js) is the product of that refactor. The overall approach is the same, especially with regards to the lookup tables and memoization, but the input parsing is much, much cleaner.

## Parsing Input

With each line of input, each rule for nesting, you need to extract two pieces of information:

* The color of the outer bag
* The zero to many varieties of inner bags, including their color and count

At first, I tried to assemble a regex to represent the entire line, complete with the [named capturing groups](https://javascript.info/regexp-groups#named-groups) I'd learned about and used for previous days. At the moment, I was able to use this approach to capture zero or one inner bag, but I couldn't get it to give me multiple inner bags. I abandoned that approach in the night, instead opting to split strings and parse the input that way until I could refactor the code later.

When I was ready to refactor, I researched ways to get all matches of a group and—conveniently enough—stumbled upon `String`'s [`matchAll`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll) method. I found `matchAll` to be most intuitive when I handled the outer bag color and the inner bag details separately, so I split up my regex for the whole line into a regex for each part:

```js
const outerBagRegex = /([\w\s]+\w) bags contain/;
const innerBagRegex = /(?<count>\d+) (?<color>[\w\s]+\w) bags?[,.]/g;
```

From there, I was able to get the single outer bag's color with `rule.match(outerBagRegex)[1]`, and get an array of inner bag matches, complete with named capturing groups, with

```js
const innerBagMatches = rule.matchAll(innerBagRegex);
for (let match of innerBagMatches) {
	const {count, color} = match.groups;
	// ...
}
```

Absolutely no splitting required on my part.

## Trees or Lookup Tables?

As with any Advent of Code puzzle or computer science problem, the data structure used to represent the problem sets the stage for the rest of the solution. The way I saw it, I had two options for representing the rules for nesting colors:

1. **Lookup table:** Each bag gets its own entry in an object — the key is the bag's color and the value is a list of all of the bags that fit inside and their counts.

2. **Tree:** Each bag gets a node which contains references to the bag's children and/or parents.

For now, I've opted to stick with the lookup table approach. This is mainly because assembling a tree out of nodes that show up out of order — like the rules in the provided input file — requires you to store and access those nodes in something like a lookup table anyway.

One approach that I may consider down the road is creating the tree, and giving each node references to its children *and* its parents. That way, given any node, you could find traverse the tree downwards to find out information about its descendants (which would solve Part 2), or you could traverse it upwards to find out information about its ancestors (which would be an optimized approach to Part 1).

## Memoized Recursion

The provided input file defined 594 bag colors, and *most* of those bags contain other bags within them. Once your data structure is finished, it's fixed. That means that once we calculate some truth about a subtree, that'll hold true for the rest of the program's life. In other words, once we know for sure that one bag has a shiny gold bag nested somewhere deep inside it, we shouldn't need to recalculate it. Likewise, if we find out that bag contains 30 bags, that won't change either. Retraversing subtrees won't do us any good, so long as we remember what we've calculated for that subtree. This is where memoization comes in.

The memoization looked something like this:

```js
/** @type {Object<string, boolean>} */
const containsShinyGoldMemoized = {};

/**
 * Get whether a shiny gold bag could be nested inside a bag of the given color [memoized]
 * @param {string} color bag color
 * @returns {boolean} whether this bag could contain a shiny gold bag
 */
function containsShinyGold(color) {
	// Leverage memoization
	if (containsShinyGoldMemoized[color] !== undefined) {
		return containsShinyGoldMemoized[color];
	}

	const nestedBags = nestingRules[color];
	for (let bag of nestedBags) {
		if (bag.color === 'shiny gold' || containsShinyGold(bag.color)) {
			containsShinyGoldMemoized[color] = true;
			return true;
		}
	}

	containsShinyGoldMemoized[color] = false;
	return false;
}
```

If we determine that light red bags contain shiny gold bags as a descendant, we store `'light red': true` inside `containsShinyGoldMemoized`. Like, if we find that dark orange bags never contain shiny gold bags, we stick `'dark orange': false` inside that object. At the start of every invocation of `containsShinyGold()`, we check to see whether our memoization object has the yea or nay on that color already. If so, we return that immediately, instead of wastefully, and probably expensively, retraversing that subtree.