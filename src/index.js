import express from "express";
import productsController from "./Controllers/productsController.js";
import cartsController from "./Controllers/cartsController.js";
import { AppError } from "./utils/errors.js";

const app = express();
app.use(express.json());

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

//Productos
app.get("/api/products", asyncHandler(async (req, res) => {
    const products = await productsController.getProducts();
    res.json(products);
}));

app.get("/api/products/:id", asyncHandler(async (req, res) => {
    const product = await productsController.getProductById(req.params.id);
    res.json(product);
}));

app.post("/api/products", asyncHandler(async (req, res) => {
    const newProduct = await productsController.addProduct(req.body);
    res.status(201).json(newProduct);
}));

app.put("/api/products/:id", asyncHandler(async (req, res) => {
    const updatedProduct = await productsController.updateProduct(req.params.id, req.body);
    res.json(updatedProduct);
}));

app.delete("/api/products/:id", asyncHandler(async (req, res) => {
    await productsController.deleteProduct(req.params.id);
    res.status(204).send();
}));

app.patch("/api/products/:id", asyncHandler(async (req, res) => {
    const updatedProduct = await productsController.updateProduct(req.params.id, req.body);
    res.json(updatedProduct);
}));

// Carritos
app.post("/api/carts", asyncHandler(async (req, res) => {
    const newCart = await cartsController.createCart();
    res.status(201).json(newCart);
}));

app.get("/api/carts/:cid", asyncHandler(async (req, res) => {
    const cart = await cartsController.getCartById(req.params.cid);
    res.json(cart);
}));

app.post("/api/carts/:cid/product/:pid", asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const cart = await cartsController.addProductToCart(req.params.cid, req.params.pid, quantity);
    res.json(cart);
}));


// Errores 
app.use((err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    console.error(err);
    res.status(500).json({ error: "Ocurrió un error inesperado en el servidor." });
});


app.listen(8080, () => { console.log("server funcionando en 8080") });

