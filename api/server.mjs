var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express from "express";

// src/app/routes/index.ts
import { Router as Router13 } from "express";

// src/app/modules/auth/auth.routes.ts
import { Router } from "express";

// src/app/modules/auth/auth.service.ts
import status3 from "http-status";

// src/app/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/app/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.5.0",
  "engineVersion": "280c870be64f457428992c43c1f6d557fab6e29e",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id                 String    @id\n  name               String\n  email              String\n  emailVerified      Boolean   @default(false)\n  image              String?\n  createdAt          DateTime  @default(now())\n  updatedAt          DateTime  @updatedAt\n  role               String    @default("MANAGER")\n  status             String    @default("ACTIVE")\n  needPasswordChange Boolean   @default(false)\n  isDeleted          Boolean   @default(false)\n  sessions           Session[]\n  accounts           Account[]\n\n  // Relations\n  housesCreated House[]       @relation("HouseCreator")\n  houseMembers  HouseMember[]\n\n  meals    Meal[]\n  deposits Deposit[]\n  expenses Expense[] @relation("ExpenseCreator")\n\n  subscriptions Subscription[]\n  payments      Payment[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Deposit {\n  id String @id @default(uuid())\n\n  houseId String\n  monthId String\n  userId  String\n\n  amount Float\n  note   String?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  house House @relation(fields: [houseId], references: [id], onDelete: Cascade)\n  month Month @relation(fields: [monthId], references: [id], onDelete: Cascade)\n  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([houseId, monthId, userId])\n  @@map("deposits")\n}\n\nenum UserRole {\n  ADMIN\n  MANAGER\n  MEMBER\n}\n\nenum UserStatus {\n  ACTIVE\n  INACTIVE\n  SUSPENDED\n}\n\nenum SubscriptionStatus {\n  ACTIVE\n  EXPIRED\n  CANCELLED\n}\n\nenum PaymentStatus {\n  PENDING\n  SUCCESS\n  FAILED\n}\n\nenum ExpenseTypeEnum {\n  MEAL\n  RENT\n  GAS\n  ELECTRICITY\n  INTERNET\n  WATER\n  OTHER\n}\n\nenum MealEnum {\n  BREAKFAST\n  LUNCH\n  DINNER\n}\n\nmodel Expense {\n  id String @id @default(uuid())\n\n  houseId String\n  monthId String\n\n  type        ExpenseTypeEnum\n  amount      Float\n  description String?\n\n  createdBy String\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  house   House @relation(fields: [houseId], references: [id], onDelete: Cascade)\n  month   Month @relation(fields: [monthId], references: [id], onDelete: Cascade)\n  creator User  @relation("ExpenseCreator", fields: [createdBy], references: [id], onDelete: Cascade)\n\n  @@index([houseId, monthId])\n  @@map("expenses")\n}\n\nmodel House {\n  id          String  @id @default(uuid())\n  name        String\n  description String?\n\n  createdBy String\n  creator   User   @relation("HouseCreator", fields: [createdBy], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  members  HouseMember[]\n  months   Month[]\n  deposits Deposit[]\n  expenses Expense[]\n  meals    Meal[]\n\n  @@index([createdBy])\n  @@map("houses")\n}\n\nmodel HouseMember {\n  id      String   @id @default(uuid())\n  userId  String\n  houseId String\n  role    UserRole @default(MEMBER)\n\n  createdAt DateTime @default(now())\n\n  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)\n  house House @relation(fields: [houseId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, houseId])\n  @@index([userId])\n  @@index([houseId])\n  @@map("house_members")\n}\n\nmodel Meal {\n  id String @id @default(uuid())\n\n  houseId String\n  monthId String\n  userId  String\n\n  date     DateTime\n  mealType MealEnum\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  house House @relation(fields: [houseId], references: [id], onDelete: Cascade)\n  month Month @relation(fields: [monthId], references: [id], onDelete: Cascade)\n  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, date, mealType])\n  @@index([houseId, monthId, userId])\n  @@map("meals")\n}\n\nmodel Month {\n  id      String @id @default(uuid())\n  houseId String\n\n  name      String\n  startDate DateTime\n  endDate   DateTime\n  isClosed  Boolean  @default(false)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  house House @relation(fields: [houseId], references: [id], onDelete: Cascade)\n\n  meals    Meal[]\n  deposits Deposit[]\n  expenses Expense[]\n\n  @@unique([houseId, name])\n  @@index([houseId])\n  @@map("months")\n}\n\nmodel Payment {\n  id String @id @default(uuid())\n\n  userId         String\n  subscriptionId String\n\n  amount        Float\n  transactionId String @unique\n\n  status PaymentStatus @default(PENDING)\n\n  stripeEventId      String? @unique\n  invoiceUrl         String?\n  paymentGatewayData Json?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)\n  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([subscriptionId])\n  @@index([transactionId])\n  @@map("payments")\n}\n\nmodel Plan {\n  id String @id @default(uuid())\n\n  name         String\n  price        Float\n  durationDays Int\n  features     String[] @default([])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  subscriptions Subscription[]\n\n  @@map("plans")\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Subscription {\n  id String @id @default(uuid())\n\n  userId String\n  planId String\n\n  startDate DateTime\n  endDate   DateTime\n  status    SubscriptionStatus\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n  plan Plan @relation(fields: [planId], references: [id], onDelete: Cascade)\n\n  payments Payment[]\n\n  @@index([userId])\n  @@index([planId])\n  @@map("subscriptions")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"needPasswordChange","kind":"scalar","type":"Boolean"},{"name":"isDeleted","kind":"scalar","type":"Boolean"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"housesCreated","kind":"object","type":"House","relationName":"HouseCreator"},{"name":"houseMembers","kind":"object","type":"HouseMember","relationName":"HouseMemberToUser"},{"name":"meals","kind":"object","type":"Meal","relationName":"MealToUser"},{"name":"deposits","kind":"object","type":"Deposit","relationName":"DepositToUser"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseCreator"},{"name":"subscriptions","kind":"object","type":"Subscription","relationName":"SubscriptionToUser"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Deposit":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"houseId","kind":"scalar","type":"String"},{"name":"monthId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"note","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"house","kind":"object","type":"House","relationName":"DepositToHouse"},{"name":"month","kind":"object","type":"Month","relationName":"DepositToMonth"},{"name":"user","kind":"object","type":"User","relationName":"DepositToUser"}],"dbName":"deposits"},"Expense":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"houseId","kind":"scalar","type":"String"},{"name":"monthId","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"ExpenseTypeEnum"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"description","kind":"scalar","type":"String"},{"name":"createdBy","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"house","kind":"object","type":"House","relationName":"ExpenseToHouse"},{"name":"month","kind":"object","type":"Month","relationName":"ExpenseToMonth"},{"name":"creator","kind":"object","type":"User","relationName":"ExpenseCreator"}],"dbName":"expenses"},"House":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"createdBy","kind":"scalar","type":"String"},{"name":"creator","kind":"object","type":"User","relationName":"HouseCreator"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"members","kind":"object","type":"HouseMember","relationName":"HouseToHouseMember"},{"name":"months","kind":"object","type":"Month","relationName":"HouseToMonth"},{"name":"deposits","kind":"object","type":"Deposit","relationName":"DepositToHouse"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseToHouse"},{"name":"meals","kind":"object","type":"Meal","relationName":"HouseToMeal"}],"dbName":"houses"},"HouseMember":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"houseId","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"HouseMemberToUser"},{"name":"house","kind":"object","type":"House","relationName":"HouseToHouseMember"}],"dbName":"house_members"},"Meal":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"houseId","kind":"scalar","type":"String"},{"name":"monthId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"mealType","kind":"enum","type":"MealEnum"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"house","kind":"object","type":"House","relationName":"HouseToMeal"},{"name":"month","kind":"object","type":"Month","relationName":"MealToMonth"},{"name":"user","kind":"object","type":"User","relationName":"MealToUser"}],"dbName":"meals"},"Month":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"houseId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"startDate","kind":"scalar","type":"DateTime"},{"name":"endDate","kind":"scalar","type":"DateTime"},{"name":"isClosed","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"house","kind":"object","type":"House","relationName":"HouseToMonth"},{"name":"meals","kind":"object","type":"Meal","relationName":"MealToMonth"},{"name":"deposits","kind":"object","type":"Deposit","relationName":"DepositToMonth"},{"name":"expenses","kind":"object","type":"Expense","relationName":"ExpenseToMonth"}],"dbName":"months"},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"subscriptionId","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"stripeEventId","kind":"scalar","type":"String"},{"name":"invoiceUrl","kind":"scalar","type":"String"},{"name":"paymentGatewayData","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"PaymentToUser"},{"name":"subscription","kind":"object","type":"Subscription","relationName":"PaymentToSubscription"}],"dbName":"payments"},"Plan":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"durationDays","kind":"scalar","type":"Int"},{"name":"features","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"subscriptions","kind":"object","type":"Subscription","relationName":"PlanToSubscription"}],"dbName":"plans"},"Subscription":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"planId","kind":"scalar","type":"String"},{"name":"startDate","kind":"scalar","type":"DateTime"},{"name":"endDate","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"SubscriptionStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"SubscriptionToUser"},{"name":"plan","kind":"object","type":"Plan","relationName":"PlanToSubscription"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToSubscription"}],"dbName":"subscriptions"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","creator","house","members","month","meals","deposits","expenses","_count","months","housesCreated","houseMembers","subscriptions","plan","subscription","payments","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Deposit.findUnique","Deposit.findUniqueOrThrow","Deposit.findFirst","Deposit.findFirstOrThrow","Deposit.findMany","Deposit.createOne","Deposit.createMany","Deposit.createManyAndReturn","Deposit.updateOne","Deposit.updateMany","Deposit.updateManyAndReturn","Deposit.upsertOne","Deposit.deleteOne","Deposit.deleteMany","_avg","_sum","Deposit.groupBy","Deposit.aggregate","Expense.findUnique","Expense.findUniqueOrThrow","Expense.findFirst","Expense.findFirstOrThrow","Expense.findMany","Expense.createOne","Expense.createMany","Expense.createManyAndReturn","Expense.updateOne","Expense.updateMany","Expense.updateManyAndReturn","Expense.upsertOne","Expense.deleteOne","Expense.deleteMany","Expense.groupBy","Expense.aggregate","House.findUnique","House.findUniqueOrThrow","House.findFirst","House.findFirstOrThrow","House.findMany","House.createOne","House.createMany","House.createManyAndReturn","House.updateOne","House.updateMany","House.updateManyAndReturn","House.upsertOne","House.deleteOne","House.deleteMany","House.groupBy","House.aggregate","HouseMember.findUnique","HouseMember.findUniqueOrThrow","HouseMember.findFirst","HouseMember.findFirstOrThrow","HouseMember.findMany","HouseMember.createOne","HouseMember.createMany","HouseMember.createManyAndReturn","HouseMember.updateOne","HouseMember.updateMany","HouseMember.updateManyAndReturn","HouseMember.upsertOne","HouseMember.deleteOne","HouseMember.deleteMany","HouseMember.groupBy","HouseMember.aggregate","Meal.findUnique","Meal.findUniqueOrThrow","Meal.findFirst","Meal.findFirstOrThrow","Meal.findMany","Meal.createOne","Meal.createMany","Meal.createManyAndReturn","Meal.updateOne","Meal.updateMany","Meal.updateManyAndReturn","Meal.upsertOne","Meal.deleteOne","Meal.deleteMany","Meal.groupBy","Meal.aggregate","Month.findUnique","Month.findUniqueOrThrow","Month.findFirst","Month.findFirstOrThrow","Month.findMany","Month.createOne","Month.createMany","Month.createManyAndReturn","Month.updateOne","Month.updateMany","Month.updateManyAndReturn","Month.upsertOne","Month.deleteOne","Month.deleteMany","Month.groupBy","Month.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Plan.findUnique","Plan.findUniqueOrThrow","Plan.findFirst","Plan.findFirstOrThrow","Plan.findMany","Plan.createOne","Plan.createMany","Plan.createManyAndReturn","Plan.updateOne","Plan.updateMany","Plan.updateManyAndReturn","Plan.upsertOne","Plan.deleteOne","Plan.deleteMany","Plan.groupBy","Plan.aggregate","Subscription.findUnique","Subscription.findUniqueOrThrow","Subscription.findFirst","Subscription.findFirstOrThrow","Subscription.findMany","Subscription.createOne","Subscription.createMany","Subscription.createManyAndReturn","Subscription.updateOne","Subscription.updateMany","Subscription.updateManyAndReturn","Subscription.upsertOne","Subscription.deleteOne","Subscription.deleteMany","Subscription.groupBy","Subscription.aggregate","AND","OR","NOT","id","userId","planId","startDate","endDate","SubscriptionStatus","status","createdAt","updatedAt","equals","in","notIn","not","lt","lte","gt","gte","contains","startsWith","endsWith","name","price","durationDays","features","has","hasEvery","hasSome","every","some","none","subscriptionId","amount","transactionId","PaymentStatus","stripeEventId","invoiceUrl","paymentGatewayData","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","houseId","isClosed","monthId","date","MealEnum","mealType","UserRole","role","description","createdBy","ExpenseTypeEnum","type","note","identifier","value","expiresAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","image","needPasswordChange","isDeleted","userId_date_mealType","houseId_name","userId_houseId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "oAd20AEXBAAAqwMAIAUAAKwDACAKAACvAwAgCwAAsAMAIAwAALEDACAPAACtAwAgEAAArgMAIBEAAIMDACAUAACyAwAg7QEAAKgDADDuAQAASAAQ7wEAAKgDADDwAQEAAAAB9gEBAP8CACH3AUAAggMAIfgBQACCAwAhhAIBAP8CACGiAgEA_wIAIbcCAQAAAAG4AiAAqQMAIbkCAQCqAwAhugIgAKkDACG7AiAAqQMAIQEAAAABACAMAwAAtgMAIO0BAADMAwAw7gEAAAMAEO8BAADMAwAw8AEBAP8CACHxAQEA_wIAIfcBQACCAwAh-AFAAIIDACGqAkAAggMAIbQCAQD_AgAhtQIBAKoDACG2AgEAqgMAIQMDAACpBgAgtQIAAIEEACC2AgAAgQQAIAwDAAC2AwAg7QEAAMwDADDuAQAAAwAQ7wEAAMwDADDwAQEAAAAB8QEBAP8CACH3AUAAggMAIfgBQACCAwAhqgJAAIIDACG0AgEAAAABtQIBAKoDACG2AgEAqgMAIQMAAAADACABAAAEADACAAAFACARAwAAtgMAIO0BAADKAwAw7gEAAAcAEO8BAADKAwAw8AEBAP8CACHxAQEA_wIAIfcBQACCAwAh-AFAAIIDACGrAgEA_wIAIawCAQD_AgAhrQIBAKoDACGuAgEAqgMAIa8CAQCqAwAhsAJAAMsDACGxAkAAywMAIbICAQCqAwAhswIBAKoDACEIAwAAqQYAIK0CAACBBAAgrgIAAIEEACCvAgAAgQQAILACAACBBAAgsQIAAIEEACCyAgAAgQQAILMCAACBBAAgEQMAALYDACDtAQAAygMAMO4BAAAHABDvAQAAygMAMPABAQAAAAHxAQEA_wIAIfcBQACCAwAh-AFAAIIDACGrAgEA_wIAIawCAQD_AgAhrQIBAKoDACGuAgEAqgMAIa8CAQCqAwAhsAJAAMsDACGxAkAAywMAIbICAQCqAwAhswIBAKoDACEDAAAABwAgAQAACAAwAgAACQAgDwYAALYDACAIAACuAwAgCgAArwMAIAsAALADACAMAACxAwAgDgAAyQMAIO0BAADIAwAw7gEAAAsAEO8BAADIAwAw8AEBAP8CACH3AUAAggMAIfgBQACCAwAhhAIBAP8CACGjAgEAqgMAIaQCAQD_AgAhBwYAAKkGACAIAACkBgAgCgAApQYAIAsAAKYGACAMAACnBgAgDgAArgYAIKMCAACBBAAgDwYAALYDACAIAACuAwAgCgAArwMAIAsAALADACAMAACxAwAgDgAAyQMAIO0BAADIAwAw7gEAAAsAEO8BAADIAwAw8AEBAAAAAfcBQACCAwAh-AFAAIIDACGEAgEA_wIAIaMCAQCqAwAhpAIBAP8CACEDAAAACwAgAQAADAAwAgAADQAgCgMAALYDACAHAAC9AwAg7QEAAMYDADDuAQAADwAQ7wEAAMYDADDwAQEA_wIAIfEBAQD_AgAh9wFAAIIDACGbAgEA_wIAIaICAADHA6ICIgIDAACpBgAgBwAArAYAIAsDAAC2AwAgBwAAvQMAIO0BAADGAwAw7gEAAA8AEO8BAADGAwAw8AEBAAAAAfEBAQD_AgAh9wFAAIIDACGbAgEA_wIAIaICAADHA6ICIr4CAADFAwAgAwAAAA8AIAEAABAAMAIAABEAIA8HAAC9AwAgCgAArwMAIAsAALADACAMAACxAwAg7QEAAMQDADDuAQAAEwAQ7wEAAMQDADDwAQEA_wIAIfMBQACCAwAh9AFAAIIDACH3AUAAggMAIfgBQACCAwAhhAIBAP8CACGbAgEA_wIAIZwCIACpAwAhBAcAAKwGACAKAAClBgAgCwAApgYAIAwAAKcGACAQBwAAvQMAIAoAAK8DACALAACwAwAgDAAAsQMAIO0BAADEAwAw7gEAABMAEO8BAADEAwAw8AEBAAAAAfMBQACCAwAh9AFAAIIDACH3AUAAggMAIfgBQACCAwAhhAIBAP8CACGbAgEA_wIAIZwCIACpAwAhvQIAAMMDACADAAAAEwAgAQAAFAAwAgAAFQAgDgMAALYDACAHAAC9AwAgCQAAvgMAIO0BAADBAwAw7gEAABcAEO8BAADBAwAw8AEBAP8CACHxAQEA_wIAIfcBQACCAwAh-AFAAIIDACGbAgEA_wIAIZ0CAQD_AgAhngJAAIIDACGgAgAAwgOgAiIDAwAAqQYAIAcAAKwGACAJAACtBgAgDwMAALYDACAHAAC9AwAgCQAAvgMAIO0BAADBAwAw7gEAABcAEO8BAADBAwAw8AEBAAAAAfEBAQD_AgAh9wFAAIIDACH4AUAAggMAIZsCAQD_AgAhnQIBAP8CACGeAkAAggMAIaACAADCA6ACIrwCAADAAwAgAwAAABcAIAEAABgAMAIAABkAIA4DAAC2AwAgBwAAvQMAIAkAAL4DACDtAQAAvwMAMO4BAAAbABDvAQAAvwMAMPABAQD_AgAh8QEBAP8CACH3AUAAggMAIfgBQACCAwAhjwIIAIADACGbAgEA_wIAIZ0CAQD_AgAhpwIBAKoDACEEAwAAqQYAIAcAAKwGACAJAACtBgAgpwIAAIEEACAOAwAAtgMAIAcAAL0DACAJAAC-AwAg7QEAAL8DADDuAQAAGwAQ7wEAAL8DADDwAQEAAAAB8QEBAP8CACH3AUAAggMAIfgBQACCAwAhjwIIAIADACGbAgEA_wIAIZ0CAQD_AgAhpwIBAKoDACEDAAAAGwAgAQAAHAAwAgAAHQAgDwYAALYDACAHAAC9AwAgCQAAvgMAIO0BAAC7AwAw7gEAAB8AEO8BAAC7AwAw8AEBAP8CACH3AUAAggMAIfgBQACCAwAhjwIIAIADACGbAgEA_wIAIZ0CAQD_AgAhowIBAKoDACGkAgEA_wIAIaYCAAC8A6YCIgQGAACpBgAgBwAArAYAIAkAAK0GACCjAgAAgQQAIA8GAAC2AwAgBwAAvQMAIAkAAL4DACDtAQAAuwMAMO4BAAAfABDvAQAAuwMAMPABAQAAAAH3AUAAggMAIfgBQACCAwAhjwIIAIADACGbAgEA_wIAIZ0CAQD_AgAhowIBAKoDACGkAgEA_wIAIaYCAAC8A6YCIgMAAAAfACABAAAgADACAAAhACABAAAAFwAgAQAAABsAIAEAAAAfACADAAAAGwAgAQAAHAAwAgAAHQAgAwAAAB8AIAEAACAAMAIAACEAIAMAAAAXACABAAAYADACAAAZACABAAAADwAgAQAAABMAIAEAAAAbACABAAAAHwAgAQAAABcAIAMAAAAPACABAAAQADACAAARACADAAAAFwAgAQAAGAAwAgAAGQAgAwAAABsAIAEAABwAMAIAAB0AIAMAAAAfACABAAAgADACAAAhACAOAwAAtgMAIBIAALoDACAUAACyAwAg7QEAALgDADDuAQAAMgAQ7wEAALgDADDwAQEA_wIAIfEBAQD_AgAh8gEBAP8CACHzAUAAggMAIfQBQACCAwAh9gEAALkD9gEi9wFAAIIDACH4AUAAggMAIQMDAACpBgAgEgAAqwYAIBQAAKgGACAOAwAAtgMAIBIAALoDACAUAACyAwAg7QEAALgDADDuAQAAMgAQ7wEAALgDADDwAQEAAAAB8QEBAP8CACHyAQEA_wIAIfMBQACCAwAh9AFAAIIDACH2AQAAuQP2ASL3AUAAggMAIfgBQACCAwAhAwAAADIAIAEAADMAMAIAADQAIAMAAAAyACABAAAzADACAAA0ACABAAAAMgAgEAMAALYDACATAAC3AwAg7QEAALMDADDuAQAAOAAQ7wEAALMDADDwAQEA_wIAIfEBAQD_AgAh9gEAALQDkgIi9wFAAIIDACH4AUAAggMAIY4CAQD_AgAhjwIIAIADACGQAgEA_wIAIZICAQCqAwAhkwIBAKoDACGUAgAAtQMAIAUDAACpBgAgEwAAqgYAIJICAACBBAAgkwIAAIEEACCUAgAAgQQAIBADAAC2AwAgEwAAtwMAIO0BAACzAwAw7gEAADgAEO8BAACzAwAw8AEBAAAAAfEBAQD_AgAh9gEAALQDkgIi9wFAAIIDACH4AUAAggMAIY4CAQD_AgAhjwIIAIADACGQAgEAAAABkgIBAAAAAZMCAQCqAwAhlAIAALUDACADAAAAOAAgAQAAOQAwAgAAOgAgAQAAADgAIAMAAAA4ACABAAA5ADACAAA6ACABAAAAAwAgAQAAAAcAIAEAAAALACABAAAADwAgAQAAABcAIAEAAAAbACABAAAAHwAgAQAAADIAIAEAAAA4ACABAAAAAQAgFwQAAKsDACAFAACsAwAgCgAArwMAIAsAALADACAMAACxAwAgDwAArQMAIBAAAK4DACARAACDAwAgFAAAsgMAIO0BAACoAwAw7gEAAEgAEO8BAACoAwAw8AEBAP8CACH2AQEA_wIAIfcBQACCAwAh-AFAAIIDACGEAgEA_wIAIaICAQD_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-AFAAIIDACGoAgEA_wIAIakCAQD_AgAhqgJAAIIDACEBAAAAigEAIAEAAACKAQAgCe0BAAChAwAw7gEAAI0BABDvAQAAoQMAMPABAQD_AgAh9wFAAIIDACH4AUAAggMAIagCAQD_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-AFAANEDACGEAgEA0AMAIaMCAQDiAwAhpAIBANADACECAAAACwAgGgAA2wEAIAIAAAALACAaAADbAQAgAwAAAA0AICEAANQBACAiAADZAQAgAQAAAA0AIAEAAAALACAEDQAA1AQAICcAANYEACAoAADVBAAgowIAAIEEACAJ7QEAAJoDADDuAQAA4gEAEO8BAACaAwAw8AEBAO0CACH3AUAA7gIAIfgBQADuAgAhhAIBAO0CACGjAgEAhgMAIaQCAQDtAgAhAwAAAAsAIAEAAOEBADAmAADiAQAgAwAAAAsAIAEAAAwAMAIAAA0AIAEAAAARACABAAAAEQAgAwAAAA8AIAEAABAAMAIAABEAIAMAAAAPACABAAAQADACAAARACADAAAADwAgAQAAEAAwAgAAEQAgBwMAANIEACAHAADTBAAg8AEBAAAAAfEBAQAAAAH3AUAAAAABmwIBAAAAAaICAAAAogICARoAAOoBACAF8AEBAAAAAfEBAQAAAAH3AUAAAAABmwIBAAAAAaICAAAAogICARoAAOwBADABGgAA7AEAMAcDAADQBAAgBwAA0QQAIPABAQDQAwAh8QEBANADACH3AUAA0QMAIZsCAQDQAwAhogIAAM8EogIiAgAAABEAIBoAAO8BACAF8AEBANADACHxAQEA0AMAIfcBQADRAwAhmwIBANADACGiAgAAzwSiAiICAAAADwAgGgAA8QEAIAIAAAAPACAaAADxAQAgAwAAABEAICEAAOoBACAiAADvAQAgAQAAABEAIAEAAAAPACADDQAAzAQAICcAAM4EACAoAADNBAAgCO0BAACWAwAw7gEAAPgBABDvAQAAlgMAMPABAQDtAgAh8QEBAO0CACH3AUAA7gIAIZsCAQDtAgAhogIAAJcDogIiAwAAAA8AIAEAAPcBADAmAAD4AQAgAwAAAA8AIAEAABAAMAIAABEAIAEAAAAZACABAAAAGQAgAwAAABcAIAEAABgAMAIAABkAIAMAAAAXACABAAAYADACAAAZACADAAAAFwAgAQAAGAAwAgAAGQAgCwMAAMIEACAHAADBBAAgCQAAywQAIPABAQAAAAHxAQEAAAAB9wFAAAAAAfgBQAAAAAGbAgEAAAABnQIBAAAAAZ4CQAAAAAGgAgAAAKACAgEaAACAAgAgCPABAQAAAAHxAQEAAAAB9wFAAAAAAfgBQAAAAAGbAgEAAAABnQIBAAAAAZ4CQAAAAAGgAgAAAKACAgEaAACCAgAwARoAAIICADALAwAAvwQAIAcAAL4EACAJAADKBAAg8AEBANADACHxAQEA0AMAIfcBQADRAwAh-AFAANEDACGbAgEA0AMAIZ0CAQDQAwAhngJAANEDACGgAgAAvASgAiICAAAAGQAgGgAAhQIAIAjwAQEA0AMAIfEBAQDQAwAh9wFAANEDACH4AUAA0QMAIZsCAQDQAwAhnQIBANADACGeAkAA0QMAIaACAAC8BKACIgIAAAAXACAaAACHAgAgAgAAABcAIBoAAIcCACADAAAAGQAgIQAAgAIAICIAAIUCACABAAAAGQAgAQAAABcAIAMNAADHBAAgJwAAyQQAICgAAMgEACAL7QEAAJIDADDuAQAAjgIAEO8BAACSAwAw8AEBAO0CACHxAQEA7QIAIfcBQADuAgAh-AFAAO4CACGbAgEA7QIAIZ0CAQDtAgAhngJAAO4CACGgAgAAkwOgAiIDAAAAFwAgAQAAjQIAMCYAAI4CACADAAAAFwAgAQAAGAAwAgAAGQAgAQAAABUAIAEAAAAVACADAAAAEwAgAQAAFAAwAgAAFQAgAwAAABMAIAEAABQAMAIAABUAIAMAAAATACABAAAUADACAAAVACAMBwAAwwQAIAoAAMQEACALAADFBAAgDAAAxgQAIPABAQAAAAHzAUAAAAAB9AFAAAAAAfcBQAAAAAH4AUAAAAABhAIBAAAAAZsCAQAAAAGcAiAAAAABARoAAJYCACAI8AEBAAAAAfMBQAAAAAH0AUAAAAAB9wFAAAAAAfgBQAAAAAGEAgEAAAABmwIBAAAAAZwCIAAAAAEBGgAAmAIAMAEaAACYAgAwDAcAAI0EACAKAACOBAAgCwAAjwQAIAwAAJAEACDwAQEA0AMAIfMBQADRAwAh9AFAANEDACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGbAgEA0AMAIZwCIACMBAAhAgAAABUAIBoAAJsCACAI8AEBANADACHzAUAA0QMAIfQBQADRAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhmwIBANADACGcAiAAjAQAIQIAAAATACAaAACdAgAgAgAAABMAIBoAAJ0CACADAAAAFQAgIQAAlgIAICIAAJsCACABAAAAFQAgAQAAABMAIAMNAACJBAAgJwAAiwQAICgAAIoEACAL7QEAAI4DADDuAQAApAIAEO8BAACOAwAw8AEBAO0CACHzAUAA7gIAIfQBQADuAgAh9wFAAO4CACH4AUAA7gIAIYQCAQDtAgAhmwIBAO0CACGcAiAAjwMAIQMAAAATACABAACjAgAwJgAApAIAIAMAAAATACABAAAUADACAAAVACABAAAAOgAgAQAAADoAIAMAAAA4ACABAAA5ADACAAA6ACADAAAAOAAgAQAAOQAwAgAAOgAgAwAAADgAIAEAADkAMAIAADoAIA0DAADmAwAgEwAAiAQAIPABAQAAAAHxAQEAAAAB9gEAAACSAgL3AUAAAAAB-AFAAAAAAY4CAQAAAAGPAggAAAABkAIBAAAAAZICAQAAAAGTAgEAAAABlAKAAAAAAQEaAACsAgAgC_ABAQAAAAHxAQEAAAAB9gEAAACSAgL3AUAAAAAB-AFAAAAAAY4CAQAAAAGPAggAAAABkAIBAAAAAZICAQAAAAGTAgEAAAABlAKAAAAAAQEaAACuAgAwARoAAK4CADANAwAA5AMAIBMAAIcEACDwAQEA0AMAIfEBAQDQAwAh9gEAAOEDkgIi9wFAANEDACH4AUAA0QMAIY4CAQDQAwAhjwIIAOADACGQAgEA0AMAIZICAQDiAwAhkwIBAOIDACGUAoAAAAABAgAAADoAIBoAALECACAL8AEBANADACHxAQEA0AMAIfYBAADhA5ICIvcBQADRAwAh-AFAANEDACGOAgEA0AMAIY8CCADgAwAhkAIBANADACGSAgEA4gMAIZMCAQDiAwAhlAKAAAAAAQIAAAA4ACAaAACzAgAgAgAAADgAIBoAALMCACADAAAAOgAgIQAArAIAICIAALECACABAAAAOgAgAQAAADgAIAgNAACCBAAgJwAAhQQAICgAAIQEACBpAACDBAAgagAAhgQAIJICAACBBAAgkwIAAIEEACCUAgAAgQQAIA7tAQAAhAMAMO4BAAC6AgAQ7wEAAIQDADDwAQEA7QIAIfEBAQDtAgAh9gEAAIUDkgIi9wFAAO4CACH4AUAA7gIAIY4CAQDtAgAhjwIIAPgCACGQAgEA7QIAIZICAQCGAwAhkwIBAIYDACGUAgAAhwMAIAMAAAA4ACABAAC5AgAwJgAAugIAIAMAAAA4ACABAAA5ADACAAA6ACALEQAAgwMAIO0BAAD-AgAw7gEAAMACABDvAQAA_gIAMPABAQAAAAH3AUAAggMAIfgBQACCAwAhhAIBAP8CACGFAggAgAMAIYYCAgCBAwAhhwIAAPoCACABAAAAvQIAIAEAAAC9AgAgCxEAAIMDACDtAQAA_gIAMO4BAADAAgAQ7wEAAP4CADDwAQEA_wIAIfcBQACCAwAh-AFAAIIDACGEAgEA_wIAIYUCCACAAwAhhgICAIEDACGHAgAA-gIAIAERAACABAAgAwAAAMACACABAADBAgAwAgAAvQIAIAMAAADAAgAgAQAAwQIAMAIAAL0CACADAAAAwAIAIAEAAMECADACAAC9AgAgCBEAAP8DACDwAQEAAAAB9wFAAAAAAfgBQAAAAAGEAgEAAAABhQIIAAAAAYYCAgAAAAGHAgAA_gMAIAEaAADFAgAgB_ABAQAAAAH3AUAAAAAB-AFAAAAAAYQCAQAAAAGFAggAAAABhgICAAAAAYcCAAD-AwAgARoAAMcCADABGgAAxwIAMAgRAADxAwAg8AEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGFAggA4AMAIYYCAgDvAwAhhwIAAPADACACAAAAvQIAIBoAAMoCACAH8AEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGFAggA4AMAIYYCAgDvAwAhhwIAAPADACACAAAAwAIAIBoAAMwCACACAAAAwAIAIBoAAMwCACADAAAAvQIAICEAAMUCACAiAADKAgAgAQAAAL0CACABAAAAwAIAIAUNAADqAwAgJwAA7QMAICgAAOwDACBpAADrAwAgagAA7gMAIArtAQAA9wIAMO4BAADTAgAQ7wEAAPcCADDwAQEA7QIAIfcBQADuAgAh-AFAAO4CACGEAgEA7QIAIYUCCAD4AgAhhgICAPkCACGHAgAA-gIAIAMAAADAAgAgAQAA0gIAMCYAANMCACADAAAAwAIAIAEAAMECADACAAC9AgAgAQAAADQAIAEAAAA0ACADAAAAMgAgAQAAMwAwAgAANAAgAwAAADIAIAEAADMAMAIAADQAIAMAAAAyACABAAAzADACAAA0ACALAwAA5wMAIBIAAOgDACAUAADpAwAg8AEBAAAAAfEBAQAAAAHyAQEAAAAB8wFAAAAAAfQBQAAAAAH2AQAAAPYBAvcBQAAAAAH4AUAAAAABARoAANsCACAI8AEBAAAAAfEBAQAAAAHyAQEAAAAB8wFAAAAAAfQBQAAAAAH2AQAAAPYBAvcBQAAAAAH4AUAAAAABARoAAN0CADABGgAA3QIAMAsDAADTAwAgEgAA1AMAIBQAANUDACDwAQEA0AMAIfEBAQDQAwAh8gEBANADACHzAUAA0QMAIfQBQADRAwAh9gEAANID9gEi9wFAANEDACH4AUAA0QMAIQIAAAA0ACAaAADgAgAgCPABAQDQAwAh8QEBANADACHyAQEA0AMAIfMBQADRAwAh9AFAANEDACH2AQAA0gP2ASL3AUAA0QMAIfgBQADRAwAhAgAAADIAIBoAAOICACACAAAAMgAgGgAA4gIAIAMAAAA0ACAhAADbAgAgIgAA4AIAIAEAAAA0ACABAAAAMgAgAw0AAM0DACAnAADPAwAgKAAAzgMAIAvtAQAA7AIAMO4BAADpAgAQ7wEAAOwCADDwAQEA7QIAIfEBAQDtAgAh8gEBAO0CACHzAUAA7gIAIfQBQADuAgAh9gEAAO8C9gEi9wFAAO4CACH4AUAA7gIAIQMAAAAyACABAADoAgAwJgAA6QIAIAMAAAAyACABAAAzADACAAA0ACAL7QEAAOwCADDuAQAA6QIAEO8BAADsAgAw8AEBAO0CACHxAQEA7QIAIfIBAQDtAgAh8wFAAO4CACH0AUAA7gIAIfYBAADvAvYBIvcBQADuAgAh-AFAAO4CACEODQAA8QIAICcAAPYCACAoAAD2AgAg-QEBAAAAAfoBAQAAAAT7AQEAAAAE_AEBAPUCACH9AQEAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABgQIBAAAAAYICAQAAAAGDAgEAAAABCw0AAPECACAnAAD0AgAgKAAA9AIAIPkBQAAAAAH6AUAAAAAE-wFAAAAABPwBQADzAgAh_QFAAAAAAf4BQAAAAAH_AUAAAAABgAJAAAAAAQcNAADxAgAgJwAA8gIAICgAAPICACD5AQAAAPYBAvoBAAAA9gEI-wEAAAD2AQj8AQAA8AL2ASIHDQAA8QIAICcAAPICACAoAADyAgAg-QEAAAD2AQL6AQAAAPYBCPsBAAAA9gEI_AEAAPAC9gEiCPkBAgAAAAH6AQIAAAAE-wECAAAABPwBAgDxAgAh_QECAAAAAf4BAgAAAAH_AQIAAAABgAICAAAAAQT5AQAAAPYBAvoBAAAA9gEI-wEAAAD2AQj8AQAA8gL2ASILDQAA8QIAICcAAPQCACAoAAD0AgAg-QFAAAAAAfoBQAAAAAT7AUAAAAAE_AFAAPMCACH9AUAAAAAB_gFAAAAAAf8BQAAAAAGAAkAAAAABCPkBQAAAAAH6AUAAAAAE-wFAAAAABPwBQAD0AgAh_QFAAAAAAf4BQAAAAAH_AUAAAAABgAJAAAAAAQ4NAADxAgAgJwAA9gIAICgAAPYCACD5AQEAAAAB-gEBAAAABPsBAQAAAAT8AQEA9QIAIf0BAQAAAAH-AQEAAAAB_wEBAAAAAYACAQAAAAGBAgEAAAABggIBAAAAAYMCAQAAAAEL-QEBAAAAAfoBAQAAAAT7AQEAAAAE_AEBAPYCACH9AQEAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABgQIBAAAAAYICAQAAAAGDAgEAAAABCu0BAAD3AgAw7gEAANMCABDvAQAA9wIAMPABAQDtAgAh9wFAAO4CACH4AUAA7gIAIYQCAQDtAgAhhQIIAPgCACGGAgIA-QIAIYcCAAD6AgAgDQ0AAPECACAnAAD8AgAgKAAA_AIAIGkAAPwCACBqAAD8AgAg-QEIAAAAAfoBCAAAAAT7AQgAAAAE_AEIAP0CACH9AQgAAAAB_gEIAAAAAf8BCAAAAAGAAggAAAABDQ0AAPECACAnAADxAgAgKAAA8QIAIGkAAPwCACBqAADxAgAg-QECAAAAAfoBAgAAAAT7AQIAAAAE_AECAPsCACH9AQIAAAAB_gECAAAAAf8BAgAAAAGAAgIAAAABBPkBAQAAAAWIAgEAAAABiQIBAAAABIoCAQAAAAQNDQAA8QIAICcAAPECACAoAADxAgAgaQAA_AIAIGoAAPECACD5AQIAAAAB-gECAAAABPsBAgAAAAT8AQIA-wIAIf0BAgAAAAH-AQIAAAAB_wECAAAAAYACAgAAAAEI-QEIAAAAAfoBCAAAAAT7AQgAAAAE_AEIAPwCACH9AQgAAAAB_gEIAAAAAf8BCAAAAAGAAggAAAABDQ0AAPECACAnAAD8AgAgKAAA_AIAIGkAAPwCACBqAAD8AgAg-QEIAAAAAfoBCAAAAAT7AQgAAAAE_AEIAP0CACH9AQgAAAAB_gEIAAAAAf8BCAAAAAGAAggAAAABCxEAAIMDACDtAQAA_gIAMO4BAADAAgAQ7wEAAP4CADDwAQEA_wIAIfcBQACCAwAh-AFAAIIDACGEAgEA_wIAIYUCCACAAwAhhgICAIEDACGHAgAA-gIAIAv5AQEAAAAB-gEBAAAABPsBAQAAAAT8AQEA9gIAIf0BAQAAAAH-AQEAAAAB_wEBAAAAAYACAQAAAAGBAgEAAAABggIBAAAAAYMCAQAAAAEI-QEIAAAAAfoBCAAAAAT7AQgAAAAE_AEIAPwCACH9AQgAAAAB_gEIAAAAAf8BCAAAAAGAAggAAAABCPkBAgAAAAH6AQIAAAAE-wECAAAABPwBAgDxAgAh_QECAAAAAf4BAgAAAAH_AQIAAAABgAICAAAAAQj5AUAAAAAB-gFAAAAABPsBQAAAAAT8AUAA9AIAIf0BQAAAAAH-AUAAAAAB_wFAAAAAAYACQAAAAAEDiwIAADIAIIwCAAAyACCNAgAAMgAgDu0BAACEAwAw7gEAALoCABDvAQAAhAMAMPABAQDtAgAh8QEBAO0CACH2AQAAhQOSAiL3AUAA7gIAIfgBQADuAgAhjgIBAO0CACGPAggA-AIAIZACAQDtAgAhkgIBAIYDACGTAgEAhgMAIZQCAACHAwAgBw0AAPECACAnAACNAwAgKAAAjQMAIPkBAAAAkgIC-gEAAACSAgj7AQAAAJICCPwBAACMA5ICIg4NAACIAwAgJwAAiwMAICgAAIsDACD5AQEAAAAB-gEBAAAABfsBAQAAAAX8AQEAigMAIf0BAQAAAAH-AQEAAAAB_wEBAAAAAYACAQAAAAGBAgEAAAABggIBAAAAAYMCAQAAAAEPDQAAiAMAICcAAIkDACAoAACJAwAg-QGAAAAAAfwBgAAAAAH9AYAAAAAB_gGAAAAAAf8BgAAAAAGAAoAAAAABlQIBAAAAAZYCAQAAAAGXAgEAAAABmAKAAAAAAZkCgAAAAAGaAoAAAAABCPkBAgAAAAH6AQIAAAAF-wECAAAABfwBAgCIAwAh_QECAAAAAf4BAgAAAAH_AQIAAAABgAICAAAAAQz5AYAAAAAB_AGAAAAAAf0BgAAAAAH-AYAAAAAB_wGAAAAAAYACgAAAAAGVAgEAAAABlgIBAAAAAZcCAQAAAAGYAoAAAAABmQKAAAAAAZoCgAAAAAEODQAAiAMAICcAAIsDACAoAACLAwAg-QEBAAAAAfoBAQAAAAX7AQEAAAAF_AEBAIoDACH9AQEAAAAB_gEBAAAAAf8BAQAAAAGAAgEAAAABgQIBAAAAAYICAQAAAAGDAgEAAAABC_kBAQAAAAH6AQEAAAAF-wEBAAAABfwBAQCLAwAh_QEBAAAAAf4BAQAAAAH_AQEAAAABgAIBAAAAAYECAQAAAAGCAgEAAAABgwIBAAAAAQcNAADxAgAgJwAAjQMAICgAAI0DACD5AQAAAJICAvoBAAAAkgII-wEAAACSAgj8AQAAjAOSAiIE-QEAAACSAgL6AQAAAJICCPsBAAAAkgII_AEAAI0DkgIiC-0BAACOAwAw7gEAAKQCABDvAQAAjgMAMPABAQDtAgAh8wFAAO4CACH0AUAA7gIAIfcBQADuAgAh-AFAAO4CACGEAgEA7QIAIZsCAQDtAgAhnAIgAI8DACEFDQAA8QIAICcAAJEDACAoAACRAwAg-QEgAAAAAfwBIACQAwAhBQ0AAPECACAnAACRAwAgKAAAkQMAIPkBIAAAAAH8ASAAkAMAIQL5ASAAAAAB_AEgAJEDACEL7QEAAJIDADDuAQAAjgIAEO8BAACSAwAw8AEBAO0CACHxAQEA7QIAIfcBQADuAgAh-AFAAO4CACGbAgEA7QIAIZ0CAQDtAgAhngJAAO4CACGgAgAAkwOgAiIHDQAA8QIAICcAAJUDACAoAACVAwAg-QEAAACgAgL6AQAAAKACCPsBAAAAoAII_AEAAJQDoAIiBw0AAPECACAnAACVAwAgKAAAlQMAIPkBAAAAoAIC-gEAAACgAgj7AQAAAKACCPwBAACUA6ACIgT5AQAAAKACAvoBAAAAoAII-wEAAACgAgj8AQAAlQOgAiII7QEAAJYDADDuAQAA-AEAEO8BAACWAwAw8AEBAO0CACHxAQEA7QIAIfcBQADuAgAhmwIBAO0CACGiAgAAlwOiAiIHDQAA8QIAICcAAJkDACAoAACZAwAg-QEAAACiAgL6AQAAAKICCPsBAAAAogII_AEAAJgDogIiBw0AAPECACAnAACZAwAgKAAAmQMAIPkBAAAAogIC-gEAAACiAgj7AQAAAKICCPwBAACYA6ICIgT5AQAAAKICAvoBAAAAogII-wEAAACiAgj8AQAAmQOiAiIJ7QEAAJoDADDuAQAA4gEAEO8BAACaAwAw8AEBAO0CACH3AUAA7gIAIfgBQADuAgAhhAIBAO0CACGjAgEAhgMAIaQCAQDtAgAhDO0BAACbAwAw7gEAAMwBABDvAQAAmwMAMPABAQDtAgAh9wFAAO4CACH4AUAA7gIAIY8CCAD4AgAhmwIBAO0CACGdAgEA7QIAIaMCAQCGAwAhpAIBAO0CACGmAgAAnAOmAiIHDQAA8QIAICcAAJ4DACAoAACeAwAg-QEAAACmAgL6AQAAAKYCCPsBAAAApgII_AEAAJ0DpgIiBw0AAPECACAnAACeAwAgKAAAngMAIPkBAAAApgIC-gEAAACmAgj7AQAAAKYCCPwBAACdA6YCIgT5AQAAAKYCAvoBAAAApgII-wEAAACmAgj8AQAAngOmAiIL7QEAAJ8DADDuAQAAtgEAEO8BAACfAwAw8AEBAO0CACHxAQEA7QIAIfcBQADuAgAh-AFAAO4CACGPAggA-AIAIZsCAQDtAgAhnQIBAO0CACGnAgEAhgMAIQntAQAAoAMAMO4BAACgAQAQ7wEAAKADADDwAQEA7QIAIfcBQADuAgAh-AFAAO4CACGoAgEA7QIAIakCAQDtAgAhqgJAAO4CACEJ7QEAAKEDADDuAQAAjQEAEO8BAAChAwAw8AEBAP8CACH3AUAAggMAIfgBQACCAwAhqAIBAP8CACGpAgEA_wIAIaoCQACCAwAhEO0BAACiAwAw7gEAAIcBABDvAQAAogMAMPABAQDtAgAh8QEBAO0CACH3AUAA7gIAIfgBQADuAgAhqwIBAO0CACGsAgEA7QIAIa0CAQCGAwAhrgIBAIYDACGvAgEAhgMAIbACQACjAwAhsQJAAKMDACGyAgEAhgMAIbMCAQCGAwAhCw0AAIgDACAnAAClAwAgKAAApQMAIPkBQAAAAAH6AUAAAAAF-wFAAAAABfwBQACkAwAh_QFAAAAAAf4BQAAAAAH_AUAAAAABgAJAAAAAAQsNAACIAwAgJwAApQMAICgAAKUDACD5AUAAAAAB-gFAAAAABfsBQAAAAAX8AUAApAMAIf0BQAAAAAH-AUAAAAAB_wFAAAAAAYACQAAAAAEI-QFAAAAAAfoBQAAAAAX7AUAAAAAF_AFAAKUDACH9AUAAAAAB_gFAAAAAAf8BQAAAAAGAAkAAAAABC-0BAACmAwAw7gEAAHEAEO8BAACmAwAw8AEBAO0CACHxAQEA7QIAIfcBQADuAgAh-AFAAO4CACGqAkAA7gIAIbQCAQDtAgAhtQIBAIYDACG2AgEAhgMAIQ7tAQAApwMAMO4BAABbABDvAQAApwMAMPABAQDtAgAh9gEBAO0CACH3AUAA7gIAIfgBQADuAgAhhAIBAO0CACGiAgEA7QIAIbcCAQDtAgAhuAIgAI8DACG5AgEAhgMAIboCIACPAwAhuwIgAI8DACEXBAAAqwMAIAUAAKwDACAKAACvAwAgCwAAsAMAIAwAALEDACAPAACtAwAgEAAArgMAIBEAAIMDACAUAACyAwAg7QEAAKgDADDuAQAASAAQ7wEAAKgDADDwAQEA_wIAIfYBAQD_AgAh9wFAAIIDACH4AUAAggMAIYQCAQD_AgAhogIBAP8CACG3AgEA_wIAIbgCIACpAwAhuQIBAKoDACG6AiAAqQMAIbsCIACpAwAhAvkBIAAAAAH8ASAAkQMAIQv5AQEAAAAB-gEBAAAABfsBAQAAAAX8AQEAiwMAIf0BAQAAAAH-AQEAAAAB_wEBAAAAAYACAQAAAAGBAgEAAAABggIBAAAAAYMCAQAAAAEDiwIAAAMAIIwCAAADACCNAgAAAwAgA4sCAAAHACCMAgAABwAgjQIAAAcAIAOLAgAACwAgjAIAAAsAII0CAAALACADiwIAAA8AIIwCAAAPACCNAgAADwAgA4sCAAAXACCMAgAAFwAgjQIAABcAIAOLAgAAGwAgjAIAABsAII0CAAAbACADiwIAAB8AIIwCAAAfACCNAgAAHwAgA4sCAAA4ACCMAgAAOAAgjQIAADgAIBADAAC2AwAgEwAAtwMAIO0BAACzAwAw7gEAADgAEO8BAACzAwAw8AEBAP8CACHxAQEA_wIAIfYBAAC0A5ICIvcBQACCAwAh-AFAAIIDACGOAgEA_wIAIY8CCACAAwAhkAIBAP8CACGSAgEAqgMAIZMCAQCqAwAhlAIAALUDACAE-QEAAACSAgL6AQAAAJICCPsBAAAAkgII_AEAAI0DkgIiDPkBgAAAAAH8AYAAAAAB_QGAAAAAAf4BgAAAAAH_AYAAAAABgAKAAAAAAZUCAQAAAAGWAgEAAAABlwIBAAAAAZgCgAAAAAGZAoAAAAABmgKAAAAAARkEAACrAwAgBQAArAMAIAoAAK8DACALAACwAwAgDAAAsQMAIA8AAK0DACAQAACuAwAgEQAAgwMAIBQAALIDACDtAQAAqAMAMO4BAABIABDvAQAAqAMAMPABAQD_AgAh9gEBAP8CACH3AUAAggMAIfgBQACCAwAhhAIBAP8CACGiAgEA_wIAIbcCAQD_AgAhuAIgAKkDACG5AgEAqgMAIboCIACpAwAhuwIgAKkDACG_AgAASAAgwAIAAEgAIBADAAC2AwAgEgAAugMAIBQAALIDACDtAQAAuAMAMO4BAAAyABDvAQAAuAMAMPABAQD_AgAh8QEBAP8CACHyAQEA_wIAIfMBQACCAwAh9AFAAIIDACH2AQAAuQP2ASL3AUAAggMAIfgBQACCAwAhvwIAADIAIMACAAAyACAOAwAAtgMAIBIAALoDACAUAACyAwAg7QEAALgDADDuAQAAMgAQ7wEAALgDADDwAQEA_wIAIfEBAQD_AgAh8gEBAP8CACHzAUAAggMAIfQBQACCAwAh9gEAALkD9gEi9wFAAIIDACH4AUAAggMAIQT5AQAAAPYBAvoBAAAA9gEI-wEAAAD2AQj8AQAA8gL2ASINEQAAgwMAIO0BAAD-AgAw7gEAAMACABDvAQAA_gIAMPABAQD_AgAh9wFAAIIDACH4AUAAggMAIYQCAQD_AgAhhQIIAIADACGGAgIAgQMAIYcCAAD6AgAgvwIAAMACACDAAgAAwAIAIA8GAAC2AwAgBwAAvQMAIAkAAL4DACDtAQAAuwMAMO4BAAAfABDvAQAAuwMAMPABAQD_AgAh9wFAAIIDACH4AUAAggMAIY8CCACAAwAhmwIBAP8CACGdAgEA_wIAIaMCAQCqAwAhpAIBAP8CACGmAgAAvAOmAiIE-QEAAACmAgL6AQAAAKYCCPsBAAAApgII_AEAAJ4DpgIiEQYAALYDACAIAACuAwAgCgAArwMAIAsAALADACAMAACxAwAgDgAAyQMAIO0BAADIAwAw7gEAAAsAEO8BAADIAwAw8AEBAP8CACH3AUAAggMAIfgBQACCAwAhhAIBAP8CACGjAgEAqgMAIaQCAQD_AgAhvwIAAAsAIMACAAALACARBwAAvQMAIAoAAK8DACALAACwAwAgDAAAsQMAIO0BAADEAwAw7gEAABMAEO8BAADEAwAw8AEBAP8CACHzAUAAggMAIfQBQACCAwAh9wFAAIIDACH4AUAAggMAIYQCAQD_AgAhmwIBAP8CACGcAiAAqQMAIb8CAAATACDAAgAAEwAgDgMAALYDACAHAAC9AwAgCQAAvgMAIO0BAAC_AwAw7gEAABsAEO8BAAC_AwAw8AEBAP8CACHxAQEA_wIAIfcBQACCAwAh-AFAAIIDACGPAggAgAMAIZsCAQD_AgAhnQIBAP8CACGnAgEAqgMAIQPxAQEAAAABngJAAAAAAaACAAAAoAICDgMAALYDACAHAAC9AwAgCQAAvgMAIO0BAADBAwAw7gEAABcAEO8BAADBAwAw8AEBAP8CACHxAQEA_wIAIfcBQACCAwAh-AFAAIIDACGbAgEA_wIAIZ0CAQD_AgAhngJAAIIDACGgAgAAwgOgAiIE-QEAAACgAgL6AQAAAKACCPsBAAAAoAII_AEAAJUDoAIiAoQCAQAAAAGbAgEAAAABDwcAAL0DACAKAACvAwAgCwAAsAMAIAwAALEDACDtAQAAxAMAMO4BAAATABDvAQAAxAMAMPABAQD_AgAh8wFAAIIDACH0AUAAggMAIfcBQACCAwAh-AFAAIIDACGEAgEA_wIAIZsCAQD_AgAhnAIgAKkDACEC8QEBAAAAAZsCAQAAAAEKAwAAtgMAIAcAAL0DACDtAQAAxgMAMO4BAAAPABDvAQAAxgMAMPABAQD_AgAh8QEBAP8CACH3AUAAggMAIZsCAQD_AgAhogIAAMcDogIiBPkBAAAAogIC-gEAAACiAgj7AQAAAKICCPwBAACZA6ICIg8GAAC2AwAgCAAArgMAIAoAAK8DACALAACwAwAgDAAAsQMAIA4AAMkDACDtAQAAyAMAMO4BAAALABDvAQAAyAMAMPABAQD_AgAh9wFAAIIDACH4AUAAggMAIYQCAQD_AgAhowIBAKoDACGkAgEA_wIAIQOLAgAAEwAgjAIAABMAII0CAAATACARAwAAtgMAIO0BAADKAwAw7gEAAAcAEO8BAADKAwAw8AEBAP8CACHxAQEA_wIAIfcBQACCAwAh-AFAAIIDACGrAgEA_wIAIawCAQD_AgAhrQIBAKoDACGuAgEAqgMAIa8CAQCqAwAhsAJAAMsDACGxAkAAywMAIbICAQCqAwAhswIBAKoDACEI-QFAAAAAAfoBQAAAAAX7AUAAAAAF_AFAAKUDACH9AUAAAAAB_gFAAAAAAf8BQAAAAAGAAkAAAAABDAMAALYDACDtAQAAzAMAMO4BAAADABDvAQAAzAMAMPABAQD_AgAh8QEBAP8CACH3AUAAggMAIfgBQACCAwAhqgJAAIIDACG0AgEA_wIAIbUCAQCqAwAhtgIBAKoDACEAAAABxAIBAAAAAQHEAkAAAAABAcQCAAAA9gECBSEAAJMHACAiAACfBwAgwQIAAJQHACDCAgAAngcAIMcCAAABACAFIQAAkQcAICIAAJwHACDBAgAAkgcAIMICAACbBwAgxwIAAL0CACALIQAA1gMAMCIAANsDADDBAgAA1wMAMMICAADYAwAwwwIAANkDACDEAgAA2gMAMMUCAADaAwAwxgIAANoDADDHAgAA2gMAMMgCAADcAwAwyQIAAN0DADALAwAA5gMAIPABAQAAAAHxAQEAAAAB9gEAAACSAgL3AUAAAAAB-AFAAAAAAY8CCAAAAAGQAgEAAAABkgIBAAAAAZMCAQAAAAGUAoAAAAABAgAAADoAICEAAOUDACADAAAAOgAgIQAA5QMAICIAAOMDACABGgAAmgcAMBADAAC2AwAgEwAAtwMAIO0BAACzAwAw7gEAADgAEO8BAACzAwAw8AEBAAAAAfEBAQD_AgAh9gEAALQDkgIi9wFAAIIDACH4AUAAggMAIY4CAQD_AgAhjwIIAIADACGQAgEAAAABkgIBAAAAAZMCAQCqAwAhlAIAALUDACACAAAAOgAgGgAA4wMAIAIAAADeAwAgGgAA3wMAIA7tAQAA3QMAMO4BAADeAwAQ7wEAAN0DADDwAQEA_wIAIfEBAQD_AgAh9gEAALQDkgIi9wFAAIIDACH4AUAAggMAIY4CAQD_AgAhjwIIAIADACGQAgEA_wIAIZICAQCqAwAhkwIBAKoDACGUAgAAtQMAIA7tAQAA3QMAMO4BAADeAwAQ7wEAAN0DADDwAQEA_wIAIfEBAQD_AgAh9gEAALQDkgIi9wFAAIIDACH4AUAAggMAIY4CAQD_AgAhjwIIAIADACGQAgEA_wIAIZICAQCqAwAhkwIBAKoDACGUAgAAtQMAIArwAQEA0AMAIfEBAQDQAwAh9gEAAOEDkgIi9wFAANEDACH4AUAA0QMAIY8CCADgAwAhkAIBANADACGSAgEA4gMAIZMCAQDiAwAhlAKAAAAAAQXEAggAAAABywIIAAAAAcwCCAAAAAHNAggAAAABzgIIAAAAAQHEAgAAAJICAgHEAgEAAAABCwMAAOQDACDwAQEA0AMAIfEBAQDQAwAh9gEAAOEDkgIi9wFAANEDACH4AUAA0QMAIY8CCADgAwAhkAIBANADACGSAgEA4gMAIZMCAQDiAwAhlAKAAAAAAQUhAACVBwAgIgAAmAcAIMECAACWBwAgwgIAAJcHACDHAgAAAQAgCwMAAOYDACDwAQEAAAAB8QEBAAAAAfYBAAAAkgIC9wFAAAAAAfgBQAAAAAGPAggAAAABkAIBAAAAAZICAQAAAAGTAgEAAAABlAKAAAAAAQMhAACVBwAgwQIAAJYHACDHAgAAAQAgAyEAAJMHACDBAgAAlAcAIMcCAAABACADIQAAkQcAIMECAACSBwAgxwIAAL0CACAEIQAA1gMAMMECAADXAwAwwwIAANkDACDHAgAA2gMAMAAAAAAABcQCAgAAAAHLAgIAAAABzAICAAAAAc0CAgAAAAHOAgIAAAABAsQCAQAAAATKAgEAAAAFCyEAAPIDADAiAAD3AwAwwQIAAPMDADDCAgAA9AMAMMMCAAD1AwAgxAIAAPYDADDFAgAA9gMAMMYCAAD2AwAwxwIAAPYDADDIAgAA-AMAMMkCAAD5AwAwCQMAAOcDACAUAADpAwAg8AEBAAAAAfEBAQAAAAHzAUAAAAAB9AFAAAAAAfYBAAAA9gEC9wFAAAAAAfgBQAAAAAECAAAANAAgIQAA_QMAIAMAAAA0ACAhAAD9AwAgIgAA_AMAIAEaAACQBwAwDgMAALYDACASAAC6AwAgFAAAsgMAIO0BAAC4AwAw7gEAADIAEO8BAAC4AwAw8AEBAAAAAfEBAQD_AgAh8gEBAP8CACHzAUAAggMAIfQBQACCAwAh9gEAALkD9gEi9wFAAIIDACH4AUAAggMAIQIAAAA0ACAaAAD8AwAgAgAAAPoDACAaAAD7AwAgC-0BAAD5AwAw7gEAAPoDABDvAQAA-QMAMPABAQD_AgAh8QEBAP8CACHyAQEA_wIAIfMBQACCAwAh9AFAAIIDACH2AQAAuQP2ASL3AUAAggMAIfgBQACCAwAhC-0BAAD5AwAw7gEAAPoDABDvAQAA-QMAMPABAQD_AgAh8QEBAP8CACHyAQEA_wIAIfMBQACCAwAh9AFAAIIDACH2AQAAuQP2ASL3AUAAggMAIfgBQACCAwAhB_ABAQDQAwAh8QEBANADACHzAUAA0QMAIfQBQADRAwAh9gEAANID9gEi9wFAANEDACH4AUAA0QMAIQkDAADTAwAgFAAA1QMAIPABAQDQAwAh8QEBANADACHzAUAA0QMAIfQBQADRAwAh9gEAANID9gEi9wFAANEDACH4AUAA0QMAIQkDAADnAwAgFAAA6QMAIPABAQAAAAHxAQEAAAAB8wFAAAAAAfQBQAAAAAH2AQAAAPYBAvcBQAAAAAH4AUAAAAABAcQCAQAAAAQEIQAA8gMAMMECAADzAwAwwwIAAPUDACDHAgAA9gMAMAAAAAAAAAAFIQAAiwcAICIAAI4HACDBAgAAjAcAIMICAACNBwAgxwIAADQAIAMhAACLBwAgwQIAAIwHACDHAgAANAAgAAAAAcQCIAAAAAEFIQAA5QYAICIAAIkHACDBAgAA5gYAIMICAACIBwAgxwIAAA0AIAshAACyBAAwIgAAtwQAMMECAACzBAAwwgIAALQEADDDAgAAtQQAIMQCAAC2BAAwxQIAALYEADDGAgAAtgQAMMcCAAC2BAAwyAIAALgEADDJAgAAuQQAMAshAACiBAAwIgAApwQAMMECAACjBAAwwgIAAKQEADDDAgAApQQAIMQCAACmBAAwxQIAAKYEADDGAgAApgQAMMcCAACmBAAwyAIAAKgEADDJAgAAqQQAMAshAACRBAAwIgAAlgQAMMECAACSBAAwwgIAAJMEADDDAgAAlAQAIMQCAACVBAAwxQIAAJUEADDGAgAAlQQAMMcCAACVBAAwyAIAAJcEADDJAgAAmAQAMAoGAAChBAAgBwAAoAQAIPABAQAAAAH3AUAAAAAB-AFAAAAAAY8CCAAAAAGbAgEAAAABowIBAAAAAaQCAQAAAAGmAgAAAKYCAgIAAAAhACAhAACfBAAgAwAAACEAICEAAJ8EACAiAACcBAAgARoAAIcHADAPBgAAtgMAIAcAAL0DACAJAAC-AwAg7QEAALsDADDuAQAAHwAQ7wEAALsDADDwAQEAAAAB9wFAAIIDACH4AUAAggMAIY8CCACAAwAhmwIBAP8CACGdAgEA_wIAIaMCAQCqAwAhpAIBAP8CACGmAgAAvAOmAiICAAAAIQAgGgAAnAQAIAIAAACZBAAgGgAAmgQAIAztAQAAmAQAMO4BAACZBAAQ7wEAAJgEADDwAQEA_wIAIfcBQACCAwAh-AFAAIIDACGPAggAgAMAIZsCAQD_AgAhnQIBAP8CACGjAgEAqgMAIaQCAQD_AgAhpgIAALwDpgIiDO0BAACYBAAw7gEAAJkEABDvAQAAmAQAMPABAQD_AgAh9wFAAIIDACH4AUAAggMAIY8CCACAAwAhmwIBAP8CACGdAgEA_wIAIaMCAQCqAwAhpAIBAP8CACGmAgAAvAOmAiII8AEBANADACH3AUAA0QMAIfgBQADRAwAhjwIIAOADACGbAgEA0AMAIaMCAQDiAwAhpAIBANADACGmAgAAmwSmAiIBxAIAAACmAgIKBgAAngQAIAcAAJ0EACDwAQEA0AMAIfcBQADRAwAh-AFAANEDACGPAggA4AMAIZsCAQDQAwAhowIBAOIDACGkAgEA0AMAIaYCAACbBKYCIgUhAAD_BgAgIgAAhQcAIMECAACABwAgwgIAAIQHACDHAgAADQAgBSEAAP0GACAiAACCBwAgwQIAAP4GACDCAgAAgQcAIMcCAAABACAKBgAAoQQAIAcAAKAEACDwAQEAAAAB9wFAAAAAAfgBQAAAAAGPAggAAAABmwIBAAAAAaMCAQAAAAGkAgEAAAABpgIAAACmAgIDIQAA_wYAIMECAACABwAgxwIAAA0AIAMhAAD9BgAgwQIAAP4GACDHAgAAAQAgCQMAALEEACAHAACwBAAg8AEBAAAAAfEBAQAAAAH3AUAAAAAB-AFAAAAAAY8CCAAAAAGbAgEAAAABpwIBAAAAAQIAAAAdACAhAACvBAAgAwAAAB0AICEAAK8EACAiAACsBAAgARoAAPwGADAOAwAAtgMAIAcAAL0DACAJAAC-AwAg7QEAAL8DADDuAQAAGwAQ7wEAAL8DADDwAQEAAAAB8QEBAP8CACH3AUAAggMAIfgBQACCAwAhjwIIAIADACGbAgEA_wIAIZ0CAQD_AgAhpwIBAKoDACECAAAAHQAgGgAArAQAIAIAAACqBAAgGgAAqwQAIAvtAQAAqQQAMO4BAACqBAAQ7wEAAKkEADDwAQEA_wIAIfEBAQD_AgAh9wFAAIIDACH4AUAAggMAIY8CCACAAwAhmwIBAP8CACGdAgEA_wIAIacCAQCqAwAhC-0BAACpBAAw7gEAAKoEABDvAQAAqQQAMPABAQD_AgAh8QEBAP8CACH3AUAAggMAIfgBQACCAwAhjwIIAIADACGbAgEA_wIAIZ0CAQD_AgAhpwIBAKoDACEH8AEBANADACHxAQEA0AMAIfcBQADRAwAh-AFAANEDACGPAggA4AMAIZsCAQDQAwAhpwIBAOIDACEJAwAArgQAIAcAAK0EACDwAQEA0AMAIfEBAQDQAwAh9wFAANEDACH4AUAA0QMAIY8CCADgAwAhmwIBANADACGnAgEA4gMAIQUhAAD0BgAgIgAA-gYAIMECAAD1BgAgwgIAAPkGACDHAgAADQAgBSEAAPIGACAiAAD3BgAgwQIAAPMGACDCAgAA9gYAIMcCAAABACAJAwAAsQQAIAcAALAEACDwAQEAAAAB8QEBAAAAAfcBQAAAAAH4AUAAAAABjwIIAAAAAZsCAQAAAAGnAgEAAAABAyEAAPQGACDBAgAA9QYAIMcCAAANACADIQAA8gYAIMECAADzBgAgxwIAAAEAIAkDAADCBAAgBwAAwQQAIPABAQAAAAHxAQEAAAAB9wFAAAAAAfgBQAAAAAGbAgEAAAABngJAAAAAAaACAAAAoAICAgAAABkAICEAAMAEACADAAAAGQAgIQAAwAQAICIAAL0EACABGgAA8QYAMA8DAAC2AwAgBwAAvQMAIAkAAL4DACDtAQAAwQMAMO4BAAAXABDvAQAAwQMAMPABAQAAAAHxAQEA_wIAIfcBQACCAwAh-AFAAIIDACGbAgEA_wIAIZ0CAQD_AgAhngJAAIIDACGgAgAAwgOgAiK8AgAAwAMAIAIAAAAZACAaAAC9BAAgAgAAALoEACAaAAC7BAAgC-0BAAC5BAAw7gEAALoEABDvAQAAuQQAMPABAQD_AgAh8QEBAP8CACH3AUAAggMAIfgBQACCAwAhmwIBAP8CACGdAgEA_wIAIZ4CQACCAwAhoAIAAMIDoAIiC-0BAAC5BAAw7gEAALoEABDvAQAAuQQAMPABAQD_AgAh8QEBAP8CACH3AUAAggMAIfgBQACCAwAhmwIBAP8CACGdAgEA_wIAIZ4CQACCAwAhoAIAAMIDoAIiB_ABAQDQAwAh8QEBANADACH3AUAA0QMAIfgBQADRAwAhmwIBANADACGeAkAA0QMAIaACAAC8BKACIgHEAgAAAKACAgkDAAC_BAAgBwAAvgQAIPABAQDQAwAh8QEBANADACH3AUAA0QMAIfgBQADRAwAhmwIBANADACGeAkAA0QMAIaACAAC8BKACIgUhAADpBgAgIgAA7wYAIMECAADqBgAgwgIAAO4GACDHAgAADQAgBSEAAOcGACAiAADsBgAgwQIAAOgGACDCAgAA6wYAIMcCAAABACAJAwAAwgQAIAcAAMEEACDwAQEAAAAB8QEBAAAAAfcBQAAAAAH4AUAAAAABmwIBAAAAAZ4CQAAAAAGgAgAAAKACAgMhAADpBgAgwQIAAOoGACDHAgAADQAgAyEAAOcGACDBAgAA6AYAIMcCAAABACADIQAA5QYAIMECAADmBgAgxwIAAA0AIAQhAACyBAAwwQIAALMEADDDAgAAtQQAIMcCAAC2BAAwBCEAAKIEADDBAgAAowQAMMMCAAClBAAgxwIAAKYEADAEIQAAkQQAMMECAACSBAAwwwIAAJQEACDHAgAAlQQAMAAAAAUhAADgBgAgIgAA4wYAIMECAADhBgAgwgIAAOIGACDHAgAAFQAgAyEAAOAGACDBAgAA4QYAIMcCAAAVACAAAAABxAIAAACiAgIFIQAA2AYAICIAAN4GACDBAgAA2QYAIMICAADdBgAgxwIAAAEAIAUhAADWBgAgIgAA2wYAIMECAADXBgAgwgIAANoGACDHAgAADQAgAyEAANgGACDBAgAA2QYAIMcCAAABACADIQAA1gYAIMECAADXBgAgxwIAAA0AIAAAAAUhAADCBgAgIgAA1AYAIMECAADDBgAgwgIAANMGACDHAgAAAQAgCyEAAIgFADAiAACNBQAwwQIAAIkFADDCAgAAigUAMMMCAACLBQAgxAIAAIwFADDFAgAAjAUAMMYCAACMBQAwxwIAAIwFADDIAgAAjgUAMMkCAACPBQAwCyEAAPwEADAiAACBBQAwwQIAAP0EADDCAgAA_gQAMMMCAAD_BAAgxAIAAIAFADDFAgAAgAUAMMYCAACABQAwxwIAAIAFADDIAgAAggUAMMkCAACDBQAwCyEAAPEEADAiAAD1BAAwwQIAAPIEADDCAgAA8wQAMMMCAAD0BAAgxAIAAKYEADDFAgAApgQAMMYCAACmBAAwxwIAAKYEADDIAgAA9gQAMMkCAACpBAAwCyEAAOYEADAiAADqBAAwwQIAAOcEADDCAgAA6AQAMMMCAADpBAAgxAIAAJUEADDFAgAAlQQAMMYCAACVBAAwxwIAAJUEADDIAgAA6wQAMMkCAACYBAAwCyEAAN0EADAiAADhBAAwwQIAAN4EADDCAgAA3wQAMMMCAADgBAAgxAIAALYEADDFAgAAtgQAMMYCAAC2BAAwxwIAALYEADDIAgAA4gQAMMkCAAC5BAAwCQMAAMIEACAJAADLBAAg8AEBAAAAAfEBAQAAAAH3AUAAAAAB-AFAAAAAAZ0CAQAAAAGeAkAAAAABoAIAAACgAgICAAAAGQAgIQAA5QQAIAMAAAAZACAhAADlBAAgIgAA5AQAIAEaAADSBgAwAgAAABkAIBoAAOQEACACAAAAugQAIBoAAOMEACAH8AEBANADACHxAQEA0AMAIfcBQADRAwAh-AFAANEDACGdAgEA0AMAIZ4CQADRAwAhoAIAALwEoAIiCQMAAL8EACAJAADKBAAg8AEBANADACHxAQEA0AMAIfcBQADRAwAh-AFAANEDACGdAgEA0AMAIZ4CQADRAwAhoAIAALwEoAIiCQMAAMIEACAJAADLBAAg8AEBAAAAAfEBAQAAAAH3AUAAAAAB-AFAAAAAAZ0CAQAAAAGeAkAAAAABoAIAAACgAgIKBgAAoQQAIAkAAPAEACDwAQEAAAAB9wFAAAAAAfgBQAAAAAGPAggAAAABnQIBAAAAAaMCAQAAAAGkAgEAAAABpgIAAACmAgICAAAAIQAgIQAA7wQAIAMAAAAhACAhAADvBAAgIgAA7QQAIAEaAADRBgAwAgAAACEAIBoAAO0EACACAAAAmQQAIBoAAOwEACAI8AEBANADACH3AUAA0QMAIfgBQADRAwAhjwIIAOADACGdAgEA0AMAIaMCAQDiAwAhpAIBANADACGmAgAAmwSmAiIKBgAAngQAIAkAAO4EACDwAQEA0AMAIfcBQADRAwAh-AFAANEDACGPAggA4AMAIZ0CAQDQAwAhowIBAOIDACGkAgEA0AMAIaYCAACbBKYCIgUhAADMBgAgIgAAzwYAIMECAADNBgAgwgIAAM4GACDHAgAAFQAgCgYAAKEEACAJAADwBAAg8AEBAAAAAfcBQAAAAAH4AUAAAAABjwIIAAAAAZ0CAQAAAAGjAgEAAAABpAIBAAAAAaYCAAAApgICAyEAAMwGACDBAgAAzQYAIMcCAAAVACAJAwAAsQQAIAkAAPsEACDwAQEAAAAB8QEBAAAAAfcBQAAAAAH4AUAAAAABjwIIAAAAAZ0CAQAAAAGnAgEAAAABAgAAAB0AICEAAPoEACADAAAAHQAgIQAA-gQAICIAAPgEACABGgAAywYAMAIAAAAdACAaAAD4BAAgAgAAAKoEACAaAAD3BAAgB_ABAQDQAwAh8QEBANADACH3AUAA0QMAIfgBQADRAwAhjwIIAOADACGdAgEA0AMAIacCAQDiAwAhCQMAAK4EACAJAAD5BAAg8AEBANADACHxAQEA0AMAIfcBQADRAwAh-AFAANEDACGPAggA4AMAIZ0CAQDQAwAhpwIBAOIDACEFIQAAxgYAICIAAMkGACDBAgAAxwYAIMICAADIBgAgxwIAABUAIAkDAACxBAAgCQAA-wQAIPABAQAAAAHxAQEAAAAB9wFAAAAAAfgBQAAAAAGPAggAAAABnQIBAAAAAacCAQAAAAEDIQAAxgYAIMECAADHBgAgxwIAABUAIAoKAADEBAAgCwAAxQQAIAwAAMYEACDwAQEAAAAB8wFAAAAAAfQBQAAAAAH3AUAAAAAB-AFAAAAAAYQCAQAAAAGcAiAAAAABAgAAABUAICEAAIcFACADAAAAFQAgIQAAhwUAICIAAIYFACABGgAAxQYAMBAHAAC9AwAgCgAArwMAIAsAALADACAMAACxAwAg7QEAAMQDADDuAQAAEwAQ7wEAAMQDADDwAQEAAAAB8wFAAIIDACH0AUAAggMAIfcBQACCAwAh-AFAAIIDACGEAgEA_wIAIZsCAQD_AgAhnAIgAKkDACG9AgAAwwMAIAIAAAAVACAaAACGBQAgAgAAAIQFACAaAACFBQAgC-0BAACDBQAw7gEAAIQFABDvAQAAgwUAMPABAQD_AgAh8wFAAIIDACH0AUAAggMAIfcBQACCAwAh-AFAAIIDACGEAgEA_wIAIZsCAQD_AgAhnAIgAKkDACEL7QEAAIMFADDuAQAAhAUAEO8BAACDBQAw8AEBAP8CACHzAUAAggMAIfQBQACCAwAh9wFAAIIDACH4AUAAggMAIYQCAQD_AgAhmwIBAP8CACGcAiAAqQMAIQfwAQEA0AMAIfMBQADRAwAh9AFAANEDACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGcAiAAjAQAIQoKAACOBAAgCwAAjwQAIAwAAJAEACDwAQEA0AMAIfMBQADRAwAh9AFAANEDACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGcAiAAjAQAIQoKAADEBAAgCwAAxQQAIAwAAMYEACDwAQEAAAAB8wFAAAAAAfQBQAAAAAH3AUAAAAAB-AFAAAAAAYQCAQAAAAGcAiAAAAABBQMAANIEACDwAQEAAAAB8QEBAAAAAfcBQAAAAAGiAgAAAKICAgIAAAARACAhAACTBQAgAwAAABEAICEAAJMFACAiAACSBQAgARoAAMQGADALAwAAtgMAIAcAAL0DACDtAQAAxgMAMO4BAAAPABDvAQAAxgMAMPABAQAAAAHxAQEA_wIAIfcBQACCAwAhmwIBAP8CACGiAgAAxwOiAiK-AgAAxQMAIAIAAAARACAaAACSBQAgAgAAAJAFACAaAACRBQAgCO0BAACPBQAw7gEAAJAFABDvAQAAjwUAMPABAQD_AgAh8QEBAP8CACH3AUAAggMAIZsCAQD_AgAhogIAAMcDogIiCO0BAACPBQAw7gEAAJAFABDvAQAAjwUAMPABAQD_AgAh8QEBAP8CACH3AUAAggMAIZsCAQD_AgAhogIAAMcDogIiBPABAQDQAwAh8QEBANADACH3AUAA0QMAIaICAADPBKICIgUDAADQBAAg8AEBANADACHxAQEA0AMAIfcBQADRAwAhogIAAM8EogIiBQMAANIEACDwAQEAAAAB8QEBAAAAAfcBQAAAAAGiAgAAAKICAgMhAADCBgAgwQIAAMMGACDHAgAAAQAgBCEAAIgFADDBAgAAiQUAMMMCAACLBQAgxwIAAIwFADAEIQAA_AQAMMECAAD9BAAwwwIAAP8EACDHAgAAgAUAMAQhAADxBAAwwQIAAPIEADDDAgAA9AQAIMcCAACmBAAwBCEAAOYEADDBAgAA5wQAMMMCAADpBAAgxwIAAJUEADAEIQAA3QQAMMECAADeBAAwwwIAAOAEACDHAgAAtgQAMAAAAAAAAAAAAAAAAAAAAAABxAJAAAAAAQUhAAC9BgAgIgAAwAYAIMECAAC-BgAgwgIAAL8GACDHAgAAAQAgAyEAAL0GACDBAgAAvgYAIMcCAAABACAAAAAFIQAAuAYAICIAALsGACDBAgAAuQYAIMICAAC6BgAgxwIAAAEAIAMhAAC4BgAgwQIAALkGACDHAgAAAQAgAAAACyEAAIwGADAiAACRBgAwwQIAAI0GADDCAgAAjgYAMMMCAACPBgAgxAIAAJAGADDFAgAAkAYAMMYCAACQBgAwxwIAAJAGADDIAgAAkgYAMMkCAACTBgAwCyEAAIAGADAiAACFBgAwwQIAAIEGADDCAgAAggYAMMMCAACDBgAgxAIAAIQGADDFAgAAhAYAMMYCAACEBgAwxwIAAIQGADDIAgAAhgYAMMkCAACHBgAwCyEAAPQFADAiAAD5BQAwwQIAAPUFADDCAgAA9gUAMMMCAAD3BQAgxAIAAPgFADDFAgAA-AUAMMYCAAD4BQAwxwIAAPgFADDIAgAA-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-wQAIPABAQAAAAH3AUAAAAAB-AFAAAAAAY8CCAAAAAGbAgEAAAABnQIBAAAAAacCAQAAAAECAAAAHQAgIQAA4QUAIAMAAAAdACAhAADhBQAgIgAA4AUAIAEaAAC0BgAwAgAAAB0AIBoAAOAFACACAAAAqgQAIBoAAN8FACAH8AEBANADACH3AUAA0QMAIfgBQADRAwAhjwIIAOADACGbAgEA0AMAIZ0CAQDQAwAhpwIBAOIDACEJBwAArQQAIAkAAPkEACDwAQEA0AMAIfcBQADRAwAh-AFAANEDACGPAggA4AMAIZsCAQDQAwAhnQIBANADACGnAgEA4gMAIQkHAACwBAAgCQAA-wQAIPABAQAAAAH3AUAAAAAB-AFAAAAAAY8CCAAAAAGbAgEAAAABnQIBAAAAAacCAQAAAAEJBwAAwQQAIAkAAMsEACDwAQEAAAAB9wFAAAAAAfgBQAAAAAGbAgEAAAABnQIBAAAAAZ4CQAAAAAGgAgAAAKACAgIAAAAZACAhAADqBQAgAwAAABkAICEAAOoFACAiAADpBQAgARoAALMGADACAAAAGQAgGgAA6QUAIAIAAAC6BAAgGgAA6AUAIAfwAQEA0AMAIfcBQADRAwAh-AFAANEDACGbAgEA0AMAIZ0CAQDQAwAhngJAANEDACGgAgAAvASgAiIJBwAAvgQAIAkAAMoEACDwAQEA0AMAIfcBQADRAwAh-AFAANEDACGbAgEA0AMAIZ0CAQDQAwAhngJAANEDACGgAgAAvASgAiIJBwAAwQQAIAkAAMsEACDwAQEAAAAB9wFAAAAAAfgBQAAAAAGbAgEAAAABnQIBAAAAAZ4CQAAAAAGgAgAAAKACAgUHAADTBAAg8AEBAAAAAfcBQAAAAAGbAgEAAAABogIAAACiAgICAAAAEQAgIQAA8wUAIAMAAAARACAhAADzBQAgIgAA8gUAIAEaAACyBgAwAgAAABEAIBoAAPIFACACAAAAkAUAIBoAAPEFACAE8AEBANADACH3AUAA0QMAIZsCAQDQAwAhogIAAM8EogIiBQcAANEEACDwAQEA0AMAIfcBQADRAwAhmwIBANADACGiAgAAzwSiAiIFBwAA0wQAIPABAQAAAAH3AUAAAAABmwIBAAAAAaICAAAAogICCggAAJUFACAKAACZBQAgCwAAlwUAIAwAAJgFACAOAACWBQAg8AEBAAAAAfcBQAAAAAH4AUAAAAABhAIBAAAAAaMCAQAAAAECAAAADQAgIQAA_wUAIAMAAAANACAhAAD_BQAgIgAA_gUAIAEaAACxBgAwDwYAALYDACAIAACuAwAgCgAArwMAIAsAALADACAMAACxAwAgDgAAyQMAIO0BAADIAwAw7gEAAAsAEO8BAADIAwAw8AEBAAAAAfcBQACCAwAh-AFAAIIDACGEAgEA_wIAIaMCAQCqAwAhpAIBAP8CACECAAAADQAgGgAA_gUAIAIAAAD8BQAgGgAA_QUAIAntAQAA-wUAMO4BAAD8BQAQ7wEAAPsFADDwAQEA_wIAIfcBQACCAwAh-AFAAIIDACGEAgEA_wIAIaMCAQCqAwAhpAIBAP8CACEJ7QEAAPsFADDuAQAA_AUAEO8BAAD7BQAw8AEBAP8CACH3AUAAggMAIfgBQACCAwAhhAIBAP8CACGjAgEAqgMAIaQCAQD_AgAhBfABAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhowIBAOIDACEKCAAA2AQAIAoAANwEACALAADaBAAgDAAA2wQAIA4AANkEACDwAQEA0AMAIfcBQADRAwAh-AFAANEDACGEAgEA0AMAIaMCAQDiAwAhCggAAJUFACAKAACZBQAgCwAAlwUAIAwAAJgFACAOAACWBQAg8AEBAAAAAfcBQAAAAAH4AUAAAAABhAIBAAAAAaMCAQAAAAEM8AEBAAAAAfcBQAAAAAH4AUAAAAABqwIBAAAAAawCAQAAAAGtAgEAAAABrgIBAAAAAa8CAQAAAAGwAkAAAAABsQJAAAAAAbICAQAAAAGzAgEAAAABAgAAAAkAICEAAIsGACADAAAACQAgIQAAiwYAICIAAIoGACABGgAAsAYAMBEDAAC2AwAg7QEAAMoDADDuAQAABwAQ7wEAAMoDADDwAQEAAAAB8QEBAP8CACH3AUAAggMAIfgBQACCAwAhqwIBAP8CACGsAgEA_wIAIa0CAQCqAwAhrgIBAKoDACGvAgEAqgMAIbACQADLAwAhsQJAAMsDACGyAgEAqgMAIbMCAQCqAwAhAgAAAAkAIBoAAIoGACACAAAAiAYAIBoAAIkGACAQ7QEAAIcGADDuAQAAiAYAEO8BAACHBgAw8AEBAP8CACHxAQEA_wIAIfcBQACCAwAh-AFAAIIDACGrAgEA_wIAIawCAQD_AgAhrQIBAKoDACGuAgEAqgMAIa8CAQCqAwAhsAJAAMsDACGxAkAAywMAIbICAQCqAwAhswIBAKoDACEQ7QEAAIcGADDuAQAAiAYAEO8BAACHBgAw8AEBAP8CACHxAQEA_wIAIfcBQACCAwAh-AFAAIIDACGrAgEA_wIAIawCAQD_AgAhrQIBAKoDACGuAgEAqgMAIa8CAQCqAwAhsAJAAMsDACGxAkAAywMAIbICAQCqAwAhswIBAKoDACEM8AEBANADACH3AUAA0QMAIfgBQADRAwAhqwIBANADACGsAgEA0AMAIa0CAQDiAwAhrgIBAOIDACGvAgEA4gMAIbACQACqBQAhsQJAAKoFACGyAgEA4gMAIbMCAQDiAwAhDPABAQDQAwAh9wFAANEDACH4AUAA0QMAIasCAQDQAwAhrAIBANADACGtAgEA4gMAIa4CAQDiAwAhrwIBAOIDACGwAkAAqgUAIbECQACqBQAhsgIBAOIDACGzAgEA4gMAIQzwAQEAAAAB9wFAAAAAAfgBQAAAAAGrAgEAAAABrAIBAAAAAa0CAQAAAAGuAgEAAAABrwIBAAAAAbACQAAAAAGxAkAAAAABsgIBAAAAAbMCAQAAAAEH8AEBAAAAAfcBQAAAAAH4AUAAAAABqgJAAAAAAbQCAQAAAAG1AgEAAAABtgIBAAAAAQIAAAAFACAhAACXBgAgAwAAAAUAICEAAJcGACAiAACWBgAgARoAAK8GADAMAwAAtgMAIO0BAADMAwAw7gEAAAMAEO8BAADMAwAw8AEBAAAAAfEBAQD_AgAh9wFAAIIDACH4AUAAggMAIaoCQACCAwAhtAIBAAAAAbUCAQCqAwAhtgIBAKoDACECAAAABQAgGgAAlgYAIAIAAACUBgAgGgAAlQYAIAvtAQAAkwYAMO4BAACUBgAQ7wEAAJMGADDwAQEA_wIAIfEBAQD_AgAh9wFAAIIDACH4AUAAggMAIaoCQACCAwAhtAIBAP8CACG1AgEAqgMAIbYCAQCqAwAhC-0BAACTBgAw7gEAAJQGABDvAQAAkwYAMPABAQD_AgAh8QEBAP8CACH3AUAAggMAIfgBQACCAwAhqgJAAIIDACG0AgEA_wIAIbUCAQCqAwAhtgIBAKoDACEH8AEBANADACH3AUAA0QMAIfgBQADRAwAhqgJAANEDACG0AgEA0AMAIbUCAQDiAwAhtgIBAOIDACEH8AEBANADACH3AUAA0QMAIfgBQADRAwAhqgJAANEDACG0AgEA0AMAIbUCAQDiAwAhtgIBAOIDACEH8AEBAAAAAfcBQAAAAAH4AUAAAAABqgJAAAAAAbQCAQAAAAG1AgEAAAABtgIBAAAAAQQhAACMBgAwwQIAAI0GADDDAgAAjwYAIMcCAACQBgAwBCEAAIAGADDBAgAAgQYAMMMCAACDBgAgxwIAAIQGADAEIQAA9AUAMMECAAD1BQAwwwIAAPcFACDHAgAA-AUAMAQhAADrBQAwwQIAAOwFADDDAgAA7gUAIMcCAACMBQAwBCEAAOIFADDBAgAA4wUAMMMCAADlBQAgxwIAALYEADAEIQAA2QUAMMECAADaBQAwwwIAANwFACDHAgAApgQAMAQhAADQBQAwwQIAANEFADDDAgAA0wUAIMcCAACVBAAwBCEAAMcFADDBAgAAyAUAMMMCAADKBQAgxwIAAPYDADAEIQAAvgUAMMECAAC_BQAwwwIAAMEFACDHAgAA2gMAMAAAAAAAAAAACgQAAKEGACAFAACiBgAgCgAApQYAIAsAAKYGACAMAACnBgAgDwAAowYAIBAAAKQGACARAACABAAgFAAAqAYAILkCAACBBAAgAwMAAKkGACASAACrBgAgFAAAqAYAIAERAACABAAgBwYAAKkGACAIAACkBgAgCgAApQYAIAsAAKYGACAMAACnBgAgDgAArgYAIKMCAACBBAAgBAcAAKwGACAKAAClBgAgCwAApgYAIAwAAKcGACAAB_ABAQAAAAH3AUAAAAAB-AFAAAAAAaoCQAAAAAG0AgEAAAABtQIBAAAAAbYCAQAAAAEM8AEBAAAAAfcBQAAAAAH4AUAAAAABqwIBAAAAAawCAQAAAAGtAgEAAAABrgIBAAAAAa8CAQAAAAGwAkAAAAABsQJAAAAAAbICAQAAAAGzAgEAAAABBfABAQAAAAH3AUAAAAAB-AFAAAAAAYQCAQAAAAGjAgEAAAABBPABAQAAAAH3AUAAAAABmwIBAAAAAaICAAAAogICB_ABAQAAAAH3AUAAAAAB-AFAAAAAAZsCAQAAAAGdAgEAAAABngJAAAAAAaACAAAAoAICB_ABAQAAAAH3AUAAAAAB-AFAAAAAAY8CCAAAAAGbAgEAAAABnQIBAAAAAacCAQAAAAEI8AEBAAAAAfcBQAAAAAH4AUAAAAABjwIIAAAAAZsCAQAAAAGdAgEAAAABowIBAAAAAaYCAAAApgICB_ABAQAAAAHyAQEAAAAB8wFAAAAAAfQBQAAAAAH2AQAAAPYBAvcBQAAAAAH4AUAAAAABCvABAQAAAAH2AQAAAJICAvcBQAAAAAH4AUAAAAABjgIBAAAAAY8CCAAAAAGQAgEAAAABkgIBAAAAAZMCAQAAAAGUAoAAAAABEwUAAJkGACAKAACcBgAgCwAAnQYAIAwAAJ4GACAPAACaBgAgEAAAmwYAIBEAAJ8GACAUAACgBgAg8AEBAAAAAfYBAQAAAAH3AUAAAAAB-AFAAAAAAYQCAQAAAAGiAgEAAAABtwIBAAAAAbgCIAAAAAG5AgEAAAABugIgAAAAAbsCIAAAAAECAAAAAQAgIQAAuAYAIAMAAABIACAhAAC4BgAgIgAAvAYAIBUAAABIACAFAAC2BQAgCgAAuQUAIAsAALoFACAMAAC7BQAgDwAAtwUAIBAAALgFACARAAC8BQAgFAAAvQUAIBoAALwGACDwAQEA0AMAIfYBAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhogIBANADACG3AgEA0AMAIbgCIACMBAAhuQIBAOIDACG6AiAAjAQAIbsCIACMBAAhEwUAALYFACAKAAC5BQAgCwAAugUAIAwAALsFACAPAAC3BQAgEAAAuAUAIBEAALwFACAUAAC9BQAg8AEBANADACH2AQEA0AMAIfcBQADRAwAh-AFAANEDACGEAgEA0AMAIaICAQDQAwAhtwIBANADACG4AiAAjAQAIbkCAQDiAwAhugIgAIwEACG7AiAAjAQAIRMEAACYBgAgCgAAnAYAIAsAAJ0GACAMAACeBgAgDwAAmgYAIBAAAJsGACARAACfBgAgFAAAoAYAIPABAQAAAAH2AQEAAAAB9wFAAAAAAfgBQAAAAAGEAgEAAAABogIBAAAAAbcCAQAAAAG4AiAAAAABuQIBAAAAAboCIAAAAAG7AiAAAAABAgAAAAEAICEAAL0GACADAAAASAAgIQAAvQYAICIAAMEGACAVAAAASAAgBAAAtQUAIAoAALkFACALAAC6BQAgDAAAuwUAIA8AALcFACAQAAC4BQAgEQAAvAUAIBQAAL0FACAaAADBBgAg8AEBANADACH2AQEA0AMAIfcBQADRAwAh-AFAANEDACGEAgEA0AMAIaICAQDQAwAhtwIBANADACG4AiAAjAQAIbkCAQDiAwAhugIgAIwEACG7AiAAjAQAIRMEAAC1BQAgCgAAuQUAIAsAALoFACAMAAC7BQAgDwAAtwUAIBAAALgFACARAAC8BQAgFAAAvQUAIPABAQDQAwAh9gEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGiAgEA0AMAIbcCAQDQAwAhuAIgAIwEACG5AgEA4gMAIboCIACMBAAhuwIgAIwEACETBAAAmAYAIAUAAJkGACAKAACcBgAgCwAAnQYAIAwAAJ4GACAQAACbBgAgEQAAnwYAIBQAAKAGACDwAQEAAAAB9gEBAAAAAfcBQAAAAAH4AUAAAAABhAIBAAAAAaICAQAAAAG3AgEAAAABuAIgAAAAAbkCAQAAAAG6AiAAAAABuwIgAAAAAQIAAAABACAhAADCBgAgBPABAQAAAAHxAQEAAAAB9wFAAAAAAaICAAAAogICB_ABAQAAAAHzAUAAAAAB9AFAAAAAAfcBQAAAAAH4AUAAAAABhAIBAAAAAZwCIAAAAAELBwAAwwQAIAoAAMQEACAMAADGBAAg8AEBAAAAAfMBQAAAAAH0AUAAAAAB9wFAAAAAAfgBQAAAAAGEAgEAAAABmwIBAAAAAZwCIAAAAAECAAAAFQAgIQAAxgYAIAMAAAATACAhAADGBgAgIgAAygYAIA0AAAATACAHAACNBAAgCgAAjgQAIAwAAJAEACAaAADKBgAg8AEBANADACHzAUAA0QMAIfQBQADRAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhmwIBANADACGcAiAAjAQAIQsHAACNBAAgCgAAjgQAIAwAAJAEACDwAQEA0AMAIfMBQADRAwAh9AFAANEDACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGbAgEA0AMAIZwCIACMBAAhB_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CAQAAC4BQAgEQAAvAUAIBQAAL0FACAaAADtBgAg8AEBANADACH2AQEA0AMAIfcBQADRAwAh-AFAANEDACGEAgEA0AMAIaICAQDQAwAhtwIBANADACG4AiAAjAQAIbkCAQDiAwAhugIgAIwEACG7AiAAjAQAIRMEAAC1BQAgBQAAtgUAIAsAALoFACAMAAC7BQAgDwAAtwUAIBAAALgFACARAAC8BQAgFAAAvQUAIPABAQDQAwAh9gEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGiAgEA0AMAIbcCAQDQAwAhuAIgAIwEACG5AgEA4gMAIboCIACMBAAhuwIgAIwEACEDAAAACwAgIQAA6QYAICIAAPAGACANAAAACwAgBgAA1wQAIAgAANgEACALAADaBAAgDAAA2wQAIA4AANkEACAaAADwBgAg8AEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGjAgEA4gMAIaQCAQDQAwAhCwYAANcEACAIAADYBAAgCwAA2gQAIAwAANsEACAOAADZBAAg8AEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGjAgEA4gMAIaQCAQDQAwAhB_ABAQAAAAHxAQEAAAAB9wFAAAAAAfgBQAAAAAGbAgEAAAABngJAAAAAAaACAAAAoAICEwQAAJgGACAFAACZBgAgCgAAnAYAIAwAAJ4GACAPAACaBgAgEAAAmwYAIBEAAJ8GACAUAACgBgAg8AEBAAAAAfYBAQAAAAH3AUAAAAAB-AFAAAAAAYQCAQAAAAGiAgEAAAABtwIBAAAAAbgCIAAAAAG5AgEAAAABugIgAAAAAbsCIAAAAAECAAAAAQAgIQAA8gYAIAsGAACUBQAgCAAAlQUAIAoAAJkFACAMAACYBQAgDgAAlgUAIPABAQAAAAH3AUAAAAAB-AFAAAAAAYQCAQAAAAGjAgEAAAABpAIBAAAAAQIAAAANACAhAAD0BgAgAwAAAEgAICEAAPIGACAiAAD4BgAgFQAAAEgAIAQAALUFACAFAAC2BQAgCgAAuQUAIAwAALsFACAPAAC3BQAgEAAAuAUAIBEAALwFACAUAAC9BQAgGgAA-AYAIPABAQDQAwAh9gEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGiAgEA0AMAIbcCAQDQAwAhuAIgAIwEACG5AgEA4gMAIboCIACMBAAhuwIgAIwEACETBAAAtQUAIAUAALYFACAKAAC5BQAgDAAAuwUAIA8AALcFACAQAAC4BQAgEQAAvAUAIBQAAL0FACDwAQEA0AMAIfYBAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhogIBANADACG3AgEA0AMAIbgCIACMBAAhuQIBAOIDACG6AiAAjAQAIbsCIACMBAAhAwAAAAsAICEAAPQGACAiAAD7BgAgDQAAAAsAIAYAANcEACAIAADYBAAgCgAA3AQAIAwAANsEACAOAADZBAAgGgAA-wYAIPABAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhowIBAOIDACGkAgEA0AMAIQsGAADXBAAgCAAA2AQAIAoAANwEACAMAADbBAAgDgAA2QQAIPABAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhowIBAOIDACGkAgEA0AMAIQfwAQEAAAAB8QEBAAAAAfcBQAAAAAH4AUAAAAABjwIIAAAAAZsCAQAAAAGnAgEAAAABEwQAAJgGACAFAACZBgAgCgAAnAYAIAsAAJ0GACAPAACaBgAgEAAAmwYAIBEAAJ8GACAUAACgBgAg8AEBAAAAAfYBAQAAAAH3AUAAAAAB-AFAAAAAAYQCAQAAAAGiAgEAAAABtwIBAAAAAbgCIAAAAAG5AgEAAAABugIgAAAAAbsCIAAAAAECAAAAAQAgIQAA_QYAIAsGAACUBQAgCAAAlQUAIAoAAJkFACALAACXBQAgDgAAlgUAIPABAQAAAAH3AUAAAAAB-AFAAAAAAYQCAQAAAAGjAgEAAAABpAIBAAAAAQIAAAANACAhAAD_BgAgAwAAAEgAICEAAP0GACAiAACDBwAgFQAAAEgAIAQAALUFACAFAAC2BQAgCgAAuQUAIAsAALoFACAPAAC3BQAgEAAAuAUAIBEAALwFACAUAAC9BQAgGgAAgwcAIPABAQDQAwAh9gEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGiAgEA0AMAIbcCAQDQAwAhuAIgAIwEACG5AgEA4gMAIboCIACMBAAhuwIgAIwEACETBAAAtQUAIAUAALYFACAKAAC5BQAgCwAAugUAIA8AALcFACAQAAC4BQAgEQAAvAUAIBQAAL0FACDwAQEA0AMAIfYBAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhogIBANADACG3AgEA0AMAIbgCIACMBAAhuQIBAOIDACG6AiAAjAQAIbsCIACMBAAhAwAAAAsAICEAAP8GACAiAACGBwAgDQAAAAsAIAYAANcEACAIAADYBAAgCgAA3AQAIAsAANoEACAOAADZBAAgGgAAhgcAIPABAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhowIBAOIDACGkAgEA0AMAIQsGAADXBAAgCAAA2AQAIAoAANwEACALAADaBAAgDgAA2QQAIPABAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhowIBAOIDACGkAgEA0AMAIQjwAQEAAAAB9wFAAAAAAfgBQAAAAAGPAggAAAABmwIBAAAAAaMCAQAAAAGkAgEAAAABpgIAAACmAgIDAAAACwAgIQAA5QYAICIAAIoHACANAAAACwAgBgAA1wQAIAgAANgEACAKAADcBAAgCwAA2gQAIAwAANsEACAaAACKBwAg8AEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGjAgEA4gMAIaQCAQDQAwAhCwYAANcEACAIAADYBAAgCgAA3AQAIAsAANoEACAMAADbBAAg8AEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGjAgEA4gMAIaQCAQDQAwAhCgMAAOcDACASAADoAwAg8AEBAAAAAfEBAQAAAAHyAQEAAAAB8wFAAAAAAfQBQAAAAAH2AQAAAPYBAvcBQAAAAAH4AUAAAAABAgAAADQAICEAAIsHACADAAAAMgAgIQAAiwcAICIAAI8HACAMAAAAMgAgAwAA0wMAIBIAANQDACAaAACPBwAg8AEBANADACHxAQEA0AMAIfIBAQDQAwAh8wFAANEDACH0AUAA0QMAIfYBAADSA_YBIvcBQADRAwAh-AFAANEDACEKAwAA0wMAIBIAANQDACDwAQEA0AMAIfEBAQDQAwAh8gEBANADACHzAUAA0QMAIfQBQADRAwAh9gEAANID9gEi9wFAANEDACH4AUAA0QMAIQfwAQEAAAAB8QEBAAAAAfMBQAAAAAH0AUAAAAAB9gEAAAD2AQL3AUAAAAAB-AFAAAAAAQfwAQEAAAAB9wFAAAAAAfgBQAAAAAGEAgEAAAABhQIIAAAAAYYCAgAAAAGHAgAA_gMAIAIAAAC9AgAgIQAAkQcAIBMEAACYBgAgBQAAmQYAIAoAAJwGACALAACdBgAgDAAAngYAIA8AAJoGACAQAACbBgAgFAAAoAYAIPABAQAAAAH2AQEAAAAB9wFAAAAAAfgBQAAAAAGEAgEAAAABogIBAAAAAbcCAQAAAAG4AiAAAAABuQIBAAAAAboCIAAAAAG7AiAAAAABAgAAAAEAICEAAJMHACATBAAAmAYAIAUAAJkGACAKAACcBgAgCwAAnQYAIAwAAJ4GACAPAACaBgAgEAAAmwYAIBEAAJ8GACDwAQEAAAAB9gEBAAAAAfcBQAAAAAH4AUAAAAABhAIBAAAAAaICAQAAAAG3AgEAAAABuAIgAAAAAbkCAQAAAAG6AiAAAAABuwIgAAAAAQIAAAABACAhAACVBwAgAwAAAEgAICEAAJUHACAiAACZBwAgFQAAAEgAIAQAALUFACAFAAC2BQAgCgAAuQUAIAsAALoFACAMAAC7BQAgDwAAtwUAIBAAALgFACARAAC8BQAgGgAAmQcAIPABAQDQAwAh9gEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGiAgEA0AMAIbcCAQDQAwAhuAIgAIwEACG5AgEA4gMAIboCIACMBAAhuwIgAIwEACETBAAAtQUAIAUAALYFACAKAAC5BQAgCwAAugUAIAwAALsFACAPAAC3BQAgEAAAuAUAIBEAALwFACDwAQEA0AMAIfYBAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhogIBANADACG3AgEA0AMAIbgCIACMBAAhuQIBAOIDACG6AiAAjAQAIbsCIACMBAAhCvABAQAAAAHxAQEAAAAB9gEAAACSAgL3AUAAAAAB-AFAAAAAAY8CCAAAAAGQAgEAAAABkgIBAAAAAZMCAQAAAAGUAoAAAAABAwAAAMACACAhAACRBwAgIgAAnQcAIAkAAADAAgAgGgAAnQcAIPABAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhhQIIAOADACGGAgIA7wMAIYcCAADwAwAgB_ABAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhhQIIAOADACGGAgIA7wMAIYcCAADwAwAgAwAAAEgAICEAAJMHACAiAACgBwAgFQAAAEgAIAQAALUFACAFAAC2BQAgCgAAuQUAIAsAALoFACAMAAC7BQAgDwAAtwUAIBAAALgFACAUAAC9BQAgGgAAoAcAIPABAQDQAwAh9gEBANADACH3AUAA0QMAIfgBQADRAwAhhAIBANADACGiAgEA0AMAIbcCAQDQAwAhuAIgAIwEACG5AgEA4gMAIboCIACMBAAhuwIgAIwEACETBAAAtQUAIAUAALYFACAKAAC5BQAgCwAAugUAIAwAALsFACAPAAC3BQAgEAAAuAUAIBQAAL0FACDwAQEA0AMAIfYBAQDQAwAh9wFAANEDACH4AUAA0QMAIYQCAQDQAwAhogIBANADACG3AgEA0AMAIbgCIACMBAAhuQIBAOIDACG6AiAAjAQAIbsCIACMBAAhCgQGAgUKAwovBwswCAwxCQ0AEQ8OBBAuBRE1DBQ9DwEDAAEBAwABBwYAAQgSBQooBwsmCAwnCQ0ACw4WBgIDAAEHAAQFBwAEChoHCx4IDCIJDQAKAwMAAQcABAkABgMDAAEHAAQJAAYDBgABBwAECQAGAwojAAskAAwlAAUIKQAKLQALKwAMLAAOKgAEAwABDQAQEgANFDsPAg0ADhE2DAERNwACAwABEwAMARQ8AAkEPgAFPwAKQgALQwAMRAAPQAAQQQARRQAURgAAAAADDQAWJwAXKAAYAAAAAw0AFicAFygAGAEDAAEBAwABAw0AHScAHigAHwAAAAMNAB0nAB4oAB8BAwABAQMAAQMNACQnACUoACYAAAADDQAkJwAlKAAmAAAAAw0ALCcALSgALgAAAAMNACwnAC0oAC4DAwABBwAECQAGAwMAAQcABAkABgUNADMnADYoADdpADRqADUAAAAAAAUNADMnADYoADdpADRqADUDBgABBwAECQAGAwYAAQcABAkABgUNADwnAD8oAEBpAD1qAD4AAAAAAAUNADwnAD8oAEBpAD1qAD4BBgABAQYAAQMNAEUnAEYoAEcAAAADDQBFJwBGKABHAgMAAQcABAIDAAEHAAQDDQBMJwBNKABOAAAAAw0ATCcATSgATgMDAAEHAAQJAAYDAwABBwAECQAGAw0AUycAVCgAVQAAAAMNAFMnAFQoAFUBBwAEAQcABAMNAFonAFsoAFwAAAADDQBaJwBbKABcAgMAARMADAIDAAETAAwFDQBhJwBkKABlaQBiagBjAAAAAAAFDQBhJwBkKABlaQBiagBjAAAFDQBqJwBtKABuaQBragBsAAAAAAAFDQBqJwBtKABuaQBragBsAgMAARIADQIDAAESAA0DDQBzJwB0KAB1AAAAAw0AcycAdCgAdRUCARZHARdKARhLARlMARtOARxQEh1REx5TAR9VEiBWFCNXASRYASVZEilcFSpdGSteAixfAi1gAi5hAi9iAjBkAjFmEjJnGjNpAjRrEjVsGzZtAjduAjhvEjlyHDpzIDt0Azx1Az12Az53Az94A0B6A0F8EkJ9IUN_A0SBARJFggEiRoMBA0eEAQNIhQESSYgBI0qJASdLiwEoTIwBKE2PAShOkAEoT5EBKFCTAShRlQESUpYBKVOYAShUmgESVZsBKlacAShXnQEoWJ4BElmhAStaogEvW6MBCFykAQhdpQEIXqYBCF-nAQhgqQEIYasBEmKsATBjrgEIZLABEmWxATFmsgEIZ7MBCGi0ARJrtwEybLgBOG25AQluugEJb7sBCXC8AQlxvQEJcr8BCXPBARJ0wgE5dcQBCXbGARJ3xwE6eMgBCXnJAQl6ygESe80BO3zOAUF9zwEEftABBH_RAQSAAdIBBIEB0wEEggHVAQSDAdcBEoQB2AFChQHaAQSGAdwBEocB3QFDiAHeAQSJAd8BBIoB4AESiwHjAUSMAeQBSI0B5QEFjgHmAQWPAecBBZAB6AEFkQHpAQWSAesBBZMB7QESlAHuAUmVAfABBZYB8gESlwHzAUqYAfQBBZkB9QEFmgH2ARKbAfkBS5wB-gFPnQH7AQeeAfwBB58B_QEHoAH-AQehAf8BB6IBgQIHowGDAhKkAYQCUKUBhgIHpgGIAhKnAYkCUagBigIHqQGLAgeqAYwCEqsBjwJSrAGQAlatAZECBq4BkgIGrwGTAgawAZQCBrEBlQIGsgGXAgazAZkCErQBmgJXtQGcAga2AZ4CErcBnwJYuAGgAga5AaECBroBogISuwGlAlm8AaYCXb0BpwIPvgGoAg-_AakCD8ABqgIPwQGrAg_CAa0CD8MBrwISxAGwAl7FAbICD8YBtAISxwG1Al_IAbYCD8kBtwIPygG4AhLLAbsCYMwBvAJmzQG-Ag3OAb8CDc8BwgIN0AHDAg3RAcQCDdIBxgIN0wHIAhLUAckCZ9UBywIN1gHNAhLXAc4CaNgBzwIN2QHQAg3aAdECEtsB1AJp3AHVAm_dAdYCDN4B1wIM3wHYAgzgAdkCDOEB2gIM4gHcAgzjAd4CEuQB3wJw5QHhAgzmAeMCEucB5AJx6AHlAgzpAeYCDOoB5wIS6wHqAnLsAesCdg"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  DepositScalarFieldEnum: () => DepositScalarFieldEnum,
  ExpenseScalarFieldEnum: () => ExpenseScalarFieldEnum,
  HouseMemberScalarFieldEnum: () => HouseMemberScalarFieldEnum,
  HouseScalarFieldEnum: () => HouseScalarFieldEnum,
  JsonNull: () => JsonNull2,
  JsonNullValueFilter: () => JsonNullValueFilter,
  MealScalarFieldEnum: () => MealScalarFieldEnum,
  ModelName: () => ModelName,
  MonthScalarFieldEnum: () => MonthScalarFieldEnum,
  NullTypes: () => NullTypes2,
  NullableJsonNullValueInput: () => NullableJsonNullValueInput,
  NullsOrder: () => NullsOrder,
  PaymentScalarFieldEnum: () => PaymentScalarFieldEnum,
  PlanScalarFieldEnum: () => PlanScalarFieldEnum,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  SubscriptionScalarFieldEnum: () => SubscriptionScalarFieldEnum,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.5.0",
  engine: "280c870be64f457428992c43c1f6d557fab6e29e"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Deposit: "Deposit",
  Expense: "Expense",
  House: "House",
  HouseMember: "HouseMember",
  Meal: "Meal",
  Month: "Month",
  Payment: "Payment",
  Plan: "Plan",
  Subscription: "Subscription"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  status: "status",
  needPasswordChange: "needPasswordChange",
  isDeleted: "isDeleted"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var DepositScalarFieldEnum = {
  id: "id",
  houseId: "houseId",
  monthId: "monthId",
  userId: "userId",
  amount: "amount",
  note: "note",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ExpenseScalarFieldEnum = {
  id: "id",
  houseId: "houseId",
  monthId: "monthId",
  type: "type",
  amount: "amount",
  description: "description",
  createdBy: "createdBy",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var HouseScalarFieldEnum = {
  id: "id",
  name: "name",
  description: "description",
  createdBy: "createdBy",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var HouseMemberScalarFieldEnum = {
  id: "id",
  userId: "userId",
  houseId: "houseId",
  role: "role",
  createdAt: "createdAt"
};
var MealScalarFieldEnum = {
  id: "id",
  houseId: "houseId",
  monthId: "monthId",
  userId: "userId",
  date: "date",
  mealType: "mealType",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var MonthScalarFieldEnum = {
  id: "id",
  houseId: "houseId",
  name: "name",
  startDate: "startDate",
  endDate: "endDate",
  isClosed: "isClosed",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PaymentScalarFieldEnum = {
  id: "id",
  userId: "userId",
  subscriptionId: "subscriptionId",
  amount: "amount",
  transactionId: "transactionId",
  status: "status",
  stripeEventId: "stripeEventId",
  invoiceUrl: "invoiceUrl",
  paymentGatewayData: "paymentGatewayData",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var PlanScalarFieldEnum = {
  id: "id",
  name: "name",
  price: "price",
  durationDays: "durationDays",
  features: "features",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SubscriptionScalarFieldEnum = {
  id: "id",
  userId: "userId",
  planId: "planId",
  startDate: "startDate",
  endDate: "endDate",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var NullableJsonNullValueInput = {
  DbNull: DbNull2,
  JsonNull: JsonNull2
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var JsonNullValueFilter = {
  DbNull: DbNull2,
  JsonNull: JsonNull2,
  AnyNull: AnyNull2
};
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/enums.ts
var UserRole = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  MEMBER: "MEMBER"
};
var UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED"
};
var SubscriptionStatus = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED"
};
var PaymentStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED"
};

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/config/env.ts
import dotenv from "dotenv";
dotenv.config();
var loadEnvVariables = () => {
  const requireEnvVariable = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
    "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
    "EMAIL_SENDER_SMTP_USER",
    "EMAIL_SENDER_SMTP_PASS",
    "EMAIL_SENDER_SMTP_HOST",
    "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_FROM",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "FRONTEND_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD"
  ];
  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(
        `Environment variable ${variable} is required but not set in .env file.`
      );
    }
  });
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN,
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE,
    EMAIL_SENDER: {
      SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER,
      SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS,
      SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST,
      SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT,
      SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM
    },
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
    },
    STRIPE: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
    },
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD
  };
};
var envVars = loadEnvVariables();

