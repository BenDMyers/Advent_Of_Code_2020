# [Day 21](https://adventofcode.com/2020/day/21)

In Day 21, your input resembles:

```
mxmxvkd kfcds sqjhc nhms (contains dairy, fish)
trh fvjkl sbzzf mxmxvkd (contains dairy)
sqjhc fvjkl (contains soy)
sqjhc mxmxvkd sbzzf (contains fish)
```

Each line represents a food item. The [_mojibake_](https://en.wikipedia.org/wiki/Mojibake) in the first part of the line is the food's ingredients. The second part is a list of some, but maybe not all, allergens in the food. Each allergen corresponds to exactly one ingredient—in the example input, `mxmxvkd` corresponds to `dairy`, for instance.

**Part 1** asks you to count how many time nonallergenic ingredients are mentioned in the input. **Part 2** asks you to organize the allergenic ingredients in order of their allergen.

## If At First You Don't Succeed… Sleep On It.

I first tried this problem the night it opened up and just could not make headway on it. In hindsight, I was a little too sleepy to solve puzzles that night. I ended up shelving my solution, getting some rest, and coming back to it on Christmas Day with a clean slate.

Looking back on my attempts from the night of, though, I notice two things:

1. I tried to solve the solution from the opposite angle as my eventual, working solution.
2. When I realized that my first attempt wasn't panning out, I started making progress on a new approach — which ended up being the same as the first few pieces of my final, working solution.

The first time I tried this solution, I read, but hadn't _really_ internalized, this little nugget:

> However, even if an allergen isn't listed, the ingredient that contains that allergen could still be present…

This mattered a _lot_ for my initial approach, which was to go through each ingredient and try to rule out which allergens they could be. Effectively, if an ingredient showed up in a given food, but an allergen hadn't, then rule out that allergen. However, because an allergen might not be listed, the absence of an allergen on a given food _isn't_ enough information to rule out any allergens.

Instead, I had to work the other way around: **if an allergen is listed, rule out any _ingredients_ that weren't listed for that food.**