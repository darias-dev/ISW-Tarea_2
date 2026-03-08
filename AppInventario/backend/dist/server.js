"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
require("reflect-metadata");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const purchase_routes_1 = __importDefault(require("./routes/purchase.routes"));
const provider_routes_1 = __importDefault(require("./routes/provider.routes"));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/products', product_routes_1.default);
app.use('/api/inventory', inventory_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/purchases', purchase_routes_1.default);
app.use('/api/providers', provider_routes_1.default);
app.get('/', (req, res) => {
    res.send('Sistema Inventario Backend Running!');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