// src/app/lib/prisma.ts
var connectionString = `${envVars.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/utils/emall.ts
import nodemailer from "nodemailer";

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message, stack = " ") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/utils/emall.ts
import status from "http-status";
import path2 from "path";
import ejs from "ejs";
var transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT)
});
var sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments
}) => {
  try {
    const templatePath = path2.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`
    );
    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }))
    });
  } catch (error) {
    console.log("Email Sending Error", error.message);
    throw new AppError_default(status.INTERNAL_SERVER_ERROR, "Failed to send email");
  }
};

// src/app/lib/auth.ts
import { bearer, emailOTP } from "better-auth/plugins";
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      // callbackUrl: envVars.GOOGLE_CALLBACK_URL,
      mapProfileToUser: () => {
        return {
          role: UserRole.MANAGER,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null
        };
      }
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.MANAGER
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false
      }
    }
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (!user) {
            console.error(
              `User with email ${email} not found. Cannot send verification OTP.`
            );
            return;
          }
          if (user && user.role === UserRole.ADMIN) {
            if (user && user.role === UserRole.ADMIN) {
              console.log(
                `User with email ${email} is an admin. Skipping sending verification OTP.`
              );
              return;
            }
          }
          if (user && !user.emailVerified) {
            await sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
                expiresIn: 2
              }
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email
            }
          });
          if (user) {
            await sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
                expiresIn: 2
              }
            });
          }
        }
      },
      expiresIn: 2 * 60,
      otpLength: 6
    })
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  },
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:4000",
    envVars.FRONTEND_URL
  ],
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/"
        }
      }
    }
  }
});

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/app/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtil = {
  setCookie,
  clearCookie,
  getCookie
};

