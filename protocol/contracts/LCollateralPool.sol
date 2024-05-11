// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "hardhat/console.sol";


contract LCollateralPool is ERC4626 {

    error OnlyFactory();

    address immutable public FACTORY;

    modifier isFactory() {
        if (msg.sender != FACTORY) revert OnlyFactory();
        _;
    }

    constructor(IERC20 _token, string memory _name, string memory _symbol) ERC4626(_token) ERC20(string.concat("L-", _name), string.concat("L-", _symbol))  {
        FACTORY = msg.sender;
    }

    function seizeTokens(address debtor, address liquidator, uint amount) external isFactory {
        //_asset.safeTransferFrom(debtor, liquidator, amount);
    }



    // function 

}