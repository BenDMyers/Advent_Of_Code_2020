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
	
})();