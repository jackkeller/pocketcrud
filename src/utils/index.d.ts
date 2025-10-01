import PocketBase from 'pocketbase';

export interface CrudOptions {
  url: string;
  authStore?: PocketBase['authStore'];
}

export interface QueryOptions {
  filter?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  expand?: string;
}

export interface CollectionField {
  id: string;
  name: string;
  type: string;
  system: boolean;
  required: boolean;
  presentable: boolean;
  unique?: boolean;
  options?: {
    min?: number;
    max?: number;
    pattern?: string;
    values?: string[];
    maxSelect?: number;
    cascadeDelete?: boolean;
    minSelect?: number;
    displayFields?: string[];
    collectionId?: string;
  };
}

export interface CollectionSchema {
  id: string;
  name: string;
  type: 'base' | 'auth' | 'view';
  system: boolean;
  schema: CollectionField[];
  indexes: string[];
  listRule?: string | null;
  viewRule?: string | null;
  createRule?: string | null;
  updateRule?: string | null;
  deleteRule?: string | null;
  options?: Record<string, unknown> | null;
}

export declare class PocketCrud {
  constructor(options: CrudOptions);

  create<T = Record<string, unknown>>(
    collection: string,
    data: Record<string, unknown>
  ): Promise<T>;
  getOne<T = Record<string, unknown>>(
    collection: string,
    id: string,
    options?: Pick<QueryOptions, 'expand'>
  ): Promise<T>;
  getList<T = Record<string, unknown>>(
    collection: string,
    options?: QueryOptions
  ): Promise<{ items: T[]; page: number; perPage: number; totalItems: number; totalPages: number }>;
  getFullList<T = Record<string, unknown>>(
    collection: string,
    options?: Omit<QueryOptions, 'page' | 'perPage'>
  ): Promise<T[]>;
  update<T = Record<string, unknown>>(
    collection: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<T>;
  delete(collection: string, id: string): Promise<boolean>;

  getCollections(): Promise<CollectionSchema[]>;
  getAccessibleCollections(): Promise<CollectionSchema[]>;
  getCollection(idOrName: string): Promise<CollectionSchema>;
  getCollectionSchema(idOrName: string): Promise<CollectionField[]>;

  createAdmin(
    email: string,
    password: string
  ): Promise<{ id: string; email: string; created: string; updated: string }>;
  isAdminUser(): Promise<boolean>;

  get client(): PocketBase;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  value?: string;
  options?: string[];
  accept?: string;
  min?: number;
  max?: number;
  pattern?: string;
  multiple?: boolean;
  rows?: number;
}

export type FieldOverrides = Record<string, Partial<FormFieldConfig>>;

export declare function getFormFieldConfig(
  field: CollectionField,
  overrides?: FieldOverrides
): FormFieldConfig | null;
export declare function getFormFields(
  schema: CollectionField[],
  overrides?: FieldOverrides
): FormFieldConfig[];
export declare function validateFormData(
  data: Record<string, unknown>,
  schema: CollectionField[]
): string[];
export declare function prepareFormData(
  data: Record<string, unknown>,
  schema: CollectionField[]
): Record<string, unknown>;
export declare function formatDateForInput(isoDateString: string): string;
export declare function formatDateForDisplay(isoDateString: string): string;

export default PocketCrud;
