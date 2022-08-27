//in front-End javascript we use import instead of require
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connect-btn")
const fundButton = document.getElementById("fund-btn")
const balanceButton = document.getElementById("balance-btn")
const withdrawButton = document.getElementById("withdraw-btn")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    //we are using the request object in metamask to use the eth_requestAccounts method to connect our wallet
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "connected"
    } else {
        connectButton.innerHTML = "Please install metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

//to send a transaction we need a provider / connection to a blockchain
// signer/ wallet / somone with gas
// contract that we are intracting with , we need abi & adress

async function fund() {
    const ethAmount = document.getElementById("eth-Amount").value
    if (ethAmount > 0) {
        if (typeof window.ethereum !== "undefined") {
            console.log(`Funding with ${ethAmount} ETH`)

            /* this line uses Web3Provider to take the http end point and stickes it in 
        ethers for us , this looks at our metamask and it makes it our provider */

            // 1-getting the provider
            const provider = new ethers.providers.Web3Provider(window.ethereum)

            // 2- getting singer/wallet
            // this will return the wallet connected to our provider adn return the account we are connected with
            const signer = provider.getSigner()
            console.log(signer)

            // 3- getting the contract : ABI & ADDRESS
            const contract = new ethers.Contract(contractAddress, abi, signer)
            try {
                const transactionResponse = await contract.fund({
                    value: ethers.utils.parseEther(ethAmount),
                })
                await listenForTransactionMined(transactionResponse, provider)
                console.log("done")
            } catch (error) {
                console.error(error)
            }
        } else {
            console.log("please install metamask to may make any Trasnactions")
        }
    } else {
        console.log("please type in the amount you want to fund with")
    }
}

// listen for the tx to be mined
function listenForTransactionMined(transactionResponse, provider) {
    console.log(`mining ${transactionResponse.hash}.....`)
    // create a listner for the blockchain , and listen for the tx to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("withdrawing....")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMined(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
