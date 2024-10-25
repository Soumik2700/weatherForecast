// Select elements
const darkModeBtn = document.querySelector(".darkModeBtn");
const htmlElement = document.getElementById("htmlSelector");

// Function to toggle dark mode
darkModeBtn.addEventListener("click", function () {
    const isDarkMode = htmlElement.classList.toggle("dark");

    // Update button text based on current mode
    darkModeBtn.innerText = isDarkMode ? "Light" : "Dark";
});


const apiKey = '86cf74ee20fbf270b000f8322804dcae';
const latLonBtn = document.getElementById("latLonBtn");
const searchCityBtn = document.getElementById("searchCity");
const todayInfo = document.getElementById("todayInfo");
const dayTwoInfo = document.getElementById("dayTwoInfo");
var message = document.getElementById("message");


// console.log(searchCityBtn);



let searchedCity = [];
localStorage.setItem('searchedCity', JSON.stringify(searchedCity));

searchCityBtn.addEventListener("click", getDataByCity);
async function getDataByCity() {

    message.innerHTML = "Wait for a while...";
    removeElements();
    try {
        const city = document.getElementById("cityName").value.trim();
        // console.log(typeof(city));
        const sortedArray = JSON.parse(localStorage.getItem("searchedCity"));

        if(!sortedArray.includes(city)){
            sortedArray.push(city);
            localStorage.setItem("searchedCity", JSON.stringify(sortedArray));
        }

        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`);
        if (!response.ok) {
            throw new Error(`${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        message.innerHTML = "";
        // console.log(data);

        const timezoneOffset = data.city.timezone;

        // Initialize an empty array to store the forecast data for 5 days
        let fiveDayForecast = [];
        let daysIncluded = new Set();  // To track which days have been added

        const dailyForecast = data.list.filter(forecast => {
            // Get the forecast timestamp and adjust it with the timezone offset
            const localTime = new Date((forecast.dt + timezoneOffset) * 1000);

            // Extract local hours and local date
            const localHours = localTime.getUTCHours();
            const localDate = localTime.getUTCDate();
            const localMonth = localTime.getUTCMonth();
            const localYear = localTime.getUTCFullYear();

            // Create a string representing the date (e.g., "2024-10-23")
            const dateString = `${localYear}-${localMonth + 1}-${localDate}`;

            // Ensure we are within the time range (20:00 to 24:00 local time)
            if (localHours >= 20 && localHours <= 24) {
                // Check if this day has already been included in the 5-day forecast
                if (!daysIncluded.has(dateString)) {
                    fiveDayForecast.push(forecast);  // Add forecast for this day
                    daysIncluded.add(dateString);    // Mark this day as included
                }
            }

            // Stop filtering once we have 5 unique days
            return fiveDayForecast.length < 5;
        });

        // If the filtering didn't yield any result, throw an error
        if (fiveDayForecast.length === 0) {
            throw new Error("No forecast data available for the given time range.");
        }

        // Calculate max and min temperature from the filtered forecast
        let maxTemp = -Infinity;
        let minTemp = Infinity;

        fiveDayForecast.forEach(forecast => {
            if (forecast.main.temp_max > maxTemp) {
                maxTemp = forecast.main.temp_max;
            }
            if (forecast.main.temp_min < minTemp) {
                minTemp = forecast.main.temp_min;
            }
        });

        // Create a new object with the filtered forecast and temperature details
        const filteredData = {
            city: data.city,  // Include city info
            forecast: fiveDayForecast, // Include filtered forecast
            maxTemp: maxTemp,
            minTemp: minTemp
        };

        console.log(filteredData);

        // Continue processing the filtered data
        placeInfoElements(filteredData);
        getTimeZone(filteredData);
        getSunriseTime(filteredData);
        getSunsetTime(filteredData);
        getAnimationOnTodayInfo();
        getAnimationOnDayTwo();

    } catch (error) {
        console.error('Error fetching weather data:', error);
        message.innerHTML = `Error fetching data: ${error}`;
    }
}

function getAnimationOnTodayInfo() {
    todayInfo.classList.remove("fade-in-one");

    void todayInfo.offsetWidth;

    todayInfo.classList.add("fade-in-one");
}

function getAnimationOnDayTwo() {
    dayTwoInfo.classList.remove("fade-in-two");

    void dayTwoInfo.offsetWidth;

    dayTwoInfo.classList.add("fade-in-two");
}

latLonBtn.addEventListener("click", getLatLon);

function getLatLon() {
    // Get latitude and longitude values inside the function after the button is clicked
    const lat = document.getElementById("lat").value;
    const lon = document.getElementById("lon").value;

    // Log to make sure the values are correct
    // console.log("Latitude:", lat);
    // console.log("Longitude:", lon);

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

        // console.log(lat);
        // console.log(lon);

        fetchData(lat, lon);
        // locationButton.removeEventListener("click", getLocation);
    })
}

