<script>
  import DynamicForm from "../Records/DynamicForm.svelte";
  import RecordList from "../Records/RecordList.svelte";

  /** @type {import('pocketcrud').default} */
  export let crud;

  /**
   * @type {{
   *   collectionName: string;
   *   relationField: string;
   *   label?: string;
   *   fieldOverrides?: Record<string, Record<string, any>>;
   *   primaryDisplayField?: string;
   *   perPage?: number;
   * }}
   */
  export let config;

  /** @type {string} */
  export let parentRecordId;

  $: collectionName = config.collectionName;
  $: relationField = config.relationField;
  $: displayLabel = config.label || config.collectionName;
  $: fieldOverrides = config.fieldOverrides || {};
  $: primaryDisplayField = config.primaryDisplayField;
  $: perPage = config.perPage || 10;

  /** @type {Array<{id: string, name: string, type: string, system: boolean, required: boolean, presentable: boolean, unique?: boolean, options?: any}>} */
  let filteredSchema = [];
  /** @type {Array<Record<string, any>>} */
  let records = [];
  /** @type {boolean} */
  let loading = true;
  /** @type {string} */
  let error = "";
  /** @type {boolean} */
  let showForm = false;
  /** @type {Record<string, any> | null} */
  let editingRecord = null;
  /** @type {number} */
  let currentPage = 1;
  /** @type {number} */
  let totalPages = 1;
  /** @type {number} */
  let totalItems = 0;

  $: if (collectionName && parentRecordId) {
    init();
  }

  async function init() {
    loading = true;
    error = "";
    showForm = false;
    editingRecord = null;

    try {
      const schema = await crud.getCollectionSchema(collectionName);
      filteredSchema = schema.filter((f) => f.name !== relationField);
      await loadRecords();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load related records";
    } finally {
      loading = false;
    }
  }

  /**
   * @param {number} page
   */
  async function loadRecords(page = 1) {
    try {
      const result = await crud.getList(collectionName, {
        page,
        perPage,
        sort: "-created",
        filter: `${relationField} = '${parentRecordId}'`,
      });
      records = result.items;
      currentPage = result.page;
      totalPages = result.totalPages;
      totalItems = result.totalItems;
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load records";
    }
  }

  function handleCreateNew() {
    editingRecord = null;
    showForm = true;
  }

  /**
   * @param {Record<string, any>} record
   */
  function handleEdit(record) {
    editingRecord = record;
    showForm = true;
  }

  /**
   * @param {Record<string, any>} record
   */
  async function handleDelete(record) {
    if (!confirm(`Are you sure you want to delete this ${collectionName} record?`)) {
      return;
    }
    try {
      await crud.delete(collectionName, record.id);
      await loadRecords(currentPage);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to delete record";
    }
  }

  /**
   * @param {Record<string, any>} formData
   */
  async function handleFormSubmit(formData) {
    try {
      const data = { ...formData, [relationField]: parentRecordId };
      if (editingRecord) {
        await crud.update(collectionName, editingRecord.id, data);
      } else {
        await crud.create(collectionName, data);
      }
      showForm = false;
      editingRecord = null;
      await loadRecords(currentPage);
    } catch (err) {
      console.error("Form submission error:", err);
      error = err instanceof Error ? err.message : "Failed to save record";
    }
  }

  function handleFormCancel() {
    showForm = false;
    editingRecord = null;
  }

  /**
   * @param {number} page
   */
  async function handlePageChange(page) {
    await loadRecords(page);
  }
</script>

<div class="pocketcrud-related-collection mt-6 border-t pt-6">
  <h4 class="mb-4 text-base font-semibold">{displayLabel}</h4>

  {#if error}
    <div class="pocketcrud-alert pocketcrud-alert-error mb-4">{error}</div>
  {/if}

  {#if loading}
    <div class="flex justify-center py-4">
      <div class="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900"></div>
    </div>
  {:else}
    {#if !showForm}
      <div class="mb-4">
        <button
          type="button"
          on:click={handleCreateNew}
          class="pocketcrud-btn pocketcrud-btn-secondary"
        >
          Add {displayLabel}
        </button>
      </div>
    {/if}

    {#if showForm}
      <div class="pocketcrud-card mb-4">
        <h5 class="mb-3 text-sm font-semibold">
          {editingRecord ? "Edit" : "Add"}
          {displayLabel}
        </h5>
        <DynamicForm
          schema={filteredSchema}
          {fieldOverrides}
          initialData={editingRecord}
          on:submit={(e) => handleFormSubmit(e.detail)}
          on:cancel={handleFormCancel}
        />
      </div>
    {/if}

    <RecordList
      records={records}
      schema={filteredSchema}
      {currentPage}
      {totalPages}
      {totalItems}
      {perPage}
      {primaryDisplayField}
      on:edit={(e) => handleEdit(e.detail)}
      on:delete={(e) => handleDelete(e.detail)}
      on:pageChange={(e) => handlePageChange(e.detail)}
    />
  {/if}
</div>
