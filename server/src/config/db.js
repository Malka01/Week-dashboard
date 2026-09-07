
const mongoose = require("mongoose");

const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Faild:", error.message);
    process.exit(1);
  }
}

module.exports = ConnectDB;