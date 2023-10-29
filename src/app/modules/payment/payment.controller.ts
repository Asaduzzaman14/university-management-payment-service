import httpStatus from 'http-status';
import sendResponse from '../../../shared/response';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';

const initPayment = async (req: Request, res: Response) => {
  const result = await PaymentService.initPayment(req?.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Payment init successfully',
    data: result,
  });
};

const webhook = async (req: Request, res: Response) => {
  const result = await PaymentService.webhook(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'webhook successfully',
    data: result,
  });
};

export const PaymentController = {
  initPayment,
  webhook,
};
