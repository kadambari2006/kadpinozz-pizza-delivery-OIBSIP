import PropTypes from 'prop-types';
import { useState } from 'react';
import { FaTrash } from 'react-icons/fa';

// Import Components
import Button from '../../Button';

function Table({ data, columns, handleDelete, handleChange }) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="bg-emerald-800 w-full table-auto border-collapse border-2 border-emerald-800 rounded-lg text-center overflow-hidden whitespace-no-wrap">
          <thead className="bg-emerald-800 h-10 uppercase font-bold">
            <tr>
              {columns.map((column) => (
                <>
                  <th key={column}>
                    {column.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                </>
              ))}
              <th>Delete</th>
            </tr>
          </thead>
          <tbody className="bg-emerald-700 text-emerald-100">
            {data.slice(startIndex, endIndex).map((row) => (
              <tr key={row._id}>
                {columns.map((column) => (
                  <td
                    key={column}
                    className="border border-emerald-600 px-4 py-2 sm:px-2 sm:py-1"
                  >
                    {column === 'numberOfOrders' ? (
                      row.orders.length
                    ) : column === 'isApproved' ? (
                      <input
                        type="checkbox"
                        checked={row[column]}
                        onChange={() => handleChange(row._id)}
                      />
                    ) : column === 'isVerified' ? (
                      <> {row[column] ? 'Verified' : 'Not Verified'}</>
                    ) : column === 'status' ? (
                      <select
                        className="bg-emerald-800 text-emerald-100 rounded-md p-2"
                        defaultValue={row[column]}
                        onChange={(e) => {
                          handleChange(row._id, e.target.value);
                          console.log('Id', row._id, 'Value', e.target.value);
                        }}
                      >
                        <option
                          value="Received"
                          selected={row[column] === 'Received'}
                        >
                          Received
                        </option>
                        <option
                          value="In the Kitchen"
                          selected={row[column] === 'In the Kitchen'}
                        >
                          In the Kitchen
                        </option>
                        <option
                          value="Sent for Delivery"
                          selected={row[column] === 'Sent for Delivery'}
                        >
                          Sent for Delivery
                        </option>
                        <option
                          value="Delivered"
                          selected={row[column] === 'Delivered'}
                        >
                          Delivered
                        </option>
                      </select>
                    ) : column === 'price' || column === 'totalPrice' || column === 'salesTax' || column === 'deliveryCharges' ? (
                      `₹${row[column]}`
                    ) : (column === 'quantity' && columns.includes('threshold')) ? (
                      <div className="flex items-center justify-center gap-1.5 py-1">
                        <input
                          type="number"
                          defaultValue={row[column]}
                          id={`qty-${row._id}`}
                          min="0"
                          className="w-20 bg-emerald-900 text-white text-center rounded px-2 py-1 text-sm border border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                        />
                        <button
                          type="button"
                          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs px-2.5 py-1 rounded font-bold transition-all shadow-sm"
                          onClick={() => {
                            const val = document.getElementById(`qty-${row._id}`)?.value;
                            if (val !== undefined && val !== '') {
                              handleChange(row._id, Number(val));
                            }
                          }}
                        >
                          Save
                        </button>
                      </div>
                    ) : column === 'orderItems' ? (
                      <table className="bg-emerald-800 w-full table-auto border-collapse border-2 border-emerald-800 rounded-lg text-center overflow-hidden whitespace-no-wrap">
                        <thead>
                          <tr>
                            <th>Pizza ID</th>
                            <th>Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {row[column].map((item) => (
                            <tr key={item._id}>
                              <td className="border border-emerald-600 px-4 py-2 sm:px-2 sm:py-1">
                                {item.pizza}
                              </td>
                              <td className="border border-emerald-600 px-4 py-2 sm:px-2 sm:py-1">
                                {item.qty}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      row[column]
                    )}
                  </td>
                ))}
                <td className="border border-emerald-600">
                  <Button
                    variant="secondary"
                    className="rounded-md"
                    onClick={() => handleDelete(row._id)}
                  >
                    <FaTrash className="text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > itemsPerPage && (
        <div className="flex justify-center items-center my-2">
          {currentPage > 1 && (
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prev
            </Button>
          )}
          <span className="mx-4">
            Page {currentPage} of {Math.ceil(data.length / itemsPerPage)}
          </span>
          {currentPage < Math.ceil(data.length / itemsPerPage) && (
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </>
  );
}

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  handleDelete: PropTypes.func,
  handleChange: PropTypes.func,
};

export default Table;
