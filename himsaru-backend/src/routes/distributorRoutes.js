import express from 'express';
import { submitApplication } from '../controllers/distributorController.js';

const router = express.Router();

router.post('/', submitApplication);

export default router;