async function fetchData(lat, lon) {
    const message = document.getElementById("message");
    message.innerHTML = "Wait for a while...";
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        message.innerHTML = "";

        // Get timezone offset from the city data (in seconds)
        const timezoneOffset = data.city.timezone;

        // Initialize an empty array to store the forecast data for 5 days
        let fiveDayForecast = [];
        let daysIncluded = new Set();  // To track which days have been added

        const dailyForecast = data.list.filter(forecast => {
            // Get the forecast timestamp and adjust it with the timezone offset
            const localTime = new Date((forecast.dt + timezoneOffset) * 1000);

            // Extract local hours and local date
            const localHours = localTime.getUTCHours();
            const localDate = localTime.getUTCDate();
            const localMonth = localTime.getUTCMonth();
            const localYear = localTime.getUTCFullYear();

            // Create a string representing the date (e.g., "2024-10-23")
            const dateString = `${localYear}-${localMonth + 1}-${localDate}`;

            // Ensure we are within the time range (20:00 to 24:00 local time)
            if (localHours >= 20 && localHours <= 24) {
                // Check if this day has already been included in the 5-day forecast
                if (!daysIncluded.has(dateString)) {
                    fiveDayForecast.push(forecast);  // Add forecast for this day
                    daysIncluded.add(dateString);    // Mark this day as included
                }
            }

            // Stop filtering once we have 5 unique days
            return fiveDayForecast.length < 5;
        });

        // If the filtering didn't yield any result, throw an error
        if (fiveDayForecast.length === 0) {
            throw new Error("No forecast data available for the given time range.");
        }

        // Calculate max and min temperature from the filtered forecast
        let maxTemp = -Infinity;
        let minTemp = Infinity;

        fiveDayForecast.forEach(forecast => {
            if (forecast.main.temp_max > maxTemp) {
                maxTemp = forecast.main.temp_max;
            }
            if (forecast.main.temp_min < minTemp) {
                minTemp = forecast.main.temp_min;
            }
        });

        // Create a new object with the filtered forecast and temperature details
        const filteredData = {
            city: data.city,  // Include city info
            forecast: fiveDayForecast, // Include filtered forecast
            maxTemp: maxTemp,
            minTemp: minTemp
        };

        console.log(filteredData);

        // Continue processing the filtered data
        placeInfoElements(filteredData);
        getTimeZone(filteredData);
        getSunriseTime(filteredData);
        getSunsetTime(filteredData);
        getAnimationOnTodayInfo();
        getAnimationOnDayTwo();

    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}




const placeInfo = document.querySelector(".placeInfo");
// placeInfo.classList.add("bg-red-400");

function placeInfoElements(filteredData) {
    placeInfo.innerHTML = "";
    const placeName = document.createElement("h2");
    const descriptionHeading = document.createElement("h3");
    // descriptionHeading.classList.add("bg-red-400", "w-full");
    const weatherIcon = document.createElement("img");


    const description = filteredData.forecast[0].weather[0].description;
    descriptionHeading.innerHTML = description;


    const icon = filteredData.forecast[0].weather[0].icon
    weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    // console.log(weatherIcon.src);

    placeName.innerHTML = filteredData.city.name;  // Use city name from data
    placeName.classList.add("placeName", "dark:text-white", "text-slate-200");

    // Append to DOM
    placeInfo.appendChild(placeName);
    placeInfo.appendChild(descriptionHeading);
    placeInfo.appendChild(weatherIcon);
    localStorage.setItem("placeInfo", placeInfo);

    const dateTime = document.createElement("p");
    dateTime.innerHTML = filteredData.forecast[0].dt_txt;
    const dateTimePara = document.getElementById("dateTime");
    dateTimePara.innerHTML = "";
    dateTimePara.appendChild(dateTime);
    localStorage.setItem("dateTime", dateTime);


    // const today = document.getElementById("today");
    // today.innerHTML = getToday(0);


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

    getSunriseTimeDayOne(filteredData);

    displayMaxMinTemp(filteredData);
    displayFeelsLikeTemp(filteredData);
    // displaySunriseSunset(filteredData);
    displayRestOfDaysData(filteredData);
}

