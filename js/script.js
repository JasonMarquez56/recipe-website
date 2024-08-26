const ingredients = [];
let recipes = [];

// Takes user input and stores it to a list of user entered ingredients
document.getElementById('ingredientInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = document.getElementById('ingredientInput');
        const ingredient = input.value.trim();

        // Runs if the input is not empty
        if (ingredient) {
            addIngredientToList(ingredient);
            ingredients.push(ingredient.toLowerCase());
            input.value = ''; // Clears the input box
        }
    }
});

// Handles displaying the user-entered ingredients in a list
function addIngredientToList(ingredient) {
    // Creates a new li element
    const li = document.createElement('li');

    // Sets the text content of the li value to the name of the ingredient
    li.textContent = ingredient;

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'remove-button';
    removeButton.onclick = function() {
        const index = ingredients.indexOf(ingredient.toLowerCase());
        if (index > -1) {
            ingredients.splice(index, 1);
        }
        li.remove();
    };

    li.appendChild(removeButton);
    document.getElementById('ingredientList').appendChild(li);
}

// Fetches the CSV file and parses the data using the Papparse library
document.addEventListener('DOMContentLoaded', function() {
    const csvFilePath = 'files/recipes.csv';

    fetch(csvFilePath)
        .then(response => response.text())
        .then(csvData => {
            Papa.parse(csvData, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function(results) {
                    recipes = results.data.map(recipe => ({
                        ...recipe,
                        Cleaned_Ingredients: parseIngredients(recipe.Cleaned_Ingredients)
                    }));
                    console.log("Parsed Recipes:", recipes);
                },
                error: function(error) {
                    console.error("Error reading CSV file:", error);
                }
            });
        })
        .catch(error => console.error('Error loading the CSV file:', error));
});

function parseIngredients(ingredientsData) {
    console.log('Ingredients Data:', ingredientsData);

    // Handle string that represents an array
    if (typeof ingredientsData === 'string') {
        try {
            // Replace single quotes with double quotes for JSON parsing
            const jsonString = ingredientsData.replace(/'/g, '"');
            // Parse JSON string
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error parsing Cleaned_Ingredients:', error);
        }
    }

    // Return empty array if not a string or parsing fails
    return [];
}

// Returns an array of user entered ingredients in lowercase
function getIngredientsFromUser() {
    return ingredients.map(ingredient => ingredient.toLowerCase());
}

// Matches user entered ingredients to the recipes in the recipes.csv
document.getElementById('findRecipes').addEventListener('click', function() {
    const userIngredients = getIngredientsFromUser();
    console.log('User Ingredients:', userIngredients); // Debugging

    const matchingRecipes = recipes.filter(recipe => {
        const cleanedIngredients = recipe.Cleaned_Ingredients; // Correctly access Cleaned_Ingredients

        if (!Array.isArray(cleanedIngredients)) {
            console.error('Cleaned_Ingredients is not an array:', cleanedIngredients);
            return false; // Skip this recipe if parsing fails
        }

        const lowerCaseCleanedIngredients = cleanedIngredients.map(ingredient => ingredient.toLowerCase());
        console.log('Cleaned Ingredients:', lowerCaseCleanedIngredients); // Debugging

        // Check if all user ingredients are partially matched in the recipe's cleaned ingredients
        return userIngredients.every(userIngredient => 
            lowerCaseCleanedIngredients.some(recipeIngredient => recipeIngredient.includes(userIngredient.toLowerCase()))
        );
    });

    console.log('Matching Recipes:', matchingRecipes); // Debugging
    displayMatchingRecipes(matchingRecipes);
});

// Shows matching recipes
function displayMatchingRecipes(matchingRecipes) {
    const resultsDiv = document.getElementById('recipeResults');
    resultsDiv.innerHTML = '';

    if (matchingRecipes.length === 0) {
        resultsDiv.textContent = 'No matching recipes found.';
    } else {
        const ul = document.createElement('ul');
        matchingRecipes.forEach(recipe => {
            // Handles displaying the recipes in html
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="recipe-header">
                    ${recipe.Title}
                    <button class="toggle-ingredients">Show Ingredients</button>
                </div>
                <ul class="ingredient-dropdown" style="display:none;">
                    ${getIngredientsList(recipe.Ingredients)}
                </ul>
            `;
            ul.appendChild(li);

            const toggleButton = li.querySelector('.toggle-ingredients');
            const dropdown = li.querySelector('.ingredient-dropdown');

            toggleButton.addEventListener('click', function() {
                if (dropdown.style.display === 'none') {
                    dropdown.style.display = 'block';
                    toggleButton.textContent = 'Hide Ingredients';
                } else {
                    dropdown.style.display = 'none';
                    toggleButton.textContent = 'Show Ingredients';
                }
            });
        });
        resultsDiv.appendChild(ul);
    }
}

function getIngredientsList(ingredientsData) {
    console.log('Ingredients Data before parsing:', ingredientsData);

    // Convert comma-separated string to an array if necessary
    let ingredientsArray;
    if (typeof ingredientsData === 'string') {
        ingredientsArray = ingredientsData.split(',').map(ingredient => ingredient.trim());
    } else if (Array.isArray(ingredientsData)) {
        ingredientsArray = ingredientsData;
    } else {
        console.error('Expected ingredientsData to be a string or array, but got:', typeof ingredientsData);
        return '<li>Error loading ingredients.</li>';
    }

    return ingredientsArray.map(ingredient => {
        const isMatch = ingredients.some(userIngredient => ingredient.toLowerCase().includes(userIngredient));
        return `<li style="${isMatch ? 'font-weight: bold; color: green;' : ''}">${ingredient}</li>`;
    }).join('');
}

