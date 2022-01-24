// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract MyTokens is ERC1155 {
    using SafeMath for uint256;
    struct Token {
        string name;
        uint256 supply;
    }

    Token[] public tokens;

    uint256[] public tokenEquivalenceOfSingleEther;

    constructor(
        string[] memory _tokenNames,
        uint256[] memory _tokenSupplies,
        uint256[] memory _tokenPriceEquivalence
    ) ERC1155("https://game.example/api/item/{id}.json") {
        require(
            _tokenNames.length == _tokenSupplies.length &&
                _tokenPriceEquivalence.length == _tokenSupplies.length,
            "You must provide equal numbers of name, tokenSupplies and equivalentPrice"
        );

        for (uint256 i = 0; i < _tokenNames.length; ++i) {
            tokens.push(Token(_tokenNames[i], _tokenSupplies[i]));
            _mint(msg.sender, i, _tokenSupplies[i], "");
            tokenEquivalenceOfSingleEther.push(_tokenPriceEquivalence[i]);
        }
    }

    function tokenToEquivalentWei(uint256 tokenId, uint256 amount)
        public
        view
        returns (uint256)
    {
        amount = amount * 10**18;
        uint256 singleEtherAmountToken = tokenEquivalenceOfSingleEther[tokenId];
        uint256 result = amount.div(singleEtherAmountToken);
        console.log(amount);
        console.log(singleEtherAmountToken);
        console.log(result);
        return result;
    }

    function getTokens() public view returns (Token[] memory) {
        return tokens;
    }
}
