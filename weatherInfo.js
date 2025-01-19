let result = document.getElementById("weatherResult");

//As soon as the DOM content of the page loads, this function starts
document.addEventListener("DOMContentLoaded", async () => {
  //We first get the user input from the search form
  const urlParams = new URLSearchParams(window.location.search);
  const location = urlParams.get("locationInput");

  //We also get the saved location from sessionStorage
  const savedLocation = sessionStorage.getItem("savedLocation");

  //If the user has input a location, then we can call the handler function
  if (location) {
    await handleLocation(location);
  }
  //If there is a saved location and the user has not input a location, we can call the helper function on that location instead
  else if (savedLocation) {
    await handleLocation(savedLocation);
  }
  //Otherwise, we can use the geolocation API to get the current user's location without requiring the input
  else if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latit = position.coords.latitude;
        const longi = position.coords.longitude;
        
        // Fetch the location name from lat, lon
        const locationName = await getLocationFromCoords(latit, longi);
        
        // Save the location to sessionStorage for persistence across tabs
        sessionStorage.setItem("savedLocation", locationName);

        // Fetch weather using latit, longi
        await fetchWeather(latit, longi);
      },
      (error) => {
        console.error("Error fetching current location:", error);
        result.innerHTML = `<p class="display-2 text-center fw-semibold"><i class="bi bi-exclamation-triangle"></i><br>Unable to fetch your location</p>`;
      }
    );
  } 
  //Give this error in case no input is provided and geolocation API is not supported by the browser.
  else {
    result.innerHTML = `<p class="display-2 text-center fw-semibold"><i class="bi bi-exclamation-triangle"></i><br>Please input a location</p>`;
  }
});

//Handler function that uses the user input as location 
async function handleLocation(loc) {
  try {
    //Set the current location as a sessionStorage item
    sessionStorage.setItem("savedLocation", loc);
   
    //Get the latitude and longitude of the location
    const { lat, lon } = await fetchLocation(loc);

    //If successful, find the weather of the location
    if (lat && lon) {
      await fetchWeather(lat, lon);
    } else {
      result.innerHTML = `<p class="display-2 text-center fw-semibold"><i class="bi bi-exclamation-triangle"></i><br>Location not found!</p>`;
    }
  } catch (error) {
    console.error(error);
    result.innerHTML = `<p class="display-2 text-center fw-semibold"><i class="bi bi-exclamation-triangle"></i><br>Unable to fetch weather information</p>`;
  }
}

//Function that finds the latitude and longitude of the user's input location.
async function fetchLocation(param) {
  const baseURL = "https://api.openweathermap.org";
  const endpoint = "/geo/1.0/direct";
  const apiKey = "4accb0b517ed443bf0664626a4ef6368";
  const tempLat = 0;
  const tempLon = 0;
  const tempName = " ";

  const fullQuery = new URLSearchParams({
    q: param,
    appid: apiKey,
  });

  //Using our location and URL parameters, we create a URL string
  const url = `${baseURL}${endpoint}?${fullQuery.toString()}`;

  try {
    //Using fetch, we communicate with the OpenWeather Geoencoding API
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    //Return the latitude and longitude of the current location if successful
    const body = await response.json();
    const { lat, lon, name } = body[0];

    return { lat, lon, name };
  } catch (error) {
    console.error(error);
  }

  return { lat: tempLat, lon: tempLon, name: tempName };
}

