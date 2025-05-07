// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { SablierFlow } from "@sablier/flow/src/SablierFlow.sol";
import { IFlowNFTDescriptor } from "@sablier/flow/src/interfaces/IFlowNFTDescriptor.sol";

contract MySablierFlow is SablierFlow {
    constructor(address initAdmin, IFlowNFTDescriptor initNftDesc) SablierFlow (initAdmin, initNftDesc) {}

    function myver() public pure returns (string memory) {
        return "6May.1623";
    }
}
