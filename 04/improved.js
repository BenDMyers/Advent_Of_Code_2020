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

