# [Day 4](https://adventofcode.com/2020/day/4)

**I have my original solutions for Parts 1 and 2 in [`index.js`](/04/index.js) like usual, but I also have an improved solution for Part 2 in [`improved.js`](/04/improved.js). Feel free to check them out!**

In Day 4's challenge, your input file contains a bunch of passport configurations, separated by blank lines. These passport configurations might each look something like:

```
ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm
```

An individual passport configuration could have any or all of the properties `byr`, `iyr`, `eyr`, `hgt`, `hcl`, `ecl`, `pid`, or `cid`. These properties could appear in any order, and might be separated by spaces or single newlines. 

**Part 1** asks you to count all the passport inputs that have all of the properties (`cid` is optional). **Part 2** places stringent requirements on the value of these properties (`hcl` must be a valid color hexcode, `ecl` must match an enum, `byr` should be a year between `1920` and `2002`, and so forth).

## Original Solutions

While working on Part 1, I suspected that Part 2 would need to leverage regexes. However, in the spirit of moving quickly and avoiding hasty, premature optimizations, I opted to use a tool that seemed simplest: [a bunch of `startsWith` checks](/04/index.js#L12).

When Part 2 revealed extra stipulations on each property, I could have continued to find regexless solutions. I could have `split` each property by its `:` and parsed numbers, or created functions to validate each property. However, I wanted to try my hand at regex.

I considered building a "one regex to rule them all," but then realized that accounting for each group appearing in order was, at the time, outside of my realm of knowledge. Again, in the spirit of rapid prototyping, I ended up with a hybrid of my solution to part 1 and a bunch of mini, one-off regex checks:

```js
let stricterPassports = 0;
for (const passport of input) {
	const byr = passport.find(cred => cred.match(/byr:(19[2-9]\d|2000|2001|2002)$/))
	const iyr = passport.find(cred => cred.match(/iyr:(201\d|2020)$/))
	const eyr = passport.find(cred => cred.match(/eyr:(202[0-9]|2030)$/))
	const hgt = passport.find(cred => cred.match(/hgt:(1[5-8]\dcm|190cm|191cm|192cm|193cm|59in|6\din|7[0-6]in)$/))
	const hcl = passport.find(cred => cred.match(/hcl:#[0-9a-f]{6}$/))
	const ecl = passport.find(cred => cred.match(/ecl:(amb|blu|brn|gry|grn|hzl|oth)$/))
	const pid = passport.find(cred => cred.match(/pid:\d{9}$/))

	if (byr && iyr && eyr && hgt && hcl && ecl && pid) {
		stricterPassports++
	}
}
console.log(stricterPassports)
```

This approach benefitted from my approach to splitting up the input file. I first `split` on `\n\n`, to get an array of all provided passport configuration candidates. I then mapped over this array, and `split` each passport candidate by `/[\s\n]/` - in other words, by spaces or newlines. This meant I had an array of arrays of passport key–value pairs. In hindsight, I should have `split` by `\b`, and leverage regex's built in word boundary detection.

Because each key–value pair was now split up into its own string without any of the surrounding cruft like spaces, I was able to take advantage of regex's `$` operator, to denote the end of the string. This prevented me from matching configurations with extra characters. For instance, `/pid:\d{9}$/` matches only strings that terminate after nine digits. If a passport's `pid` instead had 10 or more digits, the match would fail.

While this solution worked, and successfully solved Part 2, the approach still felt mildly unholy to me. Specifically, the use of multiple `passport.find(cred => cred.match(<some regex>))` checks felt like an improper use of both arrays *and* regexes. I felt like there had to be a way to check the whole passport configuration, as a single string, just one time with a single regex.

That's where the [`improved.js`](/04/improved.js) script comes in.

## Improved Solution

`improved.js` starts with a key difference in the file parsing: passport configuration strings are no longer split up by word boundaries — instead, they remain whole strings. That way, I could meet my goal of checking each passport's conformance with a single regex check.

Doing a single regex check also requires a single regex. Out of concerns that a single, super-long regex would quickly become inscruptable and therefore undebuggable, I decided to find a solution for breaking up my regular expression into multiple lines. From what I could tell, the most straightforward way to split up my regex into multiple lines was to build it with [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp). I was able to break each property's slice of the overall regex into its own line, which helped readability and debuggability immensely. [Read more about what I learned about debugging this mega-regex.](#regexp-and-debugging-regexes)

Because the properties could come in any order, I decided to revisit [named capturing groups](https://javascript.info/regexp-groups#named-groups). This decision ended up being *huge* for making this solution work. It increased debuggability, but giving printable names to every matched groups, and I could see which group names were coming up with `undefined` instead. Also, I suspect that multiple matches for the same name would collide, ensuring that properties aren't double-counted.

Getting the `RegExp`-built regex to work was the meat of this improved solution. Additionally, I retooled the `for` loop I had used for my initial solution into a `reduce`, more to try a different approach than for any particular benefit.

## Lessons Learned

Today's puzzle was a huge exercise in regexes and debuggability for me. Through each phase of solving the puzzles, I encountered multiple bugs that would have been a challenge to just eyeball in the code. This became a problem especially as more and more property checks were added in, complicating the number of ways the program could go wrong.

### `RegExp` and Debugging Regexes

This was my first time building up a regular expression with [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp), instead of using regex literals! I found that breaking each property on its own line made the expression much more readable and, as a plus, I was able to comment out different properties' regex slices to debug. I will definitely take this to heart going forward, in case I need to write long regular expressions going forward.

One difference between the `RegExp`-based construction and the regex literals I had been writing earlier was that I was writing each piece of the `RegExp` construction as a _string_ literal. This led to two bugs that took a while to figure out:

First, when converting from the mini-regexes of earlier solutions to the string literals used for `RegExp`, I forgot to escape my checks for digits. Instead of `\\d`, I still had `\d`. The string literals interpreted this as escaping the letter `d`, so instead of checking for digits, it was checking for the letter `d`. When I realized none of my property checks that used `\d` were finding any matches, I haphazardly replaced the `\d` with `[0-9]`. Suddenly, the checks were working again. It took a while before I realized that the initial problem was that I hadn't escaped the backslash 🤦🏻‍♂️

Secondly, because each property was in the one big passport configuration string, I could rely on the end-of-string `$` operator. I remembered to remove the `$` from each piece of the regex, but I didn't account for a replacement. This meant that my regexes were matching cases that had extra characters than what was allowed. For instance, the `pid` property was supposed to have exactly nine digits. `\d{9}` will look for sequences with nine digits, but that'll also end up matching sequences with 10 or more digits because it's successfully finding the first nine digits. The solution was to replace the `$` with word boundary checks (`\b`).

Finding that second problem was... painful. I couldn't see a reason why my attempt at an improved, one-regex-to-rule-them-all solution was finding *slightly* more solutions than my initial solutions. I ended up spinning up a `for` loop where I ran both solutions at the same time, and I set it break when the two solutions found a discrepancy, and log the offending passport and its successfully matched properties.

### Debugging Long Lists

In [my initial pass at a solution for Part 2](/04/index.js#L28), I destructured the findings from each named capture group into its own variable. Logging all of those properties to find what's wrong would have created an inscrutable infodump, though.

There are probably better ways to do this, but I came up with a way with some whimsy: using color-coded emojis to mark properties that did not match the respective regex patterns:

```js
console.table({
	byr: byr || `🦑 ${passport.find(cred => cred.startsWith('byr'))}`,
	iyr: iyr || `🥕 ${passport.find(cred => cred.startsWith('iyr'))}`,
	eyr: eyr || `🍋 ${passport.find(cred => cred.startsWith('eyr'))}`,
	hgt: hgt || `🦖 ${passport.find(cred => cred.startsWith('hgt'))}`,
	hcl: hcl || `🧿 ${passport.find(cred => cred.startsWith('hcl'))}`,
	ecl: ecl || `☂ ${passport.find(cred => cred.startsWith('ecl'))}`,
	pid: pid || `🌸 ${passport.find(cred => cred.startsWith('pid'))}`
})
```

This log uses `console.table` to print out the provided object in a structured format. Since every passport candidate had its own `console.table` call, each passport's details were clearly delineated in my terminal.

Whenever a property did *not* match its prescribed regex pattern, the `console.table` prepends that property's value with a colorful emoji. This made it easy to eyeball nonmatches in the terminal, and judge whether they were meant to fail or be false positives.

The end result was that my terminal looked like this:

![Screenshot of terminal, which has output boxes for each password. Some property entries are marked with colorful emojis.](https://i.imgur.com/rqQIs06.png)

I don't know that I'll do this kind of log again anytime soon, but it was cute this time!

## Further Opportunities

One thing I tried several times and just couldn't get to work was using the regex [`test()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test) method, combined with [quantifiers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Quantifiers), to get a single pass/fail boolean value if all seven required properties matched. If I could get this to work, it would clean up my `reduce` a lot, as I'd be able to do something like:

```js
let regexGroupMatchedPassports = input.reduce((matchCount, passport) => (theAllRegex.test(passport) ? matchCount + 1 : matchCount), 0);
```