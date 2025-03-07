import jwt from "jsonwebtoken";

export function generateToken(
  payload,
  secret = process.env.JWT_SECRET,
  expiresIn = process.env.JWT_EXPIRES_IN,
  options = {}
) {
  const token = jwt.sign(payload, secret, {
    expiresIn,
    ...options,
  });
  return token;
}

export const verifyToken = (token, secretKey = process.env.JWT_SECRET) => {
  if (!secretKey) throw new Error("Secret key is required to verify a token");

  return jwt.verify(token, secretKey);
};

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);

  return `${year}/${month}/${day}`;
};
