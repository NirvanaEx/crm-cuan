// UniversalTable.jsx
import React, { useState, useEffect } from 'react';
import { AiOutlineEdit, AiOutlineDelete, AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import '../css/UniversalTable.css';

const UniversalTable = ({
  columns,
  data,
  itemsPerPage = 5,
  onDelete,
  onEdit,
  onRowClick,
  currentPage: propCurrentPage,
  onPageChange,
  hideEditIcon = false,    // если true — не показывать иконку редактирования
  hideDeleteIcon = false   // если true — не показывать иконку удаления
}) => {
  const [currentPage, setCurrentPage] = useState(propCurrentPage || 1);

  useEffect(() => {
    if (propCurrentPage !== undefined && propCurrentPage !== currentPage) {
      setCurrentPage(propCurrentPage);
    }
  }, [propCurrentPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = data.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => {
    const newPage = currentPage > 1 ? currentPage - 1 : currentPage;
    if (onPageChange) onPageChange(newPage);
    else setCurrentPage(newPage);
  };

  const handleNext = () => {
    const newPage = currentPage < totalPages ? currentPage + 1 : currentPage;
    if (onPageChange) onPageChange(newPage);
    else setCurrentPage(newPage);
  };

  const handlePageSelect = (page) => {
    if (onPageChange) onPageChange(page);
    else setCurrentPage(page);
  };

  // Определяется, нужно ли отображать колонку с иконками действий.
  const showActions = (onEdit && !hideEditIcon) || (onDelete && !hideDeleteIcon);
  const totalColumns = columns.length + (showActions ? 1 : 0);

  return (
    <div className="universal-table">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {showActions && <th style={{ width: '5%' }}></th>}
              {columns.map(col => (
                <th key={col.key} style={{ width: col.width || 'auto' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length ? (
              currentData.map((row, idx) => (
                <tr key={idx} onClick={() => onRowClick && onRowClick(row)}>
                  {showActions && (
                    <td onClick={(e) => e.stopPropagation()}>
                      {onEdit && !hideEditIcon && (
                        <AiOutlineEdit
                          className="action-icon"
                          onClick={() => onEdit(row)}
                        />
                      )}
                      {onDelete && !hideDeleteIcon && (
                        <AiOutlineDelete
                          className="action-icon"
                          onClick={() => onDelete(row)}
                        />
                      )}
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} style={{ width: col.width || 'auto' }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={totalColumns} style={{ textAlign: 'center', padding: '20px' }}>
                  Нет данных
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => handlePageSelect(1)}>1</button>
          <button onClick={handlePrev}><AiOutlineLeft /></button>
          <span className="current-page">{currentPage}</span>
          <button onClick={handleNext}><AiOutlineRight /></button>
          <button onClick={() => handlePageSelect(totalPages)}>{totalPages}</button>
        </div>
      )}
    </div>
  );
};

export default UniversalTable;
