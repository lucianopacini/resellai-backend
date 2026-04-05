// server.js
const OpenAI = require("openai");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

// --- OpenAI setup ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- Express setup ---
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // permette di leggere JSON dal frontend

// --- MySQL setup ---
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "lookbook_db"
});

db.connect(err => {
    if (err) {
        console.error("Errore connessione DB:", err);
    } else {
        console.log("Connesso al DB MySQL!");

        // --- Test: leggere tutti i prodotti ---
        db.query("SELECT * FROM prodotti", (err, results) => {
            if (err) {
                console.error("Errore query:", err);
            } else {
                console.log("Prodotti nel DB:", results);
            }
        });
    }
});

// --- Rotta GET per frontend ---
app.get("/prodotti", (req, res) => {
    db.query("SELECT * FROM prodotti", (err, results) => {
        if (err) {
            res.status(500).json({ error: "Errore nel DB" });
        } else {
            res.json(results);
        }
    });
});

// --- Rotta POST AI /valuta ---
app.post("/valuta", async (req, res) => {
    const { categoria, brand, stato } = req.body;

    try {
        // --- Chiamata AI ---
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
Sei un esperto di moda second-hand.
Devi stimare il prezzo di un capo usato.

Rispondi SOLO in JSON con questa struttura:
{
  "suggested_price": numero,
  "range": { "min": numero, "max": numero },
  "motivation": stringa,
  "selling_tips": [stringa, stringa]
}`
                },
                {
                    role: "user",
                    content: `Categoria: ${categoria}, Brand: ${brand}, Stato: ${stato}`
                }
            ]
        });

        const aiText = response.choices[0].message.content;
        const data = JSON.parse(aiText);

        // --- SALVATAGGIO NEL DB con tutti i campi ---
        db.query(
            `INSERT INTO prodotti 
            (categoria, brand, stato, suggested_price, price_min, price_max, motivation) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                categoria,
                brand,
                stato,
                data.suggested_price,
                data.range.min,
                data.range.max,
                data.motivation
            ],
            (err, result) => {
                if (err) {
                    console.error("Errore inserimento DB:", err);
                } else {
                    console.log("Prodotto + valutazione AI salvati nel DB!");
                }
            }
        );

        // --- Risposta al frontend ---
        res.json(data);

    } catch (error) {
        console.error("Errore AI:", error);
        res.status(500).json({ error: "Errore AI" });
    }
});

// --- Start server ---
app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});