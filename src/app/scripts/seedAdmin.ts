/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { prisma } from "../lib/prisma";

const seedAdmin = async () => {
  try {
    const adminData = {
      name: "Admin",
      email: "admin@example.com",
      password: "yourStrongPassword",
      role: UserRole.ADMIN,
    };

    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingUser) {
      console.log("Admin user already exists.");
      return;
    }

    // Create admin via external auth service
    const response = await fetch(
      `${envVars.BETTER_AUTH_URL}/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: envVars.FRONTEND_URL,
        },
        body: JSON.stringify(adminData),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create admin: ${errorText}`);
    }

    // mark email as verified
    await prisma.user.update({
      where: { email: adminData.email },
      data: { emailVerified: true },
    });

    console.log("Admin user seeded successfully.");
  } catch (error: any) {
    console.error("Error seeding admin:", error.message || error);
  } finally {
    await prisma.$disconnect();
  }
};

seedAdmin();
