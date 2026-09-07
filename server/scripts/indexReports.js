require("dotenv").config();

const mongoose = require("mongoose");

// Register models before querying/populating
require("../src/models/User");
require("../src/models/Project");
require("../src/models/Report");

const {
  indexReports,
} = require("../src/services/ai/reportIndex.service");

const connectDB = async () => {
  // await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("MongoDB connected");
};

const run = async () => {
  try {
    await connectDB();

    await indexReports();

    console.log(
      "Report indexing completed successfully"
    );

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "Report indexing failed:",
      error
    );

    await mongoose.connection.close();

    process.exit(1);
  }
};

run();