import { Router } from 'express';
import { login, register, sendVerificationCode } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/send-code', sendVerificationCode);

export default router;