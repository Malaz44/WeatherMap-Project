
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
    throw new Error('Geocoding is not available');
  }

  const data = await response.json();

  if (data.length === 0) {
    throw new Error('City not found Please try again.');
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    name: data[0].display_name
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
    console.log('Coordinates:', location);  
  } catch (error) {
    showError(error.message);
  } finally {
    showSpinner(false);          
  }
});