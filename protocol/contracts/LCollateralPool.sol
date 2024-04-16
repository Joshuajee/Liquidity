// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import "hardhat/console.sol";


contract LCollateralPool is ERC4626 {

    constructor(IERC20 _token, string calldata _name, string calldata _symbol) ERC4626(_token) ERC20(string.concat("L-", _name), string.concat("L-", _symbol))  {

    }

}