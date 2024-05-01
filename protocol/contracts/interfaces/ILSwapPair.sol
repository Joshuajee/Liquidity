// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ILSwapPair {
    function borrow (address borrower, uint amount, bool isToken0) external;
}