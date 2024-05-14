import { GearKeyring, IUpdateVoucherParams, decodeAddress, HexString, CreateType, ProgramMetadata, MessageSendOptions, MessageQueued } from '@gear-js/api';
import { useAccount, useApi, useAlert, useSendMessage, SendMessageOptions, DefaultTemplateOptions } from '@gear-js/react-hooks';
// import { KeyringPair, KeyringPair$Json } from '@polkadot/keyring/types';
import { EventRecord } from '@polkadot/types/interfaces';
import { generatePassword, gasToSpend, sleepReact } from '@/app/utils'; 
import { ENABLED_ACTIONS, SIGNLESS_STORAGE_KEY, MAIN_CONTRACT } from '@/app/consts'; 
import { Keyring } from '@polkadot/api';
import useVoucherUtils from './useVoucherUtils';
import { useState } from 'react';
import { AnyJson, ISubmittableResult } from '@polkadot/types/types';

type Session = {
    key: HexString;
    allowedActions: string[];
};

type Payload = Record<string, Record<string, AnyJson>>;

enum AlertType {
    INFO = 'info',
    ERROR = 'error',
    LOADING = 'loading',
    SUCCESS = 'success',
  }

const DEFAULT_OPTIONS = {
    style: { marginBottom: '10px' },
    isClosed: true,
    timeout: 5000,
  };

  const DEFAULT_ERROR_OPTIONS: DefaultTemplateOptions = {
    ...DEFAULT_OPTIONS,
    type: AlertType.ERROR,
  };

  const DEFAULT_SUCCESS_OPTIONS: DefaultTemplateOptions = {
    ...DEFAULT_OPTIONS,
    type: AlertType.SUCCESS,
  };
/*
[TODO]: Si ya existe una cuenta signless para la cuenta actual, se tienen que tener en cuenta 
        alguanas consideraciones (guardar la cuenta en el contrato, esta solo se podra usar
        si se tiene la contraseña, por lo cual no habrian problemas con esto, siempre checar el
        estado para obtener la cuenta signless del usuario):
            - Primero, en caso de que se refresque la pagina, o se acceda a esta, se tiene que
              verificar leyendo el estado para checar si existe una cuenta signless por parte 
              del usario (igualmente este ya tiene que estar registrado, ya que se registran 
              a la vez el usuario y su 'sesion'), si no existe, seguir los pasos para que se 
              registre, si no, pedirle su contraseña para poder 'desbloquear' su cuenta y poder
              hacer uso de su cuenta signless.
            - Una vez que ya se registro en el la pagina la cuenta signless (keyring), ya se 
              puede hacer uso de esta, y se almacena como estado dentro de este 'hook'
        
        *NOTA: el guardar la keypair bloqueada en el estado del contrato evita que esta se 
        guarde en el localstorage, asi igual evitamos que alguien que no debe haga uso de la 
        cuenta del usuario (en el mismo dispositivo).*
*/

