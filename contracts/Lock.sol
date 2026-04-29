// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PublishingAgreement {

    address public author;
    address public publisher;

    uint public amount;
    uint public endTime;
    uint public authorShare; // percentage e.g. 70 means 70% goes to author

    bool public isReleased;

    constructor(address _author, address _publisher, uint _duration, uint _amount, uint _authorShare) payable {
      require(_authorShare <= 100, "Author share cannot exceed 100%");
      author = _author;
      publisher = _publisher;
      endTime = block.timestamp + _duration;
      amount = _amount;
      authorShare = _authorShare;
      isReleased = false;
    }

    // Anyone can pay into the agreement (buyers, additional payments)
    function payAgreement() external payable {
        require(msg.value > 0, "Amount required");
    }

    // Release funds after expiry with revenue split between author and publisher
    function releaseFunds() external {
        require(block.timestamp >= endTime, "Not expired yet");
        require(!isReleased, "Already released");
        require(address(this).balance > 0, "No funds to release");

        isReleased = true;

        uint totalBalance = address(this).balance;
        uint authorAmount = (totalBalance * authorShare) / 100;
        uint publisherAmount = totalBalance - authorAmount;

        payable(author).transfer(authorAmount);
        payable(publisher).transfer(publisherAmount);
    }
}