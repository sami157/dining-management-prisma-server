import admin from "firebase-admin";

const serviceAccount = require("./admin-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
