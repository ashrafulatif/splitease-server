import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreatePlanPayload, IUpdatePlanPayload } from "./plans.interface";

const normalizeFeatures = (features: string[]) => {
  const normalizedFeatures = features
    .map((feature) => feature?.trim())
    .filter((feature) => !!feature);

  return Array.from(new Set(normalizedFeatures));
};

const getPlans = async () => {
  return prisma.plan.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const createPlan = async (payload: ICreatePlanPayload) => {
  const name = payload.name?.trim();

  if (!name) {
    throw new AppError(status.BAD_REQUEST, "Plan name is required");
  }

  if (!payload.price || payload.price <= 0) {
    throw new AppError(status.BAD_REQUEST, "Price must be greater than 0");
  }

  if (!payload.durationDays || payload.durationDays <= 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "Duration days must be greater than 0",
    );
  }

  if (!Array.isArray(payload.features) || payload.features.length === 0) {
    throw new AppError(status.BAD_REQUEST, "Features list is required");
  }

  const features = normalizeFeatures(payload.features);

  if (features.length === 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "Features list must contain at least one valid feature",
    );
  }

  const isPlanExists = await prisma.plan.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (isPlanExists) {
    throw new AppError(status.CONFLICT, "Plan with this name already exists");
  }

  return prisma.plan.create({
    data: {
      name,
      price: payload.price,
      durationDays: payload.durationDays,
      features,
    },
  });
};

const updatePlan = async (id: string, payload: IUpdatePlanPayload) => {
  const existingPlan = await prisma.plan.findUnique({ where: { id } });

  if (!existingPlan) {
    throw new AppError(status.NOT_FOUND, "Plan not found");
  }

  const data: IUpdatePlanPayload = {};

  if (payload.name !== undefined) {
    const trimmedName = payload.name.trim();

    if (!trimmedName) {
      throw new AppError(status.BAD_REQUEST, "Plan name cannot be empty");
    }

    const duplicatePlan = await prisma.plan.findFirst({
      where: {
        id: { not: id },
        name: {
          equals: trimmedName,
          mode: "insensitive",
        },
      },
    });

    if (duplicatePlan) {
      throw new AppError(
        status.CONFLICT,
        "Another plan with this name already exists",
      );
    }

    data.name = trimmedName;
  }

  if (payload.price !== undefined) {
    if (payload.price <= 0) {
      throw new AppError(status.BAD_REQUEST, "Price must be greater than 0");
    }
    data.price = payload.price;
  }

  if (payload.durationDays !== undefined) {
    if (payload.durationDays <= 0) {
      throw new AppError(
        status.BAD_REQUEST,
        "Duration days must be greater than 0",
      );
    }
    data.durationDays = payload.durationDays;
  }

  if (payload.features !== undefined) {
    if (!Array.isArray(payload.features) || payload.features.length === 0) {
      throw new AppError(
        status.BAD_REQUEST,
        "Features list must contain at least one feature",
      );
    }

    const features = normalizeFeatures(payload.features);

    if (features.length === 0) {
      throw new AppError(
        status.BAD_REQUEST,
        "Features list must contain at least one valid feature",
      );
    }

    data.features = features;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "No valid fields provided to update",
    );
  }

  return prisma.plan.update({
    where: { id },
    data,
  });
};

const deletePlan = async (id: string) => {
  const existingPlan = await prisma.plan.findUnique({ where: { id } });

  if (!existingPlan) {
    throw new AppError(status.NOT_FOUND, "Plan not found");
  }

  return prisma.plan.delete({
    where: { id },
  });
};

export const PlansService = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
};
