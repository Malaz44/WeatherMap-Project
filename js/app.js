const API_KEY = '6161976754c96158b475e03b22df45b7';

const form = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const errorBox = document.getElementById('error-box');
const spinner = document.getElementById('spinner');
const submitButton = form.querySelector('button');

const map = L.map('map').setView([15.5007, 32.5599], 6);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let currentMarker = null;

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function hideError() {
  errorBox.hidden = true;
}

function showSpinner(show) {
  spinner.hidden = !show;
  submitButton.disabled = show;
}

async function safeFetch(url) {
  try {
    return await fetch(url);
  } catch (error) {
    throw new Error('Please check your internet connection');
  }
}

async function getCoordinates(city) {
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q='
    + encodeURIComponent(city);

  const response = await safeFetch(url);

  if (response.status === 429) {
    throw new Error('Too many requests. Please wait a moment and try again.');
  }
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

  const response = await safeFetch(url);

  if (response.status === 404) {
    throw new Error('Weather data was not found for this location.');
  }
  if (response.status === 401) {
    throw new Error('Invalid API key. Please check your OpenWeatherMap key.');
  }
  if (response.status === 429) {
    throw new Error('Too many requests. Please wait a minute and try again.');
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

function addRow(parent, label, value) {
  const row = document.createElement('p');
  row.className = 'popup-row';
  row.textContent = label + ': ' + value;
  parent.appendChild(row);
}

async function shareWeather(weather) {
  const text = 'Weather in ' + weather.city + ': '
    + Math.round(weather.temp) + '°C, '
    + weather.description + ', humidity '
    + weather.humidity + '%, wind '
    + weather.windSpeed + ' m/s.';

  try {
    if (navigator.share) {
      await navigator.share({ title: 'WeatherMap', text: text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Weather copied to clipboard!');
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      showError('Sharing is not available on this device.');
    }
  }
}

function buildPopup(weather) {
  const card = document.createElement('div');
  card.className = 'popup-card';

  const title = document.createElement('h2');
  title.className = 'popup-title';
  title.textContent = weather.city;
  card.appendChild(title);

  const icon = document.createElement('img');
  icon.className = 'popup-icon';
  icon.src = 'https://openweathermap.org/img/wn/' + weather.icon + '@2x.png';
  icon.alt = weather.description;
  card.appendChild(icon);

  const temp = document.createElement('p');
  temp.className = 'popup-temp';
  temp.textContent = Math.round(weather.temp) + '°C';
  card.appendChild(temp);

  addRow(card, 'Clouds', weather.clouds + '%');
  addRow(card, 'Humidity', weather.humidity + '%');
  addRow(card, 'Wind', weather.windSpeed + ' m/s');

  const shareButton = document.createElement('button');
  shareButton.type = 'button';
  shareButton.className = 'share-btn';
  shareButton.textContent = 'Share';
  shareButton.addEventListener('click', function () {
    shareWeather(weather);
  });
  card.appendChild(shareButton);

  return card;
}

function showOnMap(location, weather) {
  if (currentMarker !== null) {
    map.removeLayer(currentMarker);
  }

  map.flyTo([location.lat, location.lng], 10, { duration: 2 });

  currentMarker = L.marker([location.lat, location.lng]).addTo(map);
  currentMarker.bindPopup(buildPopup(weather));

  map.once('moveend', function () {
    currentMarker.openPopup();
  });
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
    showOnMap(location, weather);
  } catch (error) {
    showError(error.message);
  } finally {
    showSpinner(false);
  }
});