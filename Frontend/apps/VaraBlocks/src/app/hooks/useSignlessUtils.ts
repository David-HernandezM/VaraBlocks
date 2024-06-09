import { GearKeyring, decodeAddress, HexString, ProgramMetadata } from '@gear-js/api';
import { useAccount, useAlert } from '@gear-js/react-hooks';
import { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';
import { MAIN_CONTRACT } from '@/app/consts'; 
import useVoucherUtils from './useVoucherUtils';
import useContractUtils from './useContractUtils';

export default function useSignlessUtils() {
  const { account } = useAccount();
  const alert = useAlert();
  const contractId = MAIN_CONTRACT.programId;
  const {
      generateNewVoucher,
  } = useVoucherUtils();
  const {
    sendMessageWithSignlessAccount,
    readState
  } = useContractUtils();

  const signlessDataForNoWalletAccount = async (noWalletAccount: string, password: string): Promise<KeyringPair> => {
    return new Promise(async (resolve, reject) => {
      const newKeyringPair = await createNewPairAddress();
      const lockedPair = lockPair(newKeyringPair, password);

      try {
        await generateNewVoucher(
          contractId,
          decodeAddress(newKeyringPair.address)
        );
      } catch(e) {
        reject('Api cant create voucher for signless account');
        return;
      }

      try {
        await sendMessageWithSignlessAccount(
          newKeyringPair,
          contractId,
          ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
          {
            BindSignlessAddressToNoWalletAccount: {
              noWalletAccount,
              signlessData: modifyPairToContract(lockedPair)
            }
          },
          0,
          "Signless accouunt created!",
          "Cant set signless account!",
          "creating signless subaccount",
          "VaraBlocks: "
        );
      } catch(e) {
        reject('Api cant send message');
        return;
      }

      resolve(newKeyringPair);
    });
  }

  const signlessDataForActualPolkadotAccount = async (password: string): Promise<KeyringPair> => {
    return new Promise(async (resolve, reject) => {
      if (!account) {
        console.log('Account is not ready');
        reject('Account is no ready');
        return;
      }

      let signlessAddress;
      let keyringPair;

      try {
        signlessAddress = await signlessAddressForPolkadotAccount();
      } catch (e) {
        reject('Error reading state for contract');
        return;
      }

      if (!signlessAddress) {
        keyringPair = await createNewPairAddress();
        const lockedPair = lockPair(keyringPair, password);

        try {
          await generateNewVoucher(
            contractId,
            decodeAddress(keyringPair.address)
          );
        } catch(e) {
          reject('Api cant create voucher for signless account');
          return;
        }
        
        try {
          await sendMessageWithSignlessAccount(
            keyringPair,
            contractId,
            ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
            {
              BindSignlessAddressToAddress: {
                userAccount: account.decodedAddress,
                signlessData: modifyPairToContract(lockedPair)
              }
            },
            0,
            "Signless accouunt created!",
            "Cant set signless account!",
            "creating signless subaccount",
            "VaraBlocks: "
          );
        } catch(e) {
          reject('Api cant send message');
          return;
        }

      } else {
        let encryptedSignlessAccount;

        try {
          encryptedSignlessAccount = await signlessEncryptedDataInContract(signlessAddress);
        } catch(e) {
          alert.error('Error reading state of contract');
          reject('Error reading state of contract');
          return;
        }
        
        try {
          keyringPair = unlockPair(encryptedSignlessAccount, password);
        } catch (e) {
          alert.error('Wrong password for signless account!!');
          reject('Wrong signless password');
          return;
        }
      }

      resolve(keyringPair);
    });
  }

  const signlessAddressForPolkadotAccount = async (): Promise<HexString | null> => {
    return new Promise(async (resolve, reject) => {
      if (!account) {
        console.log('Account is not ready');
        reject('Account is no ready');
        return;
      }

      const contractState: any = await readState(
        MAIN_CONTRACT.programId,
        MAIN_CONTRACT.programMetadata,
        {
          SignlessAccountAddressForAddress: account.decodedAddress
        }
      );

      const { signlessAccountAddressForAddress } = contractState;

      resolve(signlessAccountAddressForAddress);
    });
  }

  const signlessEncryptedDataInContract = async (signlessAddress: HexString): Promise<KeyringPair$Json> => {
    return new Promise(async (resolve, reject) => {
      try {
        const contractState: any = await readState(
          MAIN_CONTRACT.programId,
          MAIN_CONTRACT.programMetadata,
          {
            SignlessAccountData: signlessAddress
          }
        );

        const { signlessAccountData } = contractState;

        const formatedEncryptedSignlessData = formatContractSignlessData(
          JSON.parse(JSON.stringify(signlessAccountData))
        );
        
        resolve(formatedEncryptedSignlessData);
      } catch (e) {
        reject('Error while reading state');
      }
    });
  }


  const createNewPairAddress = async (): Promise<KeyringPair> => {
    return new Promise(async (resolve, reject) => {
        try {
            const newPair = await GearKeyring.create('signlessPair');
            resolve(newPair.keyring);
        } catch (e) {
            console.log("Error creating new account pair!");
            reject(e);
        }
    });
  };

  const formatContractSignlessData = (signlessData: any): KeyringPair$Json => {
    const formatEncryptedSignlessData = { ...signlessData };
    const encodingType = formatEncryptedSignlessData.encoding.encodingType;
    delete formatEncryptedSignlessData.encoding['encodingType'];
    formatEncryptedSignlessData.encoding['type'] = encodingType;

    return formatEncryptedSignlessData;
  }

  const modifyPairToContract = (pair: KeyringPair$Json) => {
    const signlessToSend = JSON.parse(JSON.stringify(pair));
    const encodingType = signlessToSend.encoding.type;
    delete signlessToSend.encoding['type'];
    signlessToSend.encoding['encodingType'] = encodingType;

    return signlessToSend;
  }

  const lockPair = (pair: KeyringPair, password: string): KeyringPair$Json => {
    return pair.toJson(password);
  }

  const unlockPair = (pair: KeyringPair$Json, password: string): KeyringPair => {
    return GearKeyring.fromJson(pair, password);
  }

  return {
    signlessDataForNoWalletAccount,
    signlessDataForActualPolkadotAccount,
    signlessAddressForPolkadotAccount,
    signlessEncryptedDataInContract,
    createNewPairAddress,
    formatContractSignlessData,
    modifyPairToContract,
    lockPair,
    unlockPair
  };
}


