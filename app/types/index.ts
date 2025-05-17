import { Category, Product, Prisma } from "@prisma/client";

// Base types from Prisma
export type { Category, Product };

// Extended types with relationships
export type CategoryWithRelations = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  products: Product[];
  parent: Category | null;
  children: Category[];
  _count: {
    products: number;
  };
};

// Type for category with parent only
export type CategoryWithParent = {
  id: string;
  name: string;
  parentId: string | null;
  parent: {
    id: string;
    name: string;
  } | null;
};

// Custom select type for category queries
export type CategorySelect = {
  id: true;
  name: true;
  parentId: true;
  createdAt: true;
  updatedAt: true;
  products?: boolean;
  parent?: boolean;
  children?: boolean;
  _count?: {
    select: {
      products: true;
    };
  };
};

// Type for category where input in Prisma queries
export type CategoryWhereInput = {
  id?: string;
  name?: string;
  parentId?: string | null;
};

// Type for category include in Prisma queries
export type CategoryIncludeType = {
  products?: boolean;
  parent?: boolean;
  children?: boolean;
  _count?: {
    select: {
      products: true;
    };
  };
};

// Type for category create input in Prisma queries
export type CategoryCreateInput = Prisma.CategoryCreateInput;

// Type for category update input in Prisma queries
export type CategoryUpdateInput = Prisma.CategoryUpdateInput;
