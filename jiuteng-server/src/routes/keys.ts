import { Router } from 'express';
import { createApiKey, listApiKeys, updateApiKey, deleteApiKey, getApiKeyUsage } from '../controllers/keyController';

const router = Router();

router.post('/', createApiKey);
router.get('/', listApiKeys);
router.put('/:id', updateApiKey);
router.delete('/:id', deleteApiKey);
router.get('/usage/:id', getApiKeyUsage);

export default router;