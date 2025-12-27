import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsPath = path.join(__dirname, '../assets/products.json');

class ProductsController {
    constructor() {
        this.products_path = productsPath;
    }

    async _saveProducts(products) {
        const dataToWrite = {
            products: products
        };
        await fs.writeFile(this.products_path, JSON.stringify(dataToWrite, null, 2));
    }

    async getProducts() {
        try {
            const data = await fs.readFile(this.products_path, 'utf-8');
            const parsedData = JSON.parse(data);
            return parsedData.products || [];
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    async getProductById(id) {
        const products = await this.getProducts();
        const product = products.find(p => p.id === parseInt(id));
        if (!product) {
            throw new NotFoundError(`No se encontró el producto ${id}`);
        }
        return product;
    }

    async addProduct(productData) {
        if (!productData.title || !productData.price) {
            throw new BadRequestError('Título y precio son obligatorios');
        }
        const products = await this.getProducts();

        if (products.some(p => p.title.toLowerCase() === productData.title.toLowerCase())) {
            throw new ConflictError(`Ya existe un producto con el título '${productData.title}'`);
        }

        const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
        const newProduct = {
            id: maxId + 1,
            ...productData,
        };
        products.push(newProduct);
        await this._saveProducts(products);
        return newProduct;
    }

    async updateProduct(id, updatedData) {
        const products = await this.getProducts();
        const productId = parseInt(id);
        const index = products.findIndex(p => p.id === productId);

        if (index === -1) {
            throw new NotFoundError(`No se encontró el producto ${id}`);
        }

        if (updatedData.title && products.some(p => p.title.toLowerCase() === updatedData.title.toLowerCase() && p.id !== productId)) {
            throw new ConflictError(`Ya existe un producto con el título '${updatedData.title}'`);
        }

        products[index] = { ...products[index], ...updatedData, id: productId };
        await this._saveProducts(products);
        return products[index];
    }

    async deleteProduct(id) {
        let products = await this.getProducts();
        const productId = parseInt(id);
        const initialLength = products.length;

        products = products.filter(p => p.id !== productId);

        if (products.length === initialLength) {
            throw new NotFoundError(`No se encontró el producto ${id}`);
        }

        await this._saveProducts(products);
    }
}

export default new ProductsController();