export default function useSignlessUtils() {
    const { api } = useApi();
    const { account } = useAccount();
    const alert = useAlert();
    // const [pair, setPair] = useState<KeyringPair | undefined>();
    const contractMetadata = ProgramMetadata.from(MAIN_CONTRACT.programMetadata);
    const contractId = MAIN_CONTRACT.programId;
    const {
        generateNewVoucher,
        voucherExists,
        voucherBalance,
        checkVoucherForUpdates
    } = useVoucherUtils();
    // const sendMessage = useSendMessage(
    //     MAIN_CONTRACT.programId, 
    //     ProgramMetadata.from(MAIN_CONTRACT.programMetadata), 
    //     { disableAlerts: true, pair }
    // );

    const getSinglessPayload = (sessionForAccount: HexString | null | undefined, payload?: Payload) => {
        if (payload) {
            const [entry] = Object.entries(payload);
            const [key, value] = entry;
        
            return { ...payload, [key]: { ...value, sessionForAccount } };
        }

        return {
            "user_address": sessionForAccount
        }
        
    };

    const signlessAccountsFromLocalStorage = () => JSON.parse(localStorage[SIGNLESS_STORAGE_KEY] || '{}') as Storage; 

    // const signlessActualAccount = (): KeyringPair$Json | undefined => {
    //     return account ? signlessAccountsFromLocalStorage()[account.address] : undefined;
    // };

    // const saveAccountPairToLocalStorage = (signlessJSONAccount: KeyringPair$Json | undefined) => {
    //     if (!account) throw new Error('No account address');
    
    //     const storage = { 
    //         ...signlessAccountsFromLocalStorage(), 
    //         [account.address]: signlessJSONAccount 
    //     };
    
    //     localStorage.setItem(SIGNLESS_STORAGE_KEY, JSON.stringify(storage));
    // };

    // const saveAccountSignlessPairInLocalStorage = (address: Keyring, password: string) => {
    //     if (!account) throw new Error('No account address');

    //     const signlessJSONAccount = address.toJson(password);

    //     saveAccountPairToLocalStorage(signlessJSONAccount);
    // };

    // const deleteAccountFromActualAccount = () => {
    //     if (!account) throw new Error('No account address');

    //     saveAccountPairToLocalStorage(undefined);
    // };

    // const createNewPairAddress = async (): Promise<KeyringPair> => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const newPair = await GearKeyring.create('signlessPair');
    //             resolve(newPair.keyring);
    //         } catch (e) {
    //             console.log("Error creating new account pair!");
    //             reject(e);
    //         }
    //     });
    // };

    // const createAndSaveAccountNewPair = async (
    //     password?: string,
    //     onMessageInBlock?: any,
    //     onMessageSendSuccessfull?: any,
    //     onMessageErrorWhileSending?: any
    // ): Promise<[HexString, HexString]> => {
    //     if (!account) throw new Error('No account address');

    //     return new Promise(async (resolve, reject) => {
    //         const newKeyringPair = await createNewPairAddress();

    //         setPair(newKeyringPair);

    //         password = !password ? generatePassword() : password;

    //         console.log('LA CONTRASENA QUE SE USARA PARA LA CUENTA ES: ');
    //         console.log(password);

    //         /*
    //             Checamos si ya existe una cuenta en el local storage
    //         */

    //         const signlessAllAccounts = signlessAccountsFromLocalStorage();
    //         console.log("TODO EL LOCAL STORAGE");
    //         console.log(signlessAllAccounts);
    //         console.log('Actual signless account for account in local storage');
    //         const signlessAccount = signlessActualAccount();
    //         console.log(signlessAccount);
            
    //         if (signlessAccount) {
    //             console.log('YA EXISTE UNA CUENTA ACA CON ESO!!!');

    //             console.log('Cuenta desbloqueada con contraseña default');
                
    //             console.log(unlockActualPair(password));
                
    //             reject('Ya existe una cuenta signless para esta cuenta!');
    //             return;
    //         }

    //         // Primero se tiene que crear una sesion en el contrato
    //         /*
    //             Primero se tiene que crear la sesion con el tipo de dato Session,
    //             en el backend se tiene que crear este mismo tipo, y se le manda la cuenta
    //             signless, en el contrato es donde se tiene que controlar esta cuenta,
    //             se agrega junto con instrucciones que se indiquen, este mandara un delayed
    //             message, y borrara el mensaje cuando le llñegue este mensaje.
    //         */

    //         const newSignlessAccount = newKeyringPair.toJson(password);
    //         const signlessAddress = decodeAddress(newKeyringPair.address);

    //         console.log("Coded address:");
    //         console.log(newKeyringPair.address);
    //         console.log("Decoded address:"); 
    //         console.log(signlessAddress);

    //         console.log('LO QUE SE ALMACENARA:');
    //         console.log(newSignlessAccount);
            

    //         saveAccountPairToLocalStorage(newSignlessAccount);

    //         console.log('Se creara el voucher para la cuenta signless');
            

    //         // Seguido se crea un voucher para la sesion
    //         const voucherId = await generateNewVoucher(
    //             contractId,
    //             signlessAddress
    //         );

    //         console.log('Se termino de crear el voucher con la cuenta signless');

    //         // Aqui se debe de manejar todo a la vez, para evitar errores en el contrato.
    //         // Como se tiene previsto, es que el usuario mande un mensaje inicial para 
    //         // poder guardar la "session" en el contrato (la sesion se maneja nivel contrato)
    //         // y aparte, crear el voucher para esta cuenta signless.
    //         // Sin embargo, esto no es aplicable para cuentas que no tienen tokens, entonces
    //         // la logica cambia un poco, tanto en el frontend como en el contrato.
    //         // 1.- Primero se tiene que crear la cuenta signless y crear un voucher para 
    //         //     esta con el mismo metodo con el que ya se aplicaba el voucher al usuario 
    //         //     a pesar de que no tengan tokens,
    //         // 2.- Se tiene que mandar el mensaje para establecer la sesion, con la misma
    //         //     cuenta la cual se almacenara como la "sesion", esto es asi para que 
    //         //     funcione en cuentas que no tienen tokens, esta es una accion "sensible"
    //         //     ya que la cuenta que se mande como payload, sera la principal del usuario
    //         //     entonces, es el unico mensaje en el cual se debe de tener cuidado.

    //         console.log('Se mandara el primer mensaje al contrato!');

    //         /*
    //             signless account in contract:   0x7e292bc5d65f2ebc05c8e12e5ba1b688a62f08daa3e2849b638cf9afe8573164
    //             signless dada por el navegador: 0x7e292bc5d65f2ebc05c8e12e5ba1b688a62f08daa3e2849b638cf9afe8573164

    //             user account por contrato:  0x74765f2d8a520d08b54828847b37cc0d912e07fd03881c8c13e2605976e60c58
    //             user account por extension: 0x74765f2d8a520d08b54828847b37cc0d912e07fd03881c8c13e2605976e60c58
    //         */
            
    //         await sendMessageWithSignlessAccount(
    //             newKeyringPair,
    //             voucherId as HexString,
    //             0,
    //             {
    //                 TestSession: {
    //                     owner_of_session: account.decodedAddress
    //                 }
    //             }
    //         )

    //         console.log('Finalizado!');

    //         // Se retorna el addres de la signless account y del voucher
    //         resolve([signlessAddress, voucherId as HexString]);
    //     });
    // };

    // const unlockActualPair = (password: string): KeyringPair => {
    //     const actualAccountPair = signlessActualAccount();

    //     if (!actualAccountPair) throw new Error('Pair not found');
        
    //     const result = GearKeyring.fromJson(actualAccountPair, password);

    //     return result;
    // };

    // const sendMessageWithSignlessAccount = async (
    //     pair: KeyringPair,
    //     signlessVoucherId: HexString, 
    //     value: number, 
    //     payload?: Payload, 
    //     onMessageInBlock?: any,
    //     onMessageSendSuccessfull?: any,
    //     onMessageErrorWhileSending?: any
    // ): Promise<void> => {
    //     if (!account) throw new Error('No account address');
    //     if (!api) throw new Error('Api is not loaded');

    //     return new Promise(async (resolve, reject) => {
    //         const messagePayload = getSinglessPayload(account.decodedAddress, payload);
            
    //         const totalGas = await api.program.calculateGas.handle(
    //             decodeAddress(pair.address),
    //             contractId,
    //             payload,
    //             value,
    //             false,
    //             contractMetadata
    //         );

    //         const onSuccess = () => {
    //             if (onMessageSendSuccessfull) onMessageSendSuccessfull();
    //             console.log('SE PROCESO EL MENSAJE CON EXITO');
                
    //             resolve();
    //         }

    //         const onError = () => {
    //             if (onMessageErrorWhileSending) onMessageErrorWhileSending();
    //             console.log('ERROR AL MANDAR EL MENSAJE');
                
    //             reject("Error while sending message");
    //         }

    //         const onInBlock = () => {
    //             if (onMessageInBlock) onMessageInBlock();
    //             console.log('THE MESSAGE IS IN BLOCK!');
    //         }

    //         const baseMessage: MessageSendOptions = {
    //             destination: contractId,
    //             payload,
    //             gasLimit: gasToSpend(totalGas),
    //             value,
    //             prepaid: true,
    //         };

    //         const sendExtrinsic = api.message.send(baseMessage, contractMetadata);

    //         const args = { SendMessage: sendExtrinsic };

    //         const extrinsic = api.specVersion >= 1100
    //             ? api.voucher.call(signlessVoucherId, args)
    //             : api.voucher.callDeprecated(args);

    //         const alertId = alert.loading('Sign In', { title: 'Neuroshark Action' });

    //         const callback = (result: ISubmittableResult) => handleStatus(result, alertId, onSuccess, onInBlock, onError);

    //         console.log("Ya se firmara con el pair avr kpdo:");
    //         await extrinsic.signAndSend(pair, callback);




            
    //         // const message: SendMessageOptions = {
    //         //     payload: messagePayload,
    //         //     gasLimit: gasToSpend(totalGas),
    //         //     value,
    //         //     voucherId: signlessVoucherId,
    //         //     onSuccess,
    //         //     onError,
    //         //     onInBlock
    //         // };

    //         // sendMessage(message);
    //     });
    // };

    // const handleEventsStatus = (
    //     events: EventRecord[],
    //     onSuccess?: (messageId: HexString) => void,
    //     onError?: () => void,
    //   ) => {
    //     if (!api) throw new Error('API is not initialized');
    
    //     events.forEach(({ event }) => {
    //       const { method, section } = event;
    
    //       if (method === 'MessageQueued') {
    //         alert.success(`${section}.MessageQueued`);
    
    //         const messageId = (event as MessageQueued).data.id.toHex();
    
    //         onSuccess && onSuccess(messageId);
    //       } else if (method === 'ExtrinsicFailed') {
    //         // const message = getExtrinsicFailedMessage(api, event);
    //         console.log('EXTRINSIC FAILED');
            
    
    //         // console.error(message);
    //         // alert.error(message, { title });
    
    //         onError && onError();
    //       }
    //     });
    //   };

    // const handleStatus = (
    //     result: ISubmittableResult,
    //     alertId: string,
    //     onSuccess?: (messageId: HexString) => void,
    //     onInBlock?: (messageId: HexString) => void,
    //     onError?: () => void,
    //   ) => {
    //     const { status, events } = result;
    //     const { isReady, isInBlock, isInvalid, isFinalized } = status;
    
    //     if (isInvalid) {
    //       if (alertId) {
    //         alert.update(alertId, 'Transaction error. Status: isInvalid', DEFAULT_ERROR_OPTIONS);
    //       } else {
    //         alert.error('Transaction error. Status: isInvalid');
    //       }
    //     } else if (isReady && alertId) {
    //       alert.update(alertId, 'Ready');
    //     } else if (isInBlock) {
    //       if (alertId) alert.update(alertId, 'In Block');
    
    //       events.forEach(({ event }) => {
    //         if (event.method === 'MessageQueued') {
    //           const messageId = (event as MessageQueued).data.id.toHex();
    
    //           onInBlock && onInBlock(messageId);
    //         }
    //       });
    //     } else if (isFinalized) {
    //       if (alertId) alert.update(alertId, 'Finalized', DEFAULT_SUCCESS_OPTIONS);
    
    //       handleEventsStatus(events, onSuccess, onError);
    //     }
    //   };

    // return {
    //     signlessAccountsFromLocalStorage,
    //     signlessActualAccount,
    //     saveAccountPairToLocalStorage,
    //     saveAccountSignlessPairInLocalStorage,
    //     deleteAccountFromActualAccount,
    //     createNewPairAddress,
    //     createAndSaveAccountNewPair,
    //     unlockActualPair,
    //     sendMessageWithSignlessAccount
    // };
}


