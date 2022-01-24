// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract MyTokens is ERC1155 {
    using SafeMath for uint256;
    uint256 rate = 100;
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

    function buyToken(
        uint256 _id,
        uint256 _amount,
        address _address
    ) public payable {
        uint256 tokenAmount = _amount * rate;
        require(tokenAmount > 0, "You must buy at least 1 token");
        require(
            tokenAmount <= tokens[_id].supply,
            "You can't buy more than the supply"
        );
        safeTransferFrom(msg.sender, _address, _id, _amount, "");
    }

    function checkBalance(address _owner, uint256 _id)
        public
        view
        returns (uint256)
    {
        return balanceOf(_owner, _id);
    }

    function swapToken(
        uint256 _id1,
        uint256 _id2,
        uint256 _amountOfId1,
        address _add
    ) public payable {
        uint256 rate1 = tokenEquivalenceOfSingleEther[_id1].div(
            tokenEquivalenceOfSingleEther[_id2]
        );
        if (rate1 == 0) {
            rate1 = 1;
        }
        uint256 rate2 = tokenEquivalenceOfSingleEther[_id2].div(
            tokenEquivalenceOfSingleEther[_id1]
        );
        uint256 tokenAmount1 = _amountOfId1.mul(rate1);
        uint256 tokenAmount2 = _amountOfId1 * rate2;
        console.log(tokenAmount1);
        console.log("hehe");
        // _setApprovalForAll(msg.sender,_add, true);
        //setApprovalForAll(_add, true);
        safeTransferFrom(msg.sender, _add, _id1, tokenAmount1, "");
        //safeTransferFrom(_add, msg.sender, _id2, tokenAmount2, "");
        
    }

    function tokenToEther(uint256 _id1, uint256 _id2)
        public
        view
        returns (uint256)
    {
        // uint256 rate = tokenEquivalenceOfSingleEther[_id1].div(tokenEquivalenceOfSingleEther[_id2]);
        //     if(rate == 0){
        //         rate = 1;
        //     }
        //     return rate;
    }
}
