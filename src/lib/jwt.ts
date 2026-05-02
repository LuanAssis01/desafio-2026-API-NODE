import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "./env";
import { HttpError } from "./http-error";

type JwtHeader = {
  alg: "HS256";
  typ: "JWT";
};

export type JwtPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

const header: JwtHeader = {
  alg: "HS256",
  typ: "JWT",
};

function encodeBase64Url(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function signContent(content: string) {
  return createHmac("sha256", env.JWT_SECRET).update(content).digest("base64url");
}

export function signJwt(payload: Pick<JwtPayload, "sub" | "email">) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const tokenPayload: JwtPayload = {
    ...payload,
    iat: nowInSeconds,
    exp: nowInSeconds + env.JWT_EXPIRES_IN_SECONDS,
  };

  const encodedHeader = encodeBase64Url(header);
  const encodedPayload = encodeBase64Url(tokenPayload);
  const content = `${encodedHeader}.${encodedPayload}`;

  return `${content}.${signContent(content)}`;
}

export function verifyJwt(token: string): JwtPayload {
  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new HttpError(401, "Token invalido.", "INVALID_TOKEN");
  }

  const content = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signContent(content);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new HttpError(401, "Token invalido.", "INVALID_TOKEN");
  }

  const parsedPayload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as JwtPayload;

  if (parsedPayload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, "Token expirado.", "EXPIRED_TOKEN");
  }

  return parsedPayload;
}
