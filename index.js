const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");

const db = require("./connection/db");

const app = express();
const port = 3000;

const isLogin = true;
let projects = [];

app.set("view engine", "hbs");

app.use("/public", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "rahasia",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 2 },
  })
);

app.use(flash());

app.get("/", function (req, res) {
  // console.log(req.session);
  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = "SELECT * FROM tb_projects";

    client.query(query, function (err, result) {
      if (err) throw err;

      const projects = result.rows;

      const newProject = projects.map((project) => {
        project.lengthDate = getDateDifference(
          project["start_date"],
          project["end_date"]
        );
        project.isLogin = req.session.isLogin;
      });

      res.render("index", {
        projects,
        isLogin: req.session.isLogin,
        user: req.session.user,
      });
    });
    done();
  });
});

app.get("/add-project", function (req, res) {
  res.render("add-project", {
    isLogin: req.session.isLogin,
    user: req.session.user,
  });
});

app.post("/add-project", function (req, res) {
  const name = req.body.name;
  const start_date = req.body.startDate;
  const end_date = req.body.endDate;
  const description = req.body.description;
  const technologies = [];
  const image = req.body.image;

  if (req.body.nodeJs) {
    technologies.push("nodejs");
  } else {
    technologies.push("");
  }
  if (req.body.reactJs) {
    technologies.push("reactjs");
  } else {
    technologies.push("");
  }
  if (req.body.nextJs) {
    technologies.push("nextJs");
  } else {
    technologies.push("");
  }
  if (req.body.typeScript) {
    technologies.push("typeScript");
  } else {
    technologies.push("");
  }

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `INSERT INTO tb_projects (name, start_date, end_date, description, technologies, image) 
                   VALUES ('${name}', '${start_date}', '${end_date}', '${description}', ARRAY ['${technologies[0]}', '${technologies[1]}','${technologies[2]}', '${technologies[3]}'], '${image}')`;

    client.query(query, function (err, result) {
      if (err) throw err;

      res.redirect("/");
    });
    done();
  });
});

app.get("/project-detail/:id", function (req, res) {
  const id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_projects WHERE id = ${id}`;

    client.query(query, function (err, result) {
      if (err) throw err;

      const project = result.rows[0];

      project.lengthDate = getDateDifference(
        project["start_date"],
        project["end_date"]
      );
      project["start_date"] = converTime(project["start_date"]);
      project["end_date"] = converTime(project["end_date"]);

      res.render("project-detail", {
        project,
        isLogin: req.session.isLogin,
        user: req.session.user,
      });
    });
    done();
  });

  return;
});

app.get("/contact", function (req, res) {
  res.render("contact", {
    isLogin: req.session.isLogin,
    user: req.session.user,
  });
});

app.get("/edit-project/:id", function (req, res) {
  const id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_projects WHERE id = ${id};`;

    client.query(query, function (err, result) {
      if (err) throw err;

      const project = result.rows[0];

      // project.start_date = getFullTime(project["start_date"]);
      // project.end_date = getFullTime(project["end_date"]);

      res.render("edit-project", {
        name: project.name,
        edit: project,
        id: project.id,
        isLogin: req.session.isLogin,
        user: req.session.user,
      });
    });
    done();
  });
});

// app.post("/edit-project/:index", function (req, res) {
//   const data = req.body;
//   const index = req.params.index;

//   data.lengthDate = getDateDifference(data["startDate"], data["endDate"]);
//   data["start-date"] = converTime(data["startDate"]);
//   data["end-date"] = converTime(data["endDate"]);

//   console.log(data);

//   projects[index] = data;

//   res.redirect("/");
// });

app.get("/delete-project/:id", (req, res) => {
  const id = req.params.id;

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `DELETE FROM tb_projects WHERE id = ${id}`;

    client.query(query, function (err, result) {
      if (err) throw err;

      res.redirect("/");
    });
    done();
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  let password = req.body.password;

  password = bcrypt.hashSync(password, 10);

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `INSERT INTO tb_user(name,email,password) 
                    VALUES('${name}','${email}','${password}');`;

    client.query(query, function (err, result) {
      if (err) throw err;

      if (err) {
        res.redirect("/register");
      } else {
        res.redirect("/login");
      }
    });

    done();
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email == "" || password == "") {
    req.flash("warning", "Please insert all fields");
    return res.redirect("/login");
  }

  db.connect(function (err, client, done) {
    if (err) throw err;

    const query = `SELECT * FROM tb_user WHERE email = '${email}';`;

    client.query(query, function (err, result) {
      if (err) throw err;

      const data = result.rows;

      if (data.length == 0) {
        req.flash("error", "Email not found");
        return res.redirect("/login");
      }

      const isMatch = bcrypt.compareSync(password, data[0].password);

      if (isMatch == false) {
        req.flash("error", "Password not match");
        return res.redirect("/login");
      }

      req.session.isLogin = true;
      req.session.user = {
        id: data[0].id,
        email: data[0].email,
        name: data[0].name,
      };

      req.flash("success", `Welcome, <b>${data[0].email}</b>`);

      res.redirect("/");
    });

    done();
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(port, function () {
  console.log(`Server running on port: ${port}`);
});

function getFullTime(time) {
  time = new Date(time);

  return time;
}

function getDateDifference(startDate, endDate) {
  startDate = new Date(startDate);
  endDate = new Date(endDate);
  const startDateUTC = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const endDateUTC = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );
  day = 1000 * 60 * 60 * 24; // miliseconds in a day
  difference = (endDateUTC - startDateUTC) / day; // difference in days
  return difference < 30
    ? difference + " Days"
    : parseInt(difference / 30) + " Months"; // return difference in months
}

function converTime(time) {
  return new Date(time).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
