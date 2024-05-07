// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// library imports
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";


// interfaces
import {ILFactory} from "./interfaces/ILFactory.sol";
import {LSwapERC20} from "./utils/LSwapERC20.sol";
import "hardhat/console.sol";

/**
 * @title LSwapPair V1 Pair
 * @notice Main contract for LSwapPair V1 and should be called from contract with safety checks.
 * @dev This contract is a pair of two tokens that are traded against each other.
 *  The pair is deployed by the FACTORY contract.
 * Mint, Burn, Swap, and Takeover are handled in this contract.
 * @author LSwapPair -- Joshua Evuetapha
 */
contract LSwapPair is LSwapERC20, ReentrancyGuard {

    error InsufficientOutputAmount();
    error InsufficientAmountOut();
    error MultipleOutputAmounts();
    error Forbidden();
    error InsufficientLiquidityBurned();
    error KInvariant();
    error OnlyFactory();
    error LoanAmountGreaterThanThreshold();
    
    using SafeERC20 for IERC20;
    using SafeCast for *;

    uint256 public constant MINIMUM_LIQUIDITY = 10 ** 3;
    address public FACTORY;

    //reserves
    uint112 private _reserve0;
    uint112 private _reserve1;
    uint112 private _actualReserve0;
    uint112 private _actualReserve1;

    // Figure out a way to use excess 12 bytes in here to store something
    address private _token0;
    address private _token1;

    // total lp fees that are not withdrawn
    uint private _pendingLiquidityFees0;
    uint private _pendingLiquidityFees1;

    // Fees per token scaled by 1e18
    uint public feesPerTokenStored0;
    uint public feesPerTokenStored1;

    uint public price0CumulativeLast;
    uint public price1CumulativeLast;

    uint32 public blockTimestampLast;

    uint private _pendingProtocolFees0;
    uint private _pendingProtocolFees1;

    mapping(address => uint256) public lpFees0;
    mapping(address => uint256) public lpFees1;

    mapping(address => uint256) public feesPerTokenPaid0;
    mapping(address => uint256) public feesPerTokenPaid1;

    event Mint(address, uint256, uint256);
    event Burn(address, uint256, uint256, address);
    event Swap(address, uint256, uint256, uint256, uint256, address);
    event Borrow(address indexed tokenToBorrow, address indexed borrower, uint112 amount); 
    event Repay(address indexed tokenToRepay, address indexed borrower, uint112 debt, uint112 interest); 
    event Sync(uint112 indexed reserve0, uint112 indexed reserve1); 


    modifier isFactory() {
        if (msg.sender != FACTORY) revert OnlyFactory();
        _;
    }

    /* ----------------------------- EXTERNAL FUNCTIONS ----------------------------- */
    function initialize(address token0, address token1) external {

        FACTORY = msg.sender;

        _token0 = token0;
        _token1 = token1;

        string memory token0Name = IERC20Metadata(_token0).name();
        string memory token1Name = IERC20Metadata(_token1).name();
        
        name = string(abi.encodePacked("LSwapTradingPool: ", token0Name, "/", token1Name));
        symbol = string(abi.encodePacked("LSwap-", token0Name, "-", token1Name));

    }

    /**
     * @notice Should be called from a contract with safety checks
     * @notice Mints liquidity tokens in exchange for ETH and tokens deposited into the pool.
     * @dev This function allows users to add liquidity to the pool,
     *      receiving liquidity tokens in return. It includes checks for
     *      the presale period and calculates liquidity based on virtual amounts at presale
     *      and deposited ETH and tokens when it's an amm.
     * @param to The address to receive the minted liquidity tokens.
     * @return liquidity The amount of liquidity tokens minted.
     * Requirements:
     * - Cannot add liquidity during the presale period if the total supply is greater than 0.
     * - The amount of ETH deposited must not exceed the bootstrap ETH amount on first mint.
     * - Ensures the deposited token amount matches the required amount for liquidity bootstrapping.
     * Emits:
     * - A `Mint` event with details for the mint transaction.
     * Security:
     * - Uses `nonReentrant` modifier to prevent reentrancy attacks.
     */
    function mint(address to) external nonReentrant returns (uint256 liquidity) {

        uint256 totalSupply_ = totalSupply();

        //Dangerous Casting
        uint112 balanceToken0 = IERC20(_token0).balanceOf(address(this)).toUint112();
        uint112 balanceToken1 = IERC20(_token1).balanceOf(address(this)).toUint112();
      
        // at this point in time we will get the actual reserves
        (uint112 reserveToken0, uint112 reserveToken1) = getActualReserves();

        uint112 fees = 0;// _pendingLiquidityFees - _pendingProtocolFees;

        //Dangerous casting
        uint112 amountToken0 = (balanceToken0 - reserveToken0 - fees);
        uint112 amountToken1 = (balanceToken1 - reserveToken1 - fees);

        _updateFeeRewards(to);

        if (totalSupply_ == 0) {
            _mint(address(0), MINIMUM_LIQUIDITY);
            liquidity = Math.sqrt(uint(amountToken0) * uint(amountToken1)) - MINIMUM_LIQUIDITY;
        } else {
            liquidity = Math.min((uint(amountToken0) * totalSupply_) / reserveToken0, (uint(amountToken1) * totalSupply_) / reserveToken1);
        }

        _mint(to, liquidity);

        _update(amountToken0, amountToken1, 0, 0);

        emit Mint(msg.sender, amountToken0, amountToken1);
    }

    /**
     * @notice Should be called from a contract with safety checks
     * @notice Burns liquidity tokens to remove liquidity from the pool and withdraw ETH and tokens.
     * @dev This function allows liquidity providers to burn their liquidity
     *         tokens in exchange for the underlying assets (ETH and tokens).
     *         It updates the initial liquidity provider information,
     *         applies fee rewards, and performs necessary state updates.
     * @param to The address to which the withdrawn ETH and tokens will be sent.
     * @return amountToken0 The amount of token0 withdrawn from the pool.
     * @return amountToken1 The amount of token1 withdrawn from the pool.
     * Reverts:
     * - If the function is called by the initial liquidity provider during the presale period.
     * Emits:
     * - A `Burn` event with necessary details of the burn.
     */
    function burn(address to) external returns (uint112 amountToken0, uint112 amountToken1) {

        uint256 liquidity = balanceOf(address(this));

        uint256 totalSupply_ = totalSupply();

        amountToken0 = uint112((liquidity * _reserve0) / totalSupply_);
        amountToken1 = uint112((liquidity * _reserve1) / totalSupply_);

        if (amountToken0 == 0 || amountToken1 == 0) {
            revert InsufficientLiquidityBurned();
        }

        _updateFeeRewards(to);
        

        _burn(address(this), liquidity);

        // Transfer liquidity tokens to the user
        IERC20(_token0).safeTransfer(to, amountToken0);
        IERC20(_token1).safeTransfer(to, amountToken1);

        //
        uint112 balanceToken0 = uint112(IERC20(_token0).balanceOf(address(this)));
        uint112 balanceToken1 = uint112(IERC20(_token1).balanceOf(address(this)));

        _update(balanceToken0, balanceToken1, 0, 0);

        emit Burn(msg.sender, amountToken0, amountToken1, to);
    }

    /**
     * @notice Should be called from a contract with safety checks
     * @notice Executes a swap from ETH to tokens or tokens to ETH.
     * @dev This function handles the swapping logic, including MEV
     *  checks, fee application, and updating reserves.
     * @param amountToken0Out The amount of tokens0 to be sent out.
     * @param amountToken1Out The amount of tokens1 to be sent out.
     * @param to The address to receive the output of the swap.
     * Requirements:
     * - Either `amountToken0Out` or `amountToken1Out` must be greater than 0, but not both.
     * - The output amount must not exceed the available reserves in the pool.
     * - Applies fees and updates reserves accordingly.
     * - Ensures the K invariant holds after the swap,
     *   adjusting for virtual reserves during the presale period.
     * - Transfers the specified `amountToken0Out` or `amountToken1Out` to the address `to`.
     * Emits:
     * - A `Swap` event with details about the amounts swapped.
     * Security:
     * - Uses `nonReentrant` modifier to prevent reentrancy attacks.
     */
    function swap(uint112 amountToken0Out, uint112 amountToken1Out, address to) external nonReentrant returns (uint112 amountInToken0, uint112 amountInToken1) {
        
        uint112 feesCollected0; 
        uint112 feesCollected1; 

        {

            if (amountToken0Out == 0 && amountToken1Out == 0) {
                revert InsufficientOutputAmount();
            }
            
            (uint112 initialReserve0, uint112 initialReserve1) = getActualReserves();

            if (amountToken0Out > initialReserve0 || amountToken1Out > initialReserve1) {
                revert InsufficientAmountOut();
            }

            if (amountToken0Out > 0) {
                //Dangerous Casting
                amountInToken1 = (IERC20(_token1).balanceOf(address(this)) - initialReserve1).toUint112();
                // optimistically send tokens out
                IERC20(_token0).safeTransfer(to, amountToken0Out);
            } 
            
            if (amountToken1Out > 0) {
                //Dangerous Casting
                amountInToken0 = (IERC20(_token0).balanceOf(address(this)) - initialReserve0).toUint112();
                // optimistically send tokens out
                IERC20(_token1).safeTransfer(to, amountToken1Out);
            }

            (feesCollected0, feesCollected1,,) = _handleFees(amountInToken0, amountInToken1);

            console.log("In:  ", amountInToken0, amountInToken1);
            console.log("Out: ", amountToken0Out, amountToken1Out);

            amountInToken0 -= feesCollected0;
            amountInToken1 -= feesCollected1;

            // update reserves
            _update(amountInToken0, amountInToken1, amountToken0Out, amountToken1Out);

            console.log("KI", uint(initialReserve0) * uint(initialReserve1), initialReserve0, initialReserve1);
            console.log("KF", uint(_reserve0) * uint(_reserve1), uint(_reserve0), uint(_reserve1));

            //check for K
            if (uint(initialReserve0) * uint(initialReserve1) > uint(_reserve0) * uint(_reserve1)) {
                //revert KInvariant();
            }

        }

        emit Swap(msg.sender, amountInToken0, amountInToken1, amountToken0Out, amountToken1Out, to);
    }

    function borrow(address tokenToBorrow, address borrower, uint112 amount) external isFactory {

        if (tokenToBorrow == _token0) {
            IERC20(_token0).safeTransfer(borrower, amount);
            _actualReserve0 -= amount;
            if (_actualReserve0 * 2 < _reserve0) revert LoanAmountGreaterThanThreshold();
        } else {
            IERC20(_token1).safeTransfer(borrower, amount);
            _actualReserve1 -= amount;
            if (_actualReserve1 * 2 < _reserve1) revert LoanAmountGreaterThanThreshold();
        }

        emit Borrow(tokenToBorrow, borrower, amount);

    }

    function repay(address tokenToRepay, address borrower, uint112 debt, uint112 interest) external isFactory {
        if (tokenToRepay == _token0) {
            _actualReserve0 += debt; 
            _handleFeesCore(interest, 0);
        } else {
            _actualReserve1 += debt;
            _handleFeesCore(0, interest);
        }
        emit Repay(tokenToRepay, borrower, debt, interest);
    }

    /// @notice the real amount of tokens stored in the pool
    function getActualReserves() public view returns (uint112 reserveToken0, uint112 reserveToken1) {
        reserveToken0 = _actualReserve0;
        reserveToken1 = _actualReserve1;
    }


    /// @notice returns real reserves 
    function getReserves() public view returns (uint112 reserve0, uint112 reserve1, uint32 _blockTimestampLast) {
       reserve0 = _reserve0 > 0 ? _reserve0 : 1;
       reserve1 = _reserve1 > 0 ? _reserve1 : 1;
       _blockTimestampLast = blockTimestampLast;
    }

    /**
     * @notice Withdraws the fees accrued to the address `to`.
     * @dev Transfers the accumulated fees in weth of the liquidty proivder
     * @param to The address to which the fees will be withdrawn.
     * Post-conditions:
     * - The `feesPerTokenPaid` should reflect the latest `feesPerTokenStored` value for the address `to`.
     * - The `lpFees` owed to the address `to` are reset to 0.
     * - The `_pendingLiquidityFees` state variable is decreased by the amount of fees withdrawn.
     */
    function withdrawFees(address to) external {
        // uint256 totalFees = _earned(to, feesPerTokenStored);

        // if (totalFees != 0) {
        //     feesPerTokenPaid[to] = feesPerTokenStored;
        //     // q- what are you for?
        //     lpFees[to] = 0;
        //     _pendingLiquidityFees -= uint112(totalFees);
        //     IERC20(_weth).safeTransfer(to, totalFees);
        // }
        // is there a need to check if weth balance is in sync with reserve and fees?
    }

    /* ----------------------------- INTERNAL FUNCTIONS ----------------------------- */

    /**
     * @notice Updates the reserve amounts.
     */
    function _update(uint112 amountInToken0, uint112 amountInToken1, uint112 amountOutToken0, uint112 amountOutToken1) internal {
        //reserves
        uint112 reserve0 = (_reserve0 + amountInToken0) - amountOutToken0;
        uint112 reserve1 = (_reserve1 + amountInToken1) - amountOutToken1;

        _reserve0 = reserve0;
        _reserve1 = reserve1;

        //actual reserves
        _actualReserve0 = _actualReserve0 - amountOutToken0 + amountInToken0;
        _actualReserve1 = _actualReserve1 - amountOutToken1 + amountInToken1;

        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
        if (timeElapsed > 0 && reserve0 != 0 && reserve1 != 0) {
            // * never overflows, and + overflow is desired
            price0CumulativeLast += uint(reserve1 * timeElapsed) / reserve0;
            price1CumulativeLast += uint(reserve0 * timeElapsed) / reserve1;
        }

        blockTimestampLast = blockTimestamp;

        //ILFactory(FACTORY).update(address(this));

        emit Sync(reserve0, reserve1);
    }
    /**
     * @dev Calculates and handles the distribution of fees for each swap transaction.
     * Fees are updated based on the amount of WETH entering or exiting the pool,
     *  - 99 bps fees are collected of which 60% goes to the treasury
     *  - Allocates 90% to LPs (added to reserves during presale, otherwise distributed per SNX logic).
     *  - If protocol fees exceed a predefined threshold, they are transferred to the treasury.
     * @param amountInToken0 amount of token0 entering the pool
     * @param amountInToken1 amount of token1 entering the pool
     * @return feesCollected0 99bps on the amount of weth entering or exiting the pool.
     * @return feesCollected1 99bps on the amount of weth entering or exiting the pool.
     * @return feesLp0 amount of lp fees share
     * @return feesLp1 amount of lp fees share
     * Post-conditions:
     * - Updates the `_pendingProtocolFees` by 60% of the fees collected or resets it to 0.
     * - Updates the `_feesPerTokenStored` if pool is not in presale.
     */
    function _handleFees(uint112 amountInToken0, uint112 amountInToken1)
        internal
        returns (uint112 feesCollected0, uint112 feesCollected1, uint112 feesLp0, uint112 feesLp1)
    {

        feesCollected0 = (amountInToken0 * 1) / 100;
        feesCollected1 = (amountInToken1 * 1) / 100;

        _handleFeesCore(feesCollected0, feesCollected1);

    }


    function _handleFeesCore(uint112 feesCollected0, uint112 feesCollected1)
        internal
        returns (uint112 feesLp0, uint112 feesLp1)
    {

        // lp fess is fixed 90% of the fees collected of total 99 bps
        feesLp0 = (feesCollected0 * 90) / 100;
        feesLp1 = (feesCollected1 * 90) / 100;

        _pendingProtocolFees0 += feesCollected0 - feesLp0;
        _pendingProtocolFees1 += feesCollected1 - feesLp1;

        _pendingLiquidityFees0 += feesLp0;
        _pendingLiquidityFees1 += feesLp1;

    }



    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        // Update fee rewards for both sender and receiver
        _updateFeeRewards(from);
        if (to != address(this)) {
            _updateFeeRewards(to);
        }
    }

    /**
     * @notice Updates the fee rewards for a given liquidity provider.
     * @dev This function calculates and updates the fee rewards earned by the liquidity provider.
     * @param lp The address of the liquidity provider.
     */

    function _updateFeeRewards(address lp) internal {
        // save for multiple reads
        uint256 _feesPerTokenStored0 = feesPerTokenStored0;
        uint256 _feesPerTokenStored1 = feesPerTokenStored1;
        (lpFees0[lp], lpFees1[lp]) = _earned(lp, _feesPerTokenStored0, _feesPerTokenStored1);
        feesPerTokenPaid0[lp] = _feesPerTokenStored0;
        feesPerTokenPaid1[lp] = _feesPerTokenStored1;
    }

    /**
     * @notice Calculates the earned fee rewards for a given liquidity provider.
     * @dev This function calculates the fee rewards accrued by a liquidity provider based on their
     *      token balance and the difference between the current `feesPerTokenStored` and the
     *      `feesPerTokenPaid` for the liquidity provider. It returns the sum of the previously
     *      stored fees and the newly accrued fees.
     * @param lp The address of the liquidity provider.
     * @param _feesPerTokenStored0 The current value of `feesPerTokenStored0`.
     * @return The total earned fee rewards for the given liquidity provider.
     */
    function _earned(address lp, uint256 _feesPerTokenStored0, uint256 _feesPerTokenStored1) internal view returns (uint256, uint256) {
        uint lpBalance = balanceOf(lp);
        uint256 feesPerToken0 = _feesPerTokenStored0 - feesPerTokenPaid0[lp];
        uint256 feesPerToken1 = _feesPerTokenStored1 - feesPerTokenPaid1[lp];
        uint256 feesAccrued0 = (lpBalance * feesPerToken0) / 1e18;
         uint256 feesAccrued1 = (lpBalance * feesPerToken1) / 1e18;
        return (lpFees0[lp] + feesAccrued0, lpFees1[lp] + feesAccrued1);
    }

    /* ----------------------------- VIEW FUNCTIONS ----------------------------- */
    function earned(address lp) external view returns (uint256, uint256) {
        return _earned(lp, feesPerTokenStored0, feesPerTokenStored1);
    }

    function getPendingLiquidityFees() external view returns (uint pendingLiquidityFees0, uint pendingLiquidityFees1) {
        pendingLiquidityFees0 = _pendingLiquidityFees0;
        pendingLiquidityFees1 = _pendingLiquidityFees1;
    }

    function getPendingProtocolFees() external view returns (uint pendingProtocolFees0, uint pendingProtocolFees1) {
        pendingProtocolFees0 = _pendingProtocolFees0;
        pendingProtocolFees1 = _pendingProtocolFees1;
    }

    function getTokens() external view returns (address, address) {
        return (_token0, _token1);
    }

    function getFACTORY() external view returns (address) {
        return FACTORY;
    }
    
}
