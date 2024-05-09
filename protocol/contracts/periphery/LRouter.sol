// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// library imports
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ILFactory} from "../interfaces/ILFactory.sol";
import {LSwapPair} from "../LSwapPair.sol";
import {LCollateralPool} from "../LCollateralPool.sol";

import {LV1Library} from "../liberies/LV1Library.sol";

import "hardhat/console.sol";

/**
 * @title LSwap V1 Router
 * @notice Router for stateless execution of swaps and liquidity provision
 * @dev This contract is used for adding/removing liquidity, swapping tokens and withdrawing fees
 * @dev This contract is stateless and does not store any data
 * @author LSwap -- Joshua Evuetapha
 */
contract LRouter is ReentrancyGuard {

    address [] public pools;
    address [] public collateralPools;

    error Expired();

    using SafeERC20 for IERC20;

    struct Pool {
        address pool;
        address token0;
        address token1;
        uint112 reserve0;
        uint112 reserve1;
        // uint fees0;
        // uint fees1;
    }

    struct AddLiquidity {
        address tokenA;
        address tokenB;
        uint amountADesired;
        uint amountBDesired;
        uint amountAMin;
        uint amountBMin;
        address to;
        uint deadline;
    }

    address public immutable FACTORY;
   // address public immutable WETH;
    uint32 private constant MAX_UINT32 = type(uint32).max;
    uint8 private constant ZERO = 0;

    modifier ensure(uint256 deadline) {
        if (block.timestamp > deadline) {
            revert Expired();
        }
        _;
    }

    constructor(address factory, address weth) {
        FACTORY = factory;
        //WETH = weth;
    }

    receive() external payable {
        //assert(msg.sender == WETH); // only accept ETH via fallback from the WETH contract
    }

    // **** ADD LIQUIDITY ****

        // **** ADD LIQUIDITY ****
    function _addLiquidity(AddLiquidity calldata params) internal virtual returns (uint amountA, uint amountB, address pair) {

        uint reserveA;
        uint reserveB;

        {
            pair = ILFactory(FACTORY).getPool(params.tokenA, params.tokenB);
            // create the pair if it doesn't exist yet
            if (pair == address(0)) {
                pair = ILFactory(FACTORY).createPair(params.tokenA, params.tokenB);
                pools.push(pair);
            }   

            (reserveA, reserveB) = LV1Library.getReserves(pair, params.tokenA, params.tokenB);

        }

        {
            if (reserveA == 0 && reserveB == 0) {

                (amountA, amountB) = (params.amountADesired, params.amountBDesired);

            } else {
                uint amountBOptimal = LV1Library.quote(params.amountADesired, reserveA, reserveB);
                if (amountBOptimal <= params.amountBDesired) {
                    require(amountBOptimal >= params.amountBMin, ' INSUFFICIENT_B_AMOUNT');
                    (amountA, amountB) = (params.amountADesired, amountBOptimal);
                } else {
                    uint amountAOptimal = LV1Library.quote(params.amountBDesired, reserveB, reserveA);
                    assert(amountAOptimal <= params.amountADesired);
                    require(amountAOptimal >= params.amountAMin, ' INSUFFICIENT_A_AMOUNT');
                    (amountA, amountB) = (amountAOptimal, params.amountBDesired);
                }
         
            }
        
        }

    }
    function addLiquidity(AddLiquidity calldata params) external ensure(params.deadline) returns (uint amountA, uint amountB, uint liquidity, address pair) {
        (amountA, amountB, pair) = _addLiquidity(params);
        IERC20(params.tokenA).safeTransferFrom(msg.sender, pair, amountA);
        IERC20(params.tokenB).safeTransferFrom(msg.sender, pair, amountB);
        liquidity = LSwapPair(pair).mint(params.to);
    }


    // **** REMOVE LIQUIDITY ****
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) public ensure(deadline) returns (uint amountA, uint amountB) {
        address pair = ILFactory(FACTORY).getPool(tokenA, tokenB);
        LSwapPair(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
        (uint amount0, uint amount1) = LSwapPair(pair).burn(to);
        (address token0,) = LV1Library.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, ' INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, ' INSUFFICIENT_B_AMOUNT');
    }

    function swapExactTokenForToken(
        uint112 amountIn,
        uint112 amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external ensure(deadline) {

        bool isOutput0  =  path[0] > path[1];

        address pair = ILFactory(FACTORY).getPool(path[0], path[1]);

        IERC20(path[0]).safeTransferFrom(msg.sender, pair, uint(amountIn));

        uint112 amountOut = amountOutMin;

        (uint112 amount0Out, uint112 amount1Out) = isOutput0 ? (uint112(0), amountOut) : (amountOut, uint112(0));
  
        LSwapPair(pair).swap(amount0Out, amount1Out, to);
    }



    //Collateral


    function depositCollateral(IERC20 token, uint assets, address receiver) external virtual returns (uint amountA, uint amountB, address pair) {

        address collateral =  ILFactory(FACTORY).getCollateralPool(address(token));

        token.safeTransferFrom(msg.sender, address(this), assets);

        if (collateral == address(0)) {
            token.approve(FACTORY, assets);
            collateral = ILFactory(FACTORY).createCollateralPool(token, assets, receiver); 
            collateralPools.push(collateral);
        } else {
            token.approve(collateral, assets);
            LCollateralPool(collateral).deposit(assets, receiver);
        }

    }



    // Getters

    function getAmmPools(address owner) external returns (Pool [] memory allPools) {

        uint length = pools.length;

        allPools = new Pool[] (length);

        for (uint i = 0;  i < length; i++) {

            LSwapPair pool = LSwapPair(pools[i]);

            (address token0, address token1) = pool.getTokens();

            (uint112 reserve0, uint112 reserve1, ) = pool.getReserves();

            allPools[i] = Pool({
                pool: address(pool),
                token0: token0,
                token1: token1,
                reserve0: reserve0,
                reserve1: reserve1
                // uint fees0;
                // uint fees1;
            });
        

        }

    }

}
