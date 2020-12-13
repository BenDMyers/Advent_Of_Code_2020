# [Day 13](https://adventofcode.com/2020/day/13)

Day 13 goes on the record for being the first day so far where you just had to know some mathematical property exists to solve it. More on that later. Your input file consists of two lines. The first line consists of the earliest timestamp you could depart. The second line is a comma-separated list of numbers and `x`'s. Each number represents a bus's schedule—that bus departs every `<amount>` minutes, starting at the epoch timestamp `0`. `x` timestamps are to be taken as unknown, and therefore unimportant.

An example input file would be:

```
939
7,13,x,x,59,x,31,19
```

In this example, the *earliest* you could leave would be at the 939 minute mark. Buses depart every 7, 13, 19, 31, and 59 minutes.

**Part 1** asks you how many minutes you'll have to wait at the bus stop before you can depart, multiplied by that bus's interval.

**Part 2** asks you to find the earliest timestamp where every bus leaves one minute apart. Using the example input file above, we'd be looking for a timestamp `t` such that…
* The 7-minute bus leaves at `t`
* The 13-minute bus leaves at `t + 1`
* Because the next two buses are `x`'s, we don't care about `t + 2` or `t + 3`
* The 59-minute bus leaves at `t + 4`
* Because the next bus is an `x`, we don't care about `t + 5`
* The 31-minute bus leaves at `t + 6`
* The 19-minute bus leaves at `t + 7`

## The Chinese Remainder Theorem

I solved Part 1 pretty quickly, and moved on to trying to solve Part 2. My first attempt was a naïve, brute force approach: I declared a `timestamp` variable, and incremented it until the bus departures aligned. This approach solved the problem's minimal sample inputs, but it fell apart on the full-size input. This is because the departure times get *massive*, exceeding the range of integer. Naïvely iterating until you hit the aligning timestamp will take a long time, and your incremented index would need to be represented as a [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) which could slow things down even further.

I was so sure there had to be a way to calculate this timestamp directly - I just didn't know *how.*

I revisited what I knew. Below, I'm assuming the same sample input file as above.

* If the 7-minute bus leaves at `t`, then `t` is divisible by 7
* Similarly, `t + 1` would be divisible by 13
* `t + 4` is divisible by 59
* `t + 6` is divisible by 31
* `t + 7` is divisible by 19

