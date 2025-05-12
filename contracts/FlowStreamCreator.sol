// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.22;

import "hardhat/console.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { UD21x18 } from "@prb/math/src/UD21x18.sol";
import { ISablierFlow } from "@sablier/flow/src/interfaces/ISablierFlow.sol";

/// @title FlowStreamCreator
/// @dev This contract allows users to create Sablier flow streams.
contract FlowStreamCreator {

    // This contract 'binds' to the given Sablier Flow and ERC20 contracts.
    // New streams are created using this ERC20 as currency and this Flow
    // contract, with a fixed RPS of 100 coins/day.
    //IERC20 public constant DAI = IERC20(0x2957264912494fbD60fff635cCc6e6f43d38c312);
    IERC20       public immutable MITCOIN;
    ISablierFlow public immutable FLOW;

    // data about created streams -- stream Ids are assumed to grow monotonically by 1. 
    mapping(uint256 => address) public receivers;
    uint256                     public lastStreamId;

    constructor(address myFlowAddr, address myErc20) {

        // Note: input args are plain 'address' types, which are being cast 
        //     flowFact = await ethers.getContractFactory("MySablierFlow")
        //     flowCon  = await flowFact.attach('0x88446cad8e1571065b22578d94c4f72425b4dec8')
        //       or
        //     flowCon  = await flowFact.attach(myFlowAddr)
        FLOW     = ISablierFlow(myFlowAddr);
        MITCOIN  = IERC20(myErc20);
        lastStreamId = 0;
    }

    //
    // Stream create & update methods
    //

    /// @notice Creates a new Sablier flow stream without upfront deposit.
    function createFlowStream(address recvr) external returns (uint256 streamId) {
        // Create the flow stream using the `create` function.
        streamId = FLOW.create({
            sender: msg.sender,                                 // sender can pause stream or change RPS
            recipient: recvr,                                   // e.g., address(0xCAFE)
            ratePerSecond: UD21x18.wrap(1_157_407_407_407_407), // ~ 100e18 MITCOIN per day
            token: MITCOIN,                                     // token being streamed
            transferable: true                                  // if stream to be transferable or not
        });

        if (streamId > 0) {
            lastStreamId = streamId;
            receivers[streamId] = recvr;
            console.log("Stream created (zero deposit): ", streamId);
        }
        else {
            console.log("Stream create without deposit failed");
        }
    }

    /// @notice Creates a new Sablier flow stream with some upfront deposit.
    /// @dev Before calling this function, the user must first approve this contract
    /// to spend the tokens from the user's address.
    function createFlowStreamAndDeposit(address recvr, uint128 depositAmount) external returns (uint256 streamId) {
        // Transfer the provided amount of tokens to this contract
        MITCOIN.transferFrom(msg.sender, address(this), depositAmount);

        // Approve the Flow contract to spend MitCoin
        MITCOIN.approve(address(FLOW), depositAmount);

        // Create the flow stream using the `createAndDeposit` function,
        // which would also deposit tokens into the stream.
        streamId = FLOW.createAndDeposit({
            sender: msg.sender,
            recipient: recvr,
            ratePerSecond: UD21x18.wrap(1_157_407_407_407_407),
            token: MITCOIN,
            transferable: true,
            amount: depositAmount
        });

        if (streamId > 0) {
            lastStreamId = streamId;
            receivers[streamId] = recvr;
            console.log("FlowStream created (with deposit): ", streamId);
        }
        else {
            console.log("Stream create with deposit failed");
        }
    }




    function myver() public pure returns(string memory) {
        return "12May.0837";
    }

}