// src/app/utils/token.ts
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN }
  );
  return accessToken;
};
var getRefreshToken = (payload) => {
  const refreshToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN }
  );
  return refreshToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtil.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1e3
    // one day
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtil.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1e3 * 7
    //7 day
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtil.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 1e3
    //one day
  });
};
var clearAccessTokenCookie = (res) => {
  CookieUtil.clearCookie(res, "accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
};
var clearRefreshTokenCookie = (res) => {
  CookieUtil.clearCookie(res, "refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
};
var clearbetterAuthSession = (res) => {
  CookieUtil.clearCookie(res, "better-auth.session_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie,
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
  clearbetterAuthSession
};

// src/app/config/cloudinary.config.ts
import { v2 as cloudinary } from "cloudinary";
import status2 from "http-status";
cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET
});
var deleteFileFromCloudinary = async (url) => {
  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);
    if (match && match[1]) {
      const publicId = match[1];
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw new AppError_default(
      status2.INTERNAL_SERVER_ERROR,
      "Failed to delete file from Cloudinary"
    );
  }
};
var cloudinaryUpload = cloudinary;

// src/app/modules/auth/auth.service.ts
var registerManager = async (payload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password
    }
  });
  if (!data.user) {
    throw new AppError_default(status3.CREATED, "Failed to register manager");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var loginUser = async (payload) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password
    }
  });
  if (data.user.status === UserStatus.SUSPENDED) {
    throw new AppError_default(status3.FORBIDDEN, "User is suspended");
  }
  if (data.user.isDeleted || data.user.status === UserStatus.INACTIVE) {
    throw new AppError_default(status3.NOT_FOUND, "User is deleted");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified
  });
  return {
    ...data,
    accessToken,
    refreshToken
  };
};
var getMe = async (user) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.userId
    },
    include: {
      subscriptions: true,
      expenses: true
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  return isUserExist;
};
var logoutUser = async (sessionToken) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `$Bearer ${sessionToken}`
    })
  });
  return result;
};
var changePassword = async (payload, sessionToken) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (!session) {
    throw new AppError_default(status3.UNAUTHORIZED, "Invalid session token");
  }
  const { currentPassword, newPassword } = payload;
  const result = await auth.api.changePassword({
    body: { currentPassword, newPassword, revokeOtherSessions: true },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });
  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { needPasswordChange: false }
    });
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified
  });
  return {
    ...result,
    accessToken,
    refreshToken
  };
};
var verifyEmail = async (email, otp) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp
    }
  });
  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true }
    });
  }
};
var resendOtp = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const isUserExist = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  if (isUserExist.isDeleted) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  if (isUserExist.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "Email is already verified");
  }
  await auth.api.sendVerificationOTP({
    body: {
      email: normalizedEmail,
      type: "email-verification"
    }
  });
};
var forgetPassword = async (email) => {
  const isUserExist = await prisma.user.findUnique({ where: { email } });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email
    }
  });
};
var resetPassword = async (email, otp, newPassword) => {
  const isUserExist = await prisma.user.findUnique({ where: { email } });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  if (!isUserExist.emailVerified) {
    throw new AppError_default(status3.BAD_REQUEST, "Email not verified");
  }
  if (isUserExist.isDeleted) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  await auth.api.resetPasswordEmailOTP({
    body: { email, otp, password: newPassword }
  });
  if (isUserExist.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: isUserExist.id
      },
      data: {
        needPasswordChange: false
      }
    });
  }
  await prisma.session.deleteMany({ where: { userId: isUserExist.id } });
};
var googleLoginSuccess = async (session) => {
  const accessToken = tokenUtils.getAccessToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name
  });
  return {
    accessToken,
    refreshToken
  };
};
var updateProfile = async (user, payload) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });
  if (!isUserExist) {
    throw new AppError_default(status3.NOT_FOUND, "User not found");
  }
  const updateData = {};
  if (payload.name) {
    updateData.name = payload.name;
  }
  if (payload.image) {
    if (isUserExist.image) {
      try {
        await deleteFileFromCloudinary(isUserExist.image);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }
    updateData.image = payload.image.path || payload.image.filename;
  }
  const updatedUser = await prisma.user.update({
    where: { id: user.userId },
    data: updateData
  });
  return updatedUser;
};
var AuthService = {
  registerManager,
  loginUser,
  logoutUser,
  googleLoginSuccess,
  verifyEmail,
  resendOtp,
  forgetPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile
};

