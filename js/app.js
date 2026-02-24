/**
 * WeatherNow - Modern Weather Web App
 * JavaScript Application
 */

// ============================================
// API Configuration
// ============================================
const API_CONFIG = {
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    apiKey: '0ee85610cd64dc423f6f9dc332265854',
    units: 'metric'
};

// Weather icon mapping
const WEATHER_ICONS = {
    '01d': 'https://openweathermap.org/img/wn/01d@4x.png',
    '01n': 'https://openweathermap.org/img/wn/01n@4x.png',
    '02d': 'https://openweathermap.org/img/wn/02d@4x.png',
    '02n': 'https://openweathermap.org/img/wn/02n@4x.png',
    '03d': 'https://openweathermap.org/img/wn/03d@4x.png',
    '03n': 'https://openweathermap.org/img/wn/03n@4x.png',
    '04d': 'https://openweathermap.org/img/wn/04d@4x.png',
    '04n': 'https://openweathermap.org/img/wn/04n@4x.png',
    '09d': 'https://openweathermap.org/img/wn/09d@4x.png',
    '09n': 'https://openweathermap.org/img/wn/09n@4x.png',
    '10d': 'https://openweathermap.org/img/wn/10d@4x.png',
    '10n': 'https://openweathermap.org/img/wn/10n@4x.png',
    '11d': 'https://openweathermap.org/img/wn/11d@4x.png',
    '11n': 'https://openweathermap.org/img/wn/11n@4x.png',
    '13d': 'https://openweathermap.org/img/wn/13d@4x.png',
    '13n': 'https://openweathermap.org/img/wn/13n@4x.png',
    '50d': 'https://openweathermap.org/img/wn/50d@4x.png',
    '50n': 'https://openweathermap.org/img/wn/50n@4x.png'
};

// Default icon
const DEFAULT_ICON = 'https://openweathermap.org/img/wn/01d@4x.png';

// Severe weather condition codes (for alerts)
const SEVERE_CONDITIONS = {
    thunderstorm: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
    heavyRain: [502, 503, 504, 511, 520, 521, 522],
    heavySnow: [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
    extreme: [900, 901, 902, 903, 904, 905, 951, 952, 953, 954, 955, 956, 957, 958, 959, 960, 961, 962]
};

// ============================================
// DOM Elements
// ============================================
const DOM = {
    // Theme toggle
    themeToggle: document.getElementById('theme-toggle'),
    
    // Form & Input
    searchForm: document.getElementById('search-form'),
    cityInput: document.getElementById('city-input'),
    
    // Quick search buttons
    quickCityBtns: document.querySelectorAll('.quick-city-btn'),
    
    // Loading, Error, Content
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMessage: document.getElementById('error-message'),
    weatherContent: document.getElementById('weather-content'),
    
    // Weather alert
    weatherAlert: document.getElementById('weather-alert'),
    alertMessage: document.getElementById('alert-message'),
    alertClose: document.getElementById('alert-close'),
    
    // Current weather elements
    favoriteBtn: document.getElementById('favorite-btn'),
    cityName: document.getElementById('city-name'),
    country: document.getElementById('country'),
    date: document.getElementById('date'),
    weatherIcon: document.getElementById('weather-icon'),
    temperature: document.getElementById('temperature'),
    weatherDescription: document.getElementById('weather-description'),
    
    // Weather details
    feelsLike: document.getElementById('feels-like'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    pressure: document.getElementById('pressure'),
    
    // Hourly forecast
    hourlyContainer: document.getElementById('hourly-container'),
    
    // 5-Day Forecast
    forecastContainer: document.getElementById('forecast-container'),
    
    // Favorites
    favoritesSection: document.getElementById('favorites-section'),
    favoritesContainer: document.getElementById('favorites-container')
};

// ============================================
// State Management
// ============================================
let currentCity = '';
let favorites = [];
let currentTheme = 'dark';

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', init);

function init() {
    loadTheme();
    loadFavorites();
    setupEventListeners();
    setCurrentDate();
}

/**
 * Load theme from localStorage
 */
function loadTheme() {
    try {
        const storedTheme = localStorage.getItem('weatherTheme');
        if (storedTheme) {
            currentTheme = storedTheme;
        }
        applyTheme(currentTheme);
    } catch (error) {
        console.error('Error loading theme:', error);
    }
}

/**
 * Apply theme to the document
 */
function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.removeAttribute('data-theme');
        DOM.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    currentTheme = theme;
}

/**
 * Toggle theme
 */
function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    
    try {
        localStorage.setItem('weatherTheme', newTheme);
    } catch (error) {
        console.error('Error saving theme:', error);
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Theme toggle
    DOM.themeToggle.addEventListener('click', toggleTheme);
    
    // Search form submission
    DOM.searchForm.addEventListener('submit', handleSearch);
    
    // Quick city buttons
    DOM.quickCityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const city = btn.dataset.city;
            DOM.cityInput.value = city;
            handleSearch(new Event('submit'));
        });
    });
    
    // Favorite button click
    DOM.favoriteBtn.addEventListener('click', toggleFavorite);
    
    // Alert close button
    DOM.alertClose.addEventListener('click', hideAlert);
    
    // Enter key in input
    DOM.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    });
}

