'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import {
  getFormFields,
  validateFormData,
  prepareFormData,
  formatDateForInput,
} from '@utils/form-utils.js';
import type { CollectionField, FieldOverrides, FormFieldConfig } from '@utils/form-utils.js';
import '../../styles/pocketcrud.css';

export interface DynamicFormProps {
  schema: CollectionField[];
  initialData?: Record<string, any> | null;
  fieldOverrides?: FieldOverrides;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onCancel: () => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  initialData = null,
  fieldOverrides,
  onSubmit,
  onCancel,
}) => {
  const [formFields, setFormFields] = useState<FormFieldConfig[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fields = getFormFields(schema, fieldOverrides);
    setFormFields(fields);
    initializeFormData(fields);
  }, [schema, fieldOverrides, initialData]);

  const initializeFormData = (fields: FormFieldConfig[]) => {
    const data: Record<string, any> = {};

    fields.forEach((field) => {
      if (initialData && initialData[field.name] !== undefined) {
        if (field.type === 'json' && typeof initialData[field.name] === 'object') {
          data[field.name] = JSON.stringify(initialData[field.name], null, 2);
        } else if (field.type === 'checkbox') {
          data[field.name] = Boolean(initialData[field.name]);
        } else if (field.type === 'select' && field.multiple) {
          data[field.name] = Array.isArray(initialData[field.name])
            ? initialData[field.name]
            : initialData[field.name]
              ? [initialData[field.name]]
              : [];
        } else if (field.type === 'date' && initialData[field.name]) {
          data[field.name] = formatDateForInput(initialData[field.name]);
        } else {
          data[field.name] = initialData[field.name] || '';
        }
      } else {
        if (field.type === 'checkbox') {
          data[field.name] = false;
        } else if (field.type === 'select' && field.multiple) {
          data[field.name] = [];
        } else {
          data[field.name] = '';
        }
      }
    });

    setFormData(data);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors = validateFormData(formData, schema);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanedData = { ...formData };

      // Handle date fields
      schema.forEach((field) => {
        const value = cleanedData[field.name];

        if (field.type === 'date' && value) {
          if (typeof value === 'string') {
            if (value.includes('T')) {
              cleanedData[field.name] = value.split('T')[0];
            } else if (value.includes(' ')) {
              cleanedData[field.name] = value.split(' ')[0];
            }
          }
        }
      });

      const preparedData = prepareFormData(cleanedData, schema);
      await onSubmit(preparedData);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'An error occurred']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleMultiSelectChange = (fieldName: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev[fieldName] || [];
      if (checked) {
        return { ...prev, [fieldName]: [...current, value] };
      } else {
        return { ...prev, [fieldName]: current.filter((v: string) => v !== value) };
      }
    });
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="pocketcrud-dynamic-form space-y-4">
      {errors.length > 0 && (
        <div className="pocketcrud-alert pocketcrud-alert-error">
          <ul className="list-inside list-disc">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {formFields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label htmlFor={field.name} className="pocketcrud-label">
            {field.label}
            {field.required && <span className="pc-field-required">*</span>}
          </label>

          {(field.type === 'textarea' || field.type === 'json') && (
            <textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 3}
              required={field.required}
              className="pocketcrud-textarea"
            />
          )}

          {field.type === 'checkbox' && (
            <label className="pocketcrud-checkbox-label">
              <input
                type="checkbox"
                id={field.name}
                checked={formData[field.name] || false}
                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                className="mr-2"
              />
              <span>Enable {field.label}</span>
            </label>
          )}

          {field.type === 'select' && field.multiple && (
            <div className="pocketcrud-checkbox-container space-y-2">
              {(field.options || []).map((option) => (
                <label key={option} className="pocketcrud-checkbox-label">
                  <input
                    type="checkbox"
                    checked={(formData[field.name] || []).includes(option)}
                    onChange={(e) => handleMultiSelectChange(field.name, option, e.target.checked)}
                    className="mr-2"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {field.type === 'select' && !field.multiple && (
            <select
              id={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
              className="pocketcrud-select"
            >
              <option value="">Select an option</option>
              {(field.options || []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          {field.type === 'file' && (
            <input
              type="file"
              id={field.name}
              accept={field.accept}
              multiple={field.multiple}
              required={field.required}
              className="pocketcrud-input"
            />
          )}

          {field.type === 'date' && (
            <input
              type="date"
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
              className="pocketcrud-input"
            />
          )}

          {field.type === 'number' && (
            <input
              type="number"
              id={field.name}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="pocketcrud-input"
            />
          )}

          {field.type !== 'textarea' &&
            field.type !== 'json' &&
            field.type !== 'checkbox' &&
            field.type !== 'select' &&
            field.type !== 'file' &&
            field.type !== 'date' &&
            field.type !== 'number' && (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                className="pocketcrud-input"
              />
            )}
        </div>
      ))}

      <div className="flex space-x-3 pt-4">
        <button type="submit" disabled={isSubmitting} className="pocketcrud-btn pocketcrud-btn-primary">
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="pocketcrud-btn pocketcrud-btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
