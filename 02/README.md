# [Day 2](https://adventofcode.com/2020/day/2)

Day 2's puzzle gives you a list of password configurations, in the format:

```
1-3 a: abcde
```

In other words

```
<leftBound>-<rightBound> <requiredLetter>: <password>
```

**Part 1** asks you to find how many `password`s have their `requiredLetter` at *least* `leftBound` times and at *most* `rightBound` times. For example, `1-3 a: abcde` is a valid password if `a` appears in `abcde` 1, 2, or 3 times.

**Part 2** is similar to Part 1, except here, a password is valid if the `requiredLetter` shows up *either* at index `leftBound + 1` or at index `rightBound + 1`, but not both.

I initially wrote up the following regex to split up my required values with [capturing groups](https://javascript.info/regexp-groups):

```js
/(\d+)-(\d+) (\w): (\w+)/
```

This regex will return four capturing groups:

1. A series of digits (`\d+`), representing `leftBound`
2. A series of digits (`\d+`), representing `rightBound`
3. A single alphanumeric character (`\w`), representing `requiredLetter`
4. A series of alphanumeric characters (`\w+`), representing `password`

The other punctuation and spacing are all stripped away.

I decided to retool this regex a bit to support [named capturing groups](https://javascript.info/regexp-groups#named-groups). It made the regex a little longer (shown below), but I also thought that the destructuring of these groups to variables felt a *little* more robust to me.

```js
/(?<leftBound>\d+)\-(?<rightBound>\d+) (?<requiredLetter>\w): (?<password>\w+)/
```

Part 2 has the stipulation that the letter must show up at *one* of the indices, but not both. This is a perfect use case for the [`XOR` operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_XOR)… which I had to look up the syntax for since it's been so long since I've used it.

An alternative solution could have looked like:

```js
const atFirstIndex = password[leftBound - 1] === requiredLetter;
const atSecondIndex = password[rightBound - 1] === requiredLetter;

if ((atFirstIndex || atSecondIndex) && !(atFirstIndex && atSecondIndex)) {
	validPositionalPasswords++;
}
```

I like the `^` operator's succinctness here.