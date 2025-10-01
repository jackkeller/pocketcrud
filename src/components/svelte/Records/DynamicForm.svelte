<script>
  import { createEventDispatcher } from 'svelte';
  import { getFormFields, validateFormData, prepareFormData, formatDateForInput } from '../../../utils/form-utils.js';
  import '../pocketcrud.css';

  /** @typedef {import('pocketcrud').FieldOverrides} FieldOverrides */

  /** @type {Array<{id: string, name: string, type: string, system: boolean, required: boolean, presentable: boolean, unique?: boolean, options?: any}>} */
  export let schema;
  /** @type {Record<string, any> | null} */
  export let initialData = null;
  /** @type {FieldOverrides | undefined} */
  export let fieldOverrides = undefined;

  const dispatch = createEventDispatcher();

  /** @type {Array<{id: string, name: string, type: string, label: string, required: boolean, options?: any}>} */
  let formFields = [];
  /** @type {Record<string, any>} */
  let formData = {};
  /** @type {string[]} */
  let errors = [];
  /** @type {boolean} */
  let isSubmitting = false;

  $: {
    formFields = getFormFields(schema, fieldOverrides);
    initializeFormData();
  }

  function initializeFormData() {
    formData = {};

    formFields.forEach((field) => {
      if (initialData && initialData[field.name] !== undefined) {
        if (field.type === 'json' && typeof initialData[field.name] === 'object') {
          formData[field.name] = JSON.stringify(initialData[field.name], null, 2);
        } else if (field.type === 'checkbox') {
          formData[field.name] = Boolean(initialData[field.name]);
        } else if (field.type === 'select' && field.multiple) {
          formData[field.name] = Array.isArray(initialData[field.name])
            ? initialData[field.name]
            : initialData[field.name]
              ? [initialData[field.name]]
              : [];
        } else if (field.type === 'date' && initialData[field.name]) {
          // Format date for HTML date input (YYYY-MM-DD)
          formData[field.name] = formatDateForInput(initialData[field.name]);
        } else {
          formData[field.name] = initialData[field.name] || '';
        }
      } else {
        if (field.type === 'checkbox') {
          formData[field.name] = false;
        } else if (field.type === 'select' && field.multiple) {
          formData[field.name] = [];
        } else {
          formData[field.name] = '';
        }
      }
    });
  }

  async function handleSubmit() {
    errors = [];

    const validationErrors = validateFormData(formData, schema);
    if (validationErrors.length > 0) {
      errors = validationErrors;
      return;
    }

    isSubmitting = true;

    try {
      // Clean up form data before preparing - remove empty string values for cleaner processing
      const cleanedData = { ...formData };

      // Handle date fields - convert from YYYY-MM-DD back to ISO format for storage
      schema.forEach((field) => {
        const value = cleanedData[field.name];

        if (field.type === 'date' && value) {
          if (typeof value === 'string') {
            // Ensure date is in YYYY-MM-DD format
            if (value.includes('T')) {
              cleanedData[field.name] = value.split('T')[0];
            } else if (value.includes(' ')) {
              cleanedData[field.name] = value.split(' ')[0];
            }
            // If it's already in YYYY-MM-DD format, leave it as is
          }
        }
      });

      console.log('Form data before preparation:', cleanedData);
      console.log('Schema:', schema);

      const preparedData = prepareFormData(cleanedData, schema);
      console.log('Prepared data:', preparedData);

      dispatch('submit', preparedData);
    } catch (err) {
      errors = [err instanceof Error ? err.message : 'An error occurred'];
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancel() {
    dispatch('cancel');
  }

  /**
   * @param {string} fieldName
   * @param {string} value
   * @param {boolean} checked
   */
  function handleMultiSelectChange(fieldName, value, checked) {
    if (checked) {
      formData[fieldName] = [...formData[fieldName], value];
    } else {
      formData[fieldName] = formData[fieldName].filter((v) => v !== value);
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="pocketcrud-dynamic-form space-y-4">
  {#if errors.length > 0}
    <div class="pocketcrud-alert pocketcrud-alert-error">
      <ul class="list-inside list-disc">
        {#each errors as error, index (index)}
          <li>{error}</li>
        {/each}
      </ul>
    </div>
  {/if}

  {#each formFields as field (field.name)}
    <div class="flex flex-col">
      <label for={field.name} class="pocketcrud-label">
        {field.label}
        {#if field.required}
          <span class="pc-field-required">*</span>
        {/if}
      </label>

      {#if field.type === 'textarea' || field.type === 'json'}
        <textarea
          id={field.name}
          name={field.name}
          bind:value={formData[field.name]}
          placeholder={field.placeholder}
          rows={field.rows || 3}
          required={field.required}
          class="pocketcrud-textarea"
        ></textarea>
      {:else if field.type === 'checkbox'}
        <label class="pocketcrud-checkbox-label">
          <input type="checkbox" id={field.name} bind:checked={formData[field.name]} class="mr-2" />
          <span>Enable {field.label}</span>
        </label>
      {:else if field.type === 'select'}
        {#if field.multiple}
          <div class="pocketcrud-checkbox-container space-y-2">
            {#each field.options || [] as option (option)}
              <label class="pocketcrud-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData[field.name].includes(option)}
                  on:change={(e) => handleMultiSelectChange(field.name, option, e.currentTarget.checked)}
                  class="mr-2"
                />
                <span>{option}</span>
              </label>
            {/each}
          </div>
        {:else}
          <select
            id={field.name}
            bind:value={formData[field.name]}
            required={field.required}
            class="pocketcrud-select"
          >
            <option value="">Select an option</option>
            {#each field.options || [] as option (option)}
              <option value={option}>{option}</option>
            {/each}
          </select>
        {/if}
      {:else if field.type === 'file'}
        <input
          type="file"
          id={field.name}
          accept={field.accept}
          multiple={field.multiple}
          required={field.required}
          class="pocketcrud-input"
        />
      {:else if field.type === 'date'}
        <input
          type="date"
          id={field.name}
          name={field.name}
          bind:value={formData[field.name]}
          required={field.required}
          class="pocketcrud-input"
        />
      {:else if field.type === 'number'}
        <input
          type="number"
          id={field.name}
          name={field.name}
          bind:value={formData[field.name]}
          placeholder={field.placeholder}
          required={field.required}
          class="pocketcrud-input"
        />
      {:else}
        <input
          type={field.type}
          id={field.name}
          name={field.name}
          bind:value={formData[field.name]}
          placeholder={field.placeholder}
          required={field.required}
          class="pocketcrud-input"
        />
      {/if}
    </div>
  {/each}

  <div class="flex space-x-3 pt-4">
    <button
      type="submit"
      disabled={isSubmitting}
      class="pocketcrud-btn pocketcrud-btn-primary"
    >
      {#if isSubmitting}
        Saving...
      {:else}
        {initialData ? 'Update' : 'Create'}
      {/if}
    </button>

    <button
      type="button"
      on:click={handleCancel}
      disabled={isSubmitting}
      class="pocketcrud-btn pocketcrud-btn-secondary"
    >
      Cancel
    </button>
  </div>
</form>

<style lang="postcss">
  .pocketcrud-dynamic-form {
    /* Component styles can be overridden by parent app */
  }
</style>
