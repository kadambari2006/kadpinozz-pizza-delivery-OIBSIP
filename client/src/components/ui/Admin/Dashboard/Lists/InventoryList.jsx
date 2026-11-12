import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Import Thunks
import {
  listInventory,
  deleteStockById,
  updateStockById,
} from '../../../../../redux/asyncThunks/inventoryThunks';

// Import Components
import Loader from '../../../Loader';
import Message from '../../../Message';
import Table from '../Table';

function InventoryList() {
  const inventoryColumns = ['_id', 'item', 'price', 'threshold', 'quantity'];

  const dispatch = useDispatch();

  const inventory = useSelector((state) => state.inventory);
  const {
    loading,
    inventoryList,
    inventoryListError,
    inventoryDeleteByIdError,
    inventoryDeleteByIdSuccess,
    inventoryUpdateStockByIdError,
    inventoryUpdateStockByIdSuccess,
  } = inventory;

  const handleDelete = (id) => {
    dispatch(deleteStockById(id)).then(() => dispatch(listInventory({})));
  };

  const handleChange = (id, newQuantity) => {
    dispatch(updateStockById({ id, quantity: newQuantity })).then(() => {
      dispatch(listInventory({}));
    });
  };

  const successMessageDelete = inventoryDeleteByIdSuccess && {
    status: '200',
    message: 'Inventory Item Deleted Successfully!',
  };

  const successMessageUpdate = inventoryUpdateStockByIdSuccess && {
    status: '200',
    message: 'Stock Quantity Updated Successfully!',
  };

  useEffect(() => {
    if (!inventoryList) {
      dispatch(listInventory({}));
    }
  }, [dispatch, inventoryList]);

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold my-2">All Stocks</h2>
      {loading ? (
        <Loader />
      ) : (
        <>
          {(inventoryListError || inventoryDeleteByIdError || inventoryUpdateStockByIdError) && (
            <Message>{inventoryListError || inventoryDeleteByIdError || inventoryUpdateStockByIdError}</Message>
          )}
          {(successMessageDelete || successMessageUpdate) && (
            <Message>{successMessageDelete || successMessageUpdate}</Message>
          )}
          <div className="mt-4">
            {inventoryList ? (
              <>
                <div className="mb-4">
                  <h1 className="text-3xl text-center font-bold border-b-2 border-emerald-900 p-1 my-2">
                    All Bases
                  </h1>
                  <Table
                    data={inventoryList.bases}
                    columns={inventoryColumns}
                    handleDelete={handleDelete}
                    handleChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <h1 className="text-3xl text-center font-bold border-b-2 border-emerald-900 p-1 my-2">
                    All Cheeses
                  </h1>
                  <Table
                    data={inventoryList.cheeses}
                    columns={inventoryColumns}
                    handleDelete={handleDelete}
                    handleChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <h1 className="text-3xl text-center font-bold border-b-2 border-emerald-900 p-1 my-2">
                    All Sauces
                  </h1>
                  <Table
                    data={inventoryList.sauces}
                    columns={inventoryColumns}
                    handleDelete={handleDelete}
                    handleChange={handleChange}
                  />
                </div>
                <div className="mb-4">
                  <h1 className="text-3xl text-center font-bold border-b-2 border-emerald-900 p-1 my-2">
                    All Veggies
                  </h1>
                  <Table
                    data={inventoryList.veggies}
                    columns={inventoryColumns}
                    handleDelete={handleDelete}
                    handleChange={handleChange}
                  />
                </div>
              </>
            ) : (
              <h2 className="text-white text-xl text-center rounded-md border-2 border-emerald-400 font-semibold mb-2 p-4">
                No Stock Found..
              </h2>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default InventoryList;
