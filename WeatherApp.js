const API_KEY = 'a4939af392d1435dd10417f89f048a23';
const searchInput = document.getElementById('city');
const suggestionsContainer = document.getElementById('suggestions');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecast = document.getElementById('forecast');
const weatherInfoSection = document.getElementById('weather-info');

// Function to fetch city data from OpenWeatherMap Geocoding API
async function fetchCityData(query) {
    if (!query) {
        return [];
    }

    try {
        const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=3&appid=${API_KEY}&lang=en`);
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
        // Fetch current weather data
        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const currentData = await currentResponse.json();
        displayCurrentWeatherData(currentData);
        console.log('Current Weather Data:', currentData);

        // Fetch forecast weather data
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();
        displayForecastWeatherData(forecastData);
        console.log('Forecast Weather Data:', forecastData);

        // Show the weather-info section
        weatherInfoSection.style.display = 'block';
    } catch (error) {   
        console.error('Error fetching weather data:', error);
    }
}

// Function to display weather data
function displayCurrentWeatherData(data) {
    if (data.main) {
        const currentWeatherItem = document.createElement('div');
        currentWeatherItem.classList.add('forecast-item');

        const currentIconCode = data.weather[0].icon;
        const currentIconUrl = `http://openweathermap.org/img/wn/${currentIconCode}.png`;

        const currentIconImg = document.createElement('img');
        currentIconImg.src = currentIconUrl;
        currentIconImg.alt = data.weather[0].description;

        // Parse the date and time for current weather
        const dateTime = new Date();
        const day = dateTime.toLocaleDateString(undefined, { weekday: 'short' });
        const time = dateTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

        currentWeatherItem.innerHTML = `
            ${day} <br>
            ${time} <br>
        `;
        currentWeatherItem.appendChild(currentIconImg);
        currentWeatherItem.innerHTML += `
            <br>
            ${Math.round(data.main.temp)} °C <br>
        `;

        // Append the current weather item to the forecast container
        forecast.innerHTML = ''; // Clear previous forecast data
        forecast.appendChild(currentWeatherItem);
    } else {
        temperature.textContent = 'Temperature: --';
        humidity.textContent = 'Humidity: --';
        windSpeed.textContent = 'Wind Speed: --';
    }
}

// Function to display forecast weather data
function displayForecastWeatherData(data) {
    if (data.cod == '200') {
        // Add forecast weather items
        for (let i = 0; i < 9; i++) {
            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item');

            const iconCode = data.list[i].weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;

            const iconImg = document.createElement('img');
            iconImg.src = iconUrl;
            iconImg.alt = data.list[i].weather[0].description;

            // Parse the date and time
            const dateTime = new Date(data.list[i].dt_txt);
            const day = dateTime.toLocaleDateString(undefined, { weekday: 'short' });
            const time = dateTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

            forecastItem.innerHTML = `
                ${day} <br>
                ${time} <br>
            `;
            forecastItem.appendChild(iconImg);
            forecastItem.innerHTML += `
                <br>
                ${Math.round(data.list[i].main.temp)} °C <br>
            `;

            forecast.appendChild(forecastItem);
        }
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
