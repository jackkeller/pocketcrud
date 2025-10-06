'use client';

import React, { useEffect, useState } from 'react';
import DynamicForm from '../Records/DynamicForm';
import RecordList from '../Records/RecordList';
import type PocketCrud from '@utils/crud.js';
import type { CollectionField, FieldOverrides } from '@utils/form-utils.js';
import '../../styles/pocketcrud.css';

export interface CollectionManagerProps {
  crud: PocketCrud;
  collectionName: string;
  fieldOverrides?: FieldOverrides;
  primaryDisplayField?: string;
  perPage?: number;
  loadingSlot?: React.ReactNode;
  errorSlot?: (error: string) => React.ReactNode;
  createButtonSlot?: (handleCreateNew: () => void) => React.ReactNode;
  formSlot?: (props: {
    schema: CollectionField[];
    fieldOverrides?: FieldOverrides;
    editingRecord: Record<string, any> | null;
    handleFormSubmit: (data: Record<string, any>) => void;
    handleFormCancel: () => void;
  }) => React.ReactNode;
  recordsSlot?: (props: {
    records: Record<string, any>[];
    schema: CollectionField[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    perPage: number;
    primaryDisplayField?: string;
    handleEdit: (record: Record<string, any>) => void;
    handleDelete: (record: Record<string, any>) => void;
    handlePageChange: (page: number) => void;
  }) => React.ReactNode;
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({
  crud,
  collectionName,
  fieldOverrides = {},
  primaryDisplayField,
  perPage = 20,
  loadingSlot,
  errorSlot,
  createButtonSlot,
  formSlot,
  recordsSlot,
}) => {
  const [schema, setSchema] = useState<CollectionField[]>([]);
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

    const loadCollection = async () => {
      setLoading(true);
      setError('');
      setShowForm(false);
      setEditingRecord(null);

      try {
        const collectionSchema = await crud.getCollectionSchema(collectionName);
        if (cancelled) return;

        setSchema(collectionSchema);

        const result = await crud.getList(collectionName, {
          page: 1,
          perPage,
          sort: '-created',
        });
        if (cancelled) return;

        setRecords(result.items);
        setCurrentPage(result.page);
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
      } catch (err) {
        if (cancelled) return;

        // Ignore PocketBase auto-cancellation errors
        const errorMessage = err instanceof Error ? err.message : '';
        if (errorMessage.includes('autocancelled') || errorMessage.includes('aborted')) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to load collection');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (collectionName) {
      loadCollection();
    }

    return () => {
      cancelled = true;
    };
  }, [collectionName, crud, perPage]);

  const loadRecords = async (page = 1) => {
    try {
      const result = await crud.getList(collectionName, {
        page,
        perPage,
        sort: '-created',
      });
      setRecords(result.items);
      setCurrentPage(result.page);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (err) {
      // Ignore PocketBase auto-cancellation errors
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('autocancelled') || errorMessage.includes('aborted')) {
        return;
      }
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
    if (!confirm(`Are you sure you want to delete this ${collectionName} record?`)) {
      return;
    }

    try {
      await crud.delete(collectionName, record.id);
      await loadRecords(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    }
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    try {
      if (editingRecord) {
        await crud.update(collectionName, editingRecord.id, formData);
      } else {
        await crud.create(collectionName, formData);
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

  const handlePageChange = async (page: number) => {
    await loadRecords(page);
  };

  if (loading) {
    return (
      <div className="pocketcrud-collection-manager">
        {loadingSlot || (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="pocketcrud-collection-manager">
        {errorSlot ? (
          errorSlot(error)
        ) : (
          <div className="pocketcrud-alert pocketcrud-alert-error">{error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="pocketcrud-collection-manager">
      <div data-testid="collection-manager">
        <div className="mb-6 flex items-center justify-start">
          {!showForm &&
            (createButtonSlot ? (
              createButtonSlot(handleCreateNew)
            ) : (
              <button
                type="button"
                onClick={handleCreateNew}
                className="pocketcrud-btn pocketcrud-btn-primary"
                data-testid="create-new-button"
              >
                Create New
              </button>
            ))}
        </div>

        {showForm &&
          (formSlot ? (
            formSlot({
              schema,
              fieldOverrides,
              editingRecord,
              handleFormSubmit,
              handleFormCancel,
            })
          ) : (
            <div className="pocketcrud-card mb-6">
              <h3 className="mb-4 text-lg font-semibold">
                {editingRecord ? 'Edit' : 'Create'} {collectionName}
              </h3>
              <DynamicForm
                schema={schema}
                fieldOverrides={fieldOverrides}
                initialData={editingRecord}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          ))}

        {recordsSlot ? (
          recordsSlot({
            records,
            schema,
            currentPage,
            totalPages,
            totalItems,
            perPage,
            primaryDisplayField,
            handleEdit,
            handleDelete,
            handlePageChange,
          })
        ) : (
          <RecordList
            records={records}
            schema={schema}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={perPage}
            primaryDisplayField={primaryDisplayField}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default CollectionManager;