Phrasing these as [modular congruences](https://en.wikipedia.org/wiki/Modular_arithmetic#Congruence) in a way that would make my linear algebra professor happy:

* t ≡ 0 (mod 7)
* t ≡ -1 (mod 13)
* t ≡ -4 (mod 59)
* t ≡ -6 (mod 31)
* t ≡ -7 (mod 19)

While I wasn't sure where to go from here, this did strike me as solving a system of equations, just in modular arithmetic-land. At this point, I turned to Google and searched "solve system of equations in modular arithmetic." Every result seemed to mention the Chinese remainder theorem, so I followed that thread. Quoting [Brilliant.org's wiki article on the subject](https://brilliant.org/wiki/chinese-remainder-theorem/),

> "The <b>Chinese remainder theorem</b> is a theorem which gives a unique solution to simultaneous linear congruences with coprime moduli. In its basic form, the Chinese remainder theorem will determine a number `p` that, when divided by some given divisors, leaves given remainders."

This was *exactly* what I needed… so long as the bus intervals (my moduli) were coprime, meaning they had no factors in common. I wrote a quick script to calculate their great common divisor to validate the input intervals were coprime, and they were. I had the greenlight to continue with the Chinese remainder theorem.

### Implementing the Chinese Remainder Theorem

While there are [code snippets online implementing the theorem](https://www.geeksforgeeks.org/chinese-remainder-theorem-set-2-implementation/), I found that many of them seemed to use abbreviated variable names, shorthand syntaxes, and confusing reassignments, and I couldn't quite follow what they were doing. While I was comfortable googling to find which algorithm I needed to solve the problem, copying a solution I didn't even understand seemed counter to the point of the puzzle. Instead, I found several resources that each seemed to tackle the different parts of the algorithm approachably, and I was able to distill the parts I liked into code I felt I could read. The one nugget I had to solve was the piece of the algorithm that relied on finding the *modular multiplicative inverse* — but I could abstract that part out to its own function that I could figure out later.

Eventually, my approach to the Chinese remainder theorem looked like this:

```js
let intervalProduct = buses.reduce((product, bus) => product * bus.interval, 1);

let alignmentTime = 0;
for (let i = 0; i < buses.length; i++) {
	let {interval, index} = buses[i];
	let partialProduct = intervalProduct / interval;
	let modularInverse = getModularMultiplicativeInverse(partialProduct, interval);
	alignmentTime += (index * modularInverse * partialProduct);
}

return alignmentTime % intervalProduct;
```

* `intervalProduct` is the product of all buses' intervals.
* A bus's `index` is equal to the interval minus its index in the original list of bus schedules. This is because if *x + i ≡ 0 (mod k)*, then *x ≡ -i (mod k) ≡ k - i (mod k)*.
* `partialProduct` is the product of each of the *other* buses' intervals except the current one.
* The `modularInverse` was abstracted away into its own function, which receives the bus's partial product and its interval.
* The returned value here *is* the timestamp we're after.

### Finding the Modular Multiplicative Inverse

The modular multiplicative inverse of *A (mod C)* is a *B* such that *A⋅B ≡ 1 (mod C)*. In other words, `(A * B) % C === 1`. As it's used in the Chinese remainder theorem, *A* is a given bus's partial product (the product of the other buses' intervals), and *C* is the bus's own interval. The modular inverse exists if and only if *A* and *C* are **coprime** — hence why the Chinese remainder theorem has the coprime stipulation as well. Because all of the bus intervals are coprime, the product of each of the other buses' intervals won't share any factors with the current bus's interval.

Getting the modular multiplicative inverse right proved to be the most challenging part. This is mainly because most modular arithmetic resources recommended using the [*extended Euclidean algorithm*](https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm) to find it, but I couldn't make heads or tails of most of the algorithm descriptions or implementations I found.

I took another step back. What was I trying to do here? I needed to get the modular multiplicative inverse of two numbers, and while the extended Euclidean algorithm might be the optimal approach, it wasn't the only way. I could try my hand at brute-forcing the inverse.

I iterated over every number from 0 to the bus's interval, multiplied that number by the bus's partial product, modulo'd it with the bus's interval, and checked whether the resulting remainder equaled 1:

```js
function getModularMultiplicativeInverse(num, modulo) {
	for (let i = 0; i < modulo; i++) {
		if ((num * i) % modulo === 1) {
			return i;
		}
	}
}
```

This worked like a charm for the small sample inputs, but once again, it buckled under the full-size input file. It didn't buckle because it was slow. This time, it was wrong, and wrong in a precision way.

### `BigInt`s

At this point, my code worked perfectly fine for all of the minimal sample inputs, but was giving incorrect answers for the real deal. With some help from some comments on the [/r/AdventOfCode subreddit's solutions thread](https://www.reddit.com/r/adventofcode/comments/kc4njx/2020_day_13_solutions/gfnu9fq/), I realized I hadn't been using `BigInt` to express large numbers. The inaccurate answers were coming from my numbers falling out of the range of possible integers in JavaScript.

I began retooling my solution to use `BigInt`s, and quickly ran into their very "if you give a mouse a cookie" problem. Once you use `BigInt`s in one place, you pretty much need to use them everywhere. I found it was easiest to initialize every number as a `BigInt`, or to convert the integers I was given into `BigInt`s as early as possible, to avoid doing too much conversion work in the middle of the algorithm.

With `BigInt`s in place, my solution finally passed.

## On Researching Solutions

There is no way I would have arrived at the Chinese remainder theorem without googling for it, and figuring out how to implement it had me looking at a lot of code that already implemented it. Looking at the subreddit or in a Discord server I'm in, there are many Advent of Code participants who feel like this was one of those problems where you just had to already know the magical algorithm to solve it, and I agree.

I don't think looking it up like this took anything away from my enjoyment of the puzzle, though. Real-life coding problems often involve research like this — being able to look for what you need and synthesize the results is a vital part of the job. As it was, even with Google, I had challenges solving the problem:

* I wouldn't have found the Chinese remainder theorem if I hadn't likened the problem to a modular arithmetic version of a system of equations
* Descriptions and implementations of the Chinese remainder theorem or the modular multiplicative inverse were often unclear, and had to be synthesized into something more approachable
* I was at a loss when my solution worked perfectly for the small sample inputs, but not for the full-size input, and I lacked the test data I needed to debug the issue that was ultimately solved with `BigInt`s
* I needed to play around with `BigInt` and apply it all over the place to keep my number types compatible

Even with Google at hand, this whole exercise still took me about three hours to solve.