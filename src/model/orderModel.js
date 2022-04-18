const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true
    },
    items: [
        {
        productId: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Product", 
            required: true
        },
        quantity: {
            type: Number, 
            required: true, 
            default: 1}
        }
    ],
    totalPrice: {
        type: Number, 
        required: true
    },
    totalItems: {
        type: Number, 
        required: true
    },
    totalQuantity: {
        type: Number, 
        required: true, 
        comment: "Holds total number of items in the cart"
    },
    cancellable: {
        type: Boolean, 
        default: true
    },
    status: {
        type: String, 
        default: 'pending', 
        enum: ["pending", "completed", "cancled"]
    },
    deletedAt: {
        type: Date
    }, 
    isDeleted: {
        type: Boolean, 
        default: false
    },
}, {timestamps: true})

module.exports = new mongoose.model("Order", orderSchema)
