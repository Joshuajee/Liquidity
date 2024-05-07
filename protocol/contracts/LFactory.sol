// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {ILFactory} from "./interfaces/ILFactory.sol";
import "./LSwapPair.sol";

import "./LCollateralPool.sol";
import "hardhat/console.sol";


contract LFactory is ILFactory {

    error PairAlreadyExist(address pair);
    error PoolAlreadyExist(address pool);

    using Clones for address;
    using SafeERC20 for IERC20;
    using SafeCast for *;

    uint public constant YEAR = 365 days;

    address public immutable PAIR_REFERENCE;

    mapping(address => mapping(address => address)) private pairs;
    mapping(address => address) private collateralPools;

    //mapping of user to collateral, to loan MarketStruct
    mapping(address => mapping(address => LoanMarket[])) public userLoans;

    constructor(address swapPool)  {
        PAIR_REFERENCE = swapPool;
    }

    modifier checkLoan(address borrower, address collateral) {
        _;
        _checkLoan(borrower, collateral);
    }

    function createPair(address _token0, address _token1) external returns (address pair) {

        bytes32 salt;

        (address token0, address token1) = getPairTokensOrder(_token0, _token1);

        unchecked {
            salt = keccak256(abi.encodePacked(token0, token1, block.timestamp));
        }

        pair = address(LSwapPair(PAIR_REFERENCE.cloneDeterministic(salt)));

        LSwapPair(pair).initialize(token0, token1);

        if (pairs[token0][token1] != address(0)) revert PairAlreadyExist(pairs[token0][token1]);
        
        pairs[token0][token1] = pair;

    }

    function createCollateralPool(IERC20 _token, uint assets, address receiver) external returns (address pool) {

        string memory name = ERC20(address(_token)).name();

        string memory symbol = ERC20(address(_token)).symbol();

        // no time to create a clone factory
        pool = address(new LCollateralPool(_token, name, symbol));

        _token.safeTransferFrom(msg.sender, address(this), assets);

        _token.approve(pool, assets);

        LCollateralPool(pool).deposit(assets, receiver);

        if (collateralPools[address(_token)] != address(0)) revert PoolAlreadyExist(collateralPools[address(_token)]);

        collateralPools[address(_token)] = pool;

    }

    function getPool(address _token0, address _token1) public view returns (address) {
        (address token0, address token1) = getPairTokensOrder(_token0, _token1);
        return pairs[token0][token1];
    }

    function getCollateralPool(address token) public view returns (address) {
        return collateralPools[token];
    }


    function getPairTokensOrder(address token0, address token1) public pure returns (address, address) {
        if (token0 > token1) {
            return (token0, token1);
        } else {
            return (token1, token0);
        }
    }

    function borrow(address collateral, address tokenToBorrow, uint112 amount) external checkLoan(msg.sender, collateral) {

        address borrower = msg.sender;

        address ammPool = getPool(collateral, tokenToBorrow);

        address collateralPool = getCollateralPool(collateral);

        LCollateralPool lCollateralPool = LCollateralPool(collateralPool); 

        uint borrowerBalance = lCollateralPool.balanceOf(borrower);

        LSwapPair(ammPool).borrow(tokenToBorrow, borrower, amount);

        userLoans[borrower][collateral].push(LoanMarket({
            ammPool: ammPool,
            collateralPool: collateralPool,
            tokenBorrowed: tokenToBorrow,
            amount: amount,
            accruedInterest: 0,
            interestRate: 1,
            borrowedAt: uint32(block.timestamp)
        }));

    }


    function repay(address collateral, address tokenToBorrow, uint index, uint112 amount) public checkLoan(msg.sender, collateral) {

        address borrower = msg.sender;

        address ammPool = getPool(collateral, tokenToBorrow);

        LoanMarket storage loan = userLoans[borrower][collateral][index];
        
        //Dangerous casting
        uint112 interest = uint112(loan.accruedInterest + ((uint32(block.timestamp) - loan.borrowedAt) * loan.interestRate * loan.amount / YEAR));

        (uint112 debtToPay, uint112 interestToPay) = _splitRepayment(loan.amount, interest, amount);

        //LSwapPair(ammPool).repay(tokenToBorrow, borrower, debtToPay, interestToPay);

        // if ((loan.amount + interest) < amount) {
        //     uint length = getUserLoans(collateral, tokenToBorrow).length;
        //     if (length > 1) userLoans[borrower][collateral][index] = userLoans[borrower][collateral][length - 1];
        //     userLoans[borrower][collateral].pop();
        // } else {
        //     loan.borrowedAt = uint32(block.timestamp);
        //     loan.accruedInterest += (interest - interestToPay);
        //     loan.amount -= debtToPay;
        // }

    }

    function repayFull(address collateral, address tokenToBorrow, uint index) external checkLoan(msg.sender, collateral) {

        
    }

    function _splitRepayment (uint112 currentDebt, uint112 accruedInterest, uint112 paymentAmount) internal  returns (uint112 debt, uint112 interest){
        uint112 totalDebt = currentDebt + accruedInterest;
        debt = ((uint(currentDebt) * uint(paymentAmount)) / totalDebt).toUint112();
        interest = paymentAmount - debt;
    }

    function _checkLoan(address borrower, address collateral) internal {

        LoanMarket [] memory loans = userLoans[borrower][collateral];
        if (loans.length > 256) revert("Too many loans on a collateral");

        uint totalLTV;

        for (uint i = 0; i < loans.length; i++) {
            uint interest = loans[i].interestRate * (block.timestamp - loans[i].borrowedAt);
            totalLTV += 1;
        }

    }

    function _calculateInterest(LoanMarket memory loan) internal returns (uint) {
        return loan.accruedInterest + ((block.timestamp - loan.borrowedAt) * loan.interestRate * loan.amount / YEAR);
    }

    function getUserLoans (address borrower, address collateral) public returns (LoanMarket[] memory) {
        return userLoans[borrower][collateral];
    }


    function getLoanStats(address borrower, address collateral) external returns (uint totalLTV, uint totalDebt, uint totalInterest) {

        LoanMarket [] memory loans = userLoans[borrower][collateral];

        for (uint i = 0; i < loans.length; i++) {
            totalDebt += loans[i].amount;
            totalInterest += _calculateInterest(loans[i]);
            totalLTV += 1;
        }

    }


}