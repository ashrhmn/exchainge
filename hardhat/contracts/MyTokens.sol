// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "hardhat/console.sol";

contract MyTokens is ERC1155, ERC1155Holder {
    using SafeMath for uint256;
    struct Token {
        string name;
        uint256 supply;
    }

    Token[] public tokens;

    uint256[] public tokenEquivalenceOfSingleEther;

    uint256 public floatingPoint;

    constructor(
        string[] memory _tokenNames,
        uint256[] memory _tokenSupplies,
        uint256[] memory _tokenPriceEquivalence,
        uint256 _floatingPoint
    ) ERC1155("https://game.example/api/item/{id}.json") {
        require(
            _tokenNames.length == _tokenSupplies.length &&
                _tokenPriceEquivalence.length == _tokenSupplies.length,
            "You must provide equal numbers of name, tokenSupplies and equivalentPrice"
        );

        // require(
        //     _floatingPoint >= 10,
        //     "Floating point should be greater/equal than/to 10"
        // );

        floatingPoint = _floatingPoint;

        for (uint256 i = 0; i < _tokenNames.length; ++i) {
            tokens.push(Token(_tokenNames[i], _tokenSupplies[i]));
            _mint(address(this), i, _tokenSupplies[i] * 10**floatingPoint, "");
            tokenEquivalenceOfSingleEther.push(_tokenPriceEquivalence[i]);
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC1155Receiver)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function tokenToEquivalentWei(uint256 tokenId, uint256 amount)
        public
        view
        returns (uint256)
    {
        amount = amount * 10**18;
        uint256 singleEtherAmountToken = tokenEquivalenceOfSingleEther[tokenId];
        uint256 result = amount.div(singleEtherAmountToken);
        // console.log(amount);
        // console.log(singleEtherAmountToken);
        // console.log(result);
        return result;
    }

    function tokenAequivalentTokenB(
        uint256 tokenIdA,
        uint256 tokenIdB,
        uint256 amount
    ) public view returns (uint256) {
        uint256 tokenValueA = tokenEquivalenceOfSingleEther[tokenIdA];
        uint256 tokenValueB = tokenEquivalenceOfSingleEther[tokenIdB];
        amount = amount * tokenValueB;
        uint256 equivalentvalue = amount.div(tokenValueA);
        return equivalentvalue;
    }

    function buyToken(uint256 tokenId, uint256 amount) public payable {
        console.log("buy token : msg.value");
        console.log(msg.value);
        console.log(tokenToEquivalentWei(tokenId, amount));

        require(
            msg.value >= tokenToEquivalentWei(tokenId, amount) - 1000, //leaving out 1000wei for floating value error
            "Amount not provided, buy token"
        );
        IERC1155(address(this)).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId,
            amount,
            ""
        );
    }

    function swapToken(
        uint256 tokenIdA,
        uint256 tokenIdB,
        uint256 amount
    ) public payable {
        safeTransferFrom(msg.sender, address(this), tokenIdA, amount, "");
        IERC1155(address(this)).safeTransferFrom(
            address(this),
            msg.sender,
            tokenIdB,
            tokenAequivalentTokenB(tokenIdA, tokenIdB, amount),
            ""
        );
    }

    function getTokens() public view returns (Token[] memory) {
        return tokens;
    }
}
