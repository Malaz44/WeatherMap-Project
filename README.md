# Project Mame: WeatherMap
## Description
A single page application that showes the current weather of any city on an interactive map. The user enters a city name, the app converts it to coordinates, moves the map to the location, adds a marker, and opens a weather card with temperature, clouds, humidity, wind speed, the weather icon and a Share button.
## Live Demo
https://malaz44.github.io/WeatherMap-Project/
## Technologies
- Language: HTML5, CSS3, JavaScript
- Architecture: client-side single page application (no framework, no server)
- Map: Leaflet.js with OpenStreetMap
## APIs
- OpenWeatherMap Current Weather API (weather data)
- Nominatim / OpenStreetMap (geocoding: city name to latitude and longitude)
## How To Run
1. Clone the repository:
   (git clone https://github.com/Malaz44/WeatherMap-Project.git)
2. Get a free API key from openweathermap.org
3. Open js/app.js and put your key at the top: const API_KEY = YOUR_API_KEY;
4. Open the project with Live Server and run (index.html)
## Project Structure
- index.html
- css/style.css
- js/app.js
## Student Name: Malaz Hassan Siddeg
