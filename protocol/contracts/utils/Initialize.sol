// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;


abstract contract Initialize {

    error AlreadyInitialized();

    bool initialized;

    modifier OnlyInitializer() {
        if (initialized) revert AlreadyInitialized();
        initialized = true;
        _;
    }


}