function displayRestOfDaysData(filteredData) {
    // console.log(filteredData);
    const iconDes = document.querySelector(".iconDes");
    const hum = document.querySelector(".hum");
    const temp = document.querySelector(".temp");
    // const day = document.querySelector(".day");
    const date = document.querySelector(".date");
    const sunrise = document.querySelector(".sunrise");
    const sunset = document.querySelector(".sunset");
    const deg = document.querySelector(".deg");
    const wind = document.querySelector(".wind");
    const gust = document.querySelector(".gust");

    // `https://openweathermap.org/img/wn/${icon}@2x.png`
    const icon = filteredData.forecast[1].weather[0].icon;
    const iconLink = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    iconDes.innerHTML = `<img class="h-14 w-14 mt-3" src=${iconLink} alt="">
                        <h2 class = "font-bold text-slate-200">${filteredData.forecast[1].weather[0].description}</h2>`;

    hum.innerHTML = `<h2 class = "font-bold text-slate-200 text-sm">${filteredData.forecast[1].main.humidity}%</h2>
                    <h2 class = "font-bold text-slate-200">Humidity</h2>`;

    temp.innerHTML = `<h2 class = "font-bold text-slate-200 text-sm">${getCelsius(filteredData, 1)}°C</h2>
                <h2 class = "font-bold text-slate-200">Temp</h2>`;
    // day.innerHTML = `<h2 class = "font-bold text-base text-slate-200">${getToday(1)}</h2>`;
    date.innerHTML = `<h2 class = "text-gray-700">${filteredData.forecast[1].dt_txt}</h2>`;

    sunrise.innerHTML = `<h2 class = "font-bold">${getSunriseTime(filteredData)}</h2>
                        <h2 class = "font-bold">Sunrise</h2>`;
    sunset.innerHTML = `<h2 class = "font-bold">${getSunsetTime(filteredData)}</h2>
                        <h2 class = "font-bold">Sunset</h2>`

    deg.innerHTML = `<h2 class = "font-bold">${filteredData.forecast[1].wind.deg}°</h2>
                    <h2 class = "font-bold">Deg</h2>`;

    wind.innerHTML = `<h2 class = "font-bold">${filteredData.forecast[1].wind.speed}km/h</h2>
                    <h2 class = "font-bold">Wind</h2>`;

    gust.innerHTML = `<h2 class = "font-bold">${filteredData.forecast[1].wind.gust}km/h</h2>
                        <h2 class = "font-bold">Gust</h2>`;

    remainingThreeDays(filteredData);
}

function getSunriseTime(filteredData) {
    const timeZoneOffset = filteredData.city.timezone;
    const sunriseTimestamp = filteredData.city.sunrise;

    const sunriseDate = new Date((timeZoneOffset + sunriseTimestamp) * 1000);
    const sunriseT = formatTime(sunriseDate);
    return sunriseT;
    // console.log(sunriseT);
}
function getSunsetTime(filteredData) {
    const timeZoneOffset = filteredData.city.timezone;
    const sunsetTimestamp = filteredData.city.sunset;

    const sunsetDate = new Date((timeZoneOffset + sunsetTimestamp) * 1000);
    const sunsetT = formatTime(sunsetDate);

    // console.log(sunsetT);
    return sunsetT;
}

function displayMaxMinTemp(filteredData) {
    // console.log(filteredData);
    const minTempVal = document.getElementById("minTempVal");
    const minTemp = document.getElementById("minTemp");
    const humidityVal = document.getElementById("humidityVal");
    const humidity = document.getElementById("humidity");
    const maxTempVal = document.getElementById("maxTempVal");
    const maxTemp = document.getElementById("maxTemp");


    minTempVal.innerHTML = `${convertToCelsius(filteredData.minTemp)}°C`;
    minTemp.innerHTML = "MIN";

    humidityVal.innerHTML = `${filteredData.forecast[0].main.humidity}%`;
    humidity.innerHTML = "Humidity";

    maxTempVal.innerHTML = `${convertToCelsius(filteredData.maxTemp)}°C`;
    maxTemp.innerHTML = "MAX";


    // console.log(minTempVal, minTemp, humidityVal, humidity, maxTempVal, maxTemp);
}

function convertToCelsius(reading) {
    if (reading > 100) {
        return (reading - 273.15).toFixed(2);
    } else {
        return reading.toFixed(2);
    }
}

function displayFeelsLikeTemp(filteredData) {
    const feelsLikeVal = document.getElementById("feelsLikeVal");
    feelsLikeVal.innerHTML = `${filteredData.forecast[0].main.feels_like}°C`;
    const feelsLike = document.getElementById("feelsLike");
    feelsLike.innerHTML = "Feels like";

}

function getSunriseTimeDayOne(filteredData) {
    // console.log(filteredData);
    const timeZoneOffset = filteredData.city.timezone;
    const sunriseTimestamp = filteredData.city.sunrise;
    const sunsetTimestamp = filteredData.city.sunset;

    const sunriseDate = new Date((timeZoneOffset + sunriseTimestamp) * 1000);
    const sunriseT = formatTime(sunriseDate);

    const sunsetDate = new Date((timeZoneOffset + sunsetTimestamp) * 1000);
    // console.log(sunsetDate);
    const sunsetT = formatTime(sunsetDate);

    displaySunriseSunset(sunriseT, sunsetT);
}

