const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Data file path — set DATA_DIR env var on Railway/production
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dbFile  = path.join(dataDir, 'finance.json');

function readDb() {
    try {
        return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    } catch {
        return { investments: [], property: [], stocks: [] };
    }
}

function writeDb(data) {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const SECTIONS = ['investments', 'property', 'stocks'];

// GET all entries
app.get('/api/:section', (req, res) => {
    const { section } = req.params;
    if (!SECTIONS.includes(section)) return res.status(404).json({ error: 'Not found' });
    res.json(readDb()[section] || []);
});

// ADD entry
app.post('/api/:section', (req, res) => {
    const { section } = req.params;
    if (!SECTIONS.includes(section)) return res.status(404).json({ error: 'Not found' });
    const db    = readDb();
    const entry = { id: Date.now().toString(), ...req.body };
    db[section].push(entry);
    writeDb(db);
    res.json(entry);
});

// DELETE entry
app.delete('/api/:section/:id', (req, res) => {
    const { section, id } = req.params;
    if (!SECTIONS.includes(section)) return res.status(404).json({ error: 'Not found' });
    const db = readDb();
    db[section] = db[section].filter(e => e.id !== id);
    writeDb(db);
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`\n  Finance Dashboard → http://localhost:${PORT}\n`);
});
