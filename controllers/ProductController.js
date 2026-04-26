// backend/controllers/productController.js
const ProductModel = require('../models/db/ProductModel');
const StockModel = require('../models/db/StockModel');
const Product = require('../models/Product');
const Stock = require('../models/Stock');

class ProductController {
    async getAll(req, res) {
        try {
            console.log('📦 Récupération de tous les produits...');
            
            const products = await ProductModel.findAll();
            console.log(`✅ ${products.length} produits trouvés dans la base`);
            
            const productsWithStock = await Promise.all(
                products.map(async (product) => {
                    try {
                        const stock = await StockModel.findByProductId(product.id);
                        return {
                            ...product.toJSON(),
                            stock: stock ? stock.quantity : 0
                        };
                    } catch (stockError) {
                        console.error(`❌ Erreur stock pour produit ${product.id}:`, stockError);
                        return {
                            ...product.toJSON(),
                            stock: 0
                        };
                    }
                })
            );
            
            console.log(`✅ Envoi de ${productsWithStock.length} produits avec stocks`);
            res.json(productsWithStock);
            
        } catch (error) {
            console.error('❌ Erreur dans getAll:', error);
            res.status(500).json({ 
                error: 'Erreur lors de la récupération des produits',
                details: error.message 
            });
        }
    }

    async getById(req, res) {
        try {
            const product = await ProductModel.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Produit non trouvé' });
            }

            const stock = await StockModel.findByProductId(product.id);

            res.json({
                product: product.toJSON(),
                stock: stock ? stock.quantity : 0
            });
        } catch (error) {
            console.error('❌ Erreur getById:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getByCategory(req, res) {
        try {
            const products = await ProductModel.findByCategory(req.params.category);
            res.json(products.map(p => p.toJSON()));
        } catch (error) {
            console.error('❌ Erreur getByCategory:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { name, price, description, image, category } = req.body;
            
            console.log('📝 Création produit:', { name, price, category });
            
            // Validation
            if (!name || !price || !category) {
                return res.status(400).json({ 
                    error: 'Nom, prix et catégorie sont requis' 
                });
            }

            const product = await ProductModel.create({
                name,
                price,
                description,
                image,
                category
            });

            // Créer l'entrée de stock
            await StockModel.create(product.id);

            res.status(201).json({
                message: 'Produit créé avec succès',
                product: product.toJSON()
            });
        } catch (error) {
            console.error('❌ Erreur create:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const product = await ProductModel.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Produit non trouvé' });
            }

            const updatedProduct = await ProductModel.update(req.params.id, req.body);

            res.json({
                message: 'Produit mis à jour avec succès',
                product: updatedProduct.toJSON()
            });
        } catch (error) {
            console.error('❌ Erreur update:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const product = await ProductModel.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Produit non trouvé' });
            }

            await ProductModel.delete(req.params.id);

            res.json({ message: 'Produit supprimé avec succès' });
        } catch (error) {
            console.error('❌ Erreur delete:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

// Vérifier que toutes les méthodes existent
const controller = new ProductController();
console.log('🔧 ProductController initialisé avec les méthodes:');
console.log('   - getAll:', typeof controller.getAll === 'function' ? '✅' : '❌');
console.log('   - getById:', typeof controller.getById === 'function' ? '✅' : '❌');
console.log('   - getByCategory:', typeof controller.getByCategory === 'function' ? '✅' : '❌');
console.log('   - create:', typeof controller.create === 'function' ? '✅' : '❌');
console.log('   - update:', typeof controller.update === 'function' ? '✅' : '❌');
console.log('   - delete:', typeof controller.delete === 'function' ? '✅' : '❌');

module.exports = controller;