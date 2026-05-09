// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PublishingAgreement {

    address public author;
    address public publisher;
    address public buyer;

    uint public amount;
    uint public endTime;
    uint public authorShare;
    uint public discountPrice;

    bool public isReleased;
    bool public isForSale;

    constructor(address _author, address _publisher, uint _duration, uint _amount, uint _authorShare) payable {
      require(_authorShare <= 100, "Author share cannot exceed 100%");
      author = _author;
      publisher = _publisher;
      endTime = block.timestamp + _duration;
      amount = _amount;
      authorShare = _authorShare;
      discountPrice = 0;
      isReleased = false;
      isForSale = false;
    }

    function payAgreement() external payable {
        require(msg.value > 0, "Amount required");
    }

    function sellAgreement(uint _discountPrice) external {
        require(msg.sender == author, "Only author can sell");
        require(!isReleased, "Already released");
        require(!isForSale, "Already for sale");
        require(_discountPrice > 0, "Price must be > 0");
        require(_discountPrice < amount, "Price must be < amount");

        isForSale = true;
        discountPrice = _discountPrice;
    }

    function buyAgreement() external payable {
        require(isForSale, "Not for sale");
        require(!isReleased, "Already released");
        require(msg.value == discountPrice, "Must pay exact price");
        require(msg.sender != author, "Author cannot buy");

        buyer = msg.sender;
        isForSale = false;
    }

    function releaseFunds() external {
        require(block.timestamp >= endTime, "Not expired yet");
        require(!isReleased, "Already released");
        require(address(this).balance > 0, "No funds");

        isReleased = true;

        uint totalBalance = address(this).balance;
        uint authorAmount = (totalBalance * authorShare) / 100;
        uint publisherAmount = totalBalance - authorAmount;

        if (buyer != address(0)) {
            payable(buyer).transfer(authorAmount);
        } else {
            payable(author).transfer(authorAmount);
        }

        payable(publisher).transfer(publisherAmount);
    }
}