function displaySunriseSunset(sunriseT, sunsetT) {
    const sunriseTime = document.getElementById("sunriseTime");
    const sunrise = document.getElementById("sunrise");
    const sunsetTime = document.getElementById("sunsetTime");
    const sunset = document.getElementById("sunset");
    // console.log(sunriseTime, sunrise, sunsetTime, sunset);

    sunriseTime.innerHTML = sunriseT;
    sunrise.innerHTML = "Sunrise";


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

function getTimeZone(filteredData, i) {
    if (!filteredData.forecast || !filteredData.forecast[i]) {
        console.error('Forecast data is missing or empty.');
        return 'Data not available';
    }

    const timeZoneData = {
        timeZone: filteredData.city.timezone, // Offset in seconds from UTC
        dt: filteredData.forecast[i].dt,
        sunrise: filteredData.city.sunrise,
        sunset: filteredData.city.sunset
    };

    // Adjust the timestamp by adding the timezone offset (in milliseconds)
    const localDate = new Date((timeZoneData.dt + timeZoneData.timeZone) * 1000);

    const year = localDate.getFullYear();
    const month = (localDate.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits
    const day = localDate.getDate().toString().padStart(2, '0'); // Ensure two digits
    const hours = localDate.getHours().toString().padStart(2, '0'); // Local hours instead of UTC hours
    const minutes = localDate.getMinutes().toString().padStart(2, '0'); // Local minutes
    const seconds = localDate.getSeconds().toString().padStart(2, '0'); // Local seconds

    // Return the formatted date string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}



function getSpeed(val) {
    const value = val * 3.6;
    const newValue = value.toFixed(2);
    const newFractionalValue = parseFloat(newValue);
    return `${newFractionalValue} km/h`;
}

function getToday(i) {
    const date = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thrusday", "Friday", "Saturday"];

    return days[date.getDay() + i];
}


function getCelsius(filteredData, i) {
    return filteredData.forecast[i].main.temp_max > 100 ? (filteredData.forecast[i].main.temp_max - 273.15).toFixed(2) : filteredData.forecast[i].main.temp_max;
}


function remainingThreeDays(filteredData) {
    const threeDaysDiv = document.querySelectorAll(".remainingThree");
    // console.log(threeDaysDiv);
    // console.log(filteredData);

    let index = 2;
    threeDaysDiv.forEach(part => {
        // console.log(part);
        part.innerHTML = "";
        part.classList.add("remove");

        const upperDiv = document.createElement("div");
        upperDiv.classList.add("upperDiv");
        part.appendChild(upperDiv);

        const dateDiv = document.createElement("div");
        dateDiv.classList.add("dateDiv");
        part.appendChild(dateDiv);

        const lowerDiv = document.createElement("div");
        lowerDiv.classList.add("lowerDiv");
        part.appendChild(lowerDiv);

        const image = document.createElement("img");
        const description = document.createElement("h2");
        description.classList.add("font-bold", "text-slate-200");
        upperDiv.appendChild(image);
        upperDiv.appendChild(description);


        const date = document.createElement("h2");
        date.classList.add("text-sm", "font-bold", "text-slate-600");
        dateDiv.appendChild(date);


        const tempDiv = document.createElement("div");
        tempDiv.classList.add("tempDiv")
        lowerDiv.appendChild(tempDiv);
        const humDiv = document.createElement("div");
        humDiv.classList.add("humDiv");
        lowerDiv.appendChild(humDiv);

        const tempVal = document.createElement("p");
        tempVal.classList.add("font-bold", "text-slate-200", "text-sm");
        const temp = document.createElement("h2");
        temp.classList.add("font-bold", "text-slate-200", "text-sm");
        tempDiv.appendChild(tempVal);
        tempDiv.appendChild(temp);


        const humVal = document.createElement("p");
        humVal.classList.add("font-bold", "text-slate-200", "text-sm");
        const hum = document.createElement("h2");
        hum.classList.add("font-bold", "text-slate-200", "text-sm");
        humDiv.appendChild(humVal);
        humDiv.appendChild(hum);

        image.src = `https://openweathermap.org/img/wn/${filteredData.forecast[index].weather[0].icon}@2x.png`;
        description.innerHTML = filteredData.forecast[index].weather[0].description;

        date.innerHTML = filteredData.forecast[index].dt_txt.substr(0, 10);

        tempVal.innerHTML = `${getCelsius(filteredData, index)}°C`;
        temp.innerHTML = "Temp";

        humVal.innerHTML = `${filteredData.forecast[index].main.humidity}%`;
        hum.innerHTML = "Humidity"

        index += 1;
    })

    getAnimationRemainThree(threeDaysDiv);
}

function getAnimationRemainThree(threeDaysDiv) {
    threeDaysDiv.forEach(each => {
        each.classList.remove("fade-in-three");

        void each.offsetWidth;

        each.classList.add("fade-in-three");
    })
}