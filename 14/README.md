# [Day 14](https://adventofcode.com/2020/day/14)

In Day 14's puzzle, your input file is a list of instructions. `mask` instructions set the program's current bitmask — a line of 32 `0`'s, `1`'s, and `X`'s. `mem` instructions command the program to store a value at some address in its memory.

A sample input file might look like:

```
mask = 000000000000000000000000000000X1001X
mem[42] = 100
mask = 00000000000000000000000000000000X0XX
mem[26] = 1
```

Before the value can be assigned to memory, however, the program's current bitmask has to be applied. The rules for applying bitmasks are different for Part 1 and Part 2.

In **Part 1**, the bitmask is applied to the *value* before it is saved to memory. Wherever an `X` is found in the bitmask, the corresponding bit in the value is left unchanged. Whenever the bitmask has a `0` or `1`, it replaces the corresponding bit in the value.

In **Part 2**, the bitmask is instead applied to the *memory address*. Wherever a `0` is found in the bitmask, the memory address's corresponding bit is left unchanged. Wherever the bitmask has a `1`, the corresponding bit in the memory address is replaced with a `1`. Finally, `X`'s in the bitmask mean that the corresponding address bit is **floating**. Floating bits must be treated as both `0` _and_ `1`. As an example if the masked address comes back as `X10X`, then the value should be saved at `0100`, `0101`, `1100`, and `1101`.

## Juggling Quasi-Bitstrings

One big challenge that came with Day 14 was managing two different formats — decimal integers and bitstrings. The bitmasks, however, were not *true* bitmasks representing binary numbers. Some of the "bits" were actually `X`'s — so perhaps the bitmasks should be described as [trit](https://en.wikipedia.org/wiki/Ternary_numeral_system)strings. Because the masks' `X`'s didn't correspond to `0` or `1`, the bitmask couldn't be parsed into a number. This meant that to apply a mask to either a value, the value had to be converted to a bitstring first, and it would stay a bitstring until all operations requiring the bitmask were finished.

To convert a number to its bitstring, I used its [`toString`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toString) method, passing it a `2` so it would output a number in base-2.

Comparing two bitstrings with different lengths is doable, but I find the logic much easier to wrap my head around when the strings are the same length. I opted to pad my numbers' bitstrings with leading zeroes until it matched the bitmask's length. Recalling [the `left-pad` incident](https://blog.npmjs.org/post/141577284765/kik-left-pad-and-npm), I decided to see whether `left-pad` had been implemented directly in JavaScript yet — and, to my surprise, it had with [`padStart`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart). I could have homebrewed a solution for that, but it's always nice when the language you're using has the utilities you need.

This meant that any number I applied the bitmask to underwent the following changes first:

```js
const binaryValue = value
	.toString(2) // format as binary number
	.padStart(bitmask.length, '0'); // prepend leading zeroes so it matches the bitmask's length
```

From there, I was free to loop through the bitstrings together, and compare each bit's/trit's value as needed.

## Finding Floating Addresses

Part 2 gives us addresses that, when masked, could have "floating" bits. This means that values must be stored at the address where that bit was a `0` _and_ the address where that bit was a `1`. For instance, a masked address of `X10X` would correspond to the memory addresses `0100`, `0101`, `1100`, and `1101`.

I saw this as a branching problem: if you start with `X10X`, you need to find all possible addresses for `010X` and `110X`. It branches even more as you add more and more floating bits into the mix. This kind of branching felt like a great opportunity for recursion.

I wrote a recursive function called `getFloatingAddresses` that would take a masked address and return an array of strings. The base case was whenever no `X`'s were left, in which case the function would return an array that only contained the provided address. The recursive case happened whenever the address had at least one `X`. The function would call itself twice—once with the first `X` replaced with a `0`, and once with the first `X` replaced with a `1`.

```js
/**
 * When a masked address's bit has an `X`, it is **floating**, meaning the value will be saved
 * at both the address where the `X` was a `0` and the address where that `X` was a `1`.
 * This function recursively calculates all possible addresses a floating address could map to.
 * @param {string} maskedAddress
 * @returns {string[]} list of every bitstring address a floating address could map to
 */
function getFloatingAddresses(maskedAddress) {
	if (!maskedAddress.includes('X')) return [maskedAddress];
	else return [
		...getFloatingAddresses(maskedAddress.replace('X', '0')),
		...getFloatingAddresses(maskedAddress.replace('X', '1')),
	];
}
```

The call chain for getting all addresses corresponding to `X10X` is:

* `getFloatingAddresses('X10X')`
	* Calls `getFloatingAddresses('010X')`
		* Calls `getFloatingAddresses('0100')`
			* Returns `['0100']`
		* Calls `getFloatingAddresses('0101')`
			* Returns `['0101']`
		* Returns `['0100', '0101']`
	* Calls `getFloatingAddresses('110X')`
		* Calls `getFloatingAddresses('1100')`
			* Returns `['1100']`
		* Calls `getFloatingAddresses('1101')`
			* Returns `['1101']`
		* Returns `['1100', '1101']`
	* Returns `['0100', '0101', '1100', '1101']`

Those addresses are then collated into a single array that can be iterated over.