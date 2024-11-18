import jwt from "jsonwebtoken";
import { TokenPayload, AuthTokens } from "../../types/auth";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "secret_key_fill_later";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "secret_key_fill_later";

function generateAuthTokens(userId: number): AuthTokens {
  const accessToken = jwt.sign(
    { userId, type: "access" } as TokenPayload,
    ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  const refreshToken = jwt.sign(
    { userId, type: "refresh" } as TokenPayload,
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
}

function verifyAccessToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    }
    catch (error) {
        return null;
    }
}

function verifyRefreshToken(token: string): TokenPayload | null {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
    }
    catch (error) {
        return null;
    }
}

// Exports
export { generateAuthTokens, verifyAccessToken, verifyRefreshToken };
