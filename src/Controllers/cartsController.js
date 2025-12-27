import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import productsController from './productsController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cartsPath = path.join(__dirname, '../assets/carts.json');

class CartsController {
    constructor() {
        this.carts_path = cartsPath;
    }

    async _saveCarts(carts) {
        await fs.writeFile(this.carts_path, JSON.stringify({ carts }, null, 2));
    }

    async getCarts() {
        try {
            const data = await fs.readFile(this.carts_path, 'utf-8');
            const parsedData = JSON.parse(data);
            return parsedData.carts || [];
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    async createCart() {
        const carts = await this.getCarts();
        const maxId = carts.reduce((max, c) => (c.cartId > max ? c.cartId : max), 0);
        const newCart = {
            cartId: maxId + 1,
            products: [],
        };
        carts.push(newCart);
        await this._saveCarts(carts);
        return newCart;
    }

    async getCartById(id) {
        const carts = await this.getCarts();
        const cart = carts.find(c => c.cartId === parseInt(id));
        if (!cart) {
            throw new NotFoundError(`Cart with id ${id} not found`);
        }
        return cart;
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(c => c.cartId === parseInt(cartId));

        if (cartIndex === -1) {
            throw new NotFoundError(`Cart with id ${cartId} not found`);
        }

        await productsController.getProductById(productId);

        const cart = carts[cartIndex];
        const productIndex = cart.products.findIndex(p => p.productId === parseInt(productId));

        if (productIndex > -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ productId: parseInt(productId), quantity });
        }

        carts[cartIndex] = cart;
        await this._saveCarts(carts);
        return cart;
    }
}

export default new CartsController();
