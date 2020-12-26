const fs = require('fs');
const [cardPublicKey, doorPublicKey] = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(x => Number(x));

/**
 * Get the number of loops required to reach the target public key
 * @param {number} target public key
 * @param {number} subjectNumber number iteratively multiplied with the value
 */
function getLoopCount(target, subjectNumber) {
	let loops = 0;
	let value = 1;

	do {
		value *= subjectNumber;
		value %= 20201227;
		loops++;
	} while (value !== target)

	return loops;
}

let cardLoopCount = getLoopCount(cardPublicKey, 7);

let encryptionKey = 1;
for (let i = 0; i < cardLoopCount; i++) {
	encryptionKey *= doorPublicKey;
	encryptionKey %= 20201227;
} 

console.log(encryptionKey);