// Variables made global for ease of use
const apiKey = 'fca_live_IgXmWILHbgT7mTWoVpZNfcdJwbVOVo8XTrEE5JFS';
let baseCurrency = document.getElementById('base-money'); // Just the names of base
let targetCurrency = document.getElementById('target-currency'); // Just the names of target
let amountInput = document.getElementById('amount');
let selectedDate = document.getElementById('date');

// Setup to fetch and display current exchange rates with error handling
async function fetchData(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

// API call function to populate dropdowns later on
async function getCurrencies() {
    const url = `https://api.freecurrencyapi.com/v1/latest`;
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        }
    };
    return fetchData(url, options);
}

// Fetch and populate dropdowns with available currencies from getCurrencies() method above
function populateDropdowns(data) {
    const baseDropdown = document.getElementById('base-money');
    const targetDropdown = document.getElementById('target-currency');
    const keys = Object.keys(data.data);

    keys.forEach(key => {
        const baseOption = document.createElement('option');
        baseOption.value = key;
        baseOption.textContent = key;
        baseDropdown.appendChild(baseOption);

        const targetOption = document.createElement('option');
        targetOption.value = key;
        targetOption.textContent = key;
        targetDropdown.appendChild(targetOption);
    });
}

// Manipulating the DOM with the results of the functions above
document.addEventListener('DOMContentLoaded', () => {
    getCurrencies().then(data => {
        populateDropdowns(data);
        fetchAndDisplayFavorites(); // Fetch and display favorites on page load
    }).catch(error => {
        console.error('Error:', error);
    });

    document.getElementById('base-money').addEventListener('change', updateConvertedAmount);
    document.getElementById('target-currency').addEventListener('change', updateConvertedAmount);
    document.getElementById('amount').addEventListener('input', updateConvertedAmount);
});

// Sets up data for the math function to calculate exchange rates
async function getExchangeRate(baseCurrency, targetCurrency) {
    const url = `https://api.freecurrencyapi.com/v1/latest?base_currency=${baseCurrency}&currencies=${targetCurrency}`;
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        }
    };
    const data = await fetchData(url, options);
    return data.data[targetCurrency];
}

// This function does the math based on selected base and target options
function updateConvertedAmount() {
    const baseDropdown = document.getElementById('base-money');
    const targetDropdown = document.getElementById('target-currency');
    const amountInput = document.getElementById('amount');
    const convertedAmountSpan = document.getElementById('converted-amount');

    const selectedBase = baseDropdown.value;
    const selectedTarget = targetDropdown.value;
    const amount = parseFloat(amountInput.value);

    if (selectedBase && selectedTarget && !isNaN(amount)) {
        getExchangeRate(selectedBase, selectedTarget).then(rate => {
            const convertedAmount = rate * amount;
            convertedAmountSpan.textContent = convertedAmount.toFixed(2);
        }).catch(error => {
            console.error('Error fetching exchange rate:', error);
            convertedAmountSpan.textContent = 'Error fetching rate';
        });
    } else {
        convertedAmountSpan.textContent = '0';
    }
}

// Starting functionality to display historical rates
const history = document.getElementById('historical-rates');
// Event listener for the button click "historical rates"
history.addEventListener('click', displayHistory);

// The call to the API Historical endpoint
async function displayHistory() {
    const selectedBase = baseCurrency.value;
    const selectedTarget = targetCurrency.value;
    const dateInput = selectedDate.value;
    const amount = parseFloat(amountInput.value);

    const url = `https://api.freecurrencyapi.com/v1/historical?apikey=${apiKey}&base_currency=${selectedBase}&currencies=${selectedTarget}&date=${dateInput}`;
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey
        }
    };

    let response = await fetch(url, options);
    let data = await response.json();
    console.log(data);

    const container = document.getElementById('historical-rates-container');
    container.innerHTML = '';

    const rates = data.data;
    const dates = Object.keys(rates);

    dates.forEach(date => {
        const rate = rates[date][selectedTarget];
        const convertedAmount = rate * amount;

        const dateDiv = document.createElement('div');
        dateDiv.classList.add('rate-entry');

        const datePara = document.createElement('p');
        datePara.textContent = `Date: ${dateInput}`;
        dateDiv.appendChild(datePara);

        const rateBase = document.createElement('p');
        rateBase.textContent = `Amount in ${selectedBase}: ${amount}`;
        dateDiv.appendChild(rateBase);

        const rateTarget = document.createElement('p');
        rateTarget.textContent = `Amount in ${selectedTarget}: ${convertedAmount.toFixed(2)}`;
        dateDiv.appendChild(rateTarget);

        container.appendChild(dateDiv);
    });
}

// Moving on to saving favorites
const favRate = document.getElementById('save-favorite');
favRate.addEventListener('click', saveFavorite); // Event listener for the button click

// The call to the Express Server API to save favorite rate information
async function saveFavorite() {
    const selectedBase = baseCurrency.value;
    const selectedTarget = targetCurrency.value;
    const amount = parseFloat(amountInput.value);

    const url = 'http://localhost:3000/api/favorites';
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            baseCurrency: selectedBase,
            targetCurrency: selectedTarget,
            amount: amount
        })
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Favorite rate saved successfully.');
        fetchAndDisplayFavorites(); // Refresh the displayed favorites after saving
    } catch (error) {
        console.error('Error saving favorite rate:', error);
    }
}

// Fetch and display favorite currency pairs
async function fetchAndDisplayFavorites() {
    const url = 'http://localhost:3000/api/favorites';
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const favorites = await response.json();
        displayFavorites(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
    }
}

// Update the DOM with favorite currency pairs
function displayFavorites(favorites) {
    const favoritesContainer = document.getElementById('favorite-currency-pairs');
    favoritesContainer.innerHTML = ''; // Clear previous content

    favorites.forEach(favorite => {
        const favoriteButton = document.createElement('button');
        favoriteButton.textContent = `${favorite.baseCurrency} / ${favorite.targetCurrency} $${favorite.amount}`;
        favoriteButton.classList.add('btn', 'btn-secondary', 'mr-2', 'mb-2'); // Bootstrap button and spacing classes
        favoriteButton.addEventListener('click', () => {
            baseCurrency.value = favorite.baseCurrency;
            targetCurrency.value = favorite.targetCurrency;
            amountInput.value = favorite.amount;
            updateConvertedAmount();
        });

        favoritesContainer.appendChild(favoriteButton);
    });
}
