import { Router } from 'express';
import { getUserInfo, updateUserProfile, getUserBalance } from '../controllers/userController';

const router = Router();

router.get('/profile', getUserInfo);
router.put('/profile', updateUserProfile);
router.get('/balance', getUserBalance);

export default router;