// Selecting DOM elements
const container = document.querySelector(".container");
const currentDegree = document.querySelector(".weather__degree").firstChild;
const currLocation = document.querySelector(".weather__information-location");
const currDay = document.querySelector(".weather__information-day");
const currDate = document.querySelector(".weather__information-date");
const currIcon = document.querySelector(".weather__icon");
const weekDays = document.querySelectorAll(".weather__week__day-box");
const search = document.querySelector(".input");
const searchBox = document.querySelector(".search__box");
const overlay = document.querySelector(".overlay");
const spinnerIcon = document.querySelector(".spinner__icon");
const errorBox = document.querySelector(".error__message-box");
const errorMsg = document.querySelector(".error__message");

//Variables

const TOMORROW_API_KEY = "apikey=OgZbA7H03S1FjQBK7xaYFVWKdWOXfMZg";
const TOMORROW_URL = `https://api.tomorrow.io/v4/weather/forecast?`;
const date = new Date();

// Function creating custom URL based on the users geolocation

const urlForecast = (lat, lng) => {
  return `${TOMORROW_URL}location=${lat},${lng}&daily&${TOMORROW_API_KEY}`;
};

const urlLocation = (lat, lng) => {
  return `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
};

// Function creating the date based on the current date

const getDate = function (day) {
  return `${date.getDate() + day}/${date.getMonth() + 1}/${date
    .getFullYear()
    .toString()
    .slice(2)}`;
};

// Function returning the week day based on the current day

const weekDay = function (day) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const newWeekOrder = daysOfWeek
    .slice(date.getDay())
    .concat(daysOfWeek.slice(0, date.getDay()));
  return newWeekOrder[day];
};

// Function changing icon based on weather and time of day.

const changeIcon = function (data, day) {
  return `/png/${data.timelines.daily[day].values.weatherCodeMax}0.png`;
};

// Function changing the background based on the weather

const changeColor = function (temp) {
  switch (true) {
    case temp < -10:
      container.style.backgroundImage =
        "linear-gradient(to right, #9fccfa, #0974f1)";
      break;
    case temp >= -10 && temp < 0:
      container.style.backgroundImage =
        "linear-gradient(to right, #b597f6, #96c6ea)";
      break;
    case temp >= 0 && temp < 10:
      container.style.backgroundImage =
        "linear-gradient(to right, #f6cfbe, #b9dcf2)";
      break;
    case temp >= 10 && temp < 20:
      container.style.backgroundImage =
        "linear-gradient(to right, #f6d5f7, #fbe9d7)";
      break;
    case temp >= 20 && temp < 30:
      container.style.backgroundImage =
        "linear-gradient(to right, #ffa585, #ffeda0)";
      break;
    case temp >= 30 && temp < 40:
      container.style.backgroundImage =
        "linear-gradient(to right, #f3696e, #f8a902)";
      break;
    case temp >= 40:
      container.style.backgroundImage =
        "linear-gradient(to right, #ff0f7b, #f89b29)";
      break;
  }
};

// Function updating the UI

const updateMainUI = function (data) {
  //Changing colors

  changeColor(data.timelines.daily[0].values.temperatureAvg);

  // Updating the current day UI

  currentDegree.textContent = Math.round(
    data.timelines.daily[0].values.temperatureAvg
  );
  currDay.textContent = weekDay(0);
  currDate.textContent = getDate(0);
  currIcon.src = changeIcon(data, 0);

  //Updating the week days UI

  weekDays.forEach((element, i) => {
    element.querySelector(".weather__week__day-name").textContent = weekDay(
      i + 1
    );
    element.querySelector(".weather__week__day-date").textContent = getDate(
      i + 1
    );
    element.querySelector(".weather__week__day-degree").firstChild.textContent =
      Math.round(data.timelines.daily[i + 1].values.temperatureAvg);
    element.querySelector(".weather__week__day-icon").src = changeIcon(
      data,
      i + 1
    );
  });
};

// Function for fetching data, returning json or throwing a new Error

const getJson = function (url) {
  return fetch(url).then((response) => {
    console.log(response);
    if (!response.ok) throw new Error(response.status);
    return response.json();
  });
};

// Promisifying the geolocation API

const getLocation = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

// Rendering error message

const renderErrorMsg = function (err, code, msg) {
  if (err.message === `${code}`) {
    errorMsg.textContent = `${msg}`;
  }
  spinnerIcon.classList.toggle("hidden");
  errorBox.classList.toggle("hidden");
};

// Adding an event listener to hide the error message

const hideError = function () {
  overlay.addEventListener(
    "click",
    () => {
      overlay.classList.toggle("hidden");
      errorBox.classList.toggle("hidden");
      spinnerIcon.classList.toggle("hidden");
    },
    { once: true }
  );
};

// Function initiating the app
const init = function () {
  getLocation()
    .then((response) => {
      const { latitude: lat, longitude: lng } = response.coords;
      return Promise.all([
        getJson(urlLocation(lat, lng)),
        getJson(urlForecast(lat, lng)),
      ]);
    })
    .then((data) => {
      currLocation.textContent = data[0].address.city;
      updateMainUI(data[1]);
      overlay.classList.toggle("hidden");
    })
    .catch((err) => {
      renderErrorMsg(
        err,
        429,
        "We have reached the limit. Please try again later"
      );
      hideError();
    });

  searchBox.addEventListener("submit", function (e) {
    e.preventDefault();
    search.blur();
    overlay.classList.toggle("hidden");
    getJson(`${TOMORROW_URL}location=${search.value}&daily&${TOMORROW_API_KEY}`)
      .then((data) => {
        currLocation.textContent = search.value;
        search.value = "";
        updateMainUI(data);
        overlay.classList.toggle("hidden");
      })
      .catch((err) => {
        renderErrorMsg(
          err,
          429,
          "You have reached the limit. Please try again later"
        );
        search.value = "";
        hideError();
      });
  });
};

init();