// src/app/shared/catchAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/shared/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { statusCode, success, message, data, meta } = responseData;
  res.status(statusCode).json({
    success,
    message,
    data,
    meta
  });
};

// src/app/modules/auth/auth.controller.ts
import status4 from "http-status";
var registerManager2 = catchAsync(async (req, res) => {
  const result = await AuthService.registerManager(req.body);
  const { token, accessToken, refreshToken, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    statusCode: status4.CREATED,
    success: true,
    message: "User Resgister Successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest
    }
  });
});
var loginUser2 = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);
  const { token, accessToken, refreshToken, ...rest } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    statusCode: status4.OK,
    success: true,
    message: "Login Successful",
    data: { token, accessToken, refreshToken, ...rest }
  });
});
var getMe2 = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await AuthService.getMe(user);
  sendResponse(res, {
    statusCode: status4.OK,
    success: true,
    message: "User Profile Fetched Successfully",
    data: result
  });
});
var logoutUser2 = catchAsync(async (req, res) => {
  const betterAuthSession = req.cookies["better-auth.session_token"];
  const result = await AuthService.logoutUser(betterAuthSession);
  tokenUtils.clearAccessTokenCookie(res);
  tokenUtils.clearRefreshTokenCookie(res);
  tokenUtils.clearbetterAuthSession(res);
  sendResponse(res, {
    statusCode: status4.OK,
    success: true,
    message: "Logout successfully",
    data: result
  });
});
var changePassword2 = catchAsync(async (req, res) => {
  const betterAuthSession = req.cookies["better-auth.session_token"];
  const payload = req.body;
  const result = await AuthService.changePassword(payload, betterAuthSession);
  const { accessToken, refreshToken, token } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    statusCode: status4.OK,
    success: true,
    message: "Password changed successfully",
    data: result
  });
});
var verifyEmail2 = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  await AuthService.verifyEmail(email, otp);
  sendResponse(res, {
    statusCode: status4.OK,
    success: true,
    message: "Email verified successfully"
  });
});
var resendOtp2 = catchAsync(async (req, res) => {
  const { email } = req.body;
  await AuthService.resendOtp(email);
  sendResponse(res, {
    statusCode: status4.OK,
    success: true,
    message: "OTP sent successfully"
  });
});
var forgetPassword2 = catchAsync(async (req, res) => {
  const { email } = req.body;
  await AuthService.forgetPassword(email);
  sendResponse(res, {
    statusCode: status4.OK,
    success: true,
    message: "Password reset OTP sent to email successfully"
  });
});
var resetPassword2 = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await AuthService.resetPassword(email, otp, newPassword);
  sendResponse(res, {
    statusCode: status4.OK,
    success: true,
    message: "Password reset successfully"
  });
});
var googleLogin = catchAsync(async (req, res) => {
  const redirectPath = req.query.redirect || "/";
  const encodedRedirectPath = encodeURIComponent(redirectPath);
  const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodedRedirectPath}`;
  res.render("googleRedirect", {
    callbackURL,
    betterAuthUrl: envVars.BETTER_AUTH_URL
  });
});
var googleLoginSuccess2 = catchAsync(async (req, res) => {
  const redirectPath = req.query.redirect || "/";
  const sessionToken = req.cookies["better-auth.session_token"];
  if (!sessionToken) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
  }
  const session = await auth.api.getSession({
    headers: { Cookie: `better-auth.session_token=${sessionToken}` }
  });
  if (!session) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
  }
  if (session && !session.user) {
    return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
  }
  const result = await AuthService.googleLoginSuccess(session);
  const { accessToken, refreshToken } = result;
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirectPath = isValidRedirectPath ? redirectPath : "/";
  res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
});
var updateProfile2 = catchAsync(async (req, res) => {
  const user = req.user;
  const payload = {
    name: req.body.name,
    image: req.file
  };
  const result = await AuthService.updateProfile(user, payload);
  sendResponse(res, {
    statusCode: status4.OK,
    success: true,
    message: "Profile updated successfully",
    data: result
  });
});
var handleOAuthError = catchAsync(async (req, res) => {
  const error = req.query.error || "oauth_failed";
  res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
});
var AuthController = {
  registerManager: registerManager2,
  loginUser: loginUser2,
  logoutUser: logoutUser2,
  googleLogin,
  googleLoginSuccess: googleLoginSuccess2,
  handleOAuthError,
  resetPassword: resetPassword2,
  forgetPassword: forgetPassword2,
  verifyEmail: verifyEmail2,
  resendOtp: resendOtp2,
  changePassword: changePassword2,
  getMe: getMe2,
  updateProfile: updateProfile2
};

// src/app/middleware/checkAuth.ts
import status5 from "http-status";
var CheckAuth = (...authRoles) => {
  return async (req, res, next) => {
    try {
      const sessionToken = CookieUtil.getCookie(
        req,
        "better-auth.session_token"
      );
      if (!sessionToken) {
        throw new AppError_default(
          status5.UNAUTHORIZED,
          "Unauthorized access! No session token provided."
        );
      }
      if (sessionToken) {
        const sessionExist = await prisma.session.findFirst({
          where: {
            token: sessionToken,
            expiresAt: {
              gt: /* @__PURE__ */ new Date()
            }
          },
          include: {
            user: true
          }
        });
        if (sessionExist && sessionExist.user) {
          const user = sessionExist.user;
          const now = /* @__PURE__ */ new Date();
          const expiresAt = new Date(sessionExist.expiresAt);
          const createdAt = new Date(sessionExist.createdAt);
          const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
          const timeRemaining = expiresAt.getTime() - now.getTime();
          const percentRemaining = timeRemaining / sessionLifeTime * 100;
          if (percentRemaining < 20) {
            res.setHeader("X-Session-Refresh", "true");
            res.setHeader("X-Session-Expires-At", expiresAt.toISOString());
            res.setHeader("X-Time-Remaining", timeRemaining.toString());
          }
          if (user.status === UserStatus.INACTIVE || user.status === UserStatus.SUSPENDED) {
            throw new AppError_default(
              status5.UNAUTHORIZED,
              "Unauthorized access! User is not active."
            );
          }
          if (user.isDeleted) {
            throw new AppError_default(
              status5.UNAUTHORIZED,
              "Unauthorized access! User is deleted."
            );
          }
          if (authRoles.length > 0 && !authRoles.includes(user.role)) {
            throw new AppError_default(
              status5.FORBIDDEN,
              "Forbidden access! You do not have permission to access this resource."
            );
          }
          req.user = {
            userId: user.id,
            role: user.role,
            email: user.email
          };
        }
      }
      const accessToken = CookieUtil.getCookie(req, "accessToken");
      if (!accessToken) {
        throw new AppError_default(
          status5.UNAUTHORIZED,
          "Unauthorized access! No access token provided."
        );
      }
      const verifiedToken = jwtUtils.verifyToken(
        accessToken,
        envVars.ACCESS_TOKEN_SECRET
      );
      if (!verifiedToken.success) {
        throw new AppError_default(
          status5.UNAUTHORIZED,
          "Unauthorized access! Invalid access token."
        );
      }
      if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data.role)) {
        throw new AppError_default(
          status5.FORBIDDEN,
          "Forbidden access! You do not have permission to access this resource."
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/app/config/multer.config.ts
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
var storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: async (req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLocaleLowerCase();
    const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const uniqueName = Math.random().toString(32).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;
    const folder = extension === "pdf" ? "pdf" : "images";
    return {
      folder: `Splitease/${folder}`,
      public_id: uniqueName,
      resource_type: "auto"
    };
  }
});
var multerUpload = multer({ storage });

// src/app/modules/auth/auth.routes.ts
var router = Router();
router.post("/register", AuthController.registerManager);
router.post("/login", AuthController.loginUser);
router.post(
  "/logout",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  AuthController.logoutUser
);
router.post(
  "/change-password",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  AuthController.changePassword
);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/forget-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);
router.get(
  "/me",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  AuthController.getMe
);
router.patch(
  "/profile",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  multerUpload.single("image"),
  AuthController.updateProfile
);
router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);
var AuthRouter = router;

// src/app/modules/houses/houses.routes.ts
import { Router as Router2 } from "express";

// src/app/modules/houses/houses.controller.ts
import status7 from "http-status";

// src/app/modules/houses/houses.service.ts
import status6 from "http-status";
var houseDetailsInclude = {
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    }
  },
  members: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  },
  _count: {
    select: {
      members: true,
      months: true,
      deposits: true,
      expenses: true,
      meals: true
    }
  }
};
var getAllHouses = async () => {
  return prisma.house.findMany({
    orderBy: { createdAt: "desc" },
    include: houseDetailsInclude
  });
};
var createHouse = async (payload, user) => {
  const name = payload?.name?.trim();
  if (!name) {
    throw new AppError_default(status6.BAD_REQUEST, "House name is required");
  }
  const isDuplicateHouse = await prisma.house.findFirst({
    where: {
      createdBy: user.userId,
      name: {
        equals: name,
        mode: "insensitive"
      }
    }
  });
  if (isDuplicateHouse) {
    throw new AppError_default(
      status6.CONFLICT,
      "You already have a house with this name"
    );
  }
  const house = await prisma.$transaction(async (tx) => {
    const createdHouse = await tx.house.create({
      data: {
        name,
        description: payload.description?.trim() || null,
        createdBy: user.userId
      }
    });
    await tx.houseMember.create({
      data: {
        houseId: createdHouse.id,
        userId: user.userId,
        role: UserRole.MANAGER
      }
    });
    return tx.house.findUnique({
      where: { id: createdHouse.id },
      include: houseDetailsInclude
    });
  });
  return house;
};
var updateHouse = async (id, payload, user) => {
  const house = await prisma.house.findUnique({
    where: { id },
    include: {
      members: {
        where: { userId: user.userId },
        select: { role: true }
      }
    }
  });
  if (!house) {
    throw new AppError_default(status6.NOT_FOUND, "House not found");
  }
  const memberRole = house.members[0]?.role;
  const canManage = house.createdBy === user.userId || memberRole === UserRole.ADMIN || memberRole === UserRole.MANAGER;
  if (!canManage) {
    throw new AppError_default(
      status6.FORBIDDEN,
      "You are not authorized to update this house"
    );
  }
  const data = {};
  if (payload.name !== void 0) {
    const trimmedName = payload.name.trim();
    if (!trimmedName) {
      throw new AppError_default(status6.BAD_REQUEST, "House name cannot be empty");
    }
    data.name = trimmedName;
  }
  if (payload.description !== void 0) {
    data.description = payload.description?.trim() || null;
  }
  if (Object.keys(data).length === 0) {
    throw new AppError_default(status6.BAD_REQUEST, "No valid data provided to update");
  }
  return prisma.house.update({
    where: { id },
    data,
    include: houseDetailsInclude
  });
};
var getHouseById = async (id, user) => {
  const access = await prisma.house.findUnique({
    where: { id },
    include: {
      members: {
        where: { userId: user.userId },
        select: { id: true }
      }
    }
  });
  if (!access) {
    throw new AppError_default(status6.NOT_FOUND, "House not found");
  }
  const hasAccess = access.createdBy === user.userId || access.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status6.FORBIDDEN,
      "You are not authorized to view this house"
    );
  }
  return prisma.house.findUnique({
    where: { id },
    include: houseDetailsInclude
  });
};
var deleteHouse = async (id, user) => {
  const house = await prisma.house.findUnique({
    where: { id }
  });
  if (!house) {
    throw new AppError_default(status6.NOT_FOUND, "House not found");
  }
  if (house.createdBy !== user.userId) {
    throw new AppError_default(
      status6.FORBIDDEN,
      "Only the creator can delete this house"
    );
  }
  return prisma.house.delete({
    where: { id }
  });
};
var getMyHouses = async (user) => {
  return prisma.house.findMany({
    where: {
      OR: [
        { createdBy: user.userId },
        { members: { some: { userId: user.userId } } }
      ]
    },
    orderBy: { createdAt: "desc" },
    include: houseDetailsInclude
  });
};
var HouseService = {
  getAllHouses,
  createHouse,
  updateHouse,
  getHouseById,
  deleteHouse,
  getMyHouses
};

// src/app/modules/houses/houses.controller.ts
var getAllHouses2 = catchAsync(async (req, res) => {
  const result = await HouseService.getAllHouses();
  sendResponse(res, {
    statusCode: status7.OK,
    success: true,
    message: "Houses retrieved successfully",
    data: result
  });
});
var getMyHouses2 = catchAsync(async (req, res) => {
  const result = await HouseService.getMyHouses(req.user);
  sendResponse(res, {
    statusCode: status7.OK,
    success: true,
    message: "Houses retrieved successfully",
    data: result
  });
});
var createHouse2 = catchAsync(async (req, res) => {
  const result = await HouseService.createHouse(req.body, req.user);
  sendResponse(res, {
    statusCode: status7.CREATED,
    success: true,
    message: "House created successfully",
    data: result
  });
});
var updateHouse2 = catchAsync(async (req, res) => {
  const result = await HouseService.updateHouse(
    req.params.id,
    req.body,
    req.user
  );
  sendResponse(res, {
    statusCode: status7.OK,
    success: true,
    message: "House updated successfully",
    data: result
  });
});
var getHouseById2 = catchAsync(async (req, res) => {
  const result = await HouseService.getHouseById(
    req.params.id,
    req.user
  );
  sendResponse(res, {
    statusCode: status7.OK,
    success: true,
    message: "House retrieved successfully",
    data: result
  });
});
var deleteHouse2 = catchAsync(async (req, res) => {
  const result = await HouseService.deleteHouse(
    req.params.id,
    req.user
  );
  sendResponse(res, {
    statusCode: status7.OK,
    success: true,
    message: "House deleted successfully",
    data: result
  });
});
var HouseController = {
  getAllHouses: getAllHouses2,
  createHouse: createHouse2,
  updateHouse: updateHouse2,
  getHouseById: getHouseById2,
  deleteHouse: deleteHouse2,
  getMyHouses: getMyHouses2
};

// src/app/modules/houses/houses.routes.ts
var router2 = Router2();
router2.get("/", CheckAuth(UserRole.ADMIN), HouseController.getAllHouses);
router2.post(
  "/",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  HouseController.createHouse
);
router2.get(
  "/my",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  HouseController.getMyHouses
);
router2.get("/:id", CheckAuth(UserRole.ADMIN), HouseController.getHouseById);
router2.patch(
  "/update/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  HouseController.updateHouse
);
router2.delete(
  "/delete/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  HouseController.deleteHouse
);
var HousesRoutes = router2;

// src/app/modules/members/members.routes.ts
import { Router as Router3 } from "express";

// src/app/modules/members/members.controller.ts
import status9 from "http-status";

// src/app/modules/members/members.service.ts
import status8 from "http-status";
var memberDetailsInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isDeleted: true
    }
  },
  house: {
    select: {
      id: true,
      name: true,
      createdBy: true
    }
  }
};
var addMemberToHouse = async (payload, user) => {
  const { houseId, name, email, role } = payload;
  const house = await prisma.house.findUnique({
    where: { id: houseId },
    include: {
      members: {
        where: { userId: user.userId },
        select: { role: true }
      }
    }
  });
  if (!house) {
    throw new AppError_default(status8.NOT_FOUND, "House not found");
  }
  const requesterRole = house.members[0]?.role;
  const canManage = user.role === UserRole.ADMIN || house.createdBy === user.userId || requesterRole === UserRole.ADMIN || requesterRole === UserRole.MANAGER;
  if (!canManage) {
    throw new AppError_default(
      status8.FORBIDDEN,
      "You are not authorized to add member in this house"
    );
  }
  const normalizedEmail = email;
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });
  if (existingUser && !existingUser.isDeleted) {
    throw new AppError_default(status8.CONFLICT, "User with this email already exists");
  }
  if (existingUser?.isDeleted) {
    throw new AppError_default(
      status8.CONFLICT,
      "A deleted user already exists with this email"
    );
  }
  const temporaryPassword = `Member@${Math.random().toString(36).slice(-2)}`;
  let createdUserId = null;
  try {
    const signUpData = await auth.api.signUpEmail({
      body: {
        name,
        email: normalizedEmail,
        password: temporaryPassword
      }
    });
    if (!signUpData.user) {
      throw new AppError_default(status8.BAD_REQUEST, "Failed to create member account");
    }
    createdUserId = signUpData.user.id;
    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: createdUserId },
        data: {
          role: UserRole.MEMBER,
          emailVerified: true,
          needPasswordChange: true
        }
      });
      const existingMembership = await tx.houseMember.findFirst({
        where: {
          houseId,
          userId: createdUserId
        }
      });
      if (existingMembership) {
        throw new AppError_default(
          status8.CONFLICT,
          "This user is already a member of this house"
        );
      }
      return tx.houseMember.create({
        data: {
          houseId,
          userId: createdUserId,
          role: role ?? UserRole.MEMBER
        },
        include: memberDetailsInclude
      });
    });
    await sendEmail({
      to: normalizedEmail,
      subject: "Your SplitEase member account credentials",
      templateName: "memberCredentials",
      templateData: {
        name,
        email: normalizedEmail,
        password: temporaryPassword
      }
    });
    return result;
  } catch (error) {
    if (createdUserId) {
      await prisma.user.delete({
        where: { id: createdUserId }
      });
    }
    throw error;
  }
};
var getAllMembers = async (user) => {
  if (user.role === UserRole.ADMIN) {
    return prisma.houseMember.findMany({
      orderBy: { createdAt: "desc" },
      include: memberDetailsInclude
    });
  }
  return prisma.houseMember.findMany({
    where: {
      house: {
        OR: [
          { createdBy: user.userId },
          {
            members: {
              some: {
                userId: user.userId
              }
            }
          }
        ]
      }
    },
    orderBy: { createdAt: "desc" },
    include: memberDetailsInclude
  });
};
var getMemberById = async (id, user) => {
  const member = await prisma.houseMember.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          isDeleted: true
        }
      },
      house: {
        select: {
          id: true,
          name: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!member) {
    throw new AppError_default(status8.NOT_FOUND, "Member not found");
  }
  const requesterRole = member.house.members[0]?.role;
  const canRead = user.role === UserRole.ADMIN || member.userId === user.userId || member.house.createdBy === user.userId || requesterRole === UserRole.ADMIN || requesterRole === UserRole.MANAGER;
  if (!canRead) {
    throw new AppError_default(
      status8.FORBIDDEN,
      "You are not authorized to view this member"
    );
  }
  return member;
};
var getHouseMember = async (houseId, user) => {
  const house = await prisma.house.findUnique({
    where: { id: houseId },
    include: {
      members: {
        where: { userId: user.userId },
        select: { role: true }
      }
    }
  });
  if (!house) {
    throw new AppError_default(status8.NOT_FOUND, "House not found");
  }
  const hasAccess = user.role === UserRole.ADMIN || house.createdBy === user.userId || house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status8.FORBIDDEN,
      "You are not authorized to view house members"
    );
  }
  return prisma.houseMember.findMany({
    where: { houseId },
    orderBy: { createdAt: "desc" },
    include: memberDetailsInclude
  });
};
var deleteMember = async (id, user) => {
  const member = await prisma.houseMember.findUnique({
    where: { id },
    include: {
      house: {
        select: {
          id: true,
          name: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!member) {
    throw new AppError_default(status8.NOT_FOUND, "Member not found");
  }
  const requesterRole = member.house.members[0]?.role;
  const canDelete = user.role === UserRole.ADMIN || member.house.createdBy === user.userId || requesterRole === UserRole.ADMIN || requesterRole === UserRole.MANAGER;
  if (!canDelete) {
    throw new AppError_default(
      status8.FORBIDDEN,
      "You are not authorized to delete this member"
    );
  }
  if (member.userId === member.house.createdBy) {
    throw new AppError_default(
      status8.BAD_REQUEST,
      "House creator cannot be removed from members"
    );
  }
  return prisma.$transaction(async (tx) => {
    const deletedMember = await tx.houseMember.delete({
      where: { id }
    });
    await tx.user.update({
      where: { id: deletedMember.userId },
      data: { isDeleted: true }
    });
    return deletedMember;
  });
};
var MembersService = {
  addMemberToHouse,
  getAllMembers,
  getMemberById,
  getHouseMember,
  deleteMember
};

// src/app/modules/members/members.controller.ts
var getAllMembers2 = catchAsync(async (req, res) => {
  const result = await MembersService.getAllMembers(req.user);
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "Members retrieved successfully",
    data: result
  });
});
var addMemberToHouse2 = catchAsync(async (req, res) => {
  const result = await MembersService.addMemberToHouse(req.body, req.user);
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "Member added to house successfully. Check your email for credentials.",
    data: result
  });
});
var getMemberById2 = catchAsync(async (req, res) => {
  const { id: memberId } = req.params;
  const result = await MembersService.getMemberById(
    memberId,
    req.user
  );
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "Member retrieved successfully",
    data: result
  });
});
var getHouseMember2 = catchAsync(async (req, res) => {
  const { houseId } = req.params;
  const result = await MembersService.getHouseMember(
    houseId,
    req.user
  );
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "House members retrieved successfully",
    data: result
  });
});
var deleteMember2 = catchAsync(async (req, res) => {
  const { id: memberId } = req.params;
  const result = await MembersService.deleteMember(
    memberId,
    req.user
  );
  sendResponse(res, {
    statusCode: status9.OK,
    success: true,
    message: "Member deleted successfully",
    data: result
  });
});
var MembersController = {
  addMemberToHouse: addMemberToHouse2,
  getAllMembers: getAllMembers2,
  getMemberById: getMemberById2,
  getHouseMember: getHouseMember2,
  deleteMember: deleteMember2
};

// src/app/modules/members/members.routes.ts
var router3 = Router3();
router3.post(
  "/",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  MembersController.addMemberToHouse
);
router3.get(
  "/",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  MembersController.getAllMembers
);
router3.get(
  "/house/:houseId",
  CheckAuth(UserRole.MANAGER),
  MembersController.getHouseMember
);
router3.get(
  "/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  MembersController.getMemberById
);
router3.delete(
  "/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  MembersController.deleteMember
);
var MembersRoutes = router3;

// src/app/modules/month/month.routes.ts
import { Router as Router4 } from "express";

// src/app/modules/month/month.controller.ts
import status11 from "http-status";

// src/app/modules/month/month.service.ts
import status10 from "http-status";
var monthDetailsInclude = {
  house: {
    select: {
      id: true,
      name: true,
      createdBy: true
    }
  },
  _count: {
    select: {
      meals: true,
      deposits: true,
      expenses: true
    }
  }
};
var createMonth = async (payload, user) => {
  const { houseId, name, startDate, endDate } = payload;
  const trimmedName = name?.trim();
  if (!trimmedName) {
    throw new AppError_default(status10.BAD_REQUEST, "Month name is required");
  }
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);
  if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
    throw new AppError_default(status10.BAD_REQUEST, "Invalid startDate or endDate");
  }
  if (parsedStartDate >= parsedEndDate) {
    throw new AppError_default(
      status10.BAD_REQUEST,
      "End date must be greater than start date"
    );
  }
  const house = await prisma.house.findUnique({
    where: { id: houseId },
    include: {
      members: {
        where: { userId: user.userId },
        select: { role: true }
      }
    }
  });
  if (!house) {
    throw new AppError_default(status10.NOT_FOUND, "House not found");
  }
  const requesterRole = house.members[0]?.role;
  const canCreateMonth = house.createdBy === user.userId || requesterRole === UserRole.MANAGER;
  if (!canCreateMonth) {
    throw new AppError_default(
      status10.FORBIDDEN,
      "Only manager can create month for this house"
    );
  }
  const isDuplicateMonth = await prisma.month.findFirst({
    where: {
      houseId,
      name: {
        equals: trimmedName,
        mode: "insensitive"
      }
    }
  });
  if (isDuplicateMonth) {
    throw new AppError_default(
      status10.CONFLICT,
      "A month with this name already exists in this house"
    );
  }
  return prisma.month.create({
    data: {
      houseId,
      name: trimmedName,
      startDate: parsedStartDate,
      endDate: parsedEndDate
    },
    include: monthDetailsInclude
  });
};
var getHouseMonths = async (houseId, user) => {
  const house = await prisma.house.findUnique({
    where: { id: houseId },
    include: {
      members: {
        where: { userId: user.userId },
        select: { role: true }
      }
    }
  });
  if (!house) {
    throw new AppError_default(status10.NOT_FOUND, "House not found");
  }
  const hasAccess = user.role === UserRole.ADMIN || house.createdBy === user.userId || house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status10.FORBIDDEN,
      "You are not authorized to view months of this house"
    );
  }
  return prisma.month.findMany({
    where: { houseId },
    orderBy: { startDate: "asc" },
    include: monthDetailsInclude
  });
};
var getMonthById = async (monthId, user) => {
  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: {
      house: {
        select: {
          id: true,
          name: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      },
      expenses: {
        orderBy: { createdAt: "desc" },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      deposits: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      meals: {
        orderBy: { date: "asc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  });
  if (!month) {
    throw new AppError_default(status10.NOT_FOUND, "Month not found");
  }
  const hasAccess = user.role === UserRole.ADMIN || month.house.createdBy === user.userId || month.house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status10.FORBIDDEN,
      "You are not authorized to view this month"
    );
  }
  const [expenseSummary, depositSummary] = await Promise.all([
    prisma.expense.aggregate({
      where: { monthId },
      _sum: { amount: true }
    }),
    prisma.deposit.aggregate({
      where: { monthId },
      _sum: { amount: true }
    })
  ]);
  return {
    ...month,
    summary: {
      totalExpense: expenseSummary._sum.amount ?? 0,
      totalDeposit: depositSummary._sum.amount ?? 0,
      totalMeal: month.meals.length,
      balance: (depositSummary._sum.amount ?? 0) - (expenseSummary._sum.amount ?? 0)
    }
  };
};
var deleteMonth = async (monthId, user) => {
  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: {
      house: {
        select: {
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!month) {
    throw new AppError_default(status10.NOT_FOUND, "Month not found");
  }
  const requesterRole = month.house.members[0]?.role;
  const canDelete = user.role === UserRole.ADMIN || month.house.createdBy === user.userId || requesterRole === UserRole.MANAGER;
  if (!canDelete) {
    throw new AppError_default(
      status10.FORBIDDEN,
      "Only manager can delete month for this house"
    );
  }
  return prisma.month.delete({
    where: { id: monthId }
  });
};
var MonthService = {
  createMonth,
  getHouseMonths,
  getMonthById,
  deleteMonth
};

// src/app/modules/month/month.controller.ts
var createMonth2 = catchAsync(async (req, res) => {
  const result = await MonthService.createMonth(req.body, req.user);
  sendResponse(res, {
    statusCode: status11.CREATED,
    success: true,
    message: "Month created successfully",
    data: result
  });
});
var getHouseMonths2 = catchAsync(async (req, res) => {
  const result = await MonthService.getHouseMonths(
    req.params.houseId,
    req.user
  );
  sendResponse(res, {
    statusCode: status11.OK,
    success: true,
    message: "Months retrieved successfully",
    data: result
  });
});
var getMonthById2 = catchAsync(async (req, res) => {
  const result = await MonthService.getMonthById(req.params.id, req.user);
  sendResponse(res, {
    statusCode: status11.OK,
    success: true,
    message: "Month retrieved successfully",
    data: result
  });
});
var deleteMonth2 = catchAsync(async (req, res) => {
  const result = await MonthService.deleteMonth(req.params.id, req.user);
  sendResponse(res, {
    statusCode: status11.OK,
    success: true,
    message: "Month deleted successfully",
    data: result
  });
});
var MonthController = {
  createMonth: createMonth2,
  getHouseMonths: getHouseMonths2,
  getMonthById: getMonthById2,
  deleteMonth: deleteMonth2
};

// src/app/modules/month/month.routes.ts
var router4 = Router4();
router4.post("/", CheckAuth(UserRole.MANAGER), MonthController.createMonth);
router4.get(
  "/house/:houseId",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  MonthController.getHouseMonths
);
router4.get(
  "/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  MonthController.getMonthById
);
router4.delete(
  "/:id",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  MonthController.deleteMonth
);
var MonthRoutes = router4;

// src/app/modules/meal/meal.routes.ts
import { Router as Router5 } from "express";

// src/app/modules/meal/meal.controller.ts
import status13 from "http-status";

// src/app/modules/meal/meal.service.ts
import status12 from "http-status";
var mealDetailsInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  house: {
    select: {
      id: true,
      name: true,
      createdBy: true
    }
  },
  month: {
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      isClosed: true
    }
  }
};
var addMeal = async (payload, user) => {
  const { houseId, monthId, date, mealType, userId } = payload;
  const mealDate = new Date(date);
  if (Number.isNaN(mealDate.getTime())) {
    throw new AppError_default(status12.BAD_REQUEST, "Invalid meal date");
  }
  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: {
      house: {
        select: {
          id: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!month || month.houseId !== houseId) {
    throw new AppError_default(status12.NOT_FOUND, "Month not found for this house");
  }
  const hasAccess = month.house.createdBy === user.userId || month.house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status12.FORBIDDEN,
      "You are not authorized to add meal in this house"
    );
  }
  if (month.isClosed) {
    throw new AppError_default(status12.BAD_REQUEST, "Cannot add meal to a closed month");
  }
  const requesterRole = month.house.members[0]?.role;
  const isManager = month.house.createdBy === user.userId || requesterRole === UserRole.ADMIN || requesterRole === UserRole.MANAGER;
  const targetUserId = userId ?? user.userId;
  if (!isManager && targetUserId !== user.userId) {
    throw new AppError_default(
      status12.FORBIDDEN,
      "You are not authorized to add meal for other members"
    );
  }
  if (isManager) {
    const isTargetUserInHouse = await prisma.house.findFirst({
      where: {
        id: houseId,
        OR: [
          {
            createdBy: targetUserId
          },
          {
            members: {
              some: {
                userId: targetUserId
              }
            }
          }
        ]
      },
      select: { id: true }
    });
    if (!isTargetUserInHouse) {
      throw new AppError_default(
        status12.NOT_FOUND,
        "Target user is not a member of this house"
      );
    }
  }
  return prisma.meal.create({
    data: {
      houseId,
      monthId,
      userId: targetUserId,
      date: mealDate,
      mealType
    },
    include: mealDetailsInclude
  });
};
var getAllMeals = async (monthId, user) => {
  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: {
      house: {
        select: {
          id: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!month) {
    throw new AppError_default(status12.NOT_FOUND, "Month not found");
  }
  const hasAccess = month.house.createdBy === user.userId || month.house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status12.FORBIDDEN,
      "You are not authorized to view meals of this month"
    );
  }
  const requesterRole = month.house.members[0]?.role;
  const isManager = month.house.createdBy === user.userId || requesterRole === UserRole.MANAGER;
  return prisma.meal.findMany({
    where: isManager ? { monthId } : {
      monthId,
      userId: user.userId
    },
    orderBy: { date: "asc" },
    include: mealDetailsInclude
  });
};
var getMealById = async (mealId, user) => {
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: {
      ...mealDetailsInclude,
      house: {
        select: {
          id: true,
          name: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!meal) {
    throw new AppError_default(status12.NOT_FOUND, "Meal not found");
  }
  const hasAccess = meal.house.createdBy === user.userId || meal.house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status12.FORBIDDEN,
      "You are not authorized to view this meal"
    );
  }
  return meal;
};
var updateMeal = async (mealId, payload, user) => {
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: {
      house: {
        select: {
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      },
      month: {
        select: {
          isClosed: true
        }
      }
    }
  });
  if (!meal) {
    throw new AppError_default(status12.NOT_FOUND, "Meal not found");
  }
  const requesterRole = meal.house.members[0]?.role;
  const isManager = meal.house.createdBy === user.userId || requesterRole === UserRole.MANAGER;
  const canUpdate = isManager || meal.userId === user.userId;
  if (!canUpdate) {
    throw new AppError_default(
      status12.FORBIDDEN,
      "You are not authorized to update this meal"
    );
  }
  if (meal.month.isClosed) {
    throw new AppError_default(
      status12.BAD_REQUEST,
      "Cannot update meal of a closed month"
    );
  }
  const data = {};
  if (payload.date !== void 0) {
    const parsedDate = new Date(payload.date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError_default(status12.BAD_REQUEST, "Invalid meal date");
    }
    data.date = parsedDate;
  }
  if (payload.mealType !== void 0) {
    data.mealType = payload.mealType;
  }
  if (Object.keys(data).length === 0) {
    throw new AppError_default(status12.BAD_REQUEST, "No valid fields to update");
  }
  return prisma.meal.update({
    where: { id: mealId },
    data,
    include: mealDetailsInclude
  });
};
var deleteMeal = async (mealId, user) => {
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: {
      house: {
        select: {
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      },
      month: {
        select: {
          isClosed: true
        }
      }
    }
  });
  if (!meal) {
    throw new AppError_default(status12.NOT_FOUND, "Meal not found");
  }
  const requesterRole = meal.house.members[0]?.role;
  const isManager = meal.house.createdBy === user.userId || requesterRole === UserRole.MANAGER;
  const canDelete = isManager || meal.userId === user.userId;
  if (!canDelete) {
    throw new AppError_default(
      status12.FORBIDDEN,
      "You are not authorized to delete this meal"
    );
  }
  if (meal.month.isClosed) {
    throw new AppError_default(
      status12.BAD_REQUEST,
      "Cannot delete meal of a closed month"
    );
  }
  return prisma.meal.delete({
    where: { id: mealId }
  });
};
var MealService = {
  addMeal,
  getAllMeals,
  getMealById,
  updateMeal,
  deleteMeal
};

// src/app/modules/meal/meal.controller.ts
var addMeal2 = catchAsync(async (req, res) => {
  const result = await MealService.addMeal(req.body, req.user);
  sendResponse(res, {
    statusCode: status13.CREATED,
    success: true,
    message: "Meal added successfully",
    data: result
  });
});
var getAllMeals2 = catchAsync(async (req, res) => {
  const result = await MealService.getAllMeals(req.params.monthId, req.user);
  sendResponse(res, {
    statusCode: status13.OK,
    success: true,
    message: "Meals retrieved successfully",
    data: result
  });
});
var getMealById2 = catchAsync(async (req, res) => {
  const result = await MealService.getMealById(req.params.id, req.user);
  sendResponse(res, {
    statusCode: status13.OK,
    success: true,
    message: "Meal retrieved successfully",
    data: result
  });
});
var updateMeal2 = catchAsync(async (req, res) => {
  const result = await MealService.updateMeal(
    req.params.id,
    req.body,
    req.user
  );
  sendResponse(res, {
    statusCode: status13.OK,
    success: true,
    message: "Meal updated successfully",
    data: result
  });
});
var deleteMeal2 = catchAsync(async (req, res) => {
  const result = await MealService.deleteMeal(req.params.id, req.user);
  sendResponse(res, {
    statusCode: status13.OK,
    success: true,
    message: "Meal deleted successfully",
    data: result
  });
});
var MealController = {
  addMeal: addMeal2,
  getAllMeals: getAllMeals2,
  getMealById: getMealById2,
  updateMeal: updateMeal2,
  deleteMeal: deleteMeal2
};

// src/app/modules/meal/meal.routes.ts
var router5 = Router5();
router5.post(
  "/",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  MealController.addMeal
);
router5.get(
  "/month/:monthId",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  MealController.getAllMeals
);
router5.get(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  MealController.getMealById
);
router5.patch(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  MealController.updateMeal
);
router5.delete(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  MealController.deleteMeal
);
var MealRoutes = router5;

// src/app/modules/deposit/deposit.routes.ts
import { Router as Router6 } from "express";

// src/app/modules/deposit/deposit.controller.ts
import status15 from "http-status";

// src/app/modules/deposit/deposit.service.ts
import status14 from "http-status";
var depositDetailsInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  house: {
    select: {
      id: true,
      name: true,
      createdBy: true
    }
  },
  month: {
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      isClosed: true
    }
  }
};
var createDeposit = async (payload, user) => {
  const { houseId, monthId, amount, note, userId } = payload;
  if (!amount || amount <= 0) {
    throw new AppError_default(status14.BAD_REQUEST, "Amount must be greater than 0");
  }
  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: {
      house: {
        select: {
          id: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!month || month.houseId !== houseId) {
    throw new AppError_default(status14.NOT_FOUND, "Month not found for this house");
  }
  const hasAccess = month.house.createdBy === user.userId || month.house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status14.FORBIDDEN,
      "You are not authorized to add deposit in this house"
    );
  }
  if (month.isClosed) {
    throw new AppError_default(
      status14.BAD_REQUEST,
      "Cannot add deposit to a closed month"
    );
  }
  const requesterRole = month.house.members[0]?.role;
  const isManager = month.house.createdBy === user.userId || requesterRole === UserRole.ADMIN || requesterRole === UserRole.MANAGER;
  const targetUserId = userId ?? user.userId;
  if (!isManager && targetUserId !== user.userId) {
    throw new AppError_default(
      status14.FORBIDDEN,
      "You are not authorized to add deposit for other members"
    );
  }
  if (isManager) {
    const isTargetUserInHouse = await prisma.house.findFirst({
      where: {
        id: houseId,
        OR: [
          {
            createdBy: targetUserId
          },
          {
            members: {
              some: {
                userId: targetUserId
              }
            }
          }
        ]
      },
      select: { id: true }
    });
    if (!isTargetUserInHouse) {
      throw new AppError_default(
        status14.NOT_FOUND,
        "Target user is not a member of this house"
      );
    }
  }
  return prisma.deposit.create({
    data: {
      houseId,
      monthId,
      userId: targetUserId,
      amount,
      note: note?.trim() || null
    },
    include: depositDetailsInclude
  });
};
var getDepositsByMonth = async (monthId, user) => {
  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: {
      house: {
        select: {
          id: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!month) {
    throw new AppError_default(status14.NOT_FOUND, "Month not found");
  }
  const hasAccess = month.house.createdBy === user.userId || month.house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status14.FORBIDDEN,
      "You are not authorized to view deposits of this month"
    );
  }
  return prisma.deposit.findMany({
    where: { monthId },
    orderBy: { createdAt: "desc" },
    include: depositDetailsInclude
  });
};
var getDepositById = async (depositId, user) => {
  const deposit = await prisma.deposit.findUnique({
    where: { id: depositId },
    include: {
      ...depositDetailsInclude,
      house: {
        select: {
          id: true,
          name: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!deposit) {
    throw new AppError_default(status14.NOT_FOUND, "Deposit not found");
  }
  const hasAccess = deposit.house.createdBy === user.userId || deposit.house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status14.FORBIDDEN,
      "You are not authorized to view this deposit"
    );
  }
  return deposit;
};
var updateDeposit = async (depositId, payload, user) => {
  const deposit = await prisma.deposit.findUnique({
    where: { id: depositId },
    include: {
      house: {
        select: {
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      },
      month: {
        select: {
          isClosed: true
        }
      }
    }
  });
  if (!deposit) {
    throw new AppError_default(status14.NOT_FOUND, "Deposit not found");
  }
  const requesterRole = deposit.house.members[0]?.role;
  const isManager = deposit.house.createdBy === user.userId || requesterRole === UserRole.MANAGER;
  const canUpdate = isManager || deposit.userId === user.userId;
  if (!canUpdate) {
    throw new AppError_default(
      status14.FORBIDDEN,
      "You are not authorized to update this deposit"
    );
  }
  if (deposit.month.isClosed) {
    throw new AppError_default(
      status14.BAD_REQUEST,
      "Cannot update deposit of a closed month"
    );
  }
  const data = {};
  if (payload.amount !== void 0) {
    if (payload.amount <= 0) {
      throw new AppError_default(status14.BAD_REQUEST, "Amount must be greater than 0");
    }
    data.amount = payload.amount;
  }
  if (payload.note !== void 0) {
    data.note = payload.note?.trim() || null;
  }
  if (Object.keys(data).length === 0) {
    throw new AppError_default(status14.BAD_REQUEST, "No valid fields to update");
  }
  return prisma.deposit.update({
    where: { id: depositId },
    data,
    include: depositDetailsInclude
  });
};
var deleteDeposit = async (depositId, user) => {
  const deposit = await prisma.deposit.findUnique({
    where: { id: depositId },
    include: {
      house: {
        select: {
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      },
      month: {
        select: {
          isClosed: true
        }
      }
    }
  });
  if (!deposit) {
    throw new AppError_default(status14.NOT_FOUND, "Deposit not found");
  }
  const requesterRole = deposit.house.members[0]?.role;
  const isManager = deposit.house.createdBy === user.userId || requesterRole === UserRole.MANAGER;
  const canDelete = isManager || deposit.userId === user.userId;
  if (!canDelete) {
    throw new AppError_default(
      status14.FORBIDDEN,
      "You are not authorized to delete this deposit"
    );
  }
  if (deposit.month.isClosed) {
    throw new AppError_default(
      status14.BAD_REQUEST,
      "Cannot delete deposit of a closed month"
    );
  }
  return prisma.deposit.delete({
    where: { id: depositId }
  });
};
var DepositService = {
  createDeposit,
  getDepositsByMonth,
  getDepositById,
  updateDeposit,
  deleteDeposit
};

// src/app/modules/deposit/deposit.controller.ts
var createDeposit2 = catchAsync(async (req, res) => {
  const result = await DepositService.createDeposit(req.body, req.user);
  sendResponse(res, {
    statusCode: status15.CREATED,
    success: true,
    message: "Deposit created successfully",
    data: result
  });
});
var getDepositsByMonth2 = catchAsync(async (req, res) => {
  const monthId = req.query.monthId;
  if (!monthId) {
    return sendResponse(res, {
      statusCode: status15.BAD_REQUEST,
      success: false,
      message: "monthId query parameter is required",
      data: null
    });
  }
  const result = await DepositService.getDepositsByMonth(monthId, req.user);
  sendResponse(res, {
    statusCode: status15.OK,
    success: true,
    message: "Deposits retrieved successfully",
    data: result
  });
});
var getDepositById2 = catchAsync(async (req, res) => {
  const result = await DepositService.getDepositById(
    req.params.id,
    req.user
  );
  sendResponse(res, {
    statusCode: status15.OK,
    success: true,
    message: "Deposit retrieved successfully",
    data: result
  });
});
var updateDeposit2 = catchAsync(async (req, res) => {
  const result = await DepositService.updateDeposit(
    req.params.id,
    req.body,
    req.user
  );
  sendResponse(res, {
    statusCode: status15.OK,
    success: true,
    message: "Deposit updated successfully",
    data: result
  });
});
var deleteDeposit2 = catchAsync(async (req, res) => {
  const result = await DepositService.deleteDeposit(
    req.params.id,
    req.user
  );
  sendResponse(res, {
    statusCode: status15.OK,
    success: true,
    message: "Deposit deleted successfully",
    data: result
  });
});
var DepositController = {
  createDeposit: createDeposit2,
  getDepositsByMonth: getDepositsByMonth2,
  getDepositById: getDepositById2,
  updateDeposit: updateDeposit2,
  deleteDeposit: deleteDeposit2
};

// src/app/modules/deposit/deposit.routes.ts
var router6 = Router6();
router6.post(
  "/",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  DepositController.createDeposit
);
router6.get(
  "/",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  DepositController.getDepositsByMonth
);
router6.get(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  DepositController.getDepositById
);
router6.patch(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  DepositController.updateDeposit
);
router6.delete(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  DepositController.deleteDeposit
);
var DepositRoutes = router6;

// src/app/modules/expenses/expenses.routes.ts
import { Router as Router7 } from "express";

// src/app/modules/expenses/expenses.controller.ts
import status17 from "http-status";

// src/app/modules/expenses/expenses.service.ts
import status16 from "http-status";
var expenseDetailsInclude = {
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  house: {
    select: {
      id: true,
      name: true,
      createdBy: true
    }
  },
  month: {
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      isClosed: true
    }
  }
};
var createExpense = async (payload, user) => {
  const { houseId, monthId, type, amount, description, userId } = payload;
  if (!amount || amount <= 0) {
    throw new AppError_default(status16.BAD_REQUEST, "Amount must be greater than 0");
  }
  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: {
      house: {
        select: {
          id: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!month || month.houseId !== houseId) {
    throw new AppError_default(status16.NOT_FOUND, "Month not found for this house");
  }
  const hasAccess = month.house.createdBy === user.userId || month.house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status16.FORBIDDEN,
      "You are not authorized to add expense in this house"
    );
  }
  if (month.isClosed) {
    throw new AppError_default(
      status16.BAD_REQUEST,
      "Cannot add expense to a closed month"
    );
  }
  const requesterRole = month.house.members[0]?.role;
  const isManager = month.house.createdBy === user.userId || requesterRole === UserRole.ADMIN || requesterRole === UserRole.MANAGER;
  const targetUserId = userId ?? user.userId;
  if (!isManager && targetUserId !== user.userId) {
    throw new AppError_default(
      status16.FORBIDDEN,
      "You are not authorized to add expense for other members"
    );
  }
  if (isManager) {
    const isTargetUserInHouse = await prisma.house.findFirst({
      where: {
        id: houseId,
        OR: [
          {
            createdBy: targetUserId
          },
          {
            members: {
              some: {
                userId: targetUserId
              }
            }
          }
        ]
      },
      select: { id: true }
    });
    if (!isTargetUserInHouse) {
      throw new AppError_default(
        status16.NOT_FOUND,
        "Target user is not a member of this house"
      );
    }
  }
  return prisma.expense.create({
    data: {
      houseId,
      monthId,
      type,
      amount,
      description: description?.trim() || null,
      createdBy: targetUserId
    },
    include: expenseDetailsInclude
  });
};
var getExpensesByMonth = async (monthId, user) => {
  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: {
      house: {
        select: {
          id: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!month) {
    throw new AppError_default(status16.NOT_FOUND, "Month not found");
  }
  const hasAccess = month.house.createdBy === user.userId || month.house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status16.FORBIDDEN,
      "You are not authorized to view expenses of this month"
    );
  }
  return prisma.expense.findMany({
    where: { monthId },
    orderBy: { createdAt: "desc" },
    include: expenseDetailsInclude
  });
};
var getExpenseById = async (expenseId, user) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      ...expenseDetailsInclude,
      house: {
        select: {
          id: true,
          name: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!expense) {
    throw new AppError_default(status16.NOT_FOUND, "Expense not found");
  }
  const hasAccess = expense.house.createdBy === user.userId || expense.house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status16.FORBIDDEN,
      "You are not authorized to view this expense"
    );
  }
  return expense;
};
var updateExpense = async (expenseId, payload, user) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      house: {
        select: {
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      },
      month: {
        select: {
          isClosed: true
        }
      }
    }
  });
  if (!expense) {
    throw new AppError_default(status16.NOT_FOUND, "Expense not found");
  }
  const requesterRole = expense.house.members[0]?.role;
  const isManager = expense.house.createdBy === user.userId || requesterRole === UserRole.MANAGER;
  const canUpdate = isManager || expense.createdBy === user.userId;
  if (!canUpdate) {
    throw new AppError_default(
      status16.FORBIDDEN,
      "You are not authorized to update this expense"
    );
  }
  if (expense.month.isClosed) {
    throw new AppError_default(
      status16.BAD_REQUEST,
      "Cannot update expense of a closed month"
    );
  }
  const data = {};
  if (payload.type !== void 0) {
    data.type = payload.type;
  }
  if (payload.amount !== void 0) {
    if (payload.amount <= 0) {
      throw new AppError_default(status16.BAD_REQUEST, "Amount must be greater than 0");
    }
    data.amount = payload.amount;
  }
  if (payload.description !== void 0) {
    data.description = payload.description?.trim() || null;
  }
  if (Object.keys(data).length === 0) {
    throw new AppError_default(status16.BAD_REQUEST, "No valid fields to update");
  }
  return prisma.expense.update({
    where: { id: expenseId },
    data,
    include: expenseDetailsInclude
  });
};
var deleteExpense = async (expenseId, user) => {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      house: {
        select: {
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      },
      month: {
        select: {
          isClosed: true
        }
      }
    }
  });
  if (!expense) {
    throw new AppError_default(status16.NOT_FOUND, "Expense not found");
  }
  const requesterRole = expense.house.members[0]?.role;
  const isManager = expense.house.createdBy === user.userId || requesterRole === UserRole.MANAGER;
  const canDelete = isManager || expense.createdBy === user.userId;
  if (!canDelete) {
    throw new AppError_default(
      status16.FORBIDDEN,
      "You are not authorized to delete this expense"
    );
  }
  if (expense.month.isClosed) {
    throw new AppError_default(
      status16.BAD_REQUEST,
      "Cannot delete expense of a closed month"
    );
  }
  return prisma.expense.delete({
    where: { id: expenseId }
  });
};
var ExpenseService = {
  createExpense,
  getExpensesByMonth,
  getExpenseById,
  updateExpense,
  deleteExpense
};

// src/app/modules/expenses/expenses.controller.ts
var createExpense2 = catchAsync(async (req, res) => {
  const result = await ExpenseService.createExpense(req.body, req.user);
  sendResponse(res, {
    statusCode: status17.CREATED,
    success: true,
    message: "Expense created successfully",
    data: result
  });
});
var getExpensesByMonth2 = catchAsync(async (req, res) => {
  const monthId = req.query.monthId;
  if (!monthId) {
    return sendResponse(res, {
      statusCode: status17.BAD_REQUEST,
      success: false,
      message: "monthId query parameter is required",
      data: null
    });
  }
  const result = await ExpenseService.getExpensesByMonth(monthId, req.user);
  sendResponse(res, {
    statusCode: status17.OK,
    success: true,
    message: "Expenses retrieved successfully",
    data: result
  });
});
var getExpenseById2 = catchAsync(async (req, res) => {
  const result = await ExpenseService.getExpenseById(
    req.params.id,
    req.user
  );
  sendResponse(res, {
    statusCode: status17.OK,
    success: true,
    message: "Expense retrieved successfully",
    data: result
  });
});
var updateExpense2 = catchAsync(async (req, res) => {
  const result = await ExpenseService.updateExpense(
    req.params.id,
    req.body,
    req.user
  );
  sendResponse(res, {
    statusCode: status17.OK,
    success: true,
    message: "Expense updated successfully",
    data: result
  });
});
var deleteExpense2 = catchAsync(async (req, res) => {
  const result = await ExpenseService.deleteExpense(
    req.params.id,
    req.user
  );
  sendResponse(res, {
    statusCode: status17.OK,
    success: true,
    message: "Expense deleted successfully",
    data: result
  });
});
var ExpenseController = {
  createExpense: createExpense2,
  getExpensesByMonth: getExpensesByMonth2,
  getExpenseById: getExpenseById2,
  updateExpense: updateExpense2,
  deleteExpense: deleteExpense2
};

// src/app/modules/expenses/expenses.routes.ts
var router7 = Router7();
router7.post(
  "/",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  ExpenseController.createExpense
);
router7.get(
  "/",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  ExpenseController.getExpensesByMonth
);
router7.get(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  ExpenseController.getExpenseById
);
router7.patch(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  ExpenseController.updateExpense
);
router7.delete(
  "/:id",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  ExpenseController.deleteExpense
);
var ExpensesRoutes = router7;

// src/app/modules/stats/stats.routes.ts
import { Router as Router8 } from "express";

// src/app/modules/stats/stats.service.ts
import status18 from "http-status";
var buildMonthlyCountBarChart = (dates) => {
  const monthCountMap = /* @__PURE__ */ new Map();
  for (const date of dates) {
    const monthLabel = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}`;
    monthCountMap.set(monthLabel, (monthCountMap.get(monthLabel) ?? 0) + 1);
  }
  return Array.from(monthCountMap.entries()).sort(([monthA], [monthB]) => monthA.localeCompare(monthB)).map(([label, value]) => ({ label, value }));
};
var getDashboardStatsData = async (user) => {
  switch (user.role) {
    case UserRole.ADMIN:
      return getAdminStatsData();
    case UserRole.MANAGER:
      return getManagerStatsData(user);
    case UserRole.MEMBER:
      return getMemberStatsData(user);
    default:
      throw new AppError_default(status18.BAD_REQUEST, "Invalid user role");
  }
};
var getAdminStatsData = async () => {
  const [
    userCount,
    houseCount,
    houseMemberCount,
    monthCount,
    mealCount,
    expenseCount,
    depositCount,
    subscriptionCount,
    paymentCount,
    totalExpenseAggregate,
    totalDepositAggregate,
    totalRevenueAggregate
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.house.count(),
    prisma.houseMember.count(),
    prisma.month.count(),
    prisma.meal.count(),
    prisma.expense.count(),
    prisma.deposit.count(),
    prisma.subscription.count(),
    prisma.payment.count(),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.deposit.aggregate({ _sum: { amount: true } }),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.SUCCESS },
      _sum: { amount: true }
    })
  ]);
  const totalExpense = totalExpenseAggregate._sum.amount ?? 0;
  const totalDeposit = totalDepositAggregate._sum.amount ?? 0;
  const [expenseTypeDistribution, months] = await Promise.all([
    prisma.expense.groupBy({
      by: ["type"],
      _count: {
        _all: true
      }
    }),
    prisma.month.findMany({
      select: { startDate: true },
      orderBy: { startDate: "asc" }
    })
  ]);
  const pieChartData = expenseTypeDistribution.map((item) => ({
    label: item.type,
    value: item._count._all
  }));
  const barChartData = buildMonthlyCountBarChart(
    months.map((month) => month.startDate)
  );
  return {
    userCount,
    houseCount,
    houseMemberCount,
    monthCount,
    mealCount,
    expenseCount,
    depositCount,
    subscriptionCount,
    paymentCount,
    totalExpense,
    totalDeposit,
    currentBalance: Number((totalDeposit - totalExpense).toFixed(2)),
    totalRevenue: totalRevenueAggregate._sum.amount ?? 0,
    pieChartData,
    barChartData
  };
};
var getManagerStatsData = async (user) => {
  const houses = await prisma.house.findMany({
    where: {
      OR: [
        { createdBy: user.userId },
        {
          members: {
            some: {
              userId: user.userId,
              role: UserRole.MANAGER
            }
          }
        }
      ]
    },
    select: { id: true }
  });
  const houseIds = Array.from(new Set(houses.map((house) => house.id)));
  if (houseIds.length === 0) {
    const myPaymentAggregate2 = await prisma.payment.aggregate({
      where: {
        userId: user.userId,
        status: PaymentStatus.SUCCESS
      },
      _sum: { amount: true }
    });
    return {
      houseCount: 0,
      memberCount: 0,
      monthCount: 0,
      mealCount: 0,
      expenseCount: 0,
      totalExpense: 0,
      totalDeposit: 0,
      currentBalance: 0,
      activeSubscriptionCount: 0,
      totalSubscriptionPaid: myPaymentAggregate2._sum.amount ?? 0,
      pieChartData: [],
      barChartData: []
    };
  }
  const [
    memberCount,
    monthCount,
    mealCount,
    expenseCount,
    totalExpenseAggregate,
    totalDepositAggregate,
    activeSubscriptionCount,
    myPaymentAggregate
  ] = await Promise.all([
    prisma.houseMember.count({ where: { houseId: { in: houseIds } } }),
    prisma.month.count({ where: { houseId: { in: houseIds } } }),
    prisma.meal.count({ where: { houseId: { in: houseIds } } }),
    prisma.expense.count({ where: { houseId: { in: houseIds } } }),
    prisma.expense.aggregate({
      where: { houseId: { in: houseIds } },
      _sum: { amount: true }
    }),
    prisma.deposit.aggregate({
      where: { houseId: { in: houseIds } },
      _sum: { amount: true }
    }),
    prisma.subscription.count({
      where: {
        userId: user.userId,
        status: SubscriptionStatus.ACTIVE
      }
    }),
    prisma.payment.aggregate({
      where: {
        userId: user.userId,
        status: PaymentStatus.SUCCESS
      },
      _sum: { amount: true }
    })
  ]);
  const totalExpense = totalExpenseAggregate._sum.amount ?? 0;
  const totalDeposit = totalDepositAggregate._sum.amount ?? 0;
  const [expenseTypeDistribution, months] = await Promise.all([
    prisma.expense.groupBy({
      by: ["type"],
      where: { houseId: { in: houseIds } },
      _count: {
        _all: true
      }
    }),
    prisma.month.findMany({
      where: { houseId: { in: houseIds } },
      select: { startDate: true },
      orderBy: { startDate: "asc" }
    })
  ]);
  const pieChartData = expenseTypeDistribution.map((item) => ({
    label: item.type,
    value: item._count._all
  }));
  const barChartData = buildMonthlyCountBarChart(
    months.map((month) => month.startDate)
  );
  return {
    houseCount: houseIds.length,
    memberCount,
    monthCount,
    mealCount,
    expenseCount,
    totalExpense,
    totalDeposit,
    currentBalance: Number((totalDeposit - totalExpense).toFixed(2)),
    activeSubscriptionCount,
    totalSubscriptionPaid: myPaymentAggregate._sum.amount ?? 0,
    pieChartData,
    barChartData
  };
};
var getMemberStatsData = async (user) => {
  const [
    joinedHouseCount,
    mealCount,
    depositCount,
    myDepositAggregate,
    myExpenseCount,
    myExpenseAggregate,
    activeSubscriptionCount,
    myPaymentAggregate
  ] = await Promise.all([
    prisma.houseMember.count({ where: { userId: user.userId } }),
    prisma.meal.count({ where: { userId: user.userId } }),
    prisma.deposit.count({ where: { userId: user.userId } }),
    prisma.deposit.aggregate({
      where: { userId: user.userId },
      _sum: { amount: true }
    }),
    prisma.expense.count({ where: { createdBy: user.userId } }),
    prisma.expense.aggregate({
      where: { createdBy: user.userId },
      _sum: { amount: true }
    }),
    prisma.subscription.count({
      where: {
        userId: user.userId,
        status: SubscriptionStatus.ACTIVE
      }
    }),
    prisma.payment.aggregate({
      where: {
        userId: user.userId,
        status: PaymentStatus.SUCCESS
      },
      _sum: { amount: true }
    })
  ]);
  const totalDeposit = myDepositAggregate._sum.amount ?? 0;
  const myExpense = myExpenseAggregate._sum.amount ?? 0;
  const [expenseTypeDistribution, months] = await Promise.all([
    prisma.expense.groupBy({
      by: ["type"],
      where: { createdBy: user.userId },
      _count: {
        _all: true
      }
    }),
    prisma.month.findMany({
      where: {
        house: {
          members: {
            some: {
              userId: user.userId
            }
          }
        }
      },
      select: { startDate: true },
      orderBy: { startDate: "asc" }
    })
  ]);
  const pieChartData = expenseTypeDistribution.map((item) => ({
    label: item.type,
    value: item._count._all
  }));
  const barChartData = buildMonthlyCountBarChart(
    months.map((month) => month.startDate)
  );
  return {
    joinedHouseCount,
    mealCount,
    depositCount,
    myExpenseCount,
    totalDeposit,
    myExpense,
    netContribution: Number((totalDeposit - myExpense).toFixed(2)),
    activeSubscriptionCount,
    totalSubscriptionPaid: myPaymentAggregate._sum.amount ?? 0,
    pieChartData,
    barChartData
  };
};
var getMonthlySummary = async (monthId, user) => {
  if (!monthId) {
    throw new AppError_default(status18.BAD_REQUEST, "monthId is required");
  }
  const month = await prisma.month.findUnique({
    where: { id: monthId },
    include: {
      house: {
        select: {
          id: true,
          createdBy: true,
          members: {
            where: { userId: user.userId },
            select: { role: true }
          }
        }
      }
    }
  });
  if (!month) {
    throw new AppError_default(status18.NOT_FOUND, "Month not found");
  }
  const hasAccess = user.role === UserRole.ADMIN || month.house.createdBy === user.userId || month.house.members.length > 0;
  if (!hasAccess) {
    throw new AppError_default(
      status18.FORBIDDEN,
      "You are not authorized to view this month summary"
    );
  }
  const [expenseAggregate, meals, deposits, houseMembers] = await Promise.all([
    prisma.expense.aggregate({
      where: { monthId },
      _sum: { amount: true }
    }),
    prisma.meal.findMany({
      where: { monthId },
      select: { userId: true }
    }),
    prisma.deposit.findMany({
      where: { monthId },
      select: { userId: true, amount: true }
    }),
    prisma.houseMember.findMany({
      where: { houseId: month.houseId },
      select: {
        userId: true
      }
    })
  ]);
  const totalExpense = expenseAggregate._sum.amount ?? 0;
  const totalMeals = meals.length;
  const totalDeposit = deposits.reduce(
    (sum, deposit) => sum + deposit.amount,
    0
  );
  const currentBalance = Number((totalDeposit - totalExpense).toFixed(2));
  const mealRate = totalMeals > 0 ? Number((totalExpense / totalMeals).toFixed(2)) : 0;
  const mealsMap = /* @__PURE__ */ new Map();
  for (const meal of meals) {
    mealsMap.set(meal.userId, (mealsMap.get(meal.userId) ?? 0) + 1);
  }
  const depositsMap = /* @__PURE__ */ new Map();
  for (const deposit of deposits) {
    depositsMap.set(
      deposit.userId,
      (depositsMap.get(deposit.userId) ?? 0) + deposit.amount
    );
  }
  const userIds = Array.from(
    /* @__PURE__ */ new Set([
      ...houseMembers.map((member) => member.userId),
      ...mealsMap.keys(),
      ...depositsMap.keys()
    ])
  );
  const users = userIds.map((userId) => {
    const userTotalMeals = mealsMap.get(userId) ?? 0;
    const userDeposit = depositsMap.get(userId) ?? 0;
    const userCost = Number((userTotalMeals * mealRate).toFixed(2));
    const userBalance = Number((userDeposit - userCost).toFixed(2));
    return {
      userId,
      totalMeals: userTotalMeals,
      deposit: userDeposit,
      cost: userCost,
      balance: userBalance
    };
  });
  return {
    mealRate,
    totalExpense,
    totalMeals,
    currentBalance,
    users
  };
};
var StatsService = {
  getDashboardStatsData,
  getMonthlySummary
};

