# [Day 22](https://adventofcode.com/2020/day/22)

Day 22 involves a game called Combat that definitely, totally is not the same as War.

Your input file consists of two players' decks, which might look something like:

```
Player 1:
9
2
6
3
1

Player 2:
5
8
4
7
10
```

In **Part 1**, you follow the usual rules of ~~War~~ **Combat**. Both players draw the first card in their deck. The player with the higher number wins the round, and adds the winning card followed by the losing card to the bottom of their deck. Keep going until one player is out of cards and the other player holds all the cards.

**Part 2** introduces *Recursive* Combat, where Combat rounds have the potential to spin up _nested_ Combat games. The winner of those nested games decides the winner of that round.

> * The game consists of a series of rounds with a few changes:
> * Before either player deals a card, if there was a previous round in this game that had exactly the same cards in the same order in the same players' decks, the game instantly ends in a win for player 1. Previous rounds from other games are not considered. (This prevents infinite games of Recursive Combat, which everyone agrees is a bad idea.)
> * Otherwise, this round's cards must be in a new configuration; the players begin the round by each drawing the top card of their deck as normal.
> * If both players have at least as many cards remaining in their deck as the value of the card they just drew, the winner of the round is determined by playing a new game of Recursive Combat (see below).
> * Otherwise, at least one player must not have enough cards left in their deck to recurse; the winner of the round is the player with the higher-value card.
> As in regular Combat, the winner of the round (even if they won the round by winning a sub-game) takes the two cards dealt at the beginning of the round and places them on the bottom of their own deck (again so that the winner's card is above the other card). Note that the winner's card might be the lower-valued of the two cards if they won the round due to winning a sub-game. If collecting cards by winning the round causes a player to have all of the cards, they win, and the game ends.

## Keeping My Recursive Ducks in a Row

One big takeaway is that in Recursive Combat, each **game** has multiple **rounds**, and each **round** may spin up a nested **game**. Because nested games use **cloned** subsets of each player's hand, the only thing a round needs to know about the game nested inside it is which player won.

I decided to express this game/round/nested-game relationship like this:

```js
// Play through an entire game of Recursive Combat
function playRecursiveCombat(player1, player2) {

	// Each iteration of this `while` loop is its own round
	while (player1.length > 0 && player2.length > 0) {
		
		// Call `playRecursiveCombat` in here if a subgame is needed

	}

	return winner;
}
```

This structure was hugely helpful for me, because it allowed me to make a clear delineation between **game** logic and **round** logic:

* A **game** iterates until one hand is empty, and returns a winner. Expressing games as a function allowed me to perform recursion, and to return values.
* A **round**, which is a single iteration of the `while` loop manipulates both players' hands, and may spin up a nested game, but it doesn't return any values.

This delineation helped me keep my recursive ducks in a row.

## Memoizing Rounds

> * Before either player deals a card, if there was a previous round in this game that had exactly the same cards in the same order in the same players' decks, the game instantly ends in a win for player 1. Previous rounds from other games are not considered.

Each game only needs to track its own history. Parent games don't care about any of their subgames' rounds. Subgames don't care about their parents' rounds. Because of this, it made sense to create a game's history just inside `playRecursiveCombat`:

```js
// Play through an entire game of Recursive Combat
function playRecursiveCombat(player1, player2) {
	/**
	 * Create memoized history of past rounds' hands
	 * @type {Map<string, string[]>}
	 */
	let memoizedRounds = new Map();

	// Each iteration of this `while` loop is its own round
	while (player1.length > 0 && player2.length > 0) {
		// Call `playRecursiveCombat` in here if a subgame is needed
	}

	return winner;
}
```

For tracking round histories, I decided I'd track key–value pairs. The _keys_ would be stringified versions of Player 1's hand. The _values_ would be arrays of stringified versions of Player 2's hand. For instance, say for one round, Player 1's hand is `[8, 1]` and Player 2's hand is `[5, 2, 9]`. In another round, Player 1 has `[8, 1]` again, but Player 2 has `[9, 2, 5]`. The memoized history would include:

```js
'8,1': ['5,2,9', '9,2,5']
```

When you want to check whether a hand configuration has come up before, you first check whether the history has a key for Player 1's hand, and then check whether that array has a value that matches Player 2's hand.

This key–value relationship can be handled pretty straightforwardly using JavaScript's objects, but remembering [the performance issues I had with objects during Day 15](https://github.com/BenDMyers/Advent_Of_Code_2020/tree/master/15#maps-over-objects), I decided to opt for [`Map`s](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) again instead.

The overall memoization approach looked like:

```js
// Play through an entire game of Recursive Combat
function playRecursiveCombat(player1, player2) {
	/**
	 * Create memoized history of past rounds' hands
	 * @type {Map<string, string[]>}
	 */
	let memoizedRounds = new Map();

	// Each iteration of this `while` loop is its own round
	while (player1.length > 0 && player2.length > 0) {
		// Check memoized history
		let serializedPlayer1 = player1.toString();
		let serializedPlayer2 = player2.toString();
		if (memoizedRounds.has(serializedPlayer1) && memoizedRounds.get(serializedPlayer1).includes(serializedPlayer2)) {
			return 1;
		}

		// Memoize this hand configuration
		if (!memoizedRounds.has(serializedPlayer1)) {
			memoizedRounds.set(serializedPlayer1, []);
		}
		memoizedRounds.get(serializedPlayer1).push(serializedPlayer2);


		// Play the rest of the round, calling `playRecursiveCombat` if a subgame is needed
	}

	return winner;
}
```