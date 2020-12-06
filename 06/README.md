# [Day 6](https://adventofcode.com/2020/day/6)

Day 6's input gives you several groups. Each group has several lines of characters:

```
obgv
bvo
orgvb
xpvsboau
bov
```

In **Part 1**, you need to find the number of *unique* characters within each group. For instance, there 10 unique characters in the group above: `o`, `b`, `g`, `v`, `r`, `x`, `p`, `s`, `a`, and `u`. Then, tally up those counts across all provided groups.

**Part 2** is similar to **Part 1**, except you need to find the number of characters found on *every* line. In the example above, the only unanimous letters are `o`, `b`, and `v`.

Because this problem involved lists where *uniqueness* mattered, I decided to use [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set). The only problem is that [JavaScript's `Set` doesn't have methods for set operations](https://2ality.com/2015/01/es6-set-operations.html) like union, intersection, difference, etc. - you have to roll your own implementation of the operations using a mix of `Set` and array functionality.

**Part 1**, which wants the total unique characters across all lines in the group, is a *union* problem. Instead of creating a union operation, I circumvented the need for that by converting the whole group to one before splitting it up into an array of characters.

**Part 2**, which wants the total unique characters which appear on every line in the group, is an *intersection* problem. To get the `Set` of characters that appeared on every line in a group, I `reduce`d over the array of lines, performing an intersection operation with each new line. That looked like:

```js
const unanimousAnswers = allAnswers.reduce((consensus, answers) => {
	const uniqueAnswers = new Set(answers.split(''));
	return intersection(consensus, uniqueAnswers);
}, firstSetOfAnswers);
```

`intersection` here is a custom implementation of the intersection operation that, under the hood, array-ifies both `Set`s and uses `filter`:

```js
function intersection(a, b) {
	return new Set([...a].filter(aItem => b.has(aItem)));
}
```