// src/app/modules/stats/stats.controller.ts
import status19 from "http-status";
var getDashboardStatsData2 = catchAsync(
  async (req, res) => {
    const result = await StatsService.getDashboardStatsData(req.user);
    sendResponse(res, {
      statusCode: status19.OK,
      success: true,
      message: "Dashboard stats retrieved successfully",
      data: result
    });
  }
);
var getMonthlySummary2 = catchAsync(async (req, res) => {
  const { monthId } = req.params;
  const result = await StatsService.getMonthlySummary(
    monthId,
    req.user
  );
  sendResponse(res, {
    statusCode: status19.OK,
    success: true,
    message: "Monthly summary retrieved successfully",
    data: result
  });
});
var StatsController = {
  getDashboardStatsData: getDashboardStatsData2,
  getMonthlySummary: getMonthlySummary2
};

// src/app/modules/stats/stats.routes.ts
var router8 = Router8();
router8.get(
  "/dashboard",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER),
  StatsController.getDashboardStatsData
);
router8.get(
  "/summary/:monthId",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  StatsController.getMonthlySummary
);
var StatsRoutes = router8;

// src/app/modules/plans/plans.routes.ts
import { Router as Router9 } from "express";

// src/app/modules/plans/plans.controller.ts
import status21 from "http-status";

