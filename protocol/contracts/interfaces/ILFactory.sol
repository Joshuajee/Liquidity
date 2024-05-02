// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ILFactory {
    struct LoanMarket {
        address ammPool;
        address collateralPool;

        address tokenBorrowed;
        uint amount;
        uint8 interestRate;
        uint64 borrowedAt;
    }

    function getPool(address _token0, address _token1) external view returns (address);
    function createPair(address _token0, address _token1) external returns (address pair);
}