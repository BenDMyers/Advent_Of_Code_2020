const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n');

const oldInput = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')
	.map(passport => passport.split(/[\s\n]/g));

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

// let matchCount = 0;
// let bruteCount = 0;
// for (const passport of input) {
// 	const test = theAllRegex.test(passport);
// 	const match = passport.match(theAllRegex)
// 	// console.log(test, match, match && match.length, JSON.stringify(passport))

// 	if (match && match.length >= 7) {
// 		matchCount++
// 	}

// 	const splitPass = passport.split(/[\s\n]/g);
// 	const byr = splitPass.find(cred => cred.match(/byr:(19[2-9]\d|2000|2001|2002)/))
// 	const iyr = splitPass.find(cred => cred.match(/iyr:(201\d|2020)/))
// 	const eyr = splitPass.find(cred => cred.match(/eyr:(202[0-9]|2030)/))
// 	const hgt = splitPass.find(cred => cred.match(/hgt:(1[5-8]\dcm|190cm|191cm|192cm|193cm|59in|6\din|7[0-6]in)/))
// 	const hcl = splitPass.find(cred => cred.match(/hcl:#[0-9a-f]{6}/))
// 	const ecl = splitPass.find(cred => cred.match(/ecl:(amb|blu|brn|gry|grn|hzl|oth)/))
// 	const pid = splitPass.find(cred => cred.match(/pid:\d{9}/))

// 	if (byr && iyr && eyr && hgt && hcl && ecl && pid) {
// 		bruteCount++
// 	}

// 	if (matchCount !== bruteCount) {
// 		// console.log(passport, match)
// 	}
// }

let newCount = 0, splitCount = 0;

for (let i = 0; i < input.length; i++) {
	const passport = input[i];
	const splitPass = oldInput[i];

	const match = passport.match(theAllRegex)
	if (match && match.length >= 7) {
		newCount++
	}

	const byr = splitPass.find(cred => cred.match(/byr:(19[2-9]\d|2000|2001|2002)$/))
	const iyr = splitPass.find(cred => cred.match(/iyr:(201\d|2020)$/))
	const eyr = splitPass.find(cred => cred.match(/eyr:(202[0-9]|2030)$/))
	const hgt = splitPass.find(cred => cred.match(/hgt:(1[5-8]\dcm|190cm|191cm|192cm|193cm|59in|6\din|7[0-6]in)$/))
	const hcl = splitPass.find(cred => cred.match(/hcl:#[0-9a-f]{6}$/))
	const ecl = splitPass.find(cred => cred.match(/ecl:(amb|blu|brn|gry|grn|hzl|oth)$/))
	const pid = splitPass.find(cred => cred.match(/pid:\d{9}$/))

	if (byr && iyr && eyr && hgt && hcl && ecl && pid) {
		splitCount++
	}

	if (newCount !== splitCount) {
		console.log(passport, match)
		console.table({byr, iyr, eyr, hgt, hcl, ecl, pid})
		break;
	}
}

console.log(newCount, splitCount)

// A regexier way
// let regexGroupMatchedPassports = input.reduce((matchCount, passport) => {
// 	console.log(passport)
// 	const match = passport.match(/\s*\n*((?<byr>byr:(19[2-9]\d|2000|2001|2002))|(?<iyr>iyr:(201\d|2020))|(?<eyr>eyr:(202[0-9]|2030))|(?<hgt>hgt:(1[5-8]\dcm|19[0-3]cm|59in|6\din|7[0-6]in))|(?<hcl>hcl:#[0-9a-f]{6})|(?<ecl>ecl:(amb|blu|brn|gry|grn|hzl|oth))|(?<pid>pid:\d{9})))\s*\n*/g);
// 	console.log(match.groups)
// 	if (match && match.groups) {
// 		const {byr, iyr, eyr, hgt, hcl, ecl, pid} = match.groups;
// 		if (byr && iyr && eyr && hgt && hcl && ecl && pid) {
// 			return matchCount + 1;
// 		}
// 	}
// 	return matchCount;
// }, 0);

// console.log(regexGroupMatchedPassports);

