import { Router } from 'express';
import { createUser, getUsers, updateUser, resetPassword } from '../controllers/user.controller';

const router = Router();

router.post('/', createUser);
router.get('/', getUsers);
router.put('/:id', updateUser);
router.post('/:id/reset-password', resetPassword);

export default router;