async function getLocationFromCoords(lat, lon) {
  const baseURL = "https://api.openweathermap.org";
  const endpoint = "/geo/1.0/reverse";
  const apiKey = "4accb0b517ed443bf0664626a4ef6368";

  const queryParams = new URLSearchParams({
    lat: lat,
    lon: lon,
    appid: apiKey,
    limit: 1, // Only need one result
  });

  const url = `${baseURL}${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const body = await response.json();
    if (body.length > 0) {
      const { name, state, country } = body[0];

      // Handle missing state or country
      const locationName = `${name}${state ? `, ${state}` : ''}${country ? `, ${country}` : ''}`;
      return locationName || "Unknown Location";
    } else {
      return "Unknown Location";
    }
  } catch (error) {
    console.error(error);
    return "Unknown Location";
  }
}


//Function that finds the weather of the user's input location.
async function fetchWeather(latitude, longitude) {
  const baseURL = "https://api.openweathermap.org";
  const endpoint = "/data/2.5/weather";
  const apiKey = "4accb0b517ed443bf0664626a4ef6368";

  const queryParams = new URLSearchParams({
    lat: latitude,
    lon: longitude,
    appid: apiKey,
    units: "imperial",
  });

  //Using our location and URL parameters, we create a URL string
  const url = `${baseURL}${endpoint}?${queryParams.toString()}`;

  try {
    //Using fetch, we communicate with the OpenWeather Weather API
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const body = await response.json();

    //These parameters help us differentiate between day and night, and the different descriptions such as rain, snow, clear, etc.
    const weatherTime = body.weather[0]?.icon || "unknown";
    const weatherDesc = body.weather[0]?.description || "unknown";

    //We create an icon map that maps each kind of weather, depending on the time of the day, to a specific header image.
    const iconMap = {
      day: {
        clear: { src: "imgs/clearday.png", alt: "A bright sunny day." },
        clouds: { src: "imgs/cloudyday.png", alt: "Closeup of many clouds." },
        rain: {
          src: "imgs/rainday.png",
          alt: "Closeup of the wet ground during heavy rain.",
        },
        thunderstorm: {
          src: "imgs/thunderstormday.png",
          alt: "A thunderbolt striking the coast.",
        },
        snow: {
          src: "imgs/snowday.png",
          alt: "Closeup of a leaf covered in snow.",
        },
        mist: {
          src: "imgs/foggyday.png",
          alt: "Landscape view of a foggy forest.",
        },
      },
      night: {
        clear: { src: "imgs/clearnight.png", alt: "A show of the night sky." },
        clouds: {
          src: "imgs/cloudynight.png",
          alt: "A shot of the moon peaking through clouds.",
        },
        rain: {
          src: "imgs/rainnight.png",
          alt: "Closeup of a window during a rainy night.",
        },
        thunderstorm: {
          src: "imgs/thunderstormnight.png",
          alt: "A thunderbolt striking the coast during the night.",
        },
        snow: { src: "imgs/snownight.png", alt: "Snowfall during the night." },
        mist: {
          src: "imgs/foggynight.png",
          alt: "Landscape view of a foggy forest during the night.",
        },
      },
    };

    //We then access the images using keywords and the string.includes() function
    const timePeriod = weatherTime.includes("d") ? "day" : "night";
    const keywords = [
      "clear",
      "clouds",
      "rain",
      "thunderstorm",
      "snow",
      "mist",
    ];
    const weatherKey =
      keywords.find((key) => weatherDesc.includes(key)) || "default";

    const iconData = iconMap[timePeriod][weatherKey];

    //Formatted result to display the weather in a bootstrap style card
    const weatherHTML = `<div class="card mb-3 fw-medium" style="max-width: 800px; margin: auto">
                          <img
                           src=${iconData.src}
                           class="card-img-top rounded d-block img-fluid mx-auto"
                           alt=${iconData.alt}
                          />
                          <div
                           class="row g-0 d-flex flex-column flex-md-row align-items-center justify-content-center m-3 display-4 fw-semibold"
                          >
                            ${body.name}, ${body.sys.country}
                          </div>
                          <div class="row g-1 d-flex flex-column flex-md-row align-items-center m-3">
                            <div class="col-md-5 text-center text-md-start">
                              <div class="card-body">
                                <p class="card-text fw-medium display-2">
                                <span><i class="bi bi-cloud"></i> ${Math.ceil(
                                  body.main.temp
                                )}°</span> F
                                </p>
                                <p class="card-text h1 ms-0 fw-medium">${
                                  body.weather[0].main
                                }</p>
                                <p
                                 class="fw-bold ms-0 text-body-secondary text-uppercase"
                                >
                                  ${body.weather[0].description}
                                </p>
                                <span class="fw-semibold"
                                  >Min: ${Math.ceil(body.main.temp_min)}°F
                                </span>
                                <span class="fw-semibold">
                                  Max: ${Math.ceil(body.main.temp_max)}°F</span
                                >
                              </div>
                            </div>
                          <div class="col-md-7">
                            <ul class="list-group list-group-flush text-center text-md-start">
                              <li class="list-group-item d-flex justify-content-between">
                                <span>Feels like</span>
                                <span>${Math.ceil(
                                  body.main.feels_like
                                )}°F</span>
                              </li>
                              <li class="list-group-item d-flex justify-content-between">
                                <span>Humidity</span>
                                <span>${body.main.humidity}%</span>
                              </li>
                              <li class="list-group-item d-flex justify-content-between">
                                <span>Pressure</span>
                                <span>${body.main.pressure} hPa</span>
                              </li>
                              <li class="list-group-item d-flex justify-content-between">
                                <span>Wind Speed</span>
                                <span>${body.wind.speed} mph</span>
                              </li>
                              <li class="list-group-item d-flex justify-content-between">
                                <span>Wind Gust</span>
                                <span>${body.wind.gust} mph</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      `;

    result.innerHTML = weatherHTML;
  } catch (error) {
    console.error(error);
  }
}
