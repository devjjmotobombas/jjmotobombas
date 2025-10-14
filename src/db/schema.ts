import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

//Schema de usuários
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified"),
  avatarImageURL: text("avatar_image_url"),
  phone: text("phone_number").unique(),
  docNumber: text("doc_number").unique(),
  enterpriseId: uuid("enterprise_id")
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

//Schema de sessões
export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

//Schema de contas
export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

//Schema de verificações
export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

//Relações da tabela de usuários
export const usersTableRelations = relations(usersTable, ({ one }) => ({
  enterprise: one(enterprisesTable, {
    fields: [usersTable.enterpriseId],
    references: [enterprisesTable.id],
  }),
}));

//Tabela de empresas
export const enterprisesTable = pgTable("enterprises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  cep: text("cep").notNull(),
  address: text("address").notNull(),
  number: text("number").notNull(),
  complement: text("complement"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  instagramURL: text("instagram_url"),
  phoneNumber: text("phone_number").notNull(),
  register: text("register").notNull(),
  avatarImageURL: text("avatar_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Relações da tabela de empresas
export const enterpriseTablesRelations = relations(
  enterprisesTable,
  ({ many }) => ({
    users: many(usersTable),
    clients: many(clientsTable),
  }),
);

//Schema de clientes

//Tabela de clientes
export const clientsTable = pgTable("clients", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  //Relationships
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
});

//Relações da tabela de clientes
export const clientsTableRelations = relations(clientsTable, ({ one }) => ({
  enterprise: one(enterprisesTable, {
    fields: [clientsTable.enterpriseId],
    references: [enterprisesTable.id],
  }),
}));

//Schema de produtos

//Tabela de produtos
export const productsTable = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  imageURL: text("image_url"),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  quantity: integer("quantity"),
  publishForSale: boolean("publish_for_sale").default(false),
  purchasePriceInCents: integer("purchase_price_in_cents"),
  salePriceInCents: integer("sale_price_in_cents").notNull(),
  quantity_in_stock: integer("quantity_in_stock").default(0),
  stockValueInCents: integer("stock_value_in_cents").default(0),
  stock_status: text("stock_status").default("in_stock"),
  code: text("code"),
  isService: boolean("is_service").default(false),
  supplierId: uuid("supplier_id")
    .references(() => suppliersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  //Relationships
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
});

//Relações da tabela de produtos
export const productsTableRelations = relations(productsTable, ({ one, many }) => ({
  enterprise: one(enterprisesTable, {
    fields: [productsTable.enterpriseId],
    references: [enterprisesTable.id],
  }),
  supplier: one(suppliersTable, {
    fields: [productsTable.supplierId],
    references: [suppliersTable.id],
  }),
  saleItems: many(saleItemsTable),
}));

//Schema de movimentações de estoque

//Tabela de movimentações de estoque
export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
  movementType: text("movement_type", { enum: ["entry", "exit"] }).notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

//Schema de fornecedores

//Tabela de fornecedores
export const suppliersTable = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  //Relationships
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
});

//Relações da tabela de fornecedores
export const suppliersTableRelations = relations(suppliersTable, ({ one }) => ({
  enterprise: one(enterprisesTable, {
    fields: [suppliersTable.enterpriseId],
    references: [enterprisesTable.id],
  }),
}));

//Schema de orçamentos

//Tabela de orçamentos
export const budgetsTable = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  items: jsonb("items").notNull(),
  totalInCents: integer("total_in_cents").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  status: text("status").notNull().default("offered"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clientsTable.id, { onDelete: "cascade" }),
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprisesTable.id, { onDelete: "cascade" }),
});

//Relações da tabela de orçamentos
export const budgetsTableRelations = relations(budgetsTable, ({ one }) => ({
  client: one(clientsTable, {
    fields: [budgetsTable.clientId],
    references: [clientsTable.id],
  }),
  enterprise: one(enterprisesTable, {
    fields: [budgetsTable.enterpriseId],
    references: [enterprisesTable.id],
  }),
}));

//Schema de Vendas

//Tabela de vendas
export const salesTable = pgTable("sales", {
  id: uuid("id").defaultRandom().primaryKey(),
  items: jsonb("items").notNull(),
  total: integer("total").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  budgetId: uuid("budget_id")
    .references(() => budgetsTable.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clientsTable.id, { onDelete: "cascade" }),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Relações da tabela de vendas
export const salesTableRelations = relations(salesTable, ({ many, one }) => ({
  saleItems: many(saleItemsTable),
  client: one(clientsTable, {
    fields: [salesTable.clientId],
    references: [clientsTable.id],
  }),
}));

//Tabela de itens de venda
export const saleItemsTable = pgTable("sale_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  productQty: integer("product_qty").notNull(),
  productPrice: integer("product_price").notNull(),
  //Relationships
  saleId: uuid("sale_id")
    .notNull()
    .references(() => salesTable.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => productsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

//Relações da tabela de itens de venda
export const saleItemsTableRelations = relations(saleItemsTable, ({ one }) => ({
  sale: one(salesTable, {
    fields: [saleItemsTable.saleId],
    references: [salesTable.id],
  }),
  product: one(productsTable, {
    fields: [saleItemsTable.productId],
    references: [productsTable.id],
  }),
}));