import { FaLeaf } from 'react-icons/fa';

function Loader() {
  return (
    <>
      <div className="relative inset-0 flex flex-col justify-center items-center">
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center border-x-8 border-emerald-800 rounded-full shadow-lg animate-spin">
            <div className="flex flex-col justify-center items-center border-y-8 border-emerald-400 rounded-full shadow-lg animate-ping">
              <div className="flex flex-col justify-center items-center border-4 border-emerald-700 h-32 w-32 rounded-full shadow-lg animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center bg-white h-32 w-32 space-y-2 rounded-full shadow-lg">
          <FaLeaf className="text-4xl text-emerald-600" />
          <p className="text-center text-sm text-emerald-800 font-semibold">Loading...</p>
        </div>
      </div>
    </>
  );
}

export default Loader;
