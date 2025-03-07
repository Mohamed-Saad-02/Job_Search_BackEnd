import CryptoJS from "crypto-js";

const DefaultValueEncryption = { value: "", secretKey: process.env.SECRET_KEY };

export const Encryption = ({ value, secretKey } = DefaultValueEncryption) => {
  return CryptoJS.AES.encrypt(JSON.stringify(value), secretKey).toString();
};

const DefaultValueDecryption = {
  cipher: "",
  secretKey: process.env.SECRET_KEY,
};
export const Decryption = ({ cipher, secretKey } = DefaultValueDecryption) => {
  return CryptoJS.AES.decrypt(cipher, secretKey)
    .toString(CryptoJS.enc.Utf8)
    .replace(/"/g, "");
};
