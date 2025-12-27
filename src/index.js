import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const products = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'products.json'), 'utf8'));

app.get("/products", (req, res) => {
    res.json(products)
});

app.get("/products/:id", (req, res) => {
    const product = products.products.find(p => p.id === parseInt(req.params.id));
    res.json(product, null, 2)
});

app.get("/categories", (req, res) => {

    res.json([{ name: "lana" }])

});

app.listen(8080, () => { console.log("server funcionando en 8080") });

