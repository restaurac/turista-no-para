export const ENV = {
  appId: process.env.VITE_APP_ID ?? "turista-no-para",
  cookieSecret: process.env.JWT_SECRET ?? "a-very-secret-key-change-me",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "admin-user",
};
