import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import idl from "../../server/idl.json"; 
import { useWallet, useAnchorWallet } from "@solana/wallet-adapter-react";

export const useProgram = () => {
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  if (!wallet || !publicKey) return { program: null, wallet: null };

  const programIdStr = import.meta.env.VITE_PROGRAM_ID; 
  if (!programIdStr) {
    console.error("VITE_PROGRAM_ID не задан в .env");
    return { program: null, wallet };
  }

  const connection = new Connection(import.meta.env.VITE_RPC_URL);
  const provider = new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });

  try {
    const programId = new PublicKey(programIdStr);
    const program = new Program(idl, programId, provider);
    return { program, wallet };
  } catch (err) {
    console.error("Ошибка создания программы:", err);
    return { program: null, wallet };
  }
};
