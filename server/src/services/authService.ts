import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/token';
import { DEFAULT_CATEGORIES } from '../config/constants';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    name: string;
    currency?: string;
    monthlyIncome?: number;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        currency: data.currency || 'USD',
        monthlyIncome: data.monthlyIncome ?? 5000,
      },
    });

    // Seed default categories for new user
    const defaultCats = DEFAULT_CATEGORIES.map(cat => ({
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      isCustom: false,
      userId: user.id,
    }));
    await prisma.category.createMany({ data: defaultCats });

    // Seed basic default budget
    const groceriesCat = await prisma.category.findFirst({
      where: { userId: user.id, name: 'Groceries & Food' },
    });
    const diningCat = await prisma.category.findFirst({
      where: { userId: user.id, name: 'Dining & Restaurants' },
    });

    if (groceriesCat) {
      await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: groceriesCat.id,
          amount: 600,
          period: 'MONTHLY',
        },
      });
    }

    if (diningCat) {
      await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: diningCat.id,
          amount: 350,
          period: 'MONTHLY',
        },
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
      },
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
        monthlyIncome: user.monthlyIncome,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        currency: true,
        monthlyIncome: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; currency?: string; monthlyIncome?: number }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        currency: true,
        monthlyIncome: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

export const authService = new AuthService();
