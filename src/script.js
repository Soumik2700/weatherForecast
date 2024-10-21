// Select elements
const darkModeBtn = document.querySelector(".darkModeBtn");
const htmlElement = document.getElementById("htmlSelector");

// Function to toggle dark mode
darkModeBtn.addEventListener("click", function () {
    const isDarkMode = htmlElement.classList.toggle("dark");

    // Update button text based on current mode
    darkModeBtn.innerText = isDarkMode ? "Light Mode" : "Dark Mode";
});


const apiKey = '86cf74ee20fbf270b000f8322804dcae';
const latLonBtn = document.getElementById("latLonBtn");
const searchCityBtn = document.getElementById("searchCity");
// console.log(searchCityBtn);

searchCityBtn.addEventListener("click", getDataByCity);
async function getDataByCity() {

    const message = document.getElementById("message");
    message.innerHTML = "Wait for a while...";
    removeElements();
    try {
        const city = document.getElementById("cityName").value;
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`)
        const data = await response.json();
        message.innerHTML = "";
        console.log(data);

        const timezoneOffset = data.city.timezone;  // In seconds
        const dailyForecast = data.list.filter(forecast => {
            const date = new Date((forecast.dt + timezoneOffset) * 1000);
            const hours = date.getUTCHours();
            return hours >= 11 && hours <= 13;
        })
        console.log(dailyForecast);


        let maxTemp = -Infinity;
        let minTemp = Infinity;

        dailyForecast.forEach(forecast => {
            forecast.main.feels_like = parseFloat((forecast.main.feels_like - 273.15).toFixed(2));
            if (forecast.main.temp_max > maxTemp) {
                maxTemp = forecast.main.temp_max;
            }
            if (forecast.main.temp_min < minTemp) {
                minTemp = forecast.main.temp_min;
            }
        });

        console.log(`Max Temp: ${maxTemp}°C, Min Temp: ${minTemp}°C`);


        const filteredData = {
            city: data.city,
            forecast: dailyForecast,
            maxTemp: maxTemp - 273.15,
            minTemp: minTemp - 273.15
        }
        console.log(filteredData);

        placeInfoElements(filteredData);
        getTimeZone(filteredData);
    } catch (error) {
        message.innerHTML = `Failed to fetch data: ${error}`;
    }
}

latLonBtn.addEventListener("click", getLatLon);

function getLatLon() {
    // Get latitude and longitude values inside the function after the button is clicked
    const lat = document.getElementById("lat").value;
    const lon = document.getElementById("lon").value;

    // Log to make sure the values are correct
    console.log("Latitude:", lat);
    console.log("Longitude:", lon);

    // Fetch the weather data using the coordinates
    fetchData(lat, lon);
    // latLonBtn.removeEventListener("click", getLatLon);
}

const locationButton = document.getElementById("locationBtn");
locationButton.addEventListener("click", getLocation)
function getLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude

        console.log(lat);
        console.log(lon);

        fetchData(lat, lon);
        // locationButton.removeEventListener("click", getLocation);
    })
}

async function fetchData(lat, lon) {
    const message = document.getElementById("message");
    // console.log(message);
    message.innerHTML = "Wait for a while..."
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        message.innerHTML = "";

        // Get timezone offset from the city data (in seconds)
        const timezoneOffset = data.city.timezone;  // In seconds

        // Filter the forecast to get times around noon (11:00 AM - 1:00 PM)
        const dailyForecast = data.list.filter(forecast => {
            const date = new Date((forecast.dt + timezoneOffset) * 1000); // Adjust for timezone
            const hours = date.getUTCHours();  // Get the hours in UTC

            // We allow a range between 11:00 AM and 1:00 PM (to account for slight deviations)
            return hours >= 11 && hours <= 13;
        });


        let maxTemp = -Infinity;
        let minTemp = Infinity;

        dailyForecast.forEach(forecast => {
            if (forecast.main.temp_max > maxTemp) {
                maxTemp = forecast.main.temp_max;
            }
            if (forecast.main.temp_min < minTemp) {
                minTemp = forecast.main.temp_min;
            }
        });

        console.log(`Max Temp: ${maxTemp}°C, Min Temp: ${minTemp}°C`);


        const filteredData = {
            city: data.city,  // Include city info
            forecast: dailyForecast, // Include filtered forecast
            maxTemp: maxTemp,
            minTemp: minTemp
        };
        console.log(filteredData);
        // Continue processing the filtered data
        placeInfoElements(filteredData);
        getTimeZone(filteredData);

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}



const placeInfo = document.querySelector(".placeInfo");

function placeInfoElements(filteredData) {
    placeInfo.innerHTML = "";
    const placeName = document.createElement("h2");
    const descriptionHeading = document.createElement("h3");
    const weatherIcon = document.createElement("img");


    const description = filteredData.forecast[0].weather[0].description;
    descriptionHeading.innerHTML = description;


    const icon = filteredData.forecast[0].weather[0].icon
    weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    console.log(weatherIcon.src);

    placeName.innerHTML = filteredData.city.name;  // Use city name from data
    placeName.classList.add("placeName", "dark:text-white", "text-slate-200");

    // Append to DOM
    placeInfo.appendChild(placeName);
    placeInfo.appendChild(descriptionHeading);
    placeInfo.appendChild(weatherIcon);
    localStorage.setItem("placeInfo", placeInfo);

    const dateTime = document.createElement("p");
    dateTime.innerHTML = getTimeZone(filteredData);
    const dateTimePara = document.getElementById("dateTime");
    dateTimePara.innerHTML = "";
    dateTimePara.appendChild(dateTime);
    localStorage.setItem("dateTime", dateTime);


    const today = document.getElementById("today");
    today.innerHTML = getToday();


    const windSpeedVal = document.getElementById("windSpeedVal");
    windSpeedVal.innerHTML = getSpeed(filteredData.forecast[0].wind.speed);
    const windSpeed = document.getElementById("windSpeed");
    windSpeed.innerHTML = "Wind speed";
    const degVal = document.getElementById("degVal");
    degVal.innerHTML = `${filteredData.forecast[0].wind.deg}°`;
    const deg = document.getElementById("deg");
    deg.innerHTML = "Direction";
    const gustVal = document.getElementById("gustVal");
    gustVal.innerHTML = getSpeed(filteredData.forecast[0].wind.gust);
    const gust = document.getElementById("gust");
    gust.innerHTML = "Gust";
    // console.log(windSpeedVal, windSpeed, degVal, deg, gustVal, gust);


    displayMaxMinTemp(filteredData);
    displayFeelsLikeTemp(filteredData);
    displaySunriseSunset(filteredData);
}


function displayMaxMinTemp(filteredData) {
    console.log(filteredData);
    const minTempVal = document.getElementById("minTempVal");
    const minTemp = document.getElementById("minTemp");
    const humidityVal = document.getElementById("humidityVal");
    const humidity = document.getElementById("humidity");
    const maxTempVal = document.getElementById("maxTempVal");
    const maxTemp = document.getElementById("maxTemp");


    minTempVal.innerHTML = `${filteredData.minTemp.toFixed(2)}°C`;
    minTemp.innerHTML = "MIN";

    humidityVal.innerHTML = `${filteredData.forecast[0].main.humidity}%`;
    humidity.innerHTML = "Humidity";

    maxTempVal.innerHTML = `${filteredData.maxTemp.toFixed(2)}°C`;
    maxTemp.innerHTML = "MAX";


    // console.log(minTempVal, minTemp, humidityVal, humidity, maxTempVal, maxTemp);
}

function displayFeelsLikeTemp(filteredData) {
    const feelsLikeVal = document.getElementById("feelsLikeVal");
    feelsLikeVal.innerHTML = `${filteredData.forecast[0].main.feels_like}°C`;
    const feelsLike = document.getElementById("feelsLike");
    feelsLike.innerHTML = "Feels like";

}

function displaySunriseSunset(filteredData) {
    const sunriseTime = document.getElementById("sunriseTime");
    const sunrise = document.getElementById("sunrise");
    const sunsetTime = document.getElementById("sunsetTime");
    const sunset = document.getElementById("sunset");
    // console.log(sunriseTime, sunrise, sunsetTime, sunset);

    const timeZoneOffset = filteredData.city.timezone;
    const sunriseTimestamp = filteredData.city.sunrise;
    const sunsetTimestamp = filteredData.city.sunset;

    const sunriseDate = new Date((timeZoneOffset + sunriseTimestamp) * 1000);
    const sunriseT = formatTime(sunriseDate);
    sunriseTime.innerHTML = sunriseT;
    sunrise.innerHTML = "Sunrise";

    const sunsetDate = new Date((timeZoneOffset + sunsetTimestamp) * 1000);
    // console.log(sunsetDate);
    const sunsetT = formatTime(sunsetDate);
    sunsetTime.innerHTML = sunsetT;
    sunset.innerHTML = "Sunset";


    // console.log(timeZoneOffset, sunriseTimestamp, sunsetTimestamp);
}

function formatTime(date) {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

function removeElements() {
    const removeAllData = document.querySelectorAll(".remove");
    removeAllData.forEach(element => {
        element.innerHTML = "";
    })
}

function getTimeZone(filteredData) {
    const timeZoneData = {
        timeZone: filteredData.city.timezone, // Offset in seconds from UTC
        dt: filteredData.forecast[0].dt,
        sunrise: filteredData.city.sunrise,
        sunset: filteredData.city.sunset
    };

    // Adjust the timestamp by adding the timezone offset (in milliseconds)
    const localDate = new Date((timeZoneData.dt + timeZoneData.timeZone) * 1000);

    const year = localDate.getFullYear();
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits
    const day = localDate.getDate().toString().padStart(2, '0'); // Ensure two digits
    const hours = localDate.getUTCHours().toString().padStart(2, '0'); // Ensure two digits
    const minutes = localDate.getUTCMinutes().toString().padStart(2, '0'); // Ensure two digits
    const seconds = localDate.getUTCSeconds().toString().padStart(2, '0'); // Ensure two digits

    // Return the formatted date string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}



function getSpeed(val) {
    const value = val * 3.6;
    const newValue = value.toFixed(2);
    const newFractionalValue = parseFloat(newValue);
    return `${newFractionalValue} km/h`;
}

function getToday() {
    const date = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thrusday", "Friday", "Saturday"];

    return days[date.getDay()];
}
