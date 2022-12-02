import {
  ProviderConnector,
  EIP712TypedData,
  AbiItem,
} from "@1inch/limit-order-protocol";
import { ethers, VoidSigner } from "ethers";

export class EthersSignerConnector implements ProviderConnector {
  // eslint-disable-next-line no-useless-constructor
  constructor(protected readonly _signer: VoidSigner) {}

  contractEncodeABI(
    abi: AbiItem[],
    address: string | null,
    methodName: string,
    methodParams: unknown[]
  ): string {
    const iface = new ethers.utils.Interface(abi);
    return iface.encodeFunctionData(methodName, methodParams);
  }

  signTypedData(
    walletAddress: string,
    typedData: EIP712TypedData,
    _typedDataHash: string
  ): Promise<string> {
    delete typedData.types.EIP712Domain;
    return this._signer._signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message
    );
  }

  ethCall(contractAddress: string, callData: string): Promise<string> {
    return this._signer.call({
      to: contractAddress,
      data: callData,
    });
  }

  decodeABIParameter<T>(type: string, hex: string): T {
    const abiCoder = new ethers.utils.AbiCoder();
    return abiCoder.decode([type], hex)[0];
  }
}
