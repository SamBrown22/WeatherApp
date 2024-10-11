const API_KEY = 'a4939af392d1435dd10417f89f048a23';
const searchInput = document.getElementById('city');
const suggestionsContainer = document.getElementById('suggestions');
const searchBtn = document.getElementById('search-btn');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

// Function to fetch city data from OpenWeatherMap Geocoding API
async function fetchCityData(query) {
    if (!query) {
        return [];
    }

    try {
        const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}&lang=en`);
        const data = await response.json();
        console.log(data);
        return data || [];
    } catch (error) {
        console.error('Error fetching city data:', error);
        return [];
    }
}

// Function to display suggestions
function displaySuggestions(cities) {
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    if (cities.length === 0) {
        const noResults = document.createElement('div');
        noResults.classList.add('suggestion-item');
        noResults.textContent = 'No results found';
        suggestionsContainer.appendChild(noResults);
        return;
    }

    cities.forEach(city => {
        const suggestionItem = document.createElement('div');
        suggestionItem.classList.add('suggestion-item');
        suggestionItem.textContent = `${city.name}, ${city.country}`;
        suggestionItem.addEventListener('click', () => {
            searchInput.value = `${city.name}, ${city.country}`; // Set input value to the selected city
            suggestionsContainer.innerHTML = ''; // Clear suggestions
            fetchWeatherData(city.lat, city.lon); // Fetch weather data for the selected city
        });
        suggestionsContainer.appendChild(suggestionItem);
    });
}

// Function to fetch weather data from OpenWeatherMap API
async function fetchWeatherData(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Function to display weather data
function displayWeatherData(data) {
    if (data.main) {
        temperature.textContent = `Temperature: ${data.main.temp} °C`;
        humidity.textContent = `Humidity: ${data.main.humidity} %`;
        windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    } else {
        temperature.textContent = 'Temperature: --';
        humidity.textContent = 'Humidity: --';
        windSpeed.textContent = 'Wind Speed: --';
    }
}

// Add event listener to the input field
searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (query) {
        const cities = await fetchCityData(query);
        displaySuggestions(cities);
    } else {
        suggestionsContainer.innerHTML = ''; // Clear suggestions if input is empty
    }
});

// Add event listener to the search button
searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query) {
        const cities = await fetchCityData(query);
        if (cities.length > 0) {
            const city = cities[0];
            fetchWeatherData(city.lat, city.lon);
        } else {
            alert('No cities found');
        }
    }
});
