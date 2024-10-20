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
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        // Get timezone offset from the city data (in seconds)
        const timezoneOffset = data.city.timezone;  // In seconds

        // Filter the forecast to get times around noon (11:00 AM - 1:00 PM)
        const dailyForecast = data.list.filter(forecast => {
            const date = new Date((forecast.dt + timezoneOffset) * 1000); // Adjust for timezone
            const hours = date.getUTCHours();  // Get the hours in UTC

            // We allow a range between 11:00 AM and 1:00 PM (to account for slight deviations)
            return hours >= 11 && hours <= 13;
        });

        const filteredData = {
            city: data.city,  // Include city info
            forecast: dailyForecast  // Include filtered forecast
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
    placeName.classList.add("placeName");

    // Append to DOM
    placeInfo.appendChild(placeName);
    placeInfo.appendChild(descriptionHeading);
    placeInfo.appendChild(weatherIcon);

    const dateTime = document.createElement("p");
    dateTime.innerHTML = getTimeZone(filteredData);

    const dateTimePara = document.getElementById("dateTime");
    dateTimePara.innerHTML = "";
    dateTimePara.appendChild(dateTime);
}

function getTimeZone(filteredData) {
    const timeZoneData = {
        timeZone: filteredData.city.timezone,
        dt: filteredData.forecast[0].dt,
        sunrise: filteredData.city.sunrise,  // `city` object for sunrise and sunset
        sunset: filteredData.city.sunset
    };

    const date = new Date(timeZoneData.dt * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();


    // console.log(timeZoneData);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}




// const city = 'London';

// fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
//     .then(response => response.json())
//     .then(data => console.log(data))
//     .catch(error => console.error('Error:', error));
