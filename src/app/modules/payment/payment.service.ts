import { PaymentStatus } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { sslService } from '../ssl/ssl.service';

const initPayment = async (data: any) => {
  console.log('init Payment');

  const paymentSession = await sslService.initPayment({
    total_amount: data.amount,
    tran_id: data.transactionId,
    cus_name: data.studentName,
    cus_email: data.studentEmail,
    cus_add1: data.address,
    cus_phone: data.phone,
  });

  await prisma.payment.create({
    data: {
      amount: data.amount,
      transactionId: data.transactionId,
      studentId: data.studentId,
    },
  });

  return paymentSession.data;
};
const webhook = async (paylode: any) => {
  if (!paylode || !paylode.status || paylode.status !== 'VALID') {
    return {
      message: 'invalid Payment',
    };
  }
  const result: any = await sslService.validate(paylode);

  if (result?.status !== 'VALID') {
    return {
      message: 'Payment Faield',
    };
  }

  const { tran_id } = result;
  await prisma.payment.updateMany({
    where: {
      transactionId: tran_id,
    },
    data: {
      status: PaymentStatus.PAID,
      paymentGatewayData: paylode,
    },
  });

  return result;
};

export const PaymentService = {
  initPayment,
  webhook,
};
