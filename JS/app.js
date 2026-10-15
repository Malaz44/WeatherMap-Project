const API_KEY = '6161976754c96158b475e03b22df45b7';

const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const errorBox = document.getElementById('error-box');
const spinner = document.getElementById('spinner');

const map = L.map('map').setView([15.5007, 32.5599], 6);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function hideError() {
  errorBox.hidden = true;
}

function showSpinner(show) {
  spinner.hidden = !show;
}

async function getCoordinates(city) {
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q='
    + encodeURIComponent(city);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Geocoding service is not available right now.');
  }

  const data = await response.json();

  if (data.length === 0) {
    throw new Error('City not found. Please check the spelling and try again.');
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    name: data[0].display_name
  };
}

async function getWeather(lat, lng) {
  const url = 'https://api.openweathermap.org/data/2.5/weather'
    + '?lat=' + lat
    + '&lon=' + lng
    + '&appid=' + API_KEY
    + '&units=metric';

  const response = await fetch(url);

  if (response.status === 404) {
    throw new Error('Weather data was not found for this location.');
  }
  if (response.status === 401) {
    throw new Error('Invalid API key. Please check your OpenWeatherMap key.');
  }
  if (!response.ok) {
    throw new Error('Weather service error. Please try again later.');
  }

  const data = await response.json();

  return {
    city: data.name,
    temp: data.main.temp,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    clouds: data.clouds.all,
    description: data.weather[0].description,
    icon: data.weather[0].icon
  };
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();
  if (city === '') {
    showError('Please enter a city name.');
    return;
  }

  hideError();
  showSpinner(true);

  try {
    const location = await getCoordinates(city);
    const weather = await getWeather(location.lat, location.lng);

    console.log('Location:', location);
    console.log('Weather:', weather);
  } catch (error) {
    showError(error.message);
  } finally {
    showSpinner(false);
  }
});