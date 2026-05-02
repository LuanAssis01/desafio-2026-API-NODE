import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/http-error";
import { signJwt } from "../lib/jwt";
import type { LoginInput, RegisterInput } from "../valueObjects/auth.schema";

function toPublicUser(user: { id: string; name: string | null; email: string; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export const AuthService = {
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new HttpError(409, "Email ja cadastrado.", "EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await Bun.password.hash(input.password);
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return {
      user: toPublicUser(user),
      token: signJwt({ sub: user.id, email: user.email }),
    };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new HttpError(401, "Credenciais invalidas.", "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await Bun.password.verify(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new HttpError(401, "Credenciais invalidas.", "INVALID_CREDENTIALS");
    }

    return {
      user: toPublicUser(user),
      token: signJwt({ sub: user.id, email: user.email }),
    };
  },

  async profile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new HttpError(404, "Usuario nao encontrado.", "USER_NOT_FOUND");
    }

    return toPublicUser(user);
  },
};
