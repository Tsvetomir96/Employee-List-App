//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/employeesDB", {useNewUrlParser: true});

const userSchema = {
    email: String,
    password: String
};

const User = new mongoose.model("User", userSchema);

const employeesSchema = {
  employeeNames: String,
    employeeAddress: String,
    employeePhone: Number,
    employeeSalary: Number
};

const employeeRegistration = mongoose.model("employeeRegistration", employeesSchema);

const employee1 = new employeeRegistration({
    employeeNames: "Dimitar Ivanov",
    employeeAddress: "Varna, Vasil Levski 11",
    employeePhone: "0894883752",
    employeeSalary: "1000"
});

const employee2 = new employeeRegistration({
    employeeNames: "Rosen Petkov",
    employeeAddress: "Sofia, Benkovska 19",
    employeePhone: "0896772621",
    employeeSalary: "1200"
});

const employee3 = new employeeRegistration({
    employeeNames: "Rositsa Milanova",
    employeeAddress: "Plovdiv, Petko Slaveikov 47",
    employeePhone: "0894663528",
    employeeSalary: "1600"
});

const defaultEmployees = [employee1, employee2, employee3];

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/list", function (req, res) {
    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    let day = today.toLocaleDateString("en-US", options);

    employeeRegistration.find({}, function (err, foundEmployees){

        if (foundEmployees.length === 0) {
            employeeRegistration.insertMany(defaultEmployees, function (err){
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully added new employee to DB.");
                }
            });
            res.redirect("/list");
        } else {
            res.render("list", {
                currentDate: day,
                newListEmployee: foundEmployees
            });
        }
    });
});

app.post("/register", function (req, res){
    const newUser = new User({
        email: req.body.email,
        password: req.body.password
    });
    newUser.save(function (err){
        if (err) {
            console.log(err);
        } else {
            res.redirect("/list")
            }
        });
    });

app.post("/login", function (req, res){
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email}, function (err, foundUser){
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.redirect("list");
                } else {
                    console.log("wrong");
                }
            }
        }
    });
});

app.post("/list", function (req, res){
     const employeeName = req.body.Names;
    const employeeAddresses = req.body.Address;
    const employeePhoneNumber = req.body.Phone;
    const employeeSalary = req.body.Salary;

    const employee = new employeeRegistration({
        employeeNames: employeeName,
        employeeAddress: employeeAddresses,
        employeePhone: employeePhoneNumber,
        employeeSalary: employeeSalary
    });

    employee.save();

    res.redirect("/list");
});

app.post("/delete" ,function (req, res){
    const checkedEmployeeId = req.body.deleting;
    const editEmployeeId = req.body.edit;

    employeeRegistration.findOneAndUpdate(editEmployeeId, function (err){
       if (!err) {
           console.log("You're editing the employee!");
           res.redirect("/list")
       }
    });

    employeeRegistration.findByIdAndRemove(checkedEmployeeId, function (err){
        if (!err) {
            console.log("You deleted checked employee!");
            res.redirect("/list");
        }
    });
});



app.listen(3000, function (){
    console.log("Server is running on localhost:3000")
});

