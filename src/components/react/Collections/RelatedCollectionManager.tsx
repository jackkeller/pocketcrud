'use client';

import React, { useEffect, useState } from 'react';
import DynamicForm from '../Records/DynamicForm';
import RecordList from '../Records/RecordList';
import type PocketCrud from '@utils/crud.js';
import type { CollectionField, FieldOverrides } from '@utils/form-utils.js';

export interface RelatedCollectionConfig {
  collectionName: string;
  relationField: string;
  label?: string;
  fieldOverrides?: FieldOverrides;
  primaryDisplayField?: string;
  perPage?: number;
}

export interface RelatedCollectionManagerProps {
  crud: PocketCrud;
  config: RelatedCollectionConfig;
  parentRecordId: string;
}

export const RelatedCollectionManager: React.FC<RelatedCollectionManagerProps> = ({
  crud,
  config,
  parentRecordId,
}) => {
  const {
    collectionName,
    relationField,
    label,
    fieldOverrides = {},
    primaryDisplayField,
    perPage = 10,
  } = config;

  const [filteredSchema, setFilteredSchema] = useState<CollectionField[]>([]);
  const [records, setRecords] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, any> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError('');
      setShowForm(false);
      setEditingRecord(null);

      try {
        const collectionSchema = await crud.getCollectionSchema(collectionName);
        if (cancelled) return;

        setFilteredSchema(collectionSchema.filter((f) => f.name !== relationField));

        const result = await crud.getList(collectionName, {
          page: 1,
          perPage,
          sort: '-created',
          filter: `${relationField} = '${parentRecordId}'`,
        });
        if (cancelled) return;

        setRecords(result.items);
        setCurrentPage(result.page);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
      } catch (err) {
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : '';
        if (errorMessage.includes('autocancelled') || errorMessage.includes('aborted')) return;
        setError(err instanceof Error ? err.message : 'Failed to load related records');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [collectionName, relationField, parentRecordId, crud, perPage]);

  const loadRecords = async (page = 1) => {
    try {
      const result = await crud.getList(collectionName, {
        page,
        perPage,
        sort: '-created',
        filter: `${relationField} = '${parentRecordId}'`,
      });
      setRecords(result.items);
      setCurrentPage(result.page);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('autocancelled') || errorMessage.includes('aborted')) return;
      setError(err instanceof Error ? err.message : 'Failed to load records');
    }
  };

  const handleCreateNew = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEdit = (record: Record<string, any>) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = async (record: Record<string, any>) => {
    if (!confirm(`Are you sure you want to delete this ${collectionName} record?`)) return;
    try {
      await crud.delete(collectionName, record.id);
      await loadRecords(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    }
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    try {
      const data = { ...formData, [relationField]: parentRecordId };
      if (editingRecord) {
        await crud.update(collectionName, editingRecord.id, data);
      } else {
        await crud.create(collectionName, data);
      }
      setShowForm(false);
      setEditingRecord(null);
      await loadRecords(currentPage);
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save record');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRecord(null);
  };

  const displayLabel = label || collectionName;

  return (
    <div className="pocketcrud-related-collection mt-6 border-t pt-6">
      <h4 className="mb-4 text-base font-semibold">{displayLabel}</h4>

      {error && <div className="pocketcrud-alert pocketcrud-alert-error mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {!showForm && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleCreateNew}
                className="pocketcrud-btn pocketcrud-btn-secondary"
              >
                Add {displayLabel}
              </button>
            </div>
          )}

          {showForm && (
            <div className="pocketcrud-card mb-4">
              <h5 className="mb-3 text-sm font-semibold">
                {editingRecord ? 'Edit' : 'Add'} {displayLabel}
              </h5>
              <DynamicForm
                schema={filteredSchema}
                fieldOverrides={fieldOverrides}
                initialData={editingRecord}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          <RecordList
            records={records}
            schema={filteredSchema}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={perPage}
            primaryDisplayField={primaryDisplayField}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPageChange={loadRecords}
          />
        </>
      )}
    </div>
  );
};

export default RelatedCollectionManager;