/**
 * Set current date
 */
function setCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    DOM.date.textContent = now.toLocaleDateString('en-US', options);
}

// ============================================
// Search & API Functions
// ============================================

/**
 * Handle search form submission
 */
async function handleSearch(e) {
    e.preventDefault();
    
    const city = DOM.cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    await fetchWeatherData(city);
}

/**
 * Fetch weather data from API
 */
async function fetchWeatherData(city) {
    showLoading();
    hideError();
    hideAlert();
    hideWeatherContent();
    
    try {
        // Fetch current weather
        const currentWeatherUrl = `${API_CONFIG.baseUrl}/weather?q=${encodeURIComponent(city)}&appid=${API_CONFIG.apiKey}&units=${API_CONFIG.units}`;
        const currentResponse = await fetch(currentWeatherUrl);
        
        if (!currentResponse.ok) {
            if (currentResponse.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (currentResponse.status === 401) {
                throw new Error('Invalid API key. Please contact the developer.');
            } else {
                throw new Error('Failed to fetch weather data. Please try again later.');
            }
        }
        
        const currentData = await currentResponse.json();
        
        // Fetch 5-day forecast (includes 3-hour intervals)
        const forecastUrl = `${API_CONFIG.baseUrl}/forecast?q=${encodeURIComponent(city)}&appid=${API_CONFIG.apiKey}&units=${API_CONFIG.units}`;
        const forecastResponse = await fetch(forecastUrl);
        
        let forecastData = null;
        if (forecastResponse.ok) {
            forecastData = await forecastResponse.json();
        }
        
        // Display weather data
        displayWeatherData(currentData, forecastData);
        
        // Update current city
        currentCity = currentData.name;
        
        // Check if city is in favorites
        updateFavoriteButton();
        
        // Check for severe weather alerts
        checkWeatherAlert(currentData);
        
        // Show content
        hideLoading();
        showWeatherContent();
        
    } catch (error) {
        hideLoading();
        showError(error.message);
        console.error('Weather fetch error:', error);
    }
}

/**
 * Display weather data in the UI
 */
function displayWeatherData(currentData, forecastData) {
    // Current weather
    DOM.cityName.textContent = currentData.name;
    DOM.country.textContent = currentData.sys.country;
    DOM.temperature.textContent = Math.round(currentData.main.temp);
    DOM.weatherDescription.textContent = currentData.weather[0].description;
    
    // Weather icon
    const iconCode = currentData.weather[0].icon;
    DOM.weatherIcon.src = WEATHER_ICONS[iconCode] || DEFAULT_ICON;
    DOM.weatherIcon.alt = currentData.weather[0].description;
    
    // Weather details
    DOM.feelsLike.textContent = `${Math.round(currentData.main.feels_like)}°C`;
    DOM.humidity.textContent = `${currentData.main.humidity}%`;
    DOM.windSpeed.textContent = `${currentData.wind.speed} m/s`;
    DOM.pressure.textContent = `${currentData.main.pressure} hPa`;
    
    // Display hourly forecast
    if (forecastData) {
        displayHourlyForecast(forecastData);
        displayForecast(forecastData);
    } else {
        DOM.hourlyContainer.innerHTML = '<p class="no-forecast">Hourly forecast unavailable</p>';
        DOM.forecastContainer.innerHTML = '<p class="no-forecast">Forecast data unavailable</p>';
    }
    
    // Show favorites section if there are favorites
    if (favorites.length > 0) {
        DOM.favoritesSection.classList.remove('hidden');
    }
}

/**
 * Display hourly forecast (next 24 hours - 8 intervals of 3 hours)
 */
function displayHourlyForecast(forecastData) {
    // Get next 8 forecasts (24 hours with 3-hour intervals)
    const hourlyForecasts = forecastData.list.slice(0, 8);
    
    DOM.hourlyContainer.innerHTML = hourlyForecasts.map(forecast => {
        const date = new Date(forecast.dt * 1000);
        const hours = date.getHours();
        const timeStr = hours === 0 ? '12 AM' : hours < 12 ? `${hours} AM` : hours === 12 ? '12 PM' : `${hours - 12} PM`;
        const iconCode = forecast.weather[0].icon;
        
        return `
            <div class="hourly-card">
                <div class="hourly-time">${timeStr}</div>
                <img src="${WEATHER_ICONS[iconCode] || DEFAULT_ICON}" 
                     alt="${forecast.weather[0].description}" 
                     class="hourly-icon">
                <div class="hourly-temp">${Math.round(forecast.main.temp)}°</div>
            </div>
        `;
    }).join('');
}

/**
 * Display 5-day forecast
 */
function displayForecast(forecastData) {
    // Group forecasts by day (take one reading per day at noon)
    const dailyForecasts = [];
    const seenDays = new Set();
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!seenDays.has(day) && dailyForecasts.length < 5) {
            seenDays.add(day);
            dailyForecasts.push({
                day: day,
                date: date,
                temp: item.main.temp,
                tempMin: item.main.temp_min,
                tempMax: item.main.temp_max,
                icon: item.weather[0].icon,
                description: item.weather[0].description
            });
        }
    });
    
    // Render forecast cards
    DOM.forecastContainer.innerHTML = dailyForecasts.map(forecast => `
        <div class="forecast-card">
            <div class="forecast-day">${forecast.day}</div>
            <img src="${WEATHER_ICONS[forecast.icon] || DEFAULT_ICON}" 
                 alt="${forecast.description}" 
                 class="forecast-icon">
            <div class="forecast-temp">
                <span class="forecast-high">${Math.round(forecast.tempMax)}°</span>
                <span class="forecast-low">${Math.round(forecast.tempMin)}°</span>
            </div>
            <p class="forecast-desc">${forecast.description}</p>
        </div>
    `).join('');
}

