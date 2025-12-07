"use client";

import { useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "@/config/constants";
import blocxtactoeAbiArtifact from "@/abi/blocxtactoeabi.json";
import { toast } from "react-hot-toast";

// Extract ABI array from Hardhat artifact
const blocxtactoeAbi = (blocxtactoeAbiArtifact as { abi: unknown[] }).abi;

// Helper function to extract error message
function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object") {
    if ("message" in err && typeof err.message === "string") {
      return err.message;
    }
    if ("shortMessage" in err && typeof err.shortMessage === "string") {
      return err.shortMessage;
    }
  }
  return "An unknown error occurred";
}

export function useCounter() {
  const { isConnected } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read current counter value
  const { data: counter, refetch: refetchCounter } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: blocxtactoeAbi,
    functionName: "getCounter",
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  // Increment counter
  const increment = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "incrementCounter",
      });
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to increment counter";
      toast.error(errorMsg);
      console.error("Error incrementing counter:", err);
    }
  };

  // Decrement counter
  const decrement = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: blocxtactoeAbi,
        functionName: "decrementCounter",
      });
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Failed to decrement counter";
      toast.error(errorMsg);
      console.error("Error decrementing counter:", err);
    }
  };

  // Show toast on success
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction confirmed!");
      refetchCounter();
    }
  }, [isConfirmed, refetchCounter]);

  // Show toast on error
  useEffect(() => {
    if (error) {
      const errorMsg = getErrorMessage(error) || "Transaction failed";
      toast.error(errorMsg);
    }
  }, [error]);

  return {
    counter: counter !== undefined ? BigInt(counter.toString()) : BigInt(0),
    increment,
    decrement,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    refetchCounter,
  };
}

