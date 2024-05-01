import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Web3Provider } from "./Web3Provider";
import Navbar from "./components/Navbar";
import SwapPage from "./pages/swap-page";
import AddLiquidityPage from "./pages/add-liquidity-page";
import BorrowPage from "./pages/borrow-page";


const App = () => {

  return (
    <Web3Provider>
      <div className="bg-[#131313]">
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<SwapPage />} />
            <Route path="/add" element={<AddLiquidityPage />} />
            <Route path="/borrow" element={<BorrowPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </Web3Provider>
  );
};

export default App