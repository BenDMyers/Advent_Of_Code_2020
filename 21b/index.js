const fs = require('fs');
const input = fs
	.readFileSync(`${__dirname}/.input`, 'utf-8')
	.split('\n')
	.map(label => {
		const matches = label.match(/^(?<ingredients>[\w\s]+\w) \(contains (?<allergens>[\w\s,]+)\)$/);
		const allergens = matches.groups.allergens.split(', ');
		const ingredients = matches.groups.ingredients.split(' ');
		return {allergens, ingredients};
	});

(function part1() {
	/**
	 * Gets all elements in Set A that aren't also in Set B
	 * @param {Set} a
	 * @param {Set} b
	 * @returns {Set} the difference between Set A and Set B
	 */
	function difference(a, b) {
		return new Set([...a].filter(x => !b.has(x)));
	}


	/** @type {Set<string>} */
	let allAllergens = new Set();
	/** @type {Set<string>} */
	let allIngredients = new Set();

	input.forEach(({allergens, ingredients}) => {
		allergens.forEach(allergen => allAllergens.add(allergen));
		ingredients.forEach(ingredient => allIngredients.add(ingredient));
	});

	// In the beginning, any allergen can map to any ingredient
	let allergenIngredientOptions = [...allAllergens].reduce((options, allergen) => {
		options[allergen] = [...allIngredients];
		return options;
	}, {});

	// If an allergen is explicitly listed, one of the listed ingredients HAS to have that allergen, so filter anything else out
	input.forEach(({allergens, ingredients}) => {
		allergens.forEach(allergen => {
			allergenIngredientOptions[allergen] = allergenIngredientOptions[allergen].filter(ingredient => ingredients.includes(ingredient));
		});
	});

	/** @type {Set<string>} */
	let possiblyAllergenicIngredients = new Set();
	allAllergens.forEach(allergen => {
		allergenIngredientOptions[allergen].forEach(ingredient => possiblyAllergenicIngredients.add(ingredient));
	});

	let nonallergenicIngredients = difference(allIngredients, possiblyAllergenicIngredients);
	let nonallergenicCount = input.reduce((sum, {ingredients}) => sum + ingredients.filter(ingredient => nonallergenicIngredients.has(ingredient)).length, 0);

	console.log(nonallergenicCount);
})();