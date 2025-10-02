import { describe, it, expect } from 'vitest';
import {
  getFormFieldConfig,
  getFormFields,
  validateFormData,
  prepareFormData,
  formatDateForInput,
  formatDateForDisplay,
} from './form-utils.js';

describe('form-utils', () => {
  describe('getFormFieldConfig', () => {
    it('should return null for system fields except id', () => {
      /** @type {import('./index.js').CollectionField} */
      const systemField = {
        id: 'sys1',
        name: 'created',
        type: 'date',
        system: true,
        required: false,
        presentable: false,
      };

      expect(getFormFieldConfig(systemField)).toBeNull();
    });

    it('should handle id field specially', () => {
      /** @type {import('./index.js').CollectionField} */
      const idField = {
        id: 'id',
        name: 'id',
        type: 'text',
        system: true,
        required: true,
        presentable: false,
      };

      const config = getFormFieldConfig(idField);
      expect(config).toMatchObject({
        name: 'id',
        type: 'text',
        required: false,
        label: 'ID',
      });
    });

    it('should handle text fields', () => {
      /** @type {import('./index.js').CollectionField} */
      const textField = {
        id: 'f1',
        name: 'title',
        type: 'text',
        system: false,
        required: true,
        presentable: true,
        options: { pattern: '^[A-Z]' },
      };

      const config = getFormFieldConfig(textField);
      expect(config).toMatchObject({
        name: 'title',
        type: 'text',
        required: true,
        label: 'Title',
        pattern: '^[A-Z]',
      });
    });

    it('should handle number fields with min/max', () => {
      /** @type {import('./index.js').CollectionField} */
      const numberField = {
        id: 'f1',
        name: 'age',
        type: 'number',
        system: false,
        required: true,
        presentable: true,
        options: { min: 0, max: 120 },
      };

      const config = getFormFieldConfig(numberField);
      expect(config).toMatchObject({
        name: 'age',
        type: 'number',
        required: true,
        label: 'Age',
        min: 0,
        max: 120,
      });
    });

    it('should handle boolean fields', () => {
      /** @type {import('./index.js').CollectionField} */
      const boolField = {
        id: 'f1',
        name: 'active',
        type: 'bool',
        system: false,
        required: false,
        presentable: true,
      };

      const config = getFormFieldConfig(boolField);
      expect(config).toMatchObject({
        name: 'active',
        type: 'checkbox',
        required: false,
        label: 'Active',
      });
    });

    it('should handle select fields', () => {
      /** @type {import('./index.js').CollectionField} */
      const selectField = {
        id: 'f1',
        name: 'category',
        type: 'select',
        system: false,
        required: true,
        presentable: true,
        options: {
          values: ['tech', 'design', 'business'],
          maxSelect: 1,
        },
      };

      const config = getFormFieldConfig(selectField);
      expect(config).toMatchObject({
        name: 'category',
        type: 'select',
        required: true,
        label: 'Category',
        options: ['tech', 'design', 'business'],
        multiple: false,
      });
    });

    it('should handle multi-select fields', () => {
      /** @type {import('./index.js').CollectionField} */
      const multiSelectField = {
        id: 'f1',
        name: 'tags',
        type: 'select',
        system: false,
        required: false,
        presentable: true,
        options: {
          values: ['red', 'blue', 'green'],
          maxSelect: 3,
        },
      };

      const config = getFormFieldConfig(multiSelectField);
      expect(config).toMatchObject({
        name: 'tags',
        type: 'select',
        required: false,
        label: 'Tags',
        options: ['red', 'blue', 'green'],
        multiple: true,
      });
    });

    it('should handle editor fields as textarea', () => {
      /** @type {import('./index.js').CollectionField} */
      const editorField = {
        id: 'f1',
        name: 'content',
        type: 'editor',
        system: false,
        required: true,
        presentable: true,
      };

      const config = getFormFieldConfig(editorField);
      expect(config).toMatchObject({
        name: 'content',
        type: 'textarea',
        required: true,
        label: 'Content',
        rows: 8,
      });
    });

    it('should handle JSON fields', () => {
      /** @type {import('./index.js').CollectionField} */
      const jsonField = {
        id: 'f1',
        name: 'metadata',
        type: 'json',
        system: false,
        required: false,
        presentable: true,
      };

      const config = getFormFieldConfig(jsonField);
      expect(config).toMatchObject({
        name: 'metadata',
        type: 'textarea',
        required: false,
        label: 'Metadata',
        rows: 4,
        placeholder: 'Enter JSON data',
      });
    });
  });

  describe('getFormFields', () => {
    it('should filter out system fields and return form configs', () => {
      /** @type {import('./index.js').CollectionField[]} */
      const schema = [
        {
          id: 'id',
          name: 'id',
          type: 'text',
          system: true,
          required: true,
          presentable: false,
        },
        {
          id: 'created',
          name: 'created',
          type: 'date',
          system: true,
          required: true,
          presentable: false,
        },
        {
          id: 'f1',
          name: 'title',
          type: 'text',
          system: false,
          required: true,
          presentable: true,
        },
      ];

      const formFields = getFormFields(schema);
      expect(formFields).toHaveLength(2);
      expect(formFields[0].name).toBe('id');
      expect(formFields[1].name).toBe('title');
    });
  });

  describe('validateFormData', () => {
    /** @type {import('./index.js').CollectionField[]} */
    const schema = [
      {
        id: 'f1',
        name: 'email',
        type: 'email',
        system: false,
        required: true,
        presentable: true,
      },
      {
        id: 'f2',
        name: 'age',
        type: 'number',
        system: false,
        required: false,
        presentable: true,
        options: { min: 0, max: 120 },
      },
      {
        id: 'f3',
        name: 'website',
        type: 'url',
        system: false,
        required: false,
        presentable: true,
      },
    ];

    it('should return errors for required fields', () => {
      const data = { age: 25 };
      const errors = validateFormData(data, schema);
      expect(errors).toContain('email is required');
    });

    it('should validate email format', () => {
      const data = { email: 'invalid-email' };
      const errors = validateFormData(data, schema);
      expect(errors).toContain('email must be a valid email address');
    });

    it('should validate number ranges', () => {
      const data = { email: 'test@example.com', age: 150 };
      const errors = validateFormData(data, schema);
      expect(errors).toContain('age must be at most 120');

      const data2 = { email: 'test@example.com', age: -5 };
      const errors2 = validateFormData(data2, schema);
      expect(errors2).toContain('age must be at least 0');
    });

    it('should validate URL format', () => {
      const data = { email: 'test@example.com', website: 'not-a-url' };
      const errors = validateFormData(data, schema);
      expect(errors).toContain('website must be a valid URL');
    });

    it('should return empty array for valid data', () => {
      const data = {
        email: 'test@example.com',
        age: 25,
        website: 'https://example.com',
      };
      const errors = validateFormData(data, schema);
      expect(errors).toHaveLength(0);
    });
  });

  describe('prepareFormData', () => {
    /** @type {import('./index.js').CollectionField[]} */
    const schema = [
      {
        id: 'id',
        name: 'id',
        type: 'text',
        system: true,
        required: true,
        presentable: false,
      },
      {
        id: 'f1',
        name: 'age',
        type: 'number',
        system: false,
        required: false,
        presentable: true,
      },
      {
        id: 'f1b',
        name: 'readingTime',
        type: 'number',
        system: false,
        required: false,
        presentable: true,
      },
      {
        id: 'f2',
        name: 'active',
        type: 'bool',
        system: false,
        required: false,
        presentable: true,
      },
      {
        id: 'f3',
        name: 'metadata',
        type: 'json',
        system: false,
        required: false,
        presentable: true,
      },
      {
        id: 'f4',
        name: 'tags',
        type: 'select',
        system: false,
        required: false,
        presentable: true,
        options: { maxSelect: 3 },
      },
      {
        id: 'f5',
        name: 'category',
        type: 'select',
        system: false,
        required: false,
        presentable: true,
        options: { maxSelect: 1 },
      },
    ];

    it('should skip undefined and null values', () => {
      const data = { age: undefined, active: null };
      const prepared = prepareFormData(data, schema);
      expect(prepared).not.toHaveProperty('age');
      expect(prepared).not.toHaveProperty('active');
    });

    it('should convert number strings to numbers', () => {
      const data = { age: '25' };
      const prepared = prepareFormData(data, schema);
      expect(prepared.age).toBe(25);
    });

    it('should omit empty number strings for optional fields', () => {
      const data = { age: '' };
      const prepared = prepareFormData(data, schema);
      expect(prepared.age).toBeUndefined();
      expect(prepared).not.toHaveProperty('age');
    });

    it('should exclude empty number fields completely', () => {
      /** @type {import('./index.js').CollectionField[]} */
      const requiredSchema = [
        {
          id: 'f1',
          name: 'requiredAge',
          type: 'number',
          system: false,
          required: true,
          presentable: true,
        },
      ];

      const data = { requiredAge: '' };
      const prepared = prepareFormData(data, requiredSchema);
      expect(prepared).not.toHaveProperty('requiredAge');
      expect(Object.keys(prepared)).toHaveLength(0);
    });

    it('should include valid number values', () => {
      const data = { age: '25', readingTime: '5' };
      const prepared = prepareFormData(data, schema);
      expect(prepared.age).toBe(25);
      expect(prepared.readingTime).toBe(5);
    });

    it('should exclude NaN number values', () => {
      const data = { age: 'not-a-number', readingTime: '5' };
      const prepared = prepareFormData(data, schema);
      expect(prepared).not.toHaveProperty('age');
      expect(prepared.readingTime).toBe(5);
    });

    it('should convert boolean values', () => {
      const data = { active: true };
      const prepared = prepareFormData(data, schema);
      expect(prepared.active).toBe(true);

      const data2 = { active: false };
      const prepared2 = prepareFormData(data2, schema);
      expect(prepared2.active).toBe(false);
    });

    it('should parse JSON strings', () => {
      const data = { metadata: '{"key": "value"}' };
      const prepared = prepareFormData(data, schema);
      expect(prepared.metadata).toEqual({ key: 'value' });
    });

    it('should handle invalid JSON gracefully', () => {
      const data = { metadata: '{invalid json' };
      const prepared = prepareFormData(data, schema);
      expect(prepared.metadata).toBe('{invalid json');
    });

    it('should handle single-select fields', () => {
      const data = { category: 'tech' };
      const prepared = prepareFormData(data, schema);
      expect(prepared.category).toBe('tech');
    });

    it('should handle multi-select fields', () => {
      const data = { tags: ['red', 'blue'] };
      const prepared = prepareFormData(data, schema);
      expect(prepared.tags).toEqual(['red', 'blue']);
    });
  });

  describe('date formatting', () => {
    describe('formatDateForInput', () => {
      it('should format ISO date string for HTML input', () => {
        const isoDate = '2023-12-25T10:30:00.000Z';
        const result = formatDateForInput(isoDate);
        expect(result).toBe('2023-12-25');
      });

      it('should handle empty strings', () => {
        expect(formatDateForInput('')).toBe('');
        expect(formatDateForInput(null)).toBe('');
        expect(formatDateForInput(undefined)).toBe('');
      });

      it('should handle invalid dates', () => {
        expect(formatDateForInput('invalid-date')).toBe('');
      });
    });

    describe('formatDateForDisplay', () => {
      it('should format ISO date string for display', () => {
        const isoDate = '2023-12-25T10:30:00.000Z';
        const result = formatDateForDisplay(isoDate);
        expect(result).toBe('12/25/2023');
      });

      it('should handle empty strings', () => {
        expect(formatDateForDisplay('')).toBe('');
        expect(formatDateForDisplay(null)).toBe('');
        expect(formatDateForDisplay(undefined)).toBe('');
      });

      it('should handle invalid dates', () => {
        expect(formatDateForDisplay('invalid-date')).toBe('');
      });
    });
  });
});
