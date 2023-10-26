import express from 'express';
import { PaymentController } from './payment.controller';

const router = express.Router();

// router.get('/', PaymentController.initPayment);

// router.get('/:id', auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN), PaymentController.getByIdFromDB);

router.post('/init', PaymentController.initPayment);

// router.post('/webhook', PaymentController.webhook)

export const paymentRoutes = router;