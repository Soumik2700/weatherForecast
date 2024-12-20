// Select elements
const darkModeBtn = document.querySelector(".darkModeBtn");
const htmlElement = document.getElementById("htmlSelector");

// Function toLowerCase() toggle dark mode
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



let searchedCity = JSON.parse(localStorage.getItem("searchedCity")) || [];
localStorage.setItem('searchedCity', JSON.stringify(searchedCity));

searchCityBtn.addEventListener("click", getDataByCity);
async function getDataByCity(cityName) {

    message.innerHTML = "Wait for a while...";
    document.getElementById("lat").value = "";
    document.getElementById("lon").value = "";
    removeElements();
    try {
        const cityInput = document.getElementById("cityName");
        const city = cityInput.value.trim() || cityName;

        const invalidPattern = /[^a-zA-Z\s]/;

        if (!city) {
            alert("Please enter a city name.");
            cityInput.focus();
            message.innerHTML = "";
            return;
        } else if (invalidPattern.test(city)) {
            alert("City name should only contain letters and spaces.");
            cityInput.focus();
            message.innerHTML = "";
            return;
        }


        // console.log(city);
        const sortedArray = JSON.parse(localStorage.getItem("searchedCity")) || [];

        if (typeof (city) != "object") {
            if (!sortedArray.includes(city)) {
                sortedArray.push(city);
                localStorage.setItem("searchedCity", JSON.stringify(sortedArray));
            }
        }

        // const recentAddedCity = JSON.parse(localStorage.getItem("searchedCity"))[JSON.parse(localStorage.getItem("searchedCity")).length - 1];

        // console.log(recentAddedCity);

        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`);
        if (!response.ok) {
            throw new Error(`${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        // console.log(data);
        message.innerHTML = "";
        // console.log(data);

        const timezoneOffset = data.city.timezone;

        // Initialize an empty array toLowerCase() store the forecast data for 5 days
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

            // Ensure we are within the time range (20:00 toLowerCase() 24:00 local time)
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

        // console.log(filteredData);

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
const cityInput = document.getElementById("cityName");
const searchHistory = document.getElementById("searchHistory");

cityInput.addEventListener("click", function () {
    makeSearchHistory();
})

function makeSearchHistory() {
    searchHistory.style.opacity = 1;
    // console.log(searchHistory);

    searchHistory.innerHTML = "";
    const existingCities = JSON.parse(localStorage.getItem("searchedCity")) || [];
    const reversedCities = existingCities.reverse();

    reversedCities.forEach(city => {

        // console.log(city);
        const historyDiv = document.createElement("div");
        historyDiv.classList.add("historyDiv", "w-full", "h-10", "flex", "justify-around", "text-slate-600", "items-center", "hover:bg-slate-300");

        const cityDiv = document.createElement("div");
        cityDiv.classList.add("cityDiv", "w-[100%]", "flex", "items-center", "h-full", "px-2");

        cityDiv.innerHTML = `<p class = "w-full h-full flex items-center">${city}</p>`;

        const deleteCity = document.createElement("div");
        deleteCity.classList.add("deleteCity", "w-[20%]", "flex", "justify-center", "items-center", "h-[70%]", "hover:bg-blue-300", "rounded-full");
        deleteCity.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 50 50" width="15px" height="15px"><path d="M 25 2 C 12.309534 2 2 12.309534 2 25 C 2 37.690466 12.309534 48 25 48 C 37.690466 48 48 37.690466 48 25 C 48 12.309534 37.690466 2 25 2 z M 25 4 C 36.609534 4 46 13.390466 46 25 C 46 36.609534 36.609534 46 25 46 C 13.390466 46 4 36.609534 4 25 C 4 13.390466 13.390466 4 25 4 z M 32.990234 15.986328 A 1.0001 1.0001 0 0 0 32.292969 16.292969 L 25 23.585938 L 17.707031 16.292969 A 1.0001 1.0001 0 0 0 16.990234 15.990234 A 1.0001 1.0001 0 0 0 16.292969 17.707031 L 23.585938 25 L 16.292969 32.292969 A 1.0001 1.0001 0 1 0 17.707031 33.707031 L 25 26.414062 L 32.292969 33.707031 A 1.0001 1.0001 0 1 0 33.707031 32.292969 L 26.414062 25 L 33.707031 17.707031 A 1.0001 1.0001 0 0 0 32.990234 15.986328 z"/></svg>`

        historyDiv.appendChild(cityDiv);
        historyDiv.appendChild(deleteCity);

        searchHistory.appendChild(historyDiv);

        if (searchHistory.offsetHeight > 155) {
            searchHistory.style.height = "155px";
            searchHistory.style.overflowY = "auto";
        }

        cityDiv.addEventListener("click", function (event) {
            const city = event.target.textContent;
            document.getElementById("cityName").value = city;
            getDataByCity(city);
            searchHistory.style.opacity = 0;
        })

        deleteCity.addEventListener("click", function (event) {
            // searchHistory.style.opacity = 1;

            // Identify the target elements
            const deleteButton = event.target.closest(".deleteCity");
            const historyDiv = event.target.closest(".historyDiv");
            const city = historyDiv.querySelector(".cityDiv").textContent.trim();
            // console.log(deleteButton, historyDiv, city);

            // Retrieve and update the array in localStorage
            const array = JSON.parse(localStorage.getItem("searchedCity")) || [];
            const index = array.indexOf(city);

            if (index !== -1) {
                array.splice(index, 1); // Remove the city from the array
            }

            // Remove the city display element from the DOM
            historyDiv.remove();

            // Update localStorage with the modified array
            localStorage.setItem("searchedCity", JSON.stringify(array));
        });

    })
    // console.log(searchHistory.offsetHeight);
}

document.addEventListener("click", function (event) {
    // console.log(event.target);
    if (!cityInput.contains(event.target) && !searchHistory.contains(event.target)) {
        searchHistory.style.opacity = 0;
    }
})

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
    // Get latitude and longitude values
    const lat = document.getElementById("lat").value.trim();
    const lon = document.getElementById("lon").value.trim();

    // Validate latitude and longitude
    if (!lat || !lon) {
        alert("Please enter both latitude and longitude.");
        return;
    }

    // Check if lat and lon are valid numbers within the appropriate range
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        alert("Latitude must be a number between -90 and 90.");
        return;
    }

    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
        alert("Longitude must be a number between -180 and 180.");
        return;
    }

    // If valid, fetch the weather data
    fetchData(latNum, lonNum);
}

