/**
 * @typedef {import('./index.js').CollectionField} CollectionField
 */

/**
 * @typedef {Object} FormFieldConfig
 * @property {string} name
 * @property {string} label
 * @property {string} type
 * @property {boolean} required
 * @property {string} [placeholder]
 * @property {string} [value]
 * @property {string[]} [options]
 * @property {string} [accept]
 * @property {number} [min]
 * @property {number} [max]
 * @property {string} [pattern]
 * @property {boolean} [multiple]
 * @property {number} [rows]
 */

/**
 * @typedef {Record<string, Partial<FormFieldConfig>>} FieldOverrides
 */

/**
 * @param {CollectionField} field
 * @param {FieldOverrides} [overrides]
 * @returns {FormFieldConfig | null}
 */
export function getFormFieldConfig(field, overrides) {
  if (field.system && field.name !== 'id') {
    return null;
  }

  /** @type {FormFieldConfig} */
  const baseConfig = {
    name: field.name,
    label: field.name.charAt(0).toUpperCase() + field.name.slice(1),
    type: 'text',
    required: field.required,
    placeholder: `Enter ${field.name}`,
    value: ''
  };

  // Configure input type based on field type
  switch (field.type) {
    case 'email':
      baseConfig.type = 'email';
      baseConfig.placeholder = 'Enter email address';
      break;
    case 'url':
      baseConfig.type = 'url';
      baseConfig.placeholder = 'Enter URL';
      break;
    case 'number':
      baseConfig.type = 'number';
      baseConfig.placeholder = 'Enter number';
      if (field.options?.min !== undefined) baseConfig.min = field.options.min;
      if (field.options?.max !== undefined) baseConfig.max = field.options.max;
      break;
    case 'date':
      baseConfig.type = 'date';
      break;
    case 'bool':
      baseConfig.type = 'checkbox';
      baseConfig.value = 'false';
      break;
    case 'select':
      baseConfig.type = 'select';
      baseConfig.options = field.options?.values || [];
      if (field.options?.maxSelect && field.options.maxSelect > 1) {
        baseConfig.multiple = true;
      } else {
        baseConfig.multiple = false;
      }
      break;
    case 'relation':
      baseConfig.type = 'select';
      baseConfig.options = []; // Would need to be populated from the related collection
      if (field.options?.maxSelect && field.options.maxSelect > 1) {
        baseConfig.multiple = true;
      } else {
        baseConfig.multiple = false;
      }
      break;
    case 'file':
      baseConfig.type = 'file';
      if (field.options?.maxSelect && field.options.maxSelect > 1) {
        baseConfig.multiple = true;
      }
      break;
    case 'json':
      baseConfig.type = 'textarea';
      baseConfig.rows = 4;
      baseConfig.placeholder = 'Enter JSON data';
      break;
    case 'editor':
      baseConfig.type = 'textarea';
      baseConfig.rows = 8;
      break;
    case 'text':
    default:
      if (field.options?.pattern) {
        baseConfig.pattern = field.options.pattern;
      }
      if (field.options?.min !== undefined) baseConfig.min = field.options.min;
      if (field.options?.max !== undefined) baseConfig.max = field.options.max;
      break;
  }

  // Special handling for ID field
  if (field.name === 'id') {
    baseConfig.label = 'ID';
    baseConfig.placeholder = 'Auto-generated';
    baseConfig.required = false;
  }

  // Apply field overrides if provided
  if (overrides && overrides[field.name]) {
    Object.assign(baseConfig, overrides[field.name]);
  }

  return baseConfig;
}

/**
 * @param {CollectionField[]} schema
 * @param {FieldOverrides} [overrides]
 * @returns {FormFieldConfig[]}
 */
export function getFormFields(schema, overrides) {
  return schema
    .map((field) => getFormFieldConfig(field, overrides))
    .filter((config) => config !== null);
}

/**
 * @param {Record<string, any>} data
 * @param {CollectionField[]} schema
 * @returns {string[]}
 */
export function validateFormData(data, schema) {
  /** @type {string[]} */
  const errors = [];

  for (const field of schema) {
    if (field.required && (!data[field.name] || data[field.name] === '')) {
      errors.push(`${field.name} is required`);
    }

    if (field.type === 'email' && data[field.name]) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(data[field.name]))) {
        errors.push(`${field.name} must be a valid email address`);
      }
    }

    if (field.type === 'url' && data[field.name]) {
      try {
        new globalThis.URL(String(data[field.name]));
      } catch {
        errors.push(`${field.name} must be a valid URL`);
      }
    }

    if (field.type === 'number' && data[field.name] !== undefined && data[field.name] !== '') {
      const num = Number(data[field.name]);
      if (isNaN(num)) {
        errors.push(`${field.name} must be a valid number`);
      } else {
        if (field.options?.min !== undefined && num < field.options.min) {
          errors.push(`${field.name} must be at least ${field.options.min}`);
        }
        if (field.options?.max !== undefined && num > field.options.max) {
          errors.push(`${field.name} must be at most ${field.options.max}`);
        }
      }
    }

    if (field.type === 'text' && data[field.name] && field.options?.pattern) {
      const regex = new RegExp(field.options.pattern);
      if (!regex.test(String(data[field.name]))) {
        errors.push(`${field.name} format is invalid`);
      }
    }
  }

  return errors;
}

/**
 * @param {string} isoDateString
 * @returns {string}
 */
export function formatDateForInput(isoDateString) {
  if (!isoDateString) return '';

  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';

    // Return YYYY-MM-DD format for HTML date input
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * @param {string} isoDateString
 * @returns {string}
 */
export function formatDateForDisplay(isoDateString) {
  if (!isoDateString) return '';

  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return '';

    // Return MM/DD/YYYY format for display
    return date.toLocaleDateString('en-US');
  } catch {
    return '';
  }
}

/**
 * @param {Record<string, any>} data
 * @param {CollectionField[]} schema
 * @returns {Record<string, any>}
 */
export function prepareFormData(data, schema) {
  /** @type {Record<string, any>} */
  const prepared = {};

  for (const field of schema) {
    const value = data[field.name];

    if (value === undefined || value === null) {
      continue;
    }

    switch (field.type) {
      case 'number':
        if (value === '' || value === null || value === undefined) {
          // For empty number fields, completely exclude them from the payload
          // This avoids null constraint issues and lets PocketBase handle defaults
          // Skip adding this field to prepared data
        } else {
          const numValue = Number(value);
          // Only include the field if it's a valid number and not NaN
          if (!isNaN(numValue)) {
            prepared[field.name] = numValue;
          }
        }
        break;
      case 'bool':
        prepared[field.name] = Boolean(value);
        break;
      case 'json':
        try {
          prepared[field.name] = typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          prepared[field.name] = value; // Keep as string if invalid JSON
        }
        break;
      case 'select':
        if (field.options?.maxSelect && field.options.maxSelect > 1) {
          // Multiple select
          prepared[field.name] = Array.isArray(value) ? value : [value];
        } else {
          // Single select
          prepared[field.name] = Array.isArray(value) ? value[0] : value;
        }
        break;
      case 'relation':
        if (field.options?.maxSelect && field.options.maxSelect > 1) {
          // Multiple relation
          prepared[field.name] = Array.isArray(value) ? value : [value];
        } else {
          // Single relation
          prepared[field.name] = Array.isArray(value) ? value[0] : value;
        }
        break;
      case 'file':
        // File handling would depend on the frontend implementation
        prepared[field.name] = value;
        break;
      default:
        prepared[field.name] = value;
    }
  }

  return prepared;
}
