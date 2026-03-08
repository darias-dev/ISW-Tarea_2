import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient, RolUsuario } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
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
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Ensure valid role
    let userRole: RolUsuario = RolUsuario.ALMACEN;
    if (Object.values(RolUsuario).includes(rol as RolUsuario)) {
      userRole = rol as RolUsuario;
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
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update an existing user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const { nombre, email, rol, activo } = req.body;

    if (isNaN(userId)) {
      res.status(400).json({ error: 'ID de usuario inválido' });
      return;
    }

    const existingUser = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!existingUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Protection: Prevent admin from deactivating themselves
    if (userId === 1 && activo === false) {
      res.status(403).json({ error: 'No puedes desactivar a la cuenta maestra.' });
      return;
    }

    let userRole = existingUser.rol;
    if (rol && Object.values(RolUsuario).includes(rol as RolUsuario)) {
      userRole = rol as RolUsuario;
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: {
        nombre: nombre !== undefined ? nombre : existingUser.nombre,
        email: email !== undefined ? email.toLowerCase() : existingUser.email,
        rol: userRole,
        activo: activo !== undefined ? activo : existingUser.activo
      },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true }
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    // Handle unique constraint email collisions
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Ese correo electrónico ya está en uso' });
      return;
    }
    res.status(500).json({ error: 'Sever error while updating user' });
  }
};

// Reset a user's password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const { newPassword } = req.body;

    if (isNaN(userId) || !newPassword) {
      res.status(400).json({ error: 'Se requiere ID de usuario y una nueva contraseña' });
      return;
    }

    // Verify user exists
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.usuario.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Error del servidor reseteando contraseña' });
  }
};
