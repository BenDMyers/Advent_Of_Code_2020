const fs = require('fs');
const lines = fs
	.readFileSync('./.input', 'utf-8')
	.split('\n')
	.map(num => Number.parseInt(num));

	
for (let i = 0; i < lines.length - 1; i++) {
	for (let j = i + 1; j < lines.length; j++) {
		if (lines[i] + lines[j] === 2020) {
			console.table({
				i: lines[i],
				j: lines[j],
				product: lines[i] * lines[j]
			});
		}
	}
}