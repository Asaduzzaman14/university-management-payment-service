import { Payment, PaymentStatus, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { sslService } from '../ssl/ssl.service';
import { IGenericResponse } from '../../../interfaces/common';
import { PaginationHelper } from '../../../helpers/paginationHelper';
import { paymentSearchableFields } from './payment.constants';

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

const getAllFromDB = async (
  filters: any,
  options: any
): Promise<IGenericResponse<Payment[]>> => {
  const { limit, page, skip } = PaginationHelper.getPaginationOptions(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: paymentSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.PaymentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.payment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });
  const total = await prisma.payment.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getByIdFromDB = async (id: string): Promise<Payment | null> => {
  const result = await prisma.payment.findUnique({
    where: {
      id,
    },
  });
  return result;
};

export const PaymentService = {
  initPayment,
  webhook,
  getAllFromDB,
  getByIdFromDB,
};
