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

// Part 2
let stricterPasswords = 0;
for (const passport of input) {
	const byr = passport.find(cred => cred.match(/byr:(19[2-9]\d|2000|2001|2002)$/))
	const iyr = passport.find(cred => cred.match(/iyr:(201\d|2020)$/))
	const eyr = passport.find(cred => cred.match(/eyr:(202[0-9]|2030)$/))
	const hgt = passport.find(cred => cred.match(/hgt:(1[5-8]\dcm|190cm|191cm|192cm|193cm|59in|6\din|7[0-6]in)$/))
	const hcl = passport.find(cred => cred.match(/hcl:#[0-9a-f]{6}$/))
	const ecl = passport.find(cred => cred.match(/ecl:(amb|blu|brn|gry|grn|hzl|oth)$/))
	const pid = passport.find(cred => cred.match(/pid:\d{9}$/))
	// const cid = passport.find(cred => cred.startsWith('cid:')) // ignore

	// Behold! My incredibly sophisticated visual debugging scheme!
	console.table({
		byr: byr || `🦑 ${passport.find(c => c.startsWith('byr'))}`,
		iyr: iyr || `🥕 ${passport.find(c => c.startsWith('iyr'))}`,
		eyr: eyr || `🍋 ${passport.find(c => c.startsWith('eyr'))}`,
		hgt: hgt || `🦖 ${passport.find(c => c.startsWith('hgt'))}`,
		hcl: hcl || `🧿 ${passport.find(c => c.startsWith('hcl'))}`,
		ecl: ecl || `☂️ ${passport.find(c => c.startsWith('ecl'))}`,
		pid: pid || `🌸 ${passport.find(c => c.startsWith('pid'))}`
	})

	// console.table({byr, iyr, eyr, hgt, hcl, ecl, pid})

	if (byr && iyr && eyr && hgt && hcl && ecl && pid) {
		stricterPasswords++
	}
}
console.log(stricterPasswords)