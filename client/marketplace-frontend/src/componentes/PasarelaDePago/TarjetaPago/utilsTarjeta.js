/**
 * Utilidades para validación y formateo de tarjetas de crédito
 */

export const luhnCheck = (num) => {
    const cleanNumber = num.toString().replace(/\s/g, "");
    if (!cleanNumber) return false;
    let sum = 0;
    let isEven = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanNumber[i], 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
};

export const detectCardType = (number) => {
    const cleanNumber = number.toString().replace(/\s/g, "");
    if (!cleanNumber) return null;
    if (/^4/.test(cleanNumber)) return "VISA";
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) return "MASTERCARD";
    if (/^3[47]/.test(cleanNumber)) return "AMEX";
    if (/^6011/.test(cleanNumber) || /^65/.test(cleanNumber) || /^64[4-9]/.test(cleanNumber)) return "DISCOVER";
    if (/^3[068]/.test(cleanNumber) || /^30[0-5]/.test(cleanNumber)) return "DINERS";
    if (/^35[2-8]/.test(cleanNumber)) return "JCB";
    return null;
};

export const formatCardNumber = (value) => {
    const v = value.toString().replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const detected = detectCardType(v);
    if (detected === "AMEX") {
        if (v.length > 4 && v.length <= 10) return v.substring(0, 4) + " " + v.substring(4, 10);
        if (v.length > 10) return v.substring(0, 4) + " " + v.substring(4, 10) + " " + v.substring(10, 15);
        return v;
    }
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) parts.push(match.substring(i, i + 4));
    return parts.length ? parts.join(" ") : v;
};

export const formatExpiryDateInput = (value) => {
    const v = value.toString().replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) return v.substring(0, 2) + "/" + v.substring(2, 4);
    return v;
};

export const getExpectedLength = (type) => {
    if (type === "AMEX") return 15;
    if (type === "DINERS") return 14;
    return 16;
};

export const getExpectedCvvLength = (type) => {
    return type === "AMEX" ? 4 : 3;
};

export const getMaskedCardNumber = (number) => {
    const clean = number.toString().replace(/\s/g, "");
    if (clean.length === 0) return "**** **** **** ####";
    const last4 = clean.slice(-4);
    return `**** **** **** ${last4}`;
};
