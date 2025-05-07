// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { FlowNFTDescriptor } from "@sablier/flow/src/FlowNFTDescriptor.sol";


// FlowNFTDescriptor

contract MyFlowNFTDesc is FlowNFTDescriptor {
    constructor() FlowNFTDescriptor() {}

    function myver() public pure returns(string memory) {
        return "6May.1610";
    }
}
