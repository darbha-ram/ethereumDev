// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.22;

import "hardhat/console.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { UD21x18 } from "@prb/math/src/UD21x18.sol";
import { ISablierFlow } from "@sablier/flow/src/interfaces/ISablierFlow.sol";

/// @title FlowStreamCreator
/// @dev This contract allows users to create Sablier flow streams.
contract FlowStreamCreator {
    //IERC20 public constant DAI = IERC20(0x2957264912494fbD60fff635cCc6e6f43d38c312);
    IERC20       public immutable MITCOIN;
    ISablierFlow public immutable FLOW;
    address      public immutable RECEIVER;

    constructor(address myFlowAddr, address myErc20, address myReceiver) {
        FLOW     = ISablierFlow(myFlowAddr);
        MITCOIN  = IERC20(myErc20);
        RECEIVER = myReceiver;

        console.log("FlowStreamCreator ctor: receiver = ", RECEIVER);
    }

    /// @notice Creates a new Sablier flow stream without upfront deposit.
    function createFlowStream() external returns (uint256 streamId) {
        // Create the flow stream using the `create` function.
        streamId = FLOW.create({
            sender: msg.sender,                                 // sender can pause stream or change RPS
            //recipient: address(0xCAFE),
            recipient: RECEIVER,
            ratePerSecond: UD21x18.wrap(1_157_407_407_407_407), // ~ 100e18 MITCOIN per day
            token: MITCOIN,                                     // token being streamed
            transferable: true                                  // if stream to be transferable or not
         });

        console.log("FlowStream created (zero deposit): ", streamId);
    }

    /// @notice Creates a new Sablier flow stream with some upfront deposit.
    /// @dev Before calling this function, the user must first approve this contract
    /// to spend the tokens from the user's address.
    function createFlowStreamAndDeposit(uint128 depositAmount) external returns (uint256 streamId) {
        // Transfer the provided amount of tokens to this contract
        MITCOIN.transferFrom(msg.sender, address(this), depositAmount);

        // Approve the Flow contract to spend DAI
        MITCOIN.approve(address(FLOW), depositAmount);

        // Create the flow stream using the `createAndDeposit` function,
        // which would also deposit tokens into the stream.
        streamId = FLOW.createAndDeposit({
            sender: msg.sender,
            recipient: RECEIVER,
            ratePerSecond: UD21x18.wrap(1_157_407_407_407_407),
            token: MITCOIN,
            transferable: true,
            amount: depositAmount
        });

        console.log("FlowStream created (non-zero deposit): ", streamId);
    }

    function myver() public pure returns(string memory) {
        return "7May.1150";
    }

}