// ============================================
// Weather Alerts
// ============================================

/**
 * Check for severe weather conditions and show alert
 */
function checkWeatherAlert(currentData) {
    const weatherId = currentData.weather[0].id;
    const description = currentData.weather[0].description;
    const temp = currentData.main.temp;
    
    let alertMsg = null;
    
    // Check for thunderstorm
    if (SEVERE_CONDITIONS.thunderstorm.includes(weatherId)) {
        alertMsg = `Thunderstorm warning! ${capitalize(description)}. Take precautions and stay indoors.`;
    }
    // Check for heavy rain
    else if (SEVERE_CONDITIONS.heavyRain.includes(weatherId)) {
        alertMsg = `Heavy rain warning! ${capitalize(description)}. Be careful when traveling.`;
    }
    // Check for heavy snow
    else if (SEVERE_CONDITIONS.heavySnow.includes(weatherId)) {
        alertMsg = `Heavy snow warning! ${capitalize(description)}. Dress warmly and drive carefully.`;
    }
    // Check for extreme conditions
    else if (SEVERE_CONDITIONS.extreme.includes(weatherId)) {
        alertMsg = `Extreme weather alert! ${capitalize(description)}. Seek shelter immediately.`;
    }
    // Check for extreme temperatures
    else if (temp >= 40) {
        alertMsg = `Extremely hot! Temperature is ${Math.round(temp)}C. Stay hydrated and avoid sun exposure.`;
    }
    else if (temp <= -10) {
        alertMsg = `Extremely cold! Temperature is ${Math.round(temp)}C. Bundle up and limit outdoor exposure.`;
    }
    // Check for high winds
    else if (currentData.wind.speed >= 20) {
        alertMsg = `High wind warning! Wind speed is ${currentData.wind.speed} m/s. Secure loose objects.`;
    }
    
    if (alertMsg) {
        showAlert(alertMsg);
    }
}

