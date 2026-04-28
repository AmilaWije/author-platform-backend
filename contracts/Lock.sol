// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PublishingAgreement {

    address public author;
    address public publisher;

    uint public amount;
    uint public endTime;

    bool public isPaid;
    bool public isReleased;

    constructor(address _author, address _publisher, uint _duration, uint _amount) payable {
      author = _author;
      publisher = _publisher;
      endTime = block.timestamp + _duration;
      amount = _amount;
      isPaid = true;
    }

    // Buyer pays money
    function payAgreement() external payable {
        require(!isPaid, "Already paid");
        require(msg.value > 0, "Amount required");

        amount = msg.value;
        isPaid = true;
    }

    // Release funds after expiry
    function releaseFunds() external {
        require(block.timestamp >= endTime, "Not expired yet");
        require(isPaid, "Payment not done");
        require(!isReleased, "Already released");

        isReleased = true;

        payable(author).transfer(address(this).balance);
    }

    function pay() external payable {
        require(!isPaid, "Already paid");
        require(msg.value > 0, "Amount required");

        isPaid = true;
    }
}