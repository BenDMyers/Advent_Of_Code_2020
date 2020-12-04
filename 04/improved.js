const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n');

const theAllRegex = new RegExp(
	'(' +
		'(?<byr>byr:(19[2-9]\\d|200[0-2]))|' + // birth year
		
		'(?<iyr>iyr:(201\\d|2020))|' + // issue year

		'(?<eyr>eyr:(202\\d|2030))|' + // expiration year

		'(?<hgt>hgt:(1[5-8]\\dcm|19[0-3]cm|59in|6\\din|7[0-6]in))|' + // height

		'(?<hcl>hcl:#[\\da-f]{6})|' + // hair color

		'(?<ecl>ecl:(amb|blu|brn|gry|grn|hzl|oth))|' + // eye color

		'(?<pid>pid:\\d{9})\\b' + // password ID

		// '(?<cid>cid:\\d+)' + // country id
	')',
	'g'
);

let newCount = 0;

// for (let i = 0; i < input.length; i++) {
// 	const passport = input[i];
// 	// const splitPass = oldInput[i];

// 	const test = theAllRegex.test(passport);
// 	const match = passport.match(theAllRegex)

// 	if (match && match.length >= 7) {
// 		newCount++
// 		if (!test) {
// 			console.log('False negative', passport, match);
// 		}
// 	} else if (test) {
// 		console.log('False positive', passport, match);
// 	}

	// const byr = splitPass.find(cred => cred.match(/byr:(19[2-9]\d|2000|2001|2002)$/))
	// const iyr = splitPass.find(cred => cred.match(/iyr:(201\d|2020)$/))
	// const eyr = splitPass.find(cred => cred.match(/eyr:(202[0-9]|2030)$/))
	// const hgt = splitPass.find(cred => cred.match(/hgt:(1[5-8]\dcm|190cm|191cm|192cm|193cm|59in|6\din|7[0-6]in)$/))
	// const hcl = splitPass.find(cred => cred.match(/hcl:#[0-9a-f]{6}$/))
	// const ecl = splitPass.find(cred => cred.match(/ecl:(amb|blu|brn|gry|grn|hzl|oth)$/))
	// const pid = splitPass.find(cred => cred.match(/pid:\d{9}$/))

	// if (byr && iyr && eyr && hgt && hcl && ecl && pid) {
	// 	splitCount++
	// }

	// if (newCount !== splitCount) {
	// 	console.log(passport, match)
	// 	console.table({byr, iyr, eyr, hgt, hcl, ecl, pid})
	// 	break;
	// }
// }

// A regexier way
let regexGroupMatchedPassports = input.reduce((matchCount, passport) => {
	const match = passport.match(theAllRegex);
	if (match && match.length === 7) {
		return matchCount + 1;
	} else {
		return matchCount;
	}
}, 0);

console.log(regexGroupMatchedPassports);

