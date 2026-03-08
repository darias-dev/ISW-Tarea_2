import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key';

// Extend Express Request to hold our decoded user info
export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  
  // Format should be "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No se encontró el token de acceso. Por favor inicie sesión.' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      res.status(403).json({ error: 'Token de acceso inválido o expirado.' });
      return;
    }
    req.user = decodedUser;
    next();
  });
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.rol;
    
    // Always allow ADMIN as a global override, or check if role is in array
    if (userRole === 'ADMIN' || allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ error: 'Acceso Denegado: No tienes los privilegios necesarios para esta acción.' });
    }
  };
};
