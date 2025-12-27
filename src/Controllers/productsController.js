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
        const product = products.find(p => p.productId === parseInt(id));
        if (!product) {
            throw new NotFoundError(`Product with id ${id} not found`);
        }
        return product;
    }

    async addProduct(productData) {
        if (!productData.title || !productData.price) {
            throw new BadRequestError('Title and price are required');
        }
        const products = await this.getProducts();

        if (products.some(p => p.title.toLowerCase() === productData.title.toLowerCase())) {
            throw new ConflictError(`Product with title '${productData.title}' already exists`);
        }

        const maxId = products.reduce((max, p) => (p.productId > max ? p.productId : max), 0);
        const newProduct = {
            productId: maxId + 1,
            ...productData,
        };
        products.push(newProduct);
        await this._saveProducts(products);
        return newProduct;
    }

    async updateProduct(id, updatedData) {
        const products = await this.getProducts();
        const productId = parseInt(id);
        const index = products.findIndex(p => p.productId === productId);

        if (index === -1) {
            throw new NotFoundError(`Product with id ${id} not found`);
        }

        if (updatedData.title && products.some(p => p.title.toLowerCase() === updatedData.title.toLowerCase() && p.productId !== productId)) {
            throw new ConflictError(`Product with title '${updatedData.title}' already exists`);
        }
        
        products[index] = { ...products[index], ...updatedData, productId: productId };
        await this._saveProducts(products);
        return products[index];
    }

    async deleteProduct(id) {
        let products = await this.getProducts();
        const productId = parseInt(id);
        const initialLength = products.length;

        products = products.filter(p => p.productId !== productId);

        if (products.length === initialLength) {
            throw new NotFoundError(`Product with id ${id} not found`);
        }

        await this._saveProducts(products);
    }
}

export default new ProductsController();