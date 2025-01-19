let result = document.getElementById("weatherResult");

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const location = urlParams.get("locationInput");
  console.log("Saved Location ", sessionStorage.getItem("savedLocation"));
  const savedLocation = sessionStorage.getItem("savedLocation");
  console.log("After Setting ", sessionStorage.getItem("savedLocation"));

  if (location) {
    try {
      console.log("Checking if saved ", sessionStorage.getItem("savedLocation"));
      sessionStorage.setItem("savedLocation", location);
      console.log("Location that was recieved ", sessionStorage.getItem("savedLocation"));
      const { lat, lon } = await fetchLocation(location);
      if (lat && lon) {
        await fetchWeather(lat, lon);
      } else {
        result.innerHTML = `<p class="display-2 text-center fw-semibold"><i class="bi bi-exclamation-triangle"></i><br>Location not found!</p>`;
      }
    } catch (error) {
      console.error(error);
      result.innerHTML = `<p class="display-2 text-center fw-semibold"><i class="bi bi-exclamation-triangle"></i><br>Unable to fetch weather information</p>`;
    }
  } else if (savedLocation) {
    try {
      const { lat, lon } = await fetchLocation(savedLocation);
      if (lat && lon) {
        await fetchWeather(lat, lon);
      } else {
        result.innerHTML = `<p class="display-2 text-center fw-semibold"><i class="bi bi-exclamation-triangle"></i><br>Location not found!</p>`;
      }
    } catch (error) {
      console.error(error);
      result.innerHTML = `<p class="display-2 text-center fw-semibold"><i class="bi bi-exclamation-triangle"></i><br>Unable to fetch weather information</p>`;
    }
  } else {
    result.innerHTML = `<p class="display-2 text-center fw-semibold"><i class="bi bi-exclamation-triangle"></i><br>No location specified!</p>`;
  }
});

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

  const url = `${baseURL}${endpoint}?${fullQuery.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const body = await response.json();
    const { lat, lon, name } = body[0];

    return { lat, lon, name };
  } catch (error) {
    console.error(error);
  }

  return { lat: tempLat, lon: tempLon, name: tempName };
}

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

  const url = `${baseURL}${endpoint}?${queryParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const body = await response.json();

    const weatherTime = body.weather[0]?.icon || "unknown";
    const weatherDesc = body.weather[0]?.description || "unknown";

    const iconMap = {
      day: {
        clear: { src: "/imgs/clearday.png", alt: "A bright sunny day." },
        clouds: { src: "/imgs/cloudyday.png", alt: "Closeup of many clouds." },
        rain: {
          src: "/imgs/rainday.png",
          alt: "Closeup of the wet ground during heavy rain.",
        },
        thunderstorm: {
          src: "/imgs/thunderstormday.png",
          alt: "A thunderbolt striking the coast.",
        },
        snow: {
          src: "/imgs/snowday.png",
          alt: "Closeup of a leaf covered in snow.",
        },
        mist: {
          src: "/imgs/foggyday.png",
          alt: "Landscape view of a foggy forest.",
        },
      },
      night: {
        clear: { src: "/imgs/clearnight.png", alt: "A show of the night sky." },
        clouds: {
          src: "/imgs/cloudynight.png",
          alt: "A shot of the moon peaking through clouds.",
        },
        rain: {
          src: "/imgs/rainnight.png",
          alt: "Closeup of a window during a rainy night.",
        },
        thunderstorm: {
          src: "/imgs/thunderstormnight.png",
          alt: "A thunderbolt striking the coast during the night.",
        },
        snow: { src: "/imgs/snownight.png", alt: "Snowfall during the night." },
        mist: {
          src: "/imgs/foggynight.png",
          alt: "Landscape view of a foggy forest during the night.",
        },
      },
    };

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
