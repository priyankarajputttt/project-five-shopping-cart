const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({

},{timestamps: true})

module.exports = new mongoose.model("user", userSchema)

