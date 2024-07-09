const {connect} = require("mongoose");

const MONGO_DB_URL = "mongodb+srv://MuskanSharma:%40khushi%2320@cluster0.m06x2yr.mongodb.net"

const DB_NAME = "cs-library-app";

const connectDb = async () => {
    try {
        await connect(`${MONGO_DB_URL}/${DB_NAME}`);
        console.log(`MongoDB connection is successful.`);
    } catch (error) {
        console.error(error);
    }
}

connectDb();

module.exports = {};