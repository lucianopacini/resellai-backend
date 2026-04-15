# 🧠 ResellAI Backend

Backend API per il progetto ResellAI, un’applicazione che utilizza l’intelligenza artificiale per stimare il prezzo di capi di abbigliamento usati.

Il sistema utilizza OpenAI per generare le valutazioni e salva i risultati in un database Supabase.

---

## 🚀 Tecnologie utilizzate

- Node.js
- Express.js
- OpenAI API (GPT-4o-mini)
- Supabase (PostgreSQL)
- dotenv
- CORS

---

## 📦 Struttura del progetto

server.js # Server principale
.env # Variabili d’ambiente (non incluso nel repo)
package.json # Dipendenze e script

---

## ⚙️ Installazione
npm install

---

## ▶️ Avvio in locale
npm start

Il server sarà disponibile su:

http://localhost:3000
🔐 Variabili d’ambiente

Crea un file `.env` nella root del progetto:

OPENAI_API_KEY=la_tua_api_key_openai
SUPABASE_URL=il_tuo_url_supabase
SUPABASE_KEY=la_tua_service_key_supabase
PORT=3000
📡 Endpoint API
POST /valuta

Valuta un capo tramite AI e salva il risultato nel database.

**Body della richiesta:**

```json
{
  "categoria": "t-shirt",
  "brand": "Nike",
  "stato": "ottimo"
}
```

**Risposta:**

```json
{
  "suggested_price": 50,
  "range": { "min": 30, "max": 70 },
  "motivation": "Testo della motivazione...",
  "selling_tips": ["Consiglio 1", "Consiglio 2"]
}
```

---

### GET /prodotti

Restituisce tutte le valutazioni salvate nel database Supabase.

---

## 🗄️ Database (Supabase)

Tabella: `product`

Campi salvati:

- categoria
- brand
- stato
- suggested_price
- price_min
- price_max
- motivation

---

## 🧠 Come funziona

1. Il frontend invia i dati del prodotto  
2. OpenAI genera una stima del prezzo  
3. Il backend converte la risposta in JSON  
4. I dati vengono salvati su Supabase  
5. Il risultato viene restituito al frontend  

---

## 🌐 Deploy

Backend deployato su Render  
Il frontend comunica tramite variabile d’ambiente  

---

## ✨ Autore

Luciano Pacini