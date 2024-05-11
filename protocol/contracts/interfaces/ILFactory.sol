// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface ILFactory {
    struct LoanMarket {
        address ammPool;
        address collateralPool;
        address tokenBorrowed;
        uint112 amount;
        uint112 accruedInterest;
        uint8 interestRate;
        uint32 borrowedAt;
    }

    function getPool(address _token0, address _token1) external view returns (address);
    function createPair(address _token0, address _token1) external returns (address pair);
    function createCollateralPool(IERC20 _token, uint assets, address receiver) external returns (address pool);
    function getCollateralPool(address token) external view returns (address);
    function update(address pair) external;

}