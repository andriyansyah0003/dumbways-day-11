// Membuka email (Day 3)
function submitForm() {
  const emailReceiver = "andriyansyah0003@gmail.com";

  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value;
  let subject = document.getElementById("subject").value;
  let message = document.getElementById("message").value;

  let a = document.createElement("a");
  a.href = `mailto:${emailReceiver}?subject=${subject}&body=Hallo, Perkenalkan Nama saya ${name}. I wanted to ${subject}, ${message} .terimakasih`;
  if (name && email && phone && subject && message) {
    a.click();
  }
}

// blog
let projects = [];

function addProject() {
  let projectName = document.getElementById("project-name").value;
  let startDate = new Date(document.getElementById("start-date").value);
  let endDate = new Date(document.getElementById("end-date").value);
  let lengthDate = getDateDifference(startDate, endDate);
  let description = document.getElementById("description").value;

  let logoTechlist = [];
  if (document.getElementById("node-js").checked) {
    logoTechlist.push("node-js");
  }
  if (document.getElementById("react-js").checked) {
    logoTechlist.push("react-js");
  }
  if (document.getElementById("next-js").checked) {
    logoTechlist.push("next-js");
  }
  if (document.getElementById("typeScript").checked) {
    logoTechlist.push("typeScript");
  }

  let image = document.getElementById("project-img").files[0];

  image = URL.createObjectURL(image);

  const dateFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  let project = {
    name: projectName,
    startDate: startDate.toLocaleDateString("id-ID", dateFormatOptions),
    endDate: endDate.toLocaleDateString("id-ID", dateFormatOptions),
    lengthDate: lengthDate.months,
    description: description,
    logoTechlist: logoTechlist,
    image: image,
  };

  projects.push(project);

  renderProjects();
}

function renderProjects() {
  let projectContainer = document.getElementById("project-container");

  projectContainer.innerHTML = "";

  projects.forEach((data) => {
    projectContainer.innerHTML += `
    <div class="col-4">
      <div class="card mx-auto mb-3" style="width: 18rem">
        <img src="${data.image}" class="card-img-top" alt="..." />
        <div class="card-body">
          <h5 class="card-title">${data.name}</h5>
          <p class="duration text-muted">
            Duration : ${data.lengthDate} months
          </p>
          <p class="card-text">
            ${data.description}
          </p>
          <div>
            ${checkTechLogoifExists(data.logoTechlist)}
          </div>
          <div class="d-flex">
            <a href="#" class="btn btn-primary w-100 me-3">Edit</a>
            <a href="#" class="btn btn-primary w-100">Delete</a>
          </div>
        </div>
      </div>
    </div>`;
  });
}

// Get Difefrent Time (Count Time)
const month = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function checkTechLogoifExists(list) {
  let logoTech = "";
  if (list.includes("node-js")) {
    logoTech +=
      '<img class="m-3" src="../img/nodejs-icon.svg" alt="node-js" height="30">';
  }
  if (list.includes("react-js")) {
    logoTech +=
      '<img class="m-3" src="../img/react.svg" alt="react-js" height="30">';
  }
  if (list.includes("next-js")) {
    logoTech +=
      '<img class="m-3" src="../img/nextjs-icon.svg" alt="next-js" height="30">';
  }
  if (list.includes("typeScript")) {
    logoTech +=
      '<img class="m-3" src="../img/typescript-icon.svg" alt="typescript-js" height="30">';
  }
  return logoTech;
}

function getDateDifference(startDate, endDate) {
  if (startDate > endDate) {
    console.error("Start date must be before end date");
    return null;
  }
  let startYear = startDate.getFullYear();
  let startMonth = startDate.getMonth();
  let startDay = startDate.getDate();

  let endYear = endDate.getFullYear();
  let endMonth = endDate.getMonth();
  let endDay = endDate.getDate();

  let february =
    (endYear % 4 == 0 && endYear % 100 != 0) || endYear % 400 == 0 ? 29 : 28;
  let daysOfMonth = [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let startDateNotPassedInEndYear =
    endMonth < startMonth || (endMonth == startMonth && endDay < startDay);
  let years = endYear - startYear - (startDateNotPassedInEndYear ? 1 : 0);
  let months = (12 + endMonth - startMonth - (endDay < startDay ? 1 : 0)) % 12;

  let days =
    startDay <= endDay
      ? endDay - startDay
      : daysOfMonth[(12 + endMonth - 1) % 12] - startDay + endDay; // get days

  return {
    years: years,
    months: months,
    days: days,
  };
}
