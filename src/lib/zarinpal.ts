const SANDBOX = process.env.ZARINPAL_SANDBOX !== "false";
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID ?? "";
const BASE = SANDBOX ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";

type RequestResult =
  | { ok: true; authority: string; paymentUrl: string }
  | { ok: false; message: string };

type VerifyResult =
  | { ok: true; refId: string }
  | { ok: false; message: string };

export async function requestZarinpalPayment(params: {
  amount: number;
  description: string;
  callbackUrl: string;
  email?: string;
  mobile?: string;
}): Promise<RequestResult> {
  const res = await fetch(`${BASE}/pg/v4/payment/request.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      amount: params.amount,
      description: params.description,
      callback_url: params.callbackUrl,
      metadata: {
        email: params.email,
        mobile: params.mobile,
      },
    }),
  });

  const data = await res.json();

  if (data?.data?.code === 100 && data.data.authority) {
    return {
      ok: true,
      authority: data.data.authority,
      paymentUrl: `${BASE}/pg/StartPay/${data.data.authority}`,
    };
  }

  return {
    ok: false,
    message: data?.errors?.message ?? "خطا در اتصال به درگاه پرداخت",
  };
}

export async function verifyZarinpalPayment(params: {
  amount: number;
  authority: string;
}): Promise<VerifyResult> {
  const res = await fetch(`${BASE}/pg/v4/payment/verify.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      amount: params.amount,
      authority: params.authority,
    }),
  });

  const data = await res.json();

  if (data?.data?.code === 100 || data?.data?.code === 101) {
    return { ok: true, refId: String(data.data.ref_id ?? data.data.code) };
  }

  return {
    ok: false,
    message: data?.errors?.message ?? "پرداخت تایید نشد",
  };
}
