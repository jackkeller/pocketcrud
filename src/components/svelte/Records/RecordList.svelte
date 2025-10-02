<script>
  import { createEventDispatcher } from "svelte";
  import { formatDateForDisplay } from "../../../utils/form-utils.js";
  import "../pocketcrud.css";

  /** @type {Array<Record<string, any>>} */
  export let records;
  /** @type {Array<{id: string, name: string, type: string, system: boolean, required: boolean, presentable: boolean, unique?: boolean, options?: any}>} */
  export let schema;
  /** @type {number} */
  export let currentPage;
  /** @type {number} */
  export let totalPages;
  /** @type {number} */
  export let totalItems;
  /** @type {number} */
  export let perPage;
  /** @type {string | undefined} */
  export let primaryDisplayField = undefined;

  const dispatch = createEventDispatcher();

  $: displayFields = (() => {
    // Start with primary display field if specified
    const fields = [];

    if (primaryDisplayField) {
      const primaryField = schema.find((f) => f.name === primaryDisplayField);
      if (primaryField) {
        fields.push(primaryField);
      }
    }

    // Add other presentable fields (excluding the primary if already added)
    const otherFields = schema.filter(
      (field) =>
        (field.presentable ||
          field.name === "id" ||
          field.name === "created" ||
          field.name === "updated") &&
        field.name !== primaryDisplayField
    );

    fields.push(...otherFields);

    return fields.slice(0, 6);
  })();

  /**
   * @param {any} value
   * @param {{id: string, name: string, type: string, system: boolean, required: boolean, presentable: boolean, unique?: boolean, options?: any}} field
   * @returns {string}
   */
  function formatFieldValue(value, field) {
    if (value === null || value === undefined) {
      return "";
    }

    switch (field.type) {
      case "bool":
        return value ? "Yes" : "No";

      case "date":
      case "datetime": {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          value instanceof Date
        ) {
          return formatDateForDisplay(String(value));
        }
        return String(value);
      }

      case "json":
        return typeof value === "object"
          ? JSON.stringify(value)
          : String(value);

      case "file":
        if (Array.isArray(value)) {
          return `${value.length} file(s)`;
        }
        return value ? "1 file" : "";

      case "select":
        if (Array.isArray(value)) {
          return value.join(", ");
        }
        return String(value);

      case "relation":
        if (Array.isArray(value)) {
          return `${value.length} relation(s)`;
        }
        return value ? "1 relation" : "";

      default: {
        const str = String(value);
        return str.length > 50 ? str.substring(0, 50) + "..." : str;
      }
    }
  }
  /**
   * @param {Record<string, any>} record
   */
  function handleEdit(record) {
    dispatch("edit", record);
  }

  /**
   * @param {Record<string, any>} record
   */
  function handleDelete(record) {
    dispatch("delete", record);
  }

  /**
   * @param {number} page
   */
  function handlePageChange(page) {
    dispatch("pageChange", page);
  }

  $: startItem = (currentPage - 1) * perPage + 1;
  $: endItem = Math.min(currentPage * perPage, totalItems);
</script>

<div class="pocketcrud-record-list overflow-hidden sm:rounded-md">
  {#if records.length === 0}
    <div class="pc-empty-state">
      <svg
        class="pc-empty-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 class="pc-empty-title">No records found</h3>
      <p class="pc-empty-description">Get started by creating a new record.</p>
    </div>
  {:else}
    <!-- Desktop Table -->
    <div class="hidden sm:block">
      <table class="pc-table">
        <thead class="pc-table-header">
          <tr>
            {#each displayFields as field (field.id)}
              <th class="pc-table-header-cell">
                {field.name}
              </th>
            {/each}
            <th class="pc-table-header-cell pc-table-actions-header">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="pc-table-body">
          {#each records as record (record.id)}
            <tr class="pc-table-row">
              {#each displayFields as field (field.id)}
                <td class="pc-table-cell">
                  {#if field.name === primaryDisplayField}
                    <span class="pc-table-primary">
                      {formatFieldValue(record[field.name], field)}
                    </span>
                  {:else}
                    {formatFieldValue(record[field.name], field)}
                  {/if}
                </td>
              {/each}
              <td class="pc-table-cell pc-table-actions">
                <div class="flex justify-end space-x-2">
                  <button
                    on:click={() => handleEdit(record)}
                    class="pc-action-btn pc-action-btn-edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      ><path
                        d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"
                      /></svg
                    >
                  </button>
                  <button
                    on:click={() => handleDelete(record)}
                    class="pc-action-btn pc-action-btn-delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      ><path
                        d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
                      /></svg
                    >
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="sm:hidden">
      {#each records as record (record.id)}
        <div class="pc-mobile-card space-y-2">
          {#each displayFields.slice(0, 3) as field (field.id)}
            <div class="flex justify-between">
              {#if field.name === primaryDisplayField}
                <span class="pc-table-primary"
                  >{formatFieldValue(record[field.name], field)}</span
                >
              {:else}
                <span class="pc-mobile-card-text"
                  >{formatFieldValue(record[field.name], field)}</span
                >
              {/if}
            </div>
          {/each}
          <div class="mt-3 flex justify-end space-x-2">
            <button
              title="Edit Record"
              on:click={() => handleEdit(record)}
              class="pc-action-btn pc-action-btn-edit"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                ><path
                  d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"
                /></svg
              >
            </button>
            <button
              title="Delete Record"
              on:click={() => handleDelete(record)}
              class="pc-action-btn pc-action-btn-delete"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                ><path
                  d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
                /></svg
              >
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="pc-pagination-container">
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            on:click={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            class="pocketcrud-btn pocketcrud-btn-secondary"
          >
            Previous
          </button>
          <button
            on:click={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            class="pocketcrud-btn pocketcrud-btn-secondary"
          >
            Next
          </button>
        </div>
        <div
          class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between"
        >
          <div>
            <p class="pc-pagination-info">
              Showing <span class="font-medium">{startItem}</span> to
              <span class="font-medium">{endItem}</span>
              of
              <span class="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div>
            <nav
              class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                on:click={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                class="pc-pagination-btn pc-pagination-btn-first"
              >
                Previous
              </button>

              {#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, currentPage - 2);
                return start + i;
              }) as pageNum (pageNum)}
                {#if pageNum <= totalPages}
                  <button
                    on:click={() => handlePageChange(pageNum)}
                    class="pc-pagination-btn {pageNum === currentPage
                      ? 'pc-pagination-btn-active'
                      : ''}"
                  >
                    {pageNum}
                  </button>
                {/if}
              {/each}

              <button
                on:click={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                class="pc-pagination-btn pc-pagination-btn-last"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style lang="postcss">
  .pocketcrud-record-list {
    /* Component styles can be overridden by parent app */
  }
</style>
