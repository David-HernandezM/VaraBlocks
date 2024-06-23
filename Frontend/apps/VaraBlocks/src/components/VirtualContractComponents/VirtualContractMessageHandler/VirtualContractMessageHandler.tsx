import { useContractUtils, useVirtualContractUtils, useAppSelector } from '@/app/hooks';
import { useAccount, useAlert } from '@gear-js/react-hooks'
import { useContext, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { MAIN_CONTRACT } from '@/app/consts';
import { HexString, ProgramMetadata, decodeAddress } from '@gear-js/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { SignlessForm } from '@/components/SignlessForm/SignlessForm';
import { signlessDataContext } from '@/app/Context';

import './VirtualContractMessageHandler.scss';


interface Props {
  virtualContractId: string | null
}

export function VirtualContractMessageHandler({ accountToReceiveMessages, virtualContractId }: Props) {
  const { account } = useAccount();
  const { signlessData } = useContext(signlessDataContext);
  const {
    sendMessageWithSignlessAccount
  } = useContractUtils();
  const {
    virtualContractData,
    messagesFromVirtualConctact
  } = useVirtualContractUtils();
  const noWalletEncryptedName = useAppSelector((state) => state.AccountsSettings.noWalletEncryptedName);
  const polkadotAccountEnable = useAppSelector((state) => state.AccountsSettings.polkadotEnable);
  const alert = useAlert();

  const [signlessAccountModalOpen, setSignlessAccountModalOpen] = useState(false);
  const [userHasVirtualContract, setUserHasVirtualContract] = useState(false);
  const [virtualContractMessages, setVirtualContractMessages] = useState<any[]>([]);
  const [enumName, setEnumName] = useState('');
  const [enumVariantName, setEnumVariantName] = useState('');

  useEffect(() => {
    console.log('Se recibira de:');
    
    console.log(accountToReceiveMessages);
    console.log('Cuenta no wallet');
    console.log(noWalletEncryptedName);
    
    
    (async function() {
      if (!virtualContractId || !accountToReceiveMessages) {
        console.log('No contract to send messages or valid address!');
        return;
      }

      console.log('Virtual contract id:');
      console.log(virtualContractId);

      let contractState = await virtualContractData(virtualContractId);

      const contractMessage = Object.keys(contractState)[0];


      if (contractMessage !== "virtualContractIdDoesNotExists") {
        contractState = await messagesFromVirtualConctact(accountToReceiveMessages);
        console.log(contractState);
        
        const { messagesFromVirtualContract } = contractState;
        setVirtualContractMessages(messagesFromVirtualContract.reverse());
        setUserHasVirtualContract(true);
      }
      else setUserHasVirtualContract(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signlessData, accountToReceiveMessages, virtualContractId]);

  const closeSignlessModal = () => {
    setSignlessAccountModalOpen(false);
  };

  const handleSendMessage = async (signlessAccountData: KeyringPair, encryptedAccountName: string | null) => {
    if (!signlessData) {
      alert.error('Signless account not set!');
      return;
    }

    let addressToReadMessages;
    let payload;

    if (polkadotAccountEnable) {
      if (!account) {
        alert.error('Account is not ready!');
        return;
      }
      addressToReadMessages = account.decodedAddress;
      payload = {
        SendMessageToVirtualContractWithAddress: {
          userAccount: account.decodedAddress,
          message: {
            enumFrom: enumName,
            val: enumVariantName
          },
          virtualContractId
        }
      };
    } else {
      addressToReadMessages = decodeAddress(signlessData.address);
      payload = {
        SendMessageToVirtualContractWithNoWalletAccount: {
          noWalletAccount: encryptedAccountName,
          message: {
            enumFrom: enumName,
            val: enumVariantName
          },
          virtualContractId
        }
      }
    }
    
    await sendMessageWithSignlessAccount(
      signlessAccountData, 
      MAIN_CONTRACT.programId,
      ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
      payload,
      0,
      "Message send!",
      "Message was not processed",
      "Sending message...",
      "VaraBlocks:"
    );

    const contractState = await messagesFromVirtualConctact(addressToReadMessages);
    const { messagesFromVirtualContract } = contractState;
    setVirtualContractMessages(messagesFromVirtualContract.reverse());
  }

  return (
    <div className='message-handler'>
      { signlessAccountModalOpen && <SignlessForm close={closeSignlessModal}  /> }
      <h2 className='message-handler__title'>
        Send message
      </h2>
      {
        userHasVirtualContract ? (
          <div>
            <div>
              <label htmlFor="messageEnumName">Enum: </label>
              <input 
                type="text" 
                name="messageEnumName" 
                id="messageEnumName" 
                className='handle-message__input'
                onChange={(e) => {
                  setEnumName(e.target.value);
                }}
                value={enumName}
                autoComplete='off'
              />
              <label htmlFor="messageEnumVariantName">Variant: </label>
              <input 
                type="text" 
                name="messageEnumVariantName" 
                id="messageEnumVariantName" 
                className='handle-message__input'
                onChange={(e) => {
                  setEnumVariantName(e.target.value);
                }}
                value={enumVariantName}
                autoComplete='off'
              />
              <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={async () => {
                if (!signlessData) {
                  setSignlessAccountModalOpen(true);
                  return;
                }

                await handleSendMessage(signlessData, noWalletEncryptedName);
              }}>
                  Send message
              </Button>
            </div>
            <div className='virtual-contract__messages-container'>
              <h3>Messages received: </h3>
              {
                virtualContractMessages.map((message, index) => {
                  const messageType = Object.keys(message)[0];
                  const messageValue = Object.values(message)[0]; 
                  return <p className='virtual-contract__message' key={index}>  
                    {messageType}: {JSON.stringify(messageValue)}
                  </p>;
                })
              }
            </div>
          </div>
        ) : (
          <p className='message-handler__no-contract-title'>
            User does not have a virtual contract
          </p>
        )
      }
    </div>
  );
}
