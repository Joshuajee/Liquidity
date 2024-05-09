import { mine } from "@nomicfoundation/hardhat-network-helpers";


async function move() {
    await mine(1200);
}

move()