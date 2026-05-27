import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

if (!PAYSTACK_SECRET_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY is not defined');
}

const paystackClient = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface InitializePaymentParams {
  email: string;
  amount: number; // In kobo (multiply naira by 100)
  reference: string;
  callback_url?: string;
  metadata?: any;
}

export interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  try {
    const response = await paystackClient.post('/transaction/initialize', params);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to initialize payment'
    );
  }
}

export async function verifyPayment(
  reference: string
): Promise<VerifyPaymentResponse> {
  try {
    const response = await paystackClient.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to verify payment'
    );
  }
}

export async function listBanks(): Promise<any> {
  try {
    const response = await paystackClient.get('/bank');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch banks');
  }
}

export async function resolveAccountNumber(
  accountNumber: string,
  bankCode: string
): Promise<any> {
  try {
    const response = await paystackClient.get(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to resolve account'
    );
  }
}

export async function createTransferRecipient(params: {
  type: string;
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
}): Promise<any> {
  try {
    const response = await paystackClient.post('/transferrecipient', {
      ...params,
      currency: params.currency || 'NGN',
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to create transfer recipient'
    );
  }
}

export async function initiateTransfer(params: {
  source: string;
  amount: number;
  recipient: string;
  reason?: string;
}): Promise<any> {
  try {
    const response = await paystackClient.post('/transfer', params);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to initiate transfer'
    );
  }
}
