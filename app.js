const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

// Inisialisasi aplikasi Express
const app = express();
const port = 3000;

// Menggunakan body-parser untuk mengambil data dari request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Membuat koneksi database SQLite
const db = new sqlite3.Database("example.db");

// Membuat tabel user
// db.serialize(function () {
//   db.run(
//     `CREATE TABLE user (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       username TEXT,
//       email TEXT)`
//   );
// });

// Endpoint untuk menampilkan semua user
app.get("/users", (req, res) => {
  db.all("SELECT * FROM user", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Endpoint untuk menampilkan user dengan id tertentu
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;

  db.get("SELECT * FROM user WHERE id = ?", userId, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({
        status: 404,
        message: `User with ID ${userId} not found`,
      });
    }
  });
});

// Endpoint untuk menambahkan user baru ==> sudah dapat menerima data array object
app.post("/users", (req, res) => {
  let users = req.body;

  // Jika data yang diterima bukan array, ubah menjadi array tunggal
  if (!Array.isArray(users)) {
    users = [users];
  }

  const insertedUsers = [];

  users.forEach((user) => {
    const { username, email } = user;
    if (!username || !email) {
      return res.status(400).json({ error: "Username and email are required" });
    }

    db.run(
      "INSERT INTO user (username, email) VALUES (?, ?)",
      [username, email],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        insertedUsers.push({
          id: this.lastID,
          username: username,
          email: email,
        });
      }
    );
  });

  res.json({ status: 200, message: "User has been inserted" });
});

// Endpoint untuk memvalidasi route post
app.post("/users/:id", (req, res) => {
  const userId = req.params.id;

  res.json({
    status: 400,
    message: `Can't use post method with url /users/${userId}`,
  });
});

// Endpoint untuk mengupdate user berdasarkan ID
app.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: "Username and email are required" });
  }

  db.run(
    "UPDATE user SET username = ?, email = ? WHERE id = ?",
    [username, email, userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: userId,
        username: username,
        email: email,
      });
    }
  );
});

// Endpoint untuk memvalidasi route put
app.put("/users/", (req, res) => {
  res.json({
    status: 400,
    message: `Can't use post method with url /users/`,
  });
});

// Endpoint untuk menghapus user berdasarkan ID
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;

  db.run("DELETE FROM user WHERE id = ?", userId, function (err, row) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.json({
        status: 200,
        message: `User with ID ${userId} has been deleted`,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: `User with ID ${userId} not found`,
      });
    }
  });
});

// Mulai server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
