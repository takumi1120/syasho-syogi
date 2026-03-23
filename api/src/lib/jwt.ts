import jwt from "jsonwebtoken";

const ACCESS_EXPIRES = "1s";
const REFRESH_EXPIRES = "7d";

export function signAccessToken(payload: { sub: number; email: string }) {
    const secret = process.env.JWT_SECRET!;

    return jwt.sign(payload, secret, {
        expiresIn: ACCESS_EXPIRES,
    });
}

export function signRefreshToken(payload: { sub: number }) {
    const secret = process.env.JWT_SECRET!;

    return jwt.sign(payload, secret, {
        expiresIn: REFRESH_EXPIRES,
    });
}

export function verifyToken(token: string) {
    const secret = process.env.JWT_SECRET!;
    return jwt.verify(token, secret);
}