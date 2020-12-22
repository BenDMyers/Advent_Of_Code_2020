const fs = require('fs');
const [player1Deck, player2Deck] = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')
	.map(deckLines => {
		let [, ...deck] = deckLines.split('\n');
		return deck.map(card => Number(card));
	});

// Part 1
(function part1() {
	const player1 = [...player1Deck];
	const player2 = [...player2Deck];

	while (player1.length > 0 && player2.length > 0) {
		let card1 = player1.shift();
		let card2 = player2.shift();

		if (card1 > card2) {
			player1.push(card1, card2);
		} else {
			player2.push(card2, card1);
		}
	}

	let winningHand = (player1.length > 0) ? player1 : player2;
	let score = winningHand.reduce((sum, card, index) => {
		let cardScore = card * (winningHand.length - index);
		return sum + cardScore;
	}, 0);

	console.log(score);
})();


// Part 2
(function part2() {
	const player1 = [...player1Deck];
	const player2 = [...player2Deck];

	/**
	 * Play a whole game of Recursive Combat (a take on War)
	 * @param {number[]} player1 Player 1's deck, which may be cloned from a parent game
	 * @param {number[]} player2 Player 2's deck, which may be cloned from a parent game
	 * @returns {{winner: 1|2, hand: number[]}} the winner and their winning hand
	 */
	function playRecursiveCombat(player1, player2) {
		/** @type {Map<string, string[]>} */
		let memoizedRounds = new Map();

		while (player1.length > 0 && player2.length > 0) {
			// If these exact same hands have been seen earlier in this game, call the game in favor of Player 1
			let serializedPlayer1 = player1.toString();
			let serializedPlayer2 = player2.toString();
			if (memoizedRounds.has(serializedPlayer1) && memoizedRounds.get(serializedPlayer1).includes(serializedPlayer2)) {
				return {winner: 1, hand: player1};
			}

			// Memoize this hand configuration
			if (!memoizedRounds.has(serializedPlayer1)) memoizedRounds.set(serializedPlayer1, []);
			memoizedRounds.get(serializedPlayer1).push(serializedPlayer2);

			// Play the round
			let card1 = player1.shift();
			let card2 = player2.shift();

			let winner;

			if ((player1.length >= card1) && (player2.length >= card2)) {
				let subhand1 = player1.slice(0, card1);
				let subhand2 = player2.slice(0, card2);
				winner = playRecursiveCombat(subhand1, subhand2).winner;
			} else {
				if (card1 > card2) {
					winner = 1;
				} else {
					winner = 2;
				}
			}
	
			if (winner === 1) {
				player1.push(card1, card2);
			} else {
				player2.push(card2, card1);
			}
		}

		return {
			winner: (player1.length > 0) ? 1 : 2,
			hand: (player1.length > 0) ? player1 : player2
		};
	}

	let {hand} = playRecursiveCombat([...player1], [...player2]);
	let score = hand.reduce((sum, card, index) => {
		let cardScore = card * (hand.length - index);
		return sum + cardScore;
	}, 0);

	console.log(score);
})();