<script>
  import DynamicForm from "../Records/DynamicForm.svelte";
  import RecordList from "../Records/RecordList.svelte";
  import "../pocketcrud.css";

  /** @type {import('pocketcrud').default} */
  export let crud;
  /** @type {string} */
  export let collectionName;
  /** @type {Record<string, Record<string, any>>} */
  export let fieldOverrides = {};
  /** @type {string | undefined} */
  export let primaryDisplayField = undefined;
  /** @type {number} */
  export let perPage = 20;

  /** @type {Array<{id: string, name: string, type: string, system: boolean, required: boolean, presentable: boolean, unique?: boolean, options?: any}>} */
  let schema = [];

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

  $: if (collectionName) {
    loadCollection();
  }

  async function loadCollection() {
    loading = true;
    error = "";
    showForm = false;
    editingRecord = null;

    try {
      schema = await crud.getCollectionSchema(collectionName);
      await loadRecords();
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load collection";
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
   * @param {{id: string, created: string, updated: string, [key: string]: any}} record
   */
  function handleEdit(record) {
    editingRecord = record;
    showForm = true;
  }

  /**
   * @param {{id: string, created: string, updated: string, [key: string]: any}} record
   */
  async function handleDelete(record) {
    if (
      !confirm(`Are you sure you want to delete this ${collectionName} record?`)
    ) {
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
      console.log(
        "Submitting form data for collection:",
        collectionName,
        formData
      );

      if (editingRecord) {
        await crud.update(collectionName, editingRecord.id, formData);
      } else {
        await crud.create(collectionName, formData);
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

<div class="pocketcrud-collection-manager">
  {#if loading}
    <slot name="loading">
      <div class="flex justify-center py-8">
        <div
          class="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"
        ></div>
      </div>
    </slot>
  {:else if error}
    <slot name="error" {error}>
      <div class="pocketcrud-alert pocketcrud-alert-error">
        {error}
      </div>
    </slot>
  {:else}
    <div data-testid="collection-manager">
      <div class="mb-6 flex items-center justify-start">
        {#if !showForm}
          <slot name="create-button" {handleCreateNew}>
            <button
              type="button"
              on:click={handleCreateNew}
              class="pocketcrud-btn pocketcrud-btn-primary"
              data-testid="create-new-button"
            >
              Create New
            </button>
          </slot>
        {/if}
      </div>

      {#if showForm}
        <slot
          name="form"
          {schema}
          {fieldOverrides}
          {editingRecord}
          {handleFormSubmit}
          {handleFormCancel}
        >
          <div class="pocketcrud-card mb-6">
            <h3 class="mb-4 text-lg font-semibold">
              {editingRecord ? "Edit" : "Create"}
              {collectionName}
            </h3>
            <DynamicForm
              {schema}
              {fieldOverrides}
              initialData={editingRecord}
              on:submit={(e) => handleFormSubmit(e.detail)}
              on:cancel={handleFormCancel}
            />
          </div>
        </slot>
      {/if}

      <slot
        name="records"
        {records}
        {schema}
        {currentPage}
        {totalPages}
        {totalItems}
        {perPage}
        {primaryDisplayField}
        {handleEdit}
        {handleDelete}
        {handlePageChange}
      >
        <RecordList
          {records}
          {schema}
          {currentPage}
          {totalPages}
          {totalItems}
          {perPage}
          {primaryDisplayField}
          on:edit={(e) => handleEdit(e.detail)}
          on:delete={(e) => handleDelete(e.detail)}
          on:pageChange={(e) => handlePageChange(e.detail)}
        />
      </slot>
    </div>
  {/if}
</div>

<style lang="postcss">
  .pocketcrud-collection-manager {
    /* Component styles can be overridden by parent app */
  }
</style>
