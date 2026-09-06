const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' }); // or whichever has GEMINI_API_KEY
// I'll just write a script that sends a POST request to the deployed backend instead of direct DB.
