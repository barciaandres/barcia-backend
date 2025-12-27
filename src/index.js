import express from "express";
import productsController from "./Controllers/productsController.js";
import { AppError } from "./utils/errors.js";

const app = express();
app.use(express.json());

// Wrapper for async routes to catch errors and pass them to the error handler
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

app.get("/products", asyncHandler(async (req, res) => {
    const products = await productsController.getProducts();
    res.json(products);
}));

app.get("/products/:id", asyncHandler(async (req, res) => {
    const product = await productsController.getProductById(req.params.id);
    res.json(product);
}));

app.post("/products", asyncHandler(async (req, res) => {
    const newProduct = await productsController.addProduct(req.body);
    res.status(201).json(newProduct);
}));

app.put("/products/:id", asyncHandler(async (req, res) => {
    const updatedProduct = await productsController.updateProduct(req.params.id, req.body);
    res.json(updatedProduct);
}));

app.delete("/products/:id", asyncHandler(async (req, res) => {
    await productsController.deleteProduct(req.params.id);
    res.status(204).send();
}));



// Centralized error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    console.error(err); // Log unexpected errors
    res.status(500).json({ error: "Ocurrió un error inesperado en el servidor." });
});


app.listen(8080, () => { console.log("server funcionando en 8080") });

