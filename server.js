const express = require('express');
const path = require('path');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup SQLite Database
const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'data.sqlite')
  : path.join(__dirname, 'data.sqlite');
const db = new Database(dbPath);

// Create consultations table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS consultations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_type TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_contact TEXT NOT NULL,
    client_email TEXT NOT NULL,
    problem_description TEXT NOT NULL,
    expected_outcome TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// API: Simpan Formulir Konsultasi
app.post('/api/consultations', (req, res) => {
  try {
    const { clientType, clientName, clientContact, clientEmail, problemDescription, expectedOutcome } = req.body;

    if (!clientType || !clientName || !clientContact || !clientEmail || !problemDescription) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi semua kolom yang wajib diisi.'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO consultations (client_type, client_name, client_contact, client_email, problem_description, expected_outcome)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(clientType, clientName, clientContact, clientEmail, problemDescription, expectedOutcome || '');

    return res.status(201).json({
      success: true,
      message: 'Formulir konsultasi berhasil terkirim. Tim kami akan segera menghubungi Anda!',
      data: {
        id: result.lastInsertRowid
      }
    });
  } catch (error) {
    console.error('Error saat menyimpan konsultasi:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat memproses data.'
    });
  }
});

// API: Ambil Semua Data Konsultasi (Untuk Dashboard / Review)
app.get('/api/consultations', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM consultations ORDER BY created_at DESC');
    const rows = stmt.all();
    return res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error saat mengambil data:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat data konsultasi.'
    });
  }
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server backend Solusin berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;