/**
 * Show weather alert
 */
function showAlert(message) {
    DOM.alertMessage.textContent = message;
    DOM.weatherAlert.classList.remove('hidden');
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        hideAlert();
    }, 10000);
}

/**
 * Hide weather alert
 */
function hideAlert() {
    DOM.weatherAlert.classList.add('hidden');
}

// ============================================
// Favorites Management
// ============================================

/**
 * Load favorites from localStorage
 */
function loadFavorites() {
    try {
        const stored = localStorage.getItem('weatherFavorites');
        favorites = stored ? JSON.parse(stored) : [];
        renderFavorites();
    } catch (error) {
        console.error('Error loading favorites:', error);
        favorites = [];
    }
}

/**
 * Save favorites to localStorage
 */
function saveFavorites() {
    try {
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
}

/**
 * Toggle favorite status for current city
 */
function toggleFavorite() {
    if (!currentCity) return;
    
    const cityIndex = favorites.indexOf(currentCity);
    
    if (cityIndex > -1) {
        // Remove from favorites
        favorites.splice(cityIndex, 1);
        DOM.favoriteBtn.classList.remove('active');
    } else {
        // Add to favorites
        favorites.push(currentCity);
        DOM.favoriteBtn.classList.add('active');
    }
    
    saveFavorites();
    renderFavorites();
    
    // Show/hide favorites section
    if (favorites.length > 0) {
        DOM.favoritesSection.classList.remove('hidden');
    } else {
        DOM.favoritesSection.classList.add('hidden');
    }
}

/**
 * Update favorite button state
 */
function updateFavoriteButton() {
    if (favorites.includes(currentCity)) {
        DOM.favoriteBtn.classList.add('active');
    } else {
        DOM.favoriteBtn.classList.remove('active');
    }
}

/**
 * Render favorites in the UI
 */
function renderFavorites() {
    if (favorites.length === 0) {
        DOM.favoritesContainer.innerHTML = '<p class="no-favorites">No favorite cities yet</p>';
        return;
    }
    
    DOM.favoritesContainer.innerHTML = favorites.map(city => `
        <div class="favorite-city-card" data-city="${city}">
            <i class="fas fa-star"></i>
            <span class="city-name">${city}</span>
            <button class="remove-favorite" data-city="${city}" aria-label="Remove ${city} from favorites">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.favorite-city-card').forEach(card => {
        card.addEventListener('click', async (e) => {
            if (!e.target.closest('.remove-favorite')) {
                const city = card.dataset.city;
                DOM.cityInput.value = city;
                await fetchWeatherData(city);
            }
        });
    });
    
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const city = btn.dataset.city;
            removeFavorite(city);
        });
    });
}

/**
 * Remove a city from favorites
 */
function removeFavorite(city) {
    const index = favorites.indexOf(city);
    if (index > -1) {
        favorites.splice(index, 1);
        saveFavorites();
        renderFavorites();
        
        // Update favorite button if current city
        if (currentCity === city) {
            DOM.favoriteBtn.classList.remove('active');
        }
        
        // Hide favorites section if empty
        if (favorites.length === 0) {
            DOM.favoritesSection.classList.add('hidden');
        }
    }
}

// ============================================
// UI State Functions
// ============================================

/**
 * Show loading state
 */
function showLoading() {
    DOM.loading.classList.remove('hidden');
}

/**
 * Hide loading state
 */
function hideLoading() {
    DOM.loading.classList.add('hidden');
}

/**
 * Show error message
 */
function showError(message) {
    DOM.errorMessage.textContent = message;
    DOM.error.classList.remove('hidden');
}

/**
 * Hide error message
 */
function hideError() {
    DOM.error.classList.add('hidden');
}

/**
 * Show weather content
 */
function showWeatherContent() {
    DOM.weatherContent.classList.remove('hidden');
    
    // Trigger animation
    DOM.weatherContent.style.animation = 'none';
    DOM.weatherContent.offsetHeight; // Trigger reflow
    DOM.weatherContent.style.animation = 'fadeIn 0.5s ease';
}

/**
 * Hide weather content
 */
function hideWeatherContent() {
    DOM.weatherContent.classList.add('hidden');
}

// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Capitalize first letter of string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
