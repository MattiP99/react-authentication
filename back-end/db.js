const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

// instead of using MongoDB we use a simple JSON file as a database
if (fs.existsSync(DB_FILE)) {
  db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
} else {
    // we store the data in a JSON object
  db = { users: [] };
}

// This is gonna write that JSON object in a JSON file
const saveDb = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
};

module.exports = {
  db,
  saveDb,
}