// src/app/modules/plans/plans.service.ts
import status20 from "http-status";
var normalizeFeatures = (features) => {
  const normalizedFeatures = features.map((feature) => feature?.trim()).filter((feature) => !!feature);
  return Array.from(new Set(normalizedFeatures));
};
var getPlans = async () => {
  return prisma.plan.findMany({
    orderBy: { createdAt: "desc" }
  });
};
var createPlan = async (payload) => {
  const name = payload.name?.trim();
  if (!name) {
    throw new AppError_default(status20.BAD_REQUEST, "Plan name is required");
  }
  if (!payload.price || payload.price <= 0) {
    throw new AppError_default(status20.BAD_REQUEST, "Price must be greater than 0");
  }
  if (!payload.durationDays || payload.durationDays <= 0) {
    throw new AppError_default(
      status20.BAD_REQUEST,
      "Duration days must be greater than 0"
    );
  }
  if (!Array.isArray(payload.features) || payload.features.length === 0) {
    throw new AppError_default(status20.BAD_REQUEST, "Features list is required");
  }
  const features = normalizeFeatures(payload.features);
  if (features.length === 0) {
    throw new AppError_default(
      status20.BAD_REQUEST,
      "Features list must contain at least one valid feature"
    );
  }
  const isPlanExists = await prisma.plan.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive"
      }
    }
  });
  if (isPlanExists) {
    throw new AppError_default(status20.CONFLICT, "Plan with this name already exists");
  }
  return prisma.plan.create({
    data: {
      name,
      price: payload.price,
      durationDays: payload.durationDays,
      features
    }
  });
};
var updatePlan = async (id, payload) => {
  const existingPlan = await prisma.plan.findUnique({ where: { id } });
  if (!existingPlan) {
    throw new AppError_default(status20.NOT_FOUND, "Plan not found");
  }
  const data = {};
  if (payload.name !== void 0) {
    const trimmedName = payload.name.trim();
    if (!trimmedName) {
      throw new AppError_default(status20.BAD_REQUEST, "Plan name cannot be empty");
    }
    const duplicatePlan = await prisma.plan.findFirst({
      where: {
        id: { not: id },
        name: {
          equals: trimmedName,
          mode: "insensitive"
        }
      }
    });
    if (duplicatePlan) {
      throw new AppError_default(
        status20.CONFLICT,
        "Another plan with this name already exists"
      );
    }
    data.name = trimmedName;
  }
  if (payload.price !== void 0) {
    if (payload.price <= 0) {
      throw new AppError_default(status20.BAD_REQUEST, "Price must be greater than 0");
    }
    data.price = payload.price;
  }
  if (payload.durationDays !== void 0) {
    if (payload.durationDays <= 0) {
      throw new AppError_default(
        status20.BAD_REQUEST,
        "Duration days must be greater than 0"
      );
    }
    data.durationDays = payload.durationDays;
  }
  if (payload.features !== void 0) {
    if (!Array.isArray(payload.features) || payload.features.length === 0) {
      throw new AppError_default(
        status20.BAD_REQUEST,
        "Features list must contain at least one feature"
      );
    }
    const features = normalizeFeatures(payload.features);
    if (features.length === 0) {
      throw new AppError_default(
        status20.BAD_REQUEST,
        "Features list must contain at least one valid feature"
      );
    }
    data.features = features;
  }
  if (Object.keys(data).length === 0) {
    throw new AppError_default(
      status20.BAD_REQUEST,
      "No valid fields provided to update"
    );
  }
  return prisma.plan.update({
    where: { id },
    data
  });
};
var deletePlan = async (id) => {
  const existingPlan = await prisma.plan.findUnique({ where: { id } });
  if (!existingPlan) {
    throw new AppError_default(status20.NOT_FOUND, "Plan not found");
  }
  return prisma.plan.delete({
    where: { id }
  });
};
var PlansService = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan
};

