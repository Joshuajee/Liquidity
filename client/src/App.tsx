import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Web3Provider } from "./Web3Provider";
import Navbar from "./components/Navbar";


const App = () => {

  return (
    <Web3Provider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/">
            kijijijiji
          </Route>
        </Routes>
      </BrowserRouter>
    </Web3Provider>
  );
};

export default App