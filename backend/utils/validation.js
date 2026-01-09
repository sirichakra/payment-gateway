// VPA validation
export function isValidVPA(vpa) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return regex.test(vpa);
}

// Luhn algorithm
export function isValidCardNumber(num) {
  const digits = num.replace(/[\s-]/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i]);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

// Card network detection
export function detectNetwork(num) {
  const n = num.replace(/[\s-]/g, "");
  if (n.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(60|65|8[1-9])/.test(n)) return "rupay";
  return "unknown";
}

// Expiry validation
export function isValidExpiry(month, year) {
  const m = parseInt(month);
  let y = parseInt(year);

  if (m < 1 || m > 12) return false;
  if (year.length === 2) y += 2000;

  const now = new Date();
  const expiry = new Date(y, m - 1, 1);
  return expiry >= new Date(now.getFullYear(), now.getMonth(), 1);
}
