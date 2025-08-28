import React from 'react';

const Table = ({ columns, data, actions, className = '' }) => {
  return (
    <div className={`table-container ${className}`}>
      <div className="table-wrapper glass">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="table-header">
                  {column.header}
                </th>
              ))}
              {actions && <th className="table-header">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="table-row">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="table-cell">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="table-cell">
                    <div className="table-actions">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          className={`action-btn ${action.className || ''}`}
                          onClick={() => action.onClick(row)}
                        >
                          {action.icon && <action.icon size={16} />}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
