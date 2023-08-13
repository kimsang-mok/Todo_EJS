import express from "express"
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash"

// const date = require(__dirname + '/date.js');

const app = express();

mongoose.connect("mongodb://localhost:27017/todolistDB")
  

const itemsSchema = new mong
oose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your todolist!"
})

const item2 = new Item({
  name: "Hit the + button to add a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3]
// Item.insertMany(defaultItems)




app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async function (req, res) {
  const listItems = await Item.find({})
  if (listItems.length === 0) {
    Item.insertMany(defaultItems)
    res.redirect("/");
  } else {
    res.render("list", {
      listTitle: "Today",
      newListItems: listItems,
    });
  }
});

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/:customListName", async function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  try {
    const foundList = await List.findOne({ name: customListName })
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save()
      res.redirect("/" + customListName)
    } else {
      res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
    }
  }
  catch (err) {
    console.log(err)
  }
})




app.post("/", async function (req, res) {
  const itemName = req.body.newTodo;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    try {
      const foundList = await List.findOne({ name: listName })
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    }
    catch (err) {
      console.log(err)
    }
  }



});

app.post("/delete", async function (req, res) {
  const checkItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName === "Today") {
    try {
      await Item.findByIdAndRemove(checkItemId)
      res.redirect("/")
    }
    catch (error) {
      console.log(error)
      res.redirect("/")
    }
  } else {
    try {
      await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkItemId } } })
      res.redirect("/" + listName)
    }
    catch (err) {
      console.log(err)
    }
  }
  // console.log(checkItemId)

})


app.listen(3000, function () {
  console.log("Server running on port 3000.");
});