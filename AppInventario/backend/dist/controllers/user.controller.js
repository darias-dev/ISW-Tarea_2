"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Create a new user
const createUser = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;
        // Optional: Add basic validation
        if (!nombre || !email || !password) {
            res.status(400).json({ error: 'Nombre, email, and password are required' });
            return;
        }
        // Check if user already exists
        const existingUser = await prisma.usuario.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(409).json({ error: 'Email is already in use' });
            return;
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // Ensure valid role
        let userRole = client_1.RolUsuario.ALMACEN;
        if (Object.values(client_1.RolUsuario).includes(rol)) {
            userRole = rol;
        }
        // Create user in DB
        const newUser = await prisma.usuario.create({
            data: {
                nombre,
                email,
                password: hashedPassword,
                rol: userRole,
            },
        });
        // Don't send the password back
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createUser = createUser;
// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await prisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                createdAt: true,
            },
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getUsers = getUsers;
