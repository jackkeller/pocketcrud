'use client';

import React, { useMemo } from 'react';
import { formatDateForDisplay } from '@utils/form-utils.js';
import type { CollectionField } from '@utils/form-utils.js';
import '../../styles/pocketcrud.css';

export interface RecordListProps {
  records: Record<string, any>[];
  schema: CollectionField[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  primaryDisplayField?: string;
  onEdit: (record: Record<string, any>) => void;
  onDelete: (record: Record<string, any>) => void;
  onPageChange: (page: number) => void;
}

export const RecordList: React.FC<RecordListProps> = ({
  records,
  schema,
  currentPage,
  totalPages,
  totalItems,
  perPage,
  primaryDisplayField,
  onEdit,
  onDelete,
  onPageChange,
}) => {
  const displayFields = useMemo(() => {
    const fields: CollectionField[] = [];

    if (primaryDisplayField) {
      const primaryField = schema.find((f) => f.name === primaryDisplayField);
      if (primaryField) {
        fields.push(primaryField);
      }
    }

    const otherFields = schema.filter(
      (field) =>
        (field.presentable || field.name === 'id' || field.name === 'created' || field.name === 'updated') &&
        field.name !== primaryDisplayField
    );

    fields.push(...otherFields);

    return fields.slice(0, 6);
  }, [schema, primaryDisplayField]);

  const formatFieldValue = (value: any, field: CollectionField): string => {
    if (value === null || value === undefined) {
      return '';
    }

    switch (field.type) {
      case 'bool':
        return value ? 'Yes' : 'No';

      case 'date':
      case 'datetime':
        if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
          return formatDateForDisplay(String(value));
        }
        return String(value);

      case 'json':
        return typeof value === 'object' ? JSON.stringify(value) : String(value);

      case 'file':
        if (Array.isArray(value)) {
          return `${value.length} file(s)`;
        }
        return value ? '1 file' : '';

      case 'select':
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return String(value);

      case 'relation':
        if (Array.isArray(value)) {
          return `${value.length} relation(s)`;
        }
        return value ? '1 relation' : '';

      default: {
        const str = String(value);
        return str.length > 50 ? str.substring(0, 50) + '...' : str;
      }
    }
  };

  const handleEdit = (record: Record<string, any>) => {
    onEdit(record);
  };

  const handleDelete = (record: Record<string, any>) => {
    onDelete(record);
  };

  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  const paginationPages = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i).filter((p) => p <= totalPages);
  }, [currentPage, totalPages]);

  if (records.length === 0) {
    return (
      <div className="pocketcrud-record-list overflow-hidden sm:rounded-md">
        <div className="pc-empty-state">
          <svg className="pc-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="pc-empty-title">No records found</h3>
          <p className="pc-empty-description">Get started by creating a new record.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pocketcrud-record-list overflow-hidden sm:rounded-md">
      {/* Desktop Table */}
      <div className="hidden sm:block">
        <table className="pc-table">
          <thead className="pc-table-header">
            <tr>
              {displayFields.map((field) => (
                <th key={field.id} className="pc-table-header-cell">
                  {field.name}
                </th>
              ))}
              <th className="pc-table-header-cell pc-table-actions-header">Actions</th>
            </tr>
          </thead>
          <tbody className="pc-table-body">
            {records.map((record) => (
              <tr key={record.id} className="pc-table-row">
                {displayFields.map((field) => (
                  <td key={field.id} className="pc-table-cell">
                    {field.name === primaryDisplayField ? (
                      <span className="pc-table-primary">{formatFieldValue(record[field.name], field)}</span>
                    ) : (
                      formatFieldValue(record[field.name], field)
                    )}
                  </td>
                ))}
                <td className="pc-table-cell pc-table-actions">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleEdit(record)} className="pc-action-btn pc-action-btn-edit">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                        <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(record)} className="pc-action-btn pc-action-btn-delete">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                        <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden">
        {records.map((record) => (
          <div key={record.id} className="pc-mobile-card space-y-2">
            {displayFields.slice(0, 3).map((field) => (
              <div key={field.id} className="flex justify-between">
                {field.name === primaryDisplayField ? (
                  <span className="pc-table-primary">{formatFieldValue(record[field.name], field)}</span>
                ) : (
                  <span className="pc-mobile-card-text">{formatFieldValue(record[field.name], field)}</span>
                )}
              </div>
            ))}
            <div className="mt-3 flex justify-end space-x-2">
              <button
                title="Edit Record"
                onClick={() => handleEdit(record)}
                className="pc-action-btn pc-action-btn-edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                  <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                </svg>
              </button>
              <button
                title="Delete Record"
                onClick={() => handleDelete(record)}
                className="pc-action-btn pc-action-btn-delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                  <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pc-pagination-container">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pocketcrud-btn pocketcrud-btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pocketcrud-btn pocketcrud-btn-secondary"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="pc-pagination-info">
                Showing <span className="font-medium">{startItem}</span> to{' '}
                <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalItems}</span>{' '}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pc-pagination-btn pc-pagination-btn-first"
                >
                  Previous
                </button>

                {paginationPages.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`pc-pagination-btn ${pageNum === currentPage ? 'pc-pagination-btn-active' : ''}`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pc-pagination-btn pc-pagination-btn-last"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordList;
