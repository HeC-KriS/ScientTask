const express = require("express")
const path = require('path');
const mongoose = require("mongoose")
const {collection,collection2} = require("./config.js")
const bcrypt = require("bcrypt")
const session = require("express-session");
const app = express()


app.use(session({
  secret: '12345',
  resave: false,
  saveUninitialized: true
}));



app.use(express.static('public'))
app.set('view engine', 'ejs')

// 👇 Add this to handle form POST data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/',(req,res)=>{
  res.redirect('/home')
})

app.get('/login', (req, res) => {
  res.render('login')
})
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    //fetching the user with username
    const user = await collection.findOne({ username: username });
    if (!user) {
      return res.send("Username not found");
    }

    // checking pass by hashing it and compare it with db hashed pass
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.send("Incorrect password");
    }
    req.session.user = {
      name: user.name,
      username: user.username,
      role: user.role
    };

    // when login works
    res.redirect('/home');
  } catch (err) {
    console.log(err);
    res.status(500).send("Error logging in");
  }
});


app.get('/signup', (req, res) => {
  res.render('signup')
})


app.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const data = {
      name: req.body.name,
      username: req.body.username,
      password: hashedPassword,
      role: req.body.role 
    };

    const userdata = await collection.insertMany([data]);
    console.log(userdata);
    res.redirect('/login');

  } catch (err) {
    if (err.code === 11000) {  
      res.status(400).send("Username already exists. Please choose another.");
    } else {
      console.log(err);
      res.status(500).send("Error signing up");
    }
  }
});

app.get('/home', async (req, res) => {
  const user = req.session.user || null;

  try {
    let filteredProjects;

    if (user && user.role === 'professor') {
      filteredProjects = await collection2.find({ owner: user.name });
    } else {
      filteredProjects = await collection2.find({});
    }

    res.render('home', { projects: filteredProjects, user });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error loading projects");
  }
});
app.post('/home', async (req, res) => {
  const projectData = {
    project: req.body.project,
    owner: req.body.owner,
    description: req.body.description
  };

  try {
    await collection2.insertMany([projectData]);
    res.redirect("/home");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving project");
  }
});


app.get('/add',(req,res)=>{
    res.render("add")
})
//the post of add goes to home directly


// editing the route get
app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid project ID");
  }

  try {
    const project = await collection2.findById(id);
    if (!project) {
      return res.status(404).send("Project not found");
    }
    res.render("edit", { project });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).send("Error fetching project");
  }
});

// editing the project post
app.post("/edit/:id", async (req, res) => {
  try {
    const { project, owner, description } = req.body;
    await collection2.findByIdAndUpdate(req.params.id, {
      project,
      owner,
      description,
    });
    res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating project");
  }
});

// Deleting projects
app.post("/delete/:id", async (req, res) => {
  try {
    await collection2.findByIdAndDelete(req.params.id);
    res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting project");
  }
});



app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});




app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
