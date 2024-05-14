// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";


// interfaces
import {ILFactory} from "./interfaces/ILFactory.sol";


contract LCollateralPool is ERC4626 {

    using SafeERC20 for IERC20;

    error OnlyFactory();
    error CannotRemoveLiquidity();

    address immutable public FACTORY;

    modifier isFactory() {
        if (msg.sender != FACTORY) revert OnlyFactory();
        _;
    }

    constructor(IERC20 _token, string memory _name, string memory _symbol) ERC4626(_token) ERC20(string.concat("L-", _name), string.concat("L-", _symbol))  {
        FACTORY = msg.sender;
    }

    function seizeTokens(address debtor, address liquidator, uint amount) external isFactory {
        IERC20(asset()).safeTransferFrom(debtor, liquidator, amount);
    }

    function transfer(address to, uint256 value) public virtual override(ERC20, IERC20) returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, value);
        bool isLiquidatable = ILFactory(FACTORY).isLiquidatable(owner, address(this));
        if (isLiquidatable) revert CannotRemoveLiquidity();
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public virtual override(ERC20, IERC20) returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, value);
        _transfer(from, to, value);
        bool isLiquidatable = ILFactory(FACTORY).isLiquidatable(from, address(this));
        if (isLiquidatable) revert CannotRemoveLiquidity();
        return true;
    }

}