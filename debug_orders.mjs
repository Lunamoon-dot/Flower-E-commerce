import mongoose from 'mongoose';

const MONGO_URI = "mongodb+srv://huyteenpast10_db_user:UYnc47JqqKr53Z6y@cluster0.onsu19m.mongodb.net/?appName=Cluster0";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String, image: String, price: Number, quantity: Number,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [orderItemSchema],
  status: String,
  totalPrice: Number,
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

(async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const orders = await Order.find({ status: "delivered" }).lean();
  console.log("DELIVERED ORDERS COUNT:", orders.length);
  orders.forEach(o => {
    console.log("\nOrder:", o._id.toString(), "| User:", o.user.toString(), "| Status:", o.status);
    o.items.forEach(it => console.log("  -> product:", it.product?.toString(), "| name:", it.name));
  });

  if (orders.length === 0) {
    console.log("\nChecking ALL orders status:");
    const all = await Order.find({}).select("status user").lean();
    all.forEach(o => console.log("  Order:", o._id, "status:", o.status, "user:", o.user?.toString()));
  }

  await mongoose.disconnect();
  process.exit(0);
})();