// src/app/modules/plans/plans.controller.ts
var getPlans2 = catchAsync(async (_req, res) => {
  const result = await PlansService.getPlans();
  sendResponse(res, {
    statusCode: status21.OK,
    success: true,
    message: "Plans retrieved successfully",
    data: result
  });
});
var createPlan2 = catchAsync(async (req, res) => {
  const result = await PlansService.createPlan(req.body);
  sendResponse(res, {
    statusCode: status21.CREATED,
    success: true,
    message: "Plan created successfully",
    data: result
  });
});
var updatePlan2 = catchAsync(async (req, res) => {
  const result = await PlansService.updatePlan(req.params.id, req.body);
  sendResponse(res, {
    statusCode: status21.OK,
    success: true,
    message: "Plan updated successfully",
    data: result
  });
});
var deletePlan2 = catchAsync(async (req, res) => {
  const result = await PlansService.deletePlan(req.params.id);
  sendResponse(res, {
    statusCode: status21.OK,
    success: true,
    message: "Plan deleted successfully",
    data: result
  });
});
var PlansController = {
  getPlans: getPlans2,
  createPlan: createPlan2,
  updatePlan: updatePlan2,
  deletePlan: deletePlan2
};

// src/app/modules/plans/plans.routes.ts
var router9 = Router9();
router9.get(
  "/",
  CheckAuth(UserRole.ADMIN, UserRole.MANAGER),
  PlansController.getPlans
);
router9.post("/", CheckAuth(UserRole.ADMIN), PlansController.createPlan);
router9.patch("/:id", CheckAuth(UserRole.ADMIN), PlansController.updatePlan);
router9.delete("/:id", CheckAuth(UserRole.ADMIN), PlansController.deletePlan);
var PlansRoutes = router9;

