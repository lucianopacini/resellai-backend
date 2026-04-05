// server.js
const OpenAI = require("openai");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// --- OpenAI setup ---
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- Supabase setup ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // usa la Secret Key
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Express setup ---
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json()); // permette di leggere JSON dal frontend

// --- Rotta GET prodotti ---
app.get("/prodotti", async (req, res) => {
    try {
        const { data, error } = await supabase.from("product").select("*");
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("Errore DB:", err);
        res.status(500).json({ error: "Errore DB" });
    }
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

        const data = JSON.parse(response.choices[0].message.content);

        // --- Inserimento in Supabase ---
        const { error } = await supabase.from("product").insert([{
            categoria,
            brand,
            stato,
            suggested_price: data.suggested_price,
            price_min: data.range.min,
            price_max: data.range.max,
            motivation: data.motivation
        }]);

        if (error) {
            console.error("Errore inserimento DB:", error);
            return res.status(500).json({ error: "Errore DB" });
        }

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