import { Contract, providers } from "ethers";
import { formatEther } from "ethers/lib/utils";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  CRYPTODEVS_DAO_ABI,
  CRYPTODEVS_DAO_CONTRACT_ADDRESS,
  CRYPTODEVS_NFT_ABI,
  CRYPTODEVS_NFT_CONTRACT_ADDRESS,
} from "../const";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [treasuryBalance, setTreasuryBalance] = useState();
  const [nftBalance, setNftBalance] = useState();
  const [numProposals, setNumProposals] = useState();
  const web3ModalRef = useRef();
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  };
  const getProviderOrSigner = async (needSigner = false) => {
    const connection = await web3ModalRef.current.connect();
    const provider = new providers.Web3Provider(connection);
    const { chainId } = await provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Please switch to the Rinkeby network!");
      throw new Error("Please switch to the Rinkeby network");
    }
    if (needSigner) {
      const signer = provider.getSigner();
      return signer;
    }
    return provider;
  };
  const getAll = async () => {
    await getUserNFTBalance();
    await getDAOTreasuryBalance();
    await getNumProposalsInDAO();
  };
  const getNumProposalsInDAO = async () => {
    try {
      const provider = await getProviderOrSigner();
      const daoInstance = getDaoContractInstance(provider);
      const daoNumProposals = await daoInstance.numProposals();
      setNumProposals(daoNumProposals.toString());
    } catch (error) {
      console.log(error);
    }
  };
  const getDAOTreasuryBalance = async () => {
    try {
      const provider = await getProviderOrSigner();
      const balance = await provider.getBalance(
        CRYPTODEVS_DAO_CONTRACT_ADDRESS
      );
      setTreasuryBalance(balance.toString());
    } catch (error) {
      console.log(error);
    }
  };
  const getUserNFTBalance = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftInstance = getCryptodevsNFTContractInstance(signer);
      const balance = await nftInstance.balanceOf(signer.getAddress());
      setNftBalance(parseInt(balance.toString()));
    } catch (error) {
      console.log(error);
    }
  };
  // Helper function to return a DAO Contract instance
  // given a Provider/Signer
  const getDaoContractInstance = (providerOrSigner) => {
    return new Contract(
      CRYPTODEVS_DAO_CONTRACT_ADDRESS,
      CRYPTODEVS_DAO_ABI,
      providerOrSigner
    );
  };

  // Helper function to return a CryptoDevs NFT Contract instance
  // given a Provider/Signer
  const getCryptodevsNFTContractInstance = (providerOrSigner) => {
    return new Contract(
      CRYPTODEVS_NFT_CONTRACT_ADDRESS,
      CRYPTODEVS_NFT_ABI,
      providerOrSigner
    );
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet().then(() => {
        getAll();
      });
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>CryptoDevs DAO</title>
        <meta name="description" content="CryptoDevs DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>Welcome to the DAO!</div>
          <div className={styles.description}>
            Your CryptoDevs NFT Balance: {nftBalance}
            <br />
            Treasury Balance: {treasuryBalance &&
              formatEther(treasuryBalance)}{" "}
            ETH
            <br />
            Total Number of Proposals: {numProposals}
          </div>
          <div className={styles.flex}>
            <button className={styles.button}>Create Proposal</button>
            <button className={styles.button}>View Proposals</button>
          </div>
        </div>
        <div>
          <img className={styles.image} src="/0.svg" />
        </div>
      </div>
    </div>
  );
}
