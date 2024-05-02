// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// library imports
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ILFactory} from "../interfaces/ILFactory.sol";
import {LSwapPair} from "../LSwapPair.sol";


import {LV1Library} from "../liberies/LV1Library.sol";


/**
 * @title LSwap V1 Router
 * @notice Router for stateless execution of swaps and liquidity provision
 * @dev This contract is used for adding/removing liquidity, swapping tokens and withdrawing fees
 * @dev This contract is stateless and does not store any data
 * @author LSwap -- Joshua Evuetapha
 */
contract LV1Router is ReentrancyGuard {

    error Expired();

    using SafeERC20 for IERC20;

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
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal virtual returns (uint amountA, uint amountB) {

        address pair = ILFactory(FACTORY).getPool(tokenA, tokenB);
        // create the pair if it doesn't exist yet
        if (ILFactory(FACTORY).getPool(tokenA, tokenB) == address(0)) {
            pair = ILFactory(FACTORY).createPair(tokenA, tokenB);
        }   

        {

            (uint reserveA, uint reserveB) = LV1Library.getReserves(pair, tokenA, tokenB);

            if (reserveA == 0 && reserveB == 0) {

                (amountA, amountB) = (amountADesired, amountBDesired);

            } else {
                uint amountBOptimal = LV1Library.quote(amountADesired, reserveA, reserveB);
                if (amountBOptimal <= amountBDesired) {
                    require(amountBOptimal >= amountBMin, ' INSUFFICIENT_B_AMOUNT');
                    (amountA, amountB) = (amountADesired, amountBOptimal);
                } else {
                    uint amountAOptimal = LV1Library.quote(amountBDesired, reserveB, reserveA);
                    assert(amountAOptimal <= amountADesired);
                    require(amountAOptimal >= amountAMin, ' INSUFFICIENT_A_AMOUNT');
                    (amountA, amountB) = (amountAOptimal, amountBDesired);
                }
         
            }
        
        }
        
    }
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
        (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
        {
            address pair =  ILFactory(FACTORY).getPool(tokenA, tokenB);
            IERC20(tokenA).safeTransferFrom(msg.sender, pair, amountA);
            IERC20(tokenB).safeTransferFrom(msg.sender, pair, amountB);
            liquidity = LSwapPair(pair).mint(to);
        }
    }

    // function addLiquidityETH(
    //     address token,
    //     uint amountTokenDesired,
    //     uint amountTokenMin,
    //     uint amountETHMin,
    //     address to,
    //     uint deadline
    // ) external virtual override payable ensure(deadline) returns (uint amountToken, uint amountETH, uint liquidity) {
    //     (amountToken, amountETH) = _addLiquidity(
    //         token,
    //         WETH,
    //         amountTokenDesired,
    //         msg.value,
    //         amountTokenMin,
    //         amountETHMin
    //     );
    //     address pair = LV1Library.pairFor(factory, token, WETH);
    //     IERC20().safeTransferFrom(token, msg.sender, pair, amountToken);
    //     IWETH(WETH).deposit{value: amountETH}();
    //     assert(IWETH(WETH).transfer(pair, amountETH));
    //     liquidity = LSwapPair(pair).mint(to);
    //     // refund dust eth, if any
    //     if (msg.value > amountETH) IERC20().safeTransferETH(msg.sender, msg.value - amountETH);
    // }

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
        // (address token0,) = LV1Library.sortTokens(tokenA, tokenB);
        // (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
        require(amountA >= amountAMin, ' INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, ' INSUFFICIENT_B_AMOUNT');
    }
    // function removeLiquidityETH(
    //     address token,
    //     uint liquidity,
    //     uint amountTokenMin,
    //     uint amountETHMin,
    //     address to,
    //     uint deadline
    // ) public virtual override ensure(deadline) returns (uint amountToken, uint amountETH) {
    //     (amountToken, amountETH) = removeLiquidity(
    //         token,
    //         WETH,
    //         liquidity,
    //         amountTokenMin,
    //         amountETHMin,
    //         address(this),
    //         deadline
    //     );
    //     IERC20().safeTransfer(token, to, amountToken);
    //     IWETH(WETH).withdraw(amountETH);
    //     IERC20().safeTransferETH(to, amountETH);
    // }

    // **** SWAP ****
    // requires the initial amount to have already been sent to the first pair
    function _swap(uint[] memory amounts, address[] memory path, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            
            address pair = ILFactory(FACTORY).getPool(input, output);

            (address token0,) = LV1Library.sortTokens(input, output);

            uint amountOut = amounts[i + 1];

            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            
            address to = i < path.length - 2 ? ILFactory(FACTORY).getPool(output, path[i + 2]) : _to;
            
            LSwapPair(pair).swap(amount0Out, amount1Out, to);

        }
    }
    // function swapExactTokensForTokens(
    //     uint amountIn,
    //     uint amountOutMin,
    //     address[] calldata path,
    //     address to,
    //     uint deadline
    // ) external virtual override ensure(deadline) returns (uint[] memory amounts) {
    //     amounts = LV1Library.getAmountsOut(factory, amountIn, path);
    //     require(amounts[amounts.length - 1] >= amountOutMin, ' INSUFFICIENT_OUTPUT_AMOUNT');
    //     IERC20().safeTransferFrom(
    //         path[0], msg.sender, LV1Library.pairFor(factory, path[0], path[1]), amounts[0]
    //     );
    //     _swap(amounts, path, to);
    // }
    // function swapTokensForExactTokens(
    //     uint amountOut,
    //     uint amountInMax,
    //     address[] calldata path,
    //     address to,
    //     uint deadline
    // ) external virtual override ensure(deadline) returns (uint[] memory amounts) {
    //     amounts = LV1Library.getAmountsIn(factory, amountOut, path);
    //     require(amounts[0] <= amountInMax, ' EXCESSIVE_INPUT_AMOUNT');
    //     IERC20().safeTransferFrom(
    //         path[0], msg.sender, LV1Library.pairFor(factory, path[0], path[1]), amounts[0]
    //     );
    //     _swap(amounts, path, to);
    // }

}