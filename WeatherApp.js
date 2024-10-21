const API_KEY = 'a4939af392d1435dd10417f89f048a23';
const searchInput = document.getElementById('city');
const suggestionsContainer = document.getElementById('suggestions');
const forecast = document.getElementById('forecast');
const weatherInfoSection = document.getElementById('weather-info');
const detailedInfo = document.getElementById('detailed-info');
const mapContainer = document.getElementById('map');

// Initialize the map
const map = L.map(mapContainer).setView([0, 0], 2); // Initial view set to world map

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let marker; // Variable to store the marker

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

        suggestionItem.addEventListener('click', async () => {
            searchInput.value = `${city.name}, ${city.country}`; // Set input value to the selected city
            suggestionsContainer.innerHTML = ''; // Clear suggestions
        
            // Fetch weather data for the selected city
            const weatherData = await fetchWeatherData(city.lat, city.lon);
        
            // Update the map for the selected city with temperature
            updateMap(city.lat, city.lon, weatherData.main.temp, weatherData.name);
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

        // Invalidate map size after showing the weather-info section
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return currentData; // Return current weather data
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Function to display current weather data
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

        // Add event listener to display detailed info
        currentWeatherItem.addEventListener('click', () => {
            displayDetailedInfo(data);
        });
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

            // Add event listener to display detailed info
            forecastItem.addEventListener('click', () => {
                displayDetailedInfo(data.list[i]);
            });

            forecast.appendChild(forecastItem);
        }
    }
}

// Function to display detailed information
function displayDetailedInfo(data) {
    detailedInfo.innerHTML = `
        <h3>Detailed Information</h3>
        <p>Temperature: ${data.main.temp} °C</p>
        <p>Feels Like: ${data.main.feels_like} °C</p>
        <p>Humidity: ${data.main.humidity} %</p>
        <p>Pressure: ${data.main.pressure} hPa</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
        <p>Wind Direction: ${data.wind.deg} °</p>
        <p>Weather: ${data.weather[0].description}</p>
    `;
}

// Function to update the map
function updateMap(lat, lon, temp, cityName) {
    // Remove the existing marker if it exists
    if (marker) {
        map.removeLayer(marker);
    }

    // Determine the color based on the temperature
    let color;
    if (temp <= 0) {
        color = 'blue';
    } else if (temp > 0 && temp <= 15) {
        color = 'green';
    } else if (temp > 15 && temp <= 30) {
        color = 'orange';
    } else {
        color = 'red';
    }

    // Create a custom DivIcon
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="custom-div-icon" data-color="${color}">${temp}°C</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });

    // Add a new marker for the selected city with temperature info
    marker = L.marker([lat, lon], { icon: customIcon }).addTo(map)
        .bindPopup(`
            <div class="custom-popup">
                ${cityName}
            </div>
        `)
        .openPopup();
    // Center the map on the marker
    map.setView([lat, lon], 10);

    // Ensure the map is centered correctly after a short delay
    setTimeout(() => {
        map.setView([lat, lon], 10);
        map.invalidateSize(); // Fix map rendering issues
    }, 100);
}

// Add event listener to the map for double-click events
map.on('dblclick', async (e) => {
    const { lat, lng } = e.latlng;

    // Fetch weather data for the clicked location
    const weatherData = await fetchWeatherData(lat, lng);

    // Update the map for the clicked location with temperature
    updateMap(lat, lng, weatherData.main.temp, weatherData.name);

    // Set input value to the clicked location
    searchInput.value = `${weatherData.name}`;

    // Clear detailed info
    detailedInfo.innerHTML = '';

    // Ensure the map is centered correctly after a short delay
    setTimeout(() => {
        map.setView([lat, lng], 10);
        map.invalidateSize(); // Fix map rendering issues
    }, 100);
});