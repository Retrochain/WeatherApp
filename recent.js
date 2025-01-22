export { saveSearches, displayRecentSearches };

//Function to save the last 6 recent searches
async function saveSearches(body, unit, icons) {
  //Set the required fields to display information
  const searchEntry = {
    name: body.name,
    temp: Math.ceil(body.main.temp),
    description: body.weather[0].description,
    units: unit,
    icon: icons,
    lat: body.coord.lat,
    lon: body.coord.lon,
  };
  
  //Get the latest search from session storage
  let recentSearches =
    JSON.parse(sessionStorage.getItem("recentSearches")) || [];

  //Avoid duplicates
  recentSearches = recentSearches.filter(
    (entry) => entry.name !== searchEntry.name
  );
  recentSearches.unshift(searchEntry);

  //Remove the oldest location
  if (recentSearches.length > 24) {
    recentSearches.pop();
  }

  //Store the recent searches in sessionStorage
  sessionStorage.setItem("recentSearches", JSON.stringify(recentSearches));

  //Display the searches if the container exists
  if (document.getElementById("recent")) {
    displayRecentSearches();
  }
}

//Function to display the last 6 searches
function displayRecentSearches() {
  //Get the DOM element that needs to be manipulated
  const recentContainer = document.getElementById("recent");
  if (!recentContainer) {
    return; // Exit the function if the element is not found
  }

  recentContainer.innerHTML = "";
  recentContainer.classList.add("d-flex", "flex-row", "flex-wrap");

  //Get the latest searches to display from sessionStorage
  const recentSearches =
    JSON.parse(sessionStorage.getItem("recentSearches")) || [];

  //Display each search along with some info, using search, in a card group
  recentSearches.forEach((search) => {
    const searchCard = document.createElement("div");
    searchCard.classList.add("card-group", "p-2", "mt-3");
    searchCard.style.width = "13rem";
    searchCard.innerHTML = `<div class="card rounded-4 shadow-sm">  
                              <div class="card-body p-3 text-center">
                                <h4 class="card-title"><span><i class="${search.icon}"></i> ${search.temp}°${search.units.charAt(0)}</span></h4>
                                <h5 class="card-subtitle mb-2 text-body-secondary">${search.name}</h5>
                                <p class="card-text text-capitalize">
                                  ${search.description}
                                </p>
                                <button class="btn btn-outline-primary card-text">
                                  View Details
                                </button>
                              </div>
                            </div>`;

    const button = searchCard.querySelector("button");
    button.addEventListener("click", () => showDetails(search.lat, search.lon))
    recentContainer.appendChild(searchCard);
  });
}

export function showDetails(lat, lon, unit) {
  console.log(lat, lon);
  window.location.href = `index.html?lat=${lat}&lon=${lon}&unit=${unit}`;
}

document.addEventListener("DOMContentLoaded", displayRecentSearches);
