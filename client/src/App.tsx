import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Web3Provider } from "./Web3Provider";


const App = () => {

  return (
    <Web3Provider>
      <BrowserRouter>
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