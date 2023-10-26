import { sslService } from '../ssl/ssl.service';

const initPayment = async (data: any) => {
  console.log(data);

  const paymentSession = await sslService.initPayment({
    total_amount: data.amount,
    tran_id: data.transactionId, // use unique tran_id for each api call
    cus_name: data.studentName,
    cus_email: data.studentEmail,
    cus_add1: data.address,
    cus_phone: data.phone,
  });
  console.log(paymentSession);

  return paymentSession;
};

export const PaymentService = {
  initPayment,
};
