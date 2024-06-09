import { GearKeyring, decodeAddress, HexString, ProgramMetadata } from '@gear-js/api';
import { useAccount, useAlert } from '@gear-js/react-hooks';
import { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';
import { MAIN_CONTRACT } from '@/app/consts'; 

/**
 * Custom hook for managing subaccounts to add Signless to the dapp
 * @returns Functions to handle signless accounts
 * @example
 * // Import functions
 * const {
 *     createNewPairAddress,
 *     lockPair,
 *     unlockPair
 * } = useSignlessUtils();
 * 
 * // Create new KeyringPair for signless session
 * let signlessAccountPair = createNewPairAddress();
 * 
 * // Lock KeyringPair with password
 * const signlessAccountLocked = lockPair(signlessAccountPair, "password");
 * 
 * // Unlock KeyringPair with password that locks the signless account
 * signlessAccountPair = unlockPair(signlessAccountLocked, "password");
 */
export const useSignlessUtils = () => {
    /**
     * @returns New KeyringPair for signless account
     */
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

    /**
     * Function to obtain the "locked" version of the signless account
     * @param pair KeyringPair of signless account to lock
     * @param password String to be used to lock the KeyringPair of the signless account
     * @returns a KeyringPair$Json from a locked signless account
     * @example
     * const lockedVersionOfSignlessAccount = lockPair(
     *     signlessAccount,
     *     'signlessAccountPassword'
     * );
     * 
     * console.log('Locked signless data:');
     * console.log(lockedVersionOfSignlessAccount);
     */
    const lockPair = (pair: KeyringPair, password: string): KeyringPair$Json => {
        return pair.toJson(password);
    }
 
    /**
     * Function to unlock the "locked" version of the signless account
     * @param pair Locked signless account
     * @param password string that was previously used to block the signless account
     * @returns The KeyringPair of the locked signless account
     * @example
     * const signlessAccount = unlockPair(
     *     lockedSignlessAccount,
     *     'signlessAccountPassword'
     * );
     * 
     * console.log('Signless data:');
     * console.log(signlessAccount);
     */
    const unlockPair = (pair: KeyringPair$Json, password: string): KeyringPair => {
        return GearKeyring.fromJson(pair, password);
    }


    return {
        createNewPairAddress,
        lockPair,
        unlockPair
    }
}