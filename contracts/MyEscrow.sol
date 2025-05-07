// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
 
contract MyEscrow {
    address public buyer;
    address public seller;
    address public arbiter;
    uint public amount;

    enum State { AWAITING_DEPOSIT, DEPOSIT_DONE, RELEASED, CANCELLED }
    State public currentState;
 
    constructor(address _buyer, address _seller, address _arbiter) {
        buyer = _buyer;
        seller = _seller;
        arbiter = _arbiter;
        currentState = State.AWAITING_DEPOSIT;
        amount = 0;

        console.log ("MyEscrow constructor");
    }
 
    function deposit() external payable {
        require(currentState == State.AWAITING_DEPOSIT, "Deposit already made or contract completed");
        require(msg.sender == buyer, "Only buyer can deposit");
        require(amount == 0, "Deposit already made or contract completed");
        require(msg.value > 0, "Deposit amount must be non-zero");

        amount = msg.value;
        currentState = State.DEPOSIT_DONE;

        console.log ("MyEscrow.deposit() done");
    }
 
    function release() external {
        require(currentState == State.DEPOSIT_DONE, "Deposit not done or already released/cancelled");
        require(msg.sender == buyer || msg.sender == arbiter, "Only buyer or arbiter can release");

        payable(seller).transfer(amount);
        currentState = State.RELEASED;
        amount = 0;

        console.log ("MyEscrow.release() done");
    }
 
    function cancel() external {
        require(currentState == State.DEPOSIT_DONE, "Deposit not done or already released/cancelled");
        require(msg.sender == buyer || msg.sender == arbiter, "Only buyer or arbiter can cancel");

        payable(buyer).transfer(amount);
        currentState = State.CANCELLED;
        amount = 0;

        console.log ("MyEscrow.cancel() done");
    }
}
