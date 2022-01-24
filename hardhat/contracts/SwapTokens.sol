// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./MyTokens.sol";

contract SwapTokens {
    string public name = "EthSwap";
    string[] public allTokens = ["ETH", "TOKEN"];

    constructor(string memory _name) public{
       name = _name;
    }

}