const locationButton = document.getElementById("locationBtn");
locationButton.addEventListener("click", getLocation)
function getLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude

        // console.log(lat);
        // console.log(lon);

        document.getElementById("lat").value = lat;
        document.getElementById("lon").value = lon;
        fetchData(lat, lon);
        // locationButton.removeEventListener("click", getLocation);
    })
}

async function fetchData(lat, lon) {
    const message = document.getElementById("message");
    message.innerHTML = "Wait for a while...";
    document.getElementById("cityName").value = "";
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error(`${response.status - response.statusText}`);
        }
        if (!lat || !lon) {
            throw new Error("Please enter valid latitude and longitude!");

        }
        const data = await response.json();
        message.innerHTML = "";

        // Get timezone offset from the city data (in seconds)
        const timezoneOffset = data.city.timezone;

        // Initialize an empty array toLowerCase() store the forecast data for 5 days
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

            // Ensure we are within the time range (20:00 toLowerCase() 24:00 local time)
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

        // console.log(filteredData);

        // Continue processing the filtered data
        placeInfoElements(filteredData);
        getTimeZone(filteredData);
        getSunriseTime(filteredData);
        getSunsetTime(filteredData);
        getAnimationOnTodayInfo();
        getAnimationOnDayTwo();

    } catch (error) {
        // console.error('Error fetching weather data:', error);
        message.innerHTML = `Failed to fetch: ${error}`;
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
    if (icon.endsWith('n')) {
        var iconCode = icon.slice(0, -1) + 'd';
        // console.log(iconCode);
    } else {
        iconCode = icon;
    }

    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    // console.log(weatherIcon.src);

    placeName.innerHTML = filteredData.city.name;  // Use city name from data
    placeName.classList.add("placeName", "dark:text-white", "text-slate-200");

    // Append toLowerCase() DOM
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
    if (icon.endsWith('n')) {
        var iconCode = icon.slice(0, -1) + 'd';
        // console.log(iconCode);
    } else {
        iconCode = icon;
    }

    const iconLink = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
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
    feelsLikeVal.innerHTML = `${convertToCelsius(filteredData.forecast[0].main.feels_like)}°C`;
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

        const icon = filteredData.forecast[index].weather[0].icon;
        if (icon.endsWith('n')) {
            var iconCode = icon.slice(0, -1) + 'd';
            // console.log(iconCode);
        } else {
            iconCode = icon;
        }


        image.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
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