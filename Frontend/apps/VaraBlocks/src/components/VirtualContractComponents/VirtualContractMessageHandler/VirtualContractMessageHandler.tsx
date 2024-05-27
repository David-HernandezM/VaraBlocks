import { useContractUtils, useVirtualContractUtils, useSignlessUtils } from '@/app/hooks';
import { useAccount, useAlert } from '@gear-js/react-hooks'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { MAIN_CONTRACT } from '@/app/consts';
import { ProgramMetadata } from '@gear-js/api';
import { KeyringPair } from '@polkadot/keyring/types';
import './VirtualContractMessageHandler.scss';


interface Props {
  signlessData: KeyringPair | null
}

export function VirtualContractMessageHandler({ signlessData }: Props) {
  const account = useAccount();
  const alert = useAlert();
  const {
    signlessDataFromActualAccount
  } = useSignlessUtils();
  const {
    sendMessage,
    sendMessageWithSignlessAccount
  } = useContractUtils();
  const {
    virtualContractData,
    messagesFromVirtualConctact
  } = useVirtualContractUtils();

  const [userHasVirtualContract, setUserHasVirtualContract] = useState(false);
  const [virtualContractMessages, setVirtualContractMessages] = useState<any[]>([]);
  const [enumName, setEnumName] = useState('');
  const [enumVariantName, setEnumVariantName] = useState('');
  
  useEffect(() => {
    (async function() {
      let contractState = await virtualContractData();
      const contractMessage = Object.keys(contractState)[0];
      if (contractMessage !== "addresDoesNotHaveVirtualContract") {
        contractState = await messagesFromVirtualConctact();
        const { messagesFromVirtualContract } = contractState;
        setVirtualContractMessages(messagesFromVirtualContract.reverse());
        setUserHasVirtualContract(true);
      }
      else setUserHasVirtualContract(false);
    })();
  }, [account])
  

  return (
    <div className='message-handler'>
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
              />
              <Button size={"small"} textSize={"medium"} textWeight={"weight2"} rounded={"rounded4"} width={"normal"} onClick={async () => {
                  if (!account.account) return;

                  let temp;

                  if (!signlessData) temp = await signlessDataFromActualAccount();
                  else temp = signlessData;
                  

                  await sendMessageWithSignlessAccount(
                    temp, 
                    MAIN_CONTRACT.programId,
                    ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
                    {
                      SendMessageToVirtualContract: {
                        userAccount: account.account.decodedAddress,
                        message: {
                          enumFrom: enumName,
                          val: enumVariantName
                        }
                      }
                    },
                    0,
                    "Message send!",
                    "Message was not processed",
                    "Sending message...",
                    "VaraBlocks:"
                );

                // await sendMessage(
                //   account.account.decodedAddress,
                //   account.account.meta.source,
                //   MAIN_CONTRACT.programId,
                //   ProgramMetadata.from(MAIN_CONTRACT.programMetadata),
                //   {
                //     SendMessageToVirtualContract: {
                //       enumFrom: enumName,
                //       val: enumVariantName
                //     }
                //   },
                //   0,
                //   "Message send!",
                //   "Message was not processed",
                //   "Sending message...",
                //   "VaraBlocks action:"
                // );

                const contractState = await messagesFromVirtualConctact();
                const { messagesFromVirtualContract } = contractState;
                setVirtualContractMessages(messagesFromVirtualContract.reverse());
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
