//jshint esversion:6
const express=require("express");
const bodyParser=require("body-parser");
const request=require("request");
const _=require("lodash")
const app=express();
const mongoose= require("mongoose");
app.set('view engine','ejs');
mongoose.connect("mongodb+srv://admin-raj:raj123@cluster0-tkpkr.mongodb.net/todolistDB1",{useNewUrlParser: true});
//mongoose.set('useUnifiedTopology,true');
const itemsSchema = {
  name:String
};
const Item =mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"welecome to todolist!"
});
const item2=new Item({
  name:"<-- Hit the + button to add a new item."
});
const item3=new Item({
  name:"<-- Hit this to delete an item."
});
const defaultItems=[item1,item2,item3];
const List1Schema={
  name:String,
  items:[itemsSchema]
};
const List1=mongoose.model("List1",List1Schema);
app.use(bodyParser.urlencoded({extented:true}));
app.use(express.static("public"));
app.get("/",function(req,res){
var today=new Date();
var options={
  weekday: "long",
  day: "numeric",
  month:"long"
};
var day =today.toLocaleDateString("en-Us",options);
Item.find({},function(err,fitems){
  //  console.log(fitems);
    if(fitems.length==0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);}
        else {
          console.log("succefully added");
        res.redirect("/");
  }});}
   else{
          res.render("list1",{Newday:"Today",NewItems:fitems});
      }
    });
  });

app.post("/",function(req,res){
var Itemname=req.body.NewItem;
var Newday=req.body.button;
//console.log(Newday);
const item=new Item({
  name:Itemname
});
if(Newday === "Today"){
item.save();
res.redirect("/");}
else {
//List1.findOne({name:Newday},function(err,flist){
    //flist.items.push(item);
    //flist.save();
    //
    List1.findOneAndUpdate({name: Newday}, {$push: {items: item}},function(err,result){
      if(!err)
      {res.redirect("/"+Newday);}
    });
    }


});
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List1.findOne({name:customListName},function(err,fList){
    if(!err){
     if(!fList)
     {
       console.log("Doesn't exist");
       //creat New list
       const list1 =new List1({
         name:customListName,
         items:defaultItems
       });
       list1.save();
 res.redirect("/"+customListName);
     }
    else {
      //show an existing list
      console.log("Exist!");
    //  typeof(console.log());
      res.render("list1",{Newday: fList.name, NewItems:fList.items});

    }
  }});
});
app.post("/delete",function(req,res){
  const delitem=req.body.delitem;
  const Newday=req.body.Newday;
  if(Newday==="Today"){
  Item.findByIdAndRemove(delitem,function(err)
{
  if(!err)

{console.log("susseccfully deleted");}
  res.redirect("/");

});}
else {
  List1.findOneAndUpdate({name:Newday},{$pull:{items:{_id: delitem}}},function(err,flist){
  if(!err){
    if(flist.items.length===0)
    {List1.findOneAndUpdate({name:Newday},{$push:{items:defaultItems}},function(err,flist){
      if(!err)
      console.log("success");
    });}

  }
});
  res.redirect("/"+Newday);
}

//console.log(delitem);

});
var port=process.env.PORT;
if(port==null || port =="")
{
  port=3000;
}
app.listen(port,function(){
  console.log(port);
  console.log("server is started");
});
