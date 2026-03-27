const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
  id_old: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    image: String,
    price: Number,
    quantity: Number
  }],
  shippingAddress: Object,
  totalPrice: Number
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String
});

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function checkOrders() {
  try {
    await mongoose.connect("mongodb+srv://huyteenpast10_db_user:UYnc47JqqKr53Z6y@cluster0.onsu19m.mongodb.net/?appName=Cluster0");
    const lastOrder = await Order.findOne().sort({ createdAt: -1 }).populate("user");
    console.log("LAST ORDER:");
    console.log(JSON.stringify(lastOrder, null, 2));
    
    // Find order matching ID F6AE63E8
    const orders = await Order.find().populate("user");
    const target = orders.find(o => o._id.toString().toUpperCase().endsWith("F6AE63E8"));
    if (target) {
        console.log("\nTARGET ORDER FOUND:");
        console.log(JSON.stringify(target, null, 2));
    } else {
        console.log("\nTarget order ending in F6AE63E8 not found. Total orders: " + orders.length);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkOrders();
