var express             = require("express"),
    methodOverride      = require("method-override"),
    bodyParser          = require("body-parser"),
    expressSanitizer    = require("express-sanitizer"),
    mongoose            = require("mongoose"), //to connect to mongodb
    app                 = express();

mongoose.connect("mongodb://localhost/todolist");
mongoose.Promise = global.Promise;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE/Model CONFIG
var todoSchema = new mongoose.Schema ({
    name: String,
    description: String
});
var Todo = mongoose.model("Todo", todoSchema);

//RESTful ROUTES
app.get("/", function(req, res) {
    res.redirect("/todo"); 
});

// INDEX ROUTE - show all todos
app.get("/todo", function(req, res){
    //get all the todos from DB
    Todo.find({}, function(err, allTodos){
       if(err){
           console.log(err);
       } else {
           res.render("index", {todos:allTodos});
       }
    });
});

// CREATE ROUTE - add new todo to db
app.post("/todo", function(req, res){
    //get data from text input and add to todos db
    var name = req.body.name;
    var description = req.body.description;
    var newTodo = {name: name, description: description};
    //create a new todo and save to DB
    Todo.create(newTodo, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to todos page
            res.redirect("/todo");
        }
    });
});

// SHOW ROUTE - Shows description about one todo
app.get("/todo/:id", function(req, res){
    //find the todo with provided ID
    Todo.findById(req.params.id, function(err, foundTodo){
        if(err){
            res.redirect("/todo");
        } else {
            //render show template with that todo
            res.render("show", {todo: foundTodo}); 
        }
    });
});

// EDIT ROUTE - Shows edit page about one todo
app.get("/todo/:id/edit", function(req, res) {
    //find the todo with provided ID
    Todo.findById(req.params.id, function(err, foundTodo){
        if(err){
            res.redirect("/todo");
        } else {
            //render edit template with that todo
            res.render("edit", {todo: foundTodo});
        }
    });
});

// UPDATE ROUTE 
app.put("/todo/:id", function(req, res){
    req.body.todo.body = req.sanitize(req.body.todo.body);
    Todo.findByIdAndUpdate(req.params.id, req.body.todo, function(err, updatedTodo){
        if(err){
            res.redirect("/todo"); //change it to error page
        } else {
            res.redirect("/todo/");
        }
    });
});

// DELETE ROUTE
app.delete("/todo/:id", function(req, res){
    Todo.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/todo"); //change it to error page
        } else {
            res.redirect("/todo/");
        }
    });
});




app.listen(process.env.PORT, process.env.IP, function(){
    console.log("toDoList server has started!");
});