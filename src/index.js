const express = require("express")
const mongoose = require("mongoose")

const route = require("./route/route")

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

mongoose.connect("mongodb+srv://rohan7599:MipvNOjb97usB2oZ@cluster0.lviwx.mongodb.net/group30Database?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('mongodb running on 27017'))
    .catch(err => console.log(err))

app.use("/", route)

app.listen(3000, () => {
    console.log('Express app running on port 3000')
})
