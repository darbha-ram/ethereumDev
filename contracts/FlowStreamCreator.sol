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
    // New streams are created using this ERC20 coin and a fixed RPS of 100 coins/day.

    // ISablierFlow requires that the entity set as the "sender" of a new stream must
    // be the msg.sender for calls to pause(), restart(), etc. Hence, for now, make
    // all updates go through the FlowStreamCreator contract and set its address as
    // the "sender" of all streams.

    //IERC20 public constant DAI = IERC20(0x2957264912494fbD60fff635cCc6e6f43d38c312);
    IERC20       public immutable MITCOIN;
    ISablierFlow public immutable FLOW;

    // 1 coin is 10^18 token decimals; 100 coins is 10^20 token decimals.
    // 100 coins per day = 10^20 / 86,400 token decimals per sec
    //                   = 1,157,407,407,407,407.407.. token decimals per sec.
    //                   = 1_157_407_407_407_407 (ignore fractional part).
    // 1 coin            = 10^18 = 1 followed by 6 sets of "000"
    uint128 public constant HUNDRED_COINS_PER_DAY = 1_157_407_407_407_407;
    uint128 public constant ONE_COIN              = 1_000_000_000_000_000_000;

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
    // Stream and update methods
    //

    /// @notice Creates a new Sablier flow stream without upfront deposit.
    function createFlowStream(address recvr) external returns (uint256 streamId) {
        // Create the flow stream using the `create` function.
        streamId = FLOW.create({
            // As noted above, set stream's "sender" to this contract (not the actual
            // msg.sender) to allow its methods to pause/update the stream.
            //sender: msg.sender
            sender:        address(this),
            recipient:     recvr,                               // e.g., address(0xCAFE)
            ratePerSecond: UD21x18.wrap(HUNDRED_COINS_PER_DAY), // ~ 100e18 MITCOIN per day
            token:         MITCOIN,                             // token being streamed
            transferable:  true
        });

        if (streamId > 0) {
            lastStreamId        = streamId;
            receivers[streamId] = recvr;
            console.log("Stream created (zero deposit): ", streamId);
        }
        else {
            console.log("Stream create without deposit failed");
        }
    }

    /// @notice Creates a new Sablier flow stream with some upfront deposit.
    /// @dev Before calling this function, the user must first approve this contract
    /// to spend the tokens from the (sender) user's address.
    function createFlowStreamAndDeposit(address recvr, uint128 depositAmount) external returns (uint256 streamId) {
        // Transfer the provided amount of tokens to this contract
        MITCOIN.transferFrom(msg.sender, address(this), depositAmount);

        // Approve the Flow contract to spend MitCoin
        MITCOIN.approve(address(FLOW), depositAmount);

        // Create the flow stream using the `createAndDeposit` function,
        // which would also deposit tokens into the stream.
        streamId = FLOW.createAndDeposit({
            //sender: msg.sender,            // see create() above
            sender:        address(this),
            recipient:     recvr,
            ratePerSecond: UD21x18.wrap(HUNDRED_COINS_PER_DAY),
            token:         MITCOIN,
            transferable:  true,
            amount:        depositAmount
        });

        if (streamId > 0) {
            lastStreamId        = streamId;
            receivers[streamId] = recvr;
            console.log("FlowStream created (with deposit): ", streamId);
        }
        else {
            console.log("Stream create with deposit failed");
        }
    }


    /// @notice Pause a Sablier flow stream.
    function pauseFlowStream(uint256 streamId) external payable {
        // The pause() API requires msg.sender to be the stream's "sender". To allow
        // invocation of pause() from this contract, "sender" was set earlier at
        // stream creation time to this contract's address.
        FLOW.pause(streamId);
        console.log("Stream pause: ", streamId);
    }

    /// @notice Restart a paused Sablier flow stream.
    function restartFlowStream(uint256 sid) external payable {
        FLOW.restart({
            streamId:      sid,
            ratePerSecond: UD21x18.wrap(HUNDRED_COINS_PER_DAY)
        });
        console.log("Stream restart: ", sid);
    }

    /// @notice Deposit to a Sablier flow stream.
    function depositFlowStream(uint256 sid, uint128 numCoins) external {
        // numCoins should be in token decimals (6,000,000,000,000,000,000)
        // but for now use integer #coins (6) for convenience.

        // ISablierFlow contract is going to do the ERC20 transfer. It needs
        // to be given permissions to transfer funds from this contract's
        // address (i.e., the stream's sender) to the stream's receiver first..
        MITCOIN.approve(address(FLOW), (ONE_COIN * numCoins));

        // .. and now the deposit can proceed.
        FLOW.deposit({
            streamId:  sid,
            amount:    (ONE_COIN * numCoins),
            //sender:    msg.sender,
            sender:    address(this),
            recipient: receivers[sid]
        });
        console.log("Stream deposit: ", sid);
    }

    /// @notice Withdraw from a Sablier flow stream.
    function withdrawFlowStream(uint256 sid, uint128 numCoins) external {
        // numCoins should be in token decimals (6,000,000,000,000,000,000)
        // but for now use integer #coins (6) for convenience.
        FLOW.withdraw({
            streamId: sid,
            to:       receivers[sid],
            amount:   (ONE_COIN * numCoins)
        });
        console.log("Stream withdrawal: ", sid);
    }


    function myver() public pure returns(string memory) {
        return "13May.1320";
    }

}