// src/app/modules/subscription/subscription.routes.ts
import { Router as Router10 } from "express";

// src/app/modules/subscription/subscription.controller.ts
import status23 from "http-status";

// src/app/modules/subscription/subscription.service.ts
import status22 from "http-status";
import { randomUUID } from "crypto";

// src/app/config/stripe.config.ts
import Stripe from "stripe";
var stripe = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY);

// src/app/modules/subscription/subscription.service.ts
var FREE_PLAN_FEATURES = [
  "Basic house and member management",
  "Basic meal, deposit and expense tracking",
  "Monthly summary report"
];
var getMySubscription = async (user) => {
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId: user.userId,
      status: SubscriptionStatus.ACTIVE,
      endDate: {
        gt: /* @__PURE__ */ new Date()
      }
    },
    include: {
      plan: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true
        }
      }
    }
  });
  if (!activeSubscription) {
    return {
      tier: "FREE",
      status: "ACTIVE",
      features: FREE_PLAN_FEATURES,
      subscription: null
    };
  }
  return {
    tier: activeSubscription.plan.name,
    status: activeSubscription.status,
    features: activeSubscription.plan.features,
    subscription: activeSubscription
  };
};
var initiateSubscription = async (planId, user) => {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new AppError_default(status22.NOT_FOUND, "Plan not found");
  }
  const userData = await prisma.user.findUnique({
    where: { id: user.userId }
  });
  if (!userData || userData.isDeleted) {
    throw new AppError_default(status22.NOT_FOUND, "User not found");
  }
  const [subscription, payment] = await prisma.$transaction(async (tx) => {
    const createdSubscription = await tx.subscription.create({
      data: {
        userId: user.userId,
        planId: plan.id,
        startDate: /* @__PURE__ */ new Date(),
        endDate: /* @__PURE__ */ new Date(),
        status: SubscriptionStatus.CANCELLED
      }
    });
    const createdPayment = await tx.payment.create({
      data: {
        userId: user.userId,
        subscriptionId: createdSubscription.id,
        amount: plan.price,
        transactionId: randomUUID(),
        status: PaymentStatus.PENDING
      }
    });
    return [createdSubscription, createdPayment];
  });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: userData.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${plan.name} Subscription`,
            description: `${plan.durationDays} days access`
          },
          unit_amount: Math.round(plan.price * 100)
        },
        quantity: 1
      }
    ],
    metadata: {
      planId: plan.id,
      userId: user.userId,
      subscriptionId: subscription.id,
      paymentId: payment.id
    },
    // success_url: `${envVars.FRONTEND_URL}/manager/dashboard/subscription`,
    success_url: `${envVars.FRONTEND_URL}/manager/dashboard/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/manager/dashboard`
  });
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      paymentGatewayData: session
    }
  });
  return {
    subscriptionId: subscription.id,
    paymentId: payment.id,
    paymentUrl: session.url
  };
};
var getSubscriptionList = async () => {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      plan: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true
        }
      }
    }
  });
  return subscriptions;
};
var SubscriptionService = {
  getMySubscription,
  initiateSubscription,
  getSubscriptionList
};

// src/app/modules/subscription/subscription.controller.ts
var getMySubscription2 = catchAsync(async (req, res) => {
  const result = await SubscriptionService.getMySubscription(req.user);
  sendResponse(res, {
    statusCode: status23.OK,
    success: true,
    message: "Subscription retrieved successfully",
    data: result
  });
});
var initiateSubscription2 = catchAsync(async (req, res) => {
  const result = await SubscriptionService.initiateSubscription(
    req.params.planId,
    req.user
  );
  sendResponse(res, {
    statusCode: status23.OK,
    success: true,
    message: "Subscription payment initiated successfully",
    data: result
  });
});
var getSubscriptionList2 = catchAsync(async (req, res) => {
  const result = await SubscriptionService.getSubscriptionList();
  sendResponse(res, {
    statusCode: status23.OK,
    success: true,
    message: "Subscription list retrieved successfully",
    data: result
  });
});
var SubscriptionController = {
  getMySubscription: getMySubscription2,
  initiateSubscription: initiateSubscription2,
  getSubscriptionList: getSubscriptionList2
};

// src/app/modules/subscription/subscription.routes.ts
var router10 = Router10();
router10.post(
  "/initiate-payment/:planId",
  CheckAuth(UserRole.MANAGER),
  SubscriptionController.initiateSubscription
);
router10.get(
  "/my",
  CheckAuth(UserRole.MANAGER, UserRole.MEMBER),
  SubscriptionController.getMySubscription
);
router10.get(
  "/",
  CheckAuth(UserRole.ADMIN),
  SubscriptionController.getSubscriptionList
);
var SubscriptionRoutes = router10;

// src/app/modules/payments/payments.routes.ts
import { Router as Router11 } from "express";
var router11 = Router11();
var PaymentRoutes = router11;

// src/app/modules/users/users.routes.ts
import { Router as Router12 } from "express";

// src/app/modules/users/users.controller.ts
import status25 from "http-status";

// src/app/modules/users/users.service.ts
import status24 from "http-status";
var userListSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  status: true,
  emailVerified: true,
  needPasswordChange: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true
};
var getAllUsers = async () => {
  return prisma.user.findMany({
    where: {
      role: {
        not: UserRole.ADMIN
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    select: userListSelect
  });
};
var getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userListSelect
  });
  if (!user) {
    throw new AppError_default(status24.NOT_FOUND, "User not found");
  }
  return user;
};
var deleteUser = async (id) => {
  const existingUser = await prisma.user.findUnique({
    where: { id }
  });
  if (!existingUser) {
    throw new AppError_default(status24.NOT_FOUND, "User not found");
  }
  if (existingUser.role === UserRole.ADMIN) {
    throw new AppError_default(status24.BAD_REQUEST, "Admin user cannot be deleted");
  }
  if (existingUser.isDeleted) {
    throw new AppError_default(status24.BAD_REQUEST, "User is already deleted");
  }
  return prisma.user.update({
    where: { id },
    data: {
      isDeleted: true
    },
    select: userListSelect
  });
};
var updateUserStatus = async (id, userStatus) => {
  const existingUser = await prisma.user.findUnique({
    where: { id }
  });
  if (!existingUser) {
    throw new AppError_default(status24.NOT_FOUND, "User not found");
  }
  const normalizedStatus = userStatus?.toUpperCase().trim();
  if (!Object.values(UserStatus).includes(normalizedStatus)) {
    throw new AppError_default(
      status24.BAD_REQUEST,
      "Invalid status. Allowed values: ACTIVE, INACTIVE, SUSPENDED"
    );
  }
  return prisma.user.update({
    where: { id },
    data: {
      status: normalizedStatus
    },
    select: userListSelect
  });
};
var UsersService = {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserStatus
};

// src/app/modules/users/users.controller.ts
var getAllUsers2 = catchAsync(async (req, res) => {
  const result = await UsersService.getAllUsers();
  sendResponse(res, {
    statusCode: status25.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result
  });
});
var getUserById2 = catchAsync(async (req, res) => {
  const result = await UsersService.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: status25.OK,
    success: true,
    message: "User retrieved successfully",
    data: result
  });
});
var deleteUser2 = catchAsync(async (req, res) => {
  const result = await UsersService.deleteUser(req.params.id);
  sendResponse(res, {
    statusCode: status25.OK,
    success: true,
    message: "User deleted successfully",
    data: result
  });
});
var updateUserStatus2 = catchAsync(async (req, res) => {
  const result = await UsersService.updateUserStatus(
    req.params.id,
    req.body.status
  );
  sendResponse(res, {
    statusCode: status25.OK,
    success: true,
    message: "User status updated successfully",
    data: result
  });
});
var UsersController = {
  getAllUsers: getAllUsers2,
  getUserById: getUserById2,
  deleteUser: deleteUser2,
  updateUserStatus: updateUserStatus2
};

// src/app/modules/users/users.routes.ts
var router12 = Router12();
router12.get("/", CheckAuth(UserRole.ADMIN), UsersController.getAllUsers);
router12.get("/:id", CheckAuth(UserRole.ADMIN), UsersController.getUserById);
router12.patch(
  "/update-status/:id",
  CheckAuth(UserRole.ADMIN),
  UsersController.updateUserStatus
);
router12.delete(
  "/delete/:id",
  CheckAuth(UserRole.ADMIN),
  UsersController.deleteUser
);
var UsersRoutes = router12;

// src/app/routes/index.ts
var router13 = Router13();
router13.use("/auth", AuthRouter);
router13.use("/houses", HousesRoutes);
router13.use("/house-members", MembersRoutes);
router13.use("/months", MonthRoutes);
router13.use("/meals", MealRoutes);
router13.use("/deposits", DepositRoutes);
router13.use("/expenses", ExpensesRoutes);
router13.use("/stats", StatsRoutes);
router13.use("/plans", PlansRoutes);
router13.use("/subscription", SubscriptionRoutes);
router13.use("/payments", PaymentRoutes);
router13.use("/users", UsersRoutes);
var IndexRouter = router13;

// src/app/middleware/notFound.ts
import status26 from "http-status";
var notFound = (req, res) => {
  res.status(status26.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} Not Found`
  });
};

// src/app.ts
import cookieParser from "cookie-parser";
import path3 from "path";
import cors from "cors";
import qs from "qs";
import { toNodeHandler } from "better-auth/node";

// src/app/middleware/globalErrorHandler.ts
import status29 from "http-status";
import z from "zod";

// src/app/errorHelpers/handleZodError.ts
import status27 from "http-status";
var handleZodError = (err) => {
  const statusCode = status27.BAD_REQUEST;
  const message = "Zod validation message";
  const errorSources = [];
  err.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join(" "),
      message: issue.message
    });
  });
  return {
    success: false,
    statusCode,
    message,
    errorSources
  };
};

// src/app/errorHelpers/handlePrismaError.ts
import status28 from "http-status";
var getStatusCodeFromPrismaError = (errorCode) => {
  if (errorCode === "P2002") {
    return status28.CONFLICT;
  }
  if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
    return status28.NOT_FOUND;
  }
  if (["P1000", "P6002"].includes(errorCode)) {
    return status28.UNAUTHORIZED;
  }
  if (["P1010", "P6010"].includes(errorCode)) {
    return status28.FORBIDDEN;
  }
  if (errorCode === "P6003") {
    return status28.PAYMENT_REQUIRED;
  }
  if (["P1008", "P2004", "P6004"].includes(errorCode)) {
    return status28.GATEWAY_TIMEOUT;
  }
  if (errorCode === "P5011") {
    return status28.TOO_MANY_REQUESTS;
  }
  if (errorCode === "P6009") {
    return 413;
  }
  if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) {
    return status28.SERVICE_UNAVAILABLE;
  }
  if (errorCode.startsWith("P2")) {
    return status28.BAD_REQUEST;
  }
  if (errorCode.startsWith("P3") || errorCode.startsWith("P4")) {
    return status28.INTERNAL_SERVER_ERROR;
  }
  return status28.INTERNAL_SERVER_ERROR;
};
var formatErrorMeta = (meta) => {
  if (!meta) return "";
  const parts = [];
  if (meta.target) {
    parts.push(`Field(s): ${String(meta.target)}`);
  }
  if (meta.field_name) {
    parts.push(`Field: ${String(meta.field_name)}`);
  }
  if (meta.column_name) {
    parts.push(`Column: ${String(meta.column_name)}`);
  }
  if (meta.table) {
    parts.push(`Table: ${String(meta.table)}`);
  }
  if (meta.model_name) {
    parts.push(`Model: ${String(meta.model_name)}`);
  }
  if (meta.relation_name) {
    parts.push(`Relation: ${String(meta.relation_name)}`);
  }
  if (meta.constraint) {
    parts.push(`Constraint: ${String(meta.constraint)}`);
  }
  if (meta.database_error) {
    parts.push(`Database Error: ${String(meta.database_error)}`);
  }
  return parts.length > 0 ? parts.join(" |") : "";
};
var handlePrismaClientKnownRequestError = (error) => {
  const statusCode = getStatusCodeFromPrismaError(error.code);
  const metaInfo = formatErrorMeta(error.meta);
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred with the database operation.";
  const errorSources = [
    {
      path: error.code,
      message: metaInfo ? `${mainMessage} | ${metaInfo}` : mainMessage
    }
  ];
  if (error.meta?.cause) {
    errorSources.push({
      path: "cause",
      message: String(error.meta.cause)
    });
  }
  return {
    success: false,
    statusCode,
    message: `Prisma Client Known Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientUnknownError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An unknown error occurred with the database operation.";
  const errorSources = [
    {
      path: "Unknown Prisma Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode: status28.INTERNAL_SERVER_ERROR,
    message: `Prisma Client Unknown Request Error: ${mainMessage}`,
    errorSources
  };
};
var handlePrismaClientValidationError = (error) => {
  let cleanMessage = error.message;
  cleanMessage = cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const errorSources = [];
  const fieldMatch = cleanMessage.match(/Argument `(\w+)`/i);
  const fieldName = fieldMatch ? fieldMatch[1] : "Unknown Field";
  const mainMessage = lines.find(
    (line) => !line.includes("Argument") && !line.includes("\u2192") && line.length > 10
  ) || lines[0] || "Invalid query parameters provided to the database operation.";
  errorSources.push({
    path: fieldName,
    message: mainMessage
  });
  return {
    success: false,
    statusCode: status28.BAD_REQUEST,
    message: `Prisma Client Validation Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientInitializationError = (error) => {
  const statusCode = error.errorCode ? getStatusCodeFromPrismaError(error.errorCode) : status28.SERVICE_UNAVAILABLE;
  const cleanMessage = error.message;
  cleanMessage.replace(/Invalid `.*?` invocation:?\s*/i, "");
  const lines = cleanMessage.split("\n").filter((line) => line.trim());
  const mainMessage = lines[0] || "An error occurred while initializing the Prisma Client.";
  const errorSources = [
    {
      path: error.errorCode || "Initialization Error",
      message: mainMessage
    }
  ];
  return {
    success: false,
    statusCode,
    message: `Prisma Client Initialization Error: ${mainMessage}`,
    errorSources
  };
};
var handlerPrismaClientRustPanicError = () => {
  const errorSources = [{
    path: "Rust Engine Crashed",
    message: "The database engine encountered a fatal error and crashed. This is usually due to an internal bug in the Prisma engine or an unexpected edge case in the database operation. Please check the Prisma logs for more details and consider reporting this issue to the Prisma team if it persists."
  }];
  return {
    success: false,
    statusCode: status28.INTERNAL_SERVER_ERROR,
    message: "Prisma Client Rust Panic Error: The database engine crashed due to a fatal error.",
    errorSources
  };
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = async (err, req, res, next) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler", err);
  }
  let statusCode = status29.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  let errorSources = [];
  let stack = void 0;
  if (req.file) {
    try {
      await deleteFileFromCloudinary(req.file.path);
    } catch (error) {
      console.error("Error deleting file from Cloudinary:", error);
    }
  }
  if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    const simplifiedError = handlePrismaClientUnknownError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    const simplifiedError = handlePrismaClientValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientRustPanicError) {
    const simplifiedError = handlerPrismaClientRustPanicError();
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    const simplifiedError = handlerPrismaClientInitializationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
    stack = err.stack;
  } else if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources];
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  } else if (err instanceof Error) {
    statusCode = status29.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message
      }
    ];
  }
  const errorResponse = {
    success: false,
    message,
    errorSources,
    error: envVars.NODE_ENV === `development` ? err : void 0,
    stack: envVars.NODE_ENV === `development` ? stack : void 0
  };
  res.status(statusCode).json(errorResponse);
};

// src/app/modules/payments/payments.controller.ts
import status30 from "http-status";

// src/app/modules/payments/payments.service.ts
var addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
var handlerStripeWebhookEvent = async (event) => {
  const isPaymentExist = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id
    }
  });
  if (isPaymentExist) {
    return { message: `Event ${event.id} already processed. Skipping` };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;
      const subscriptionId = session.metadata?.subscriptionId;
      if (!paymentId || !subscriptionId) {
        return { message: "Missing payment/subscription metadata" };
      }
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          subscription: {
            include: {
              plan: true
            }
          }
        }
      });
      if (!payment) {
        return { message: `Payment ${paymentId} not found` };
      }
      const isPaid = session.payment_status === "paid";
      await prisma.$transaction(async (tx) => {
        if (isPaid) {
          await tx.subscription.updateMany({
            where: {
              userId: payment.userId,
              status: SubscriptionStatus.ACTIVE,
              id: { not: payment.subscriptionId }
            },
            data: {
              status: SubscriptionStatus.EXPIRED
            }
          });
          const startDate = /* @__PURE__ */ new Date();
          const endDate = addDays(
            startDate,
            payment.subscription.plan.durationDays
          );
          await tx.subscription.update({
            where: {
              id: payment.subscriptionId
            },
            data: {
              status: SubscriptionStatus.ACTIVE,
              startDate,
              endDate
            }
          });
          await tx.payment.update({
            where: {
              id: paymentId
            },
            data: {
              stripeEventId: event.id,
              status: PaymentStatus.SUCCESS,
              paymentGatewayData: session
            }
          });
        } else {
          await tx.subscription.update({
            where: {
              id: payment.subscriptionId
            },
            data: {
              status: SubscriptionStatus.CANCELLED
            }
          });
          await tx.payment.update({
            where: {
              id: paymentId
            },
            data: {
              stripeEventId: event.id,
              status: PaymentStatus.FAILED,
              paymentGatewayData: session
            }
          });
        }
      });
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      const paymentId = session.metadata?.paymentId;
      const subscriptionId = session.metadata?.subscriptionId;
      if (paymentId && subscriptionId) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: paymentId },
            data: {
              stripeEventId: event.id,
              status: PaymentStatus.FAILED,
              paymentGatewayData: session
            }
          });
          await tx.subscription.update({
            where: { id: subscriptionId },
            data: {
              status: SubscriptionStatus.CANCELLED
            }
          });
        });
      }
      break;
    }
    default:
      break;
  }
  return { message: `Webhook Event ${event.id} processed successfully` };
};
var PaymentService = {
  handlerStripeWebhookEvent
};

// src/app/modules/payments/payments.controller.ts
var handlerStripeWebhookEvent2 = catchAsync(
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;
    if (!signature || !webhookSecret) {
      return res.status(status30.BAD_REQUEST).json({ message: "Missing Stripe signature or webhook secret" });
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch {
      return res.status(status30.BAD_REQUEST).json({ message: "Error processing Stripe webhook" });
    }
    const result = await PaymentService.handlerStripeWebhookEvent(event);
    sendResponse(res, {
      statusCode: status30.OK,
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result
    });
  }
);
var PaymentController = {
  handlerStripeWebhookEvent: handlerStripeWebhookEvent2
};

// src/app.ts
var app = express();
app.set("query parser", (str) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path3.resolve(process.cwd(), `src/app/templates`));
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handlerStripeWebhookEvent
);
app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:4000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
  })
);
app.use("/api/auth", toNodeHandler(auth));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", IndexRouter);
app.get("/", (req, res) => {
  res.send("SplitEase - Smart Expense management!");
});
app.use(notFound);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var server;
var bootstrap = async () => {
  try {
    server = app_default.listen(envVars.PORT, () => {
      console.log(`Server is running on http://localhost:${envVars.PORT}`);
    });
  } catch (error) {
    console.error("An error occur", error);
  }
};
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received. Shutting down server...");
  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(1);
    });
  }
});
process.on("SIGINT", () => {
  console.log("SIGINT signal received. Shutting down server...");
  if (server) {
    server.close(() => {
      console.log("Server closed gracefully.");
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception Detected... Shutting down server", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
process.on("unhandledRejection", (error) => {
  console.log("Unhandled Rejection Detected... Shutting down server", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
bootstrap();
