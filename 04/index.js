const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n\n')
	.map(passport => passport.split(/[\s\n]/g));

console.log(input)

// Part 1
let validPassports = 0;
for (const passport of input) {
	const byr = passport.find(cred => cred.startsWith('byr:'))
	const iyr = passport.find(cred => cred.startsWith('iyr:'))
	const eyr = passport.find(cred => cred.startsWith('eyr:'))
	const hgt = passport.find(cred => cred.startsWith('hgt:'))
	const hcl = passport.find(cred => cred.startsWith('hcl:'))
	const ecl = passport.find(cred => cred.startsWith('ecl:'))
	const pid = passport.find(cred => cred.startsWith('pid:'))
	const cid = passport.find(cred => cred.startsWith('cid:'))

	if (byr && iyr && eyr && hgt && hcl && ecl && pid) {
		validPassports++
	}
}

console.log(validPassports)