import { SendMessage } from "@/app/app_types/types";
import { 
  useAppSelector, 
  useAppDispatch 
} from "@/app/hooks"
import { 
  modifySendMessageEnumName,
  modifySendMessageEnumVariantName,
  setSendMessageActorId
} from "@/app/SliceReducers";
import { metadataHasIn, enumDataByName, firstVariantFromEnumI } from "@/app/utils"
import { useState } from "react";
import './SendMessageBlock.scss';
import { HexString } from "@gear-js/api";

interface SendMessageBlockProps {
  sendMessageBlockId: string,
}

// [TODO]: add the case when a variable has the same out metadata on init or handle

export function SendMessageBlock({ sendMessageBlockId }: SendMessageBlockProps) {
  const metadataInit = useAppSelector((state) => state.VaraBlocksData.initMetadata);
  const metadataHandle = useAppSelector((state) => state.VaraBlocksData.handleMetadata);
  const enums = useAppSelector((state) => state.VaraBlocksData.enums);
  const sendMessageBlock = useAppSelector((state) => state.VaraBlocksData.sendMessageBlocks[sendMessageBlockId]);
  const varaBlocksDispatch = useAppDispatch();

  // const [enumNameSelect, setEnumNameSelect] = useState(
  //   (sendReplyBlock as { SendReplyI: { data: SendReply, sendReplyInInit: boolean } }).SendReplyI.data.message.enumFrom
  // );

  const enumNameSelect = (sendMessageBlock as { SendMessageI: { data: SendMessage, sendMessageInInit: boolean } }).SendMessageI.data.message.enumFrom;
  const [enumVariantNameSelect, setEnumVariantNameSelect] = useState(
    (sendMessageBlock as { SendMessageI: { data: SendMessage, sendMessageInInit: boolean } }).SendMessageI.data.message.val
  );
  const [sendMessageToActorId, setSendMessageToActorId] = useState(
    (sendMessageBlock as { SendMessageI: { data: SendMessage, sendMessageInInit: boolean } }).SendMessageI.data.to
  );

  const enumVariantsOptions = (): (JSX.Element | null)[] | null => {
    const enumData = enumDataByName(enumNameSelect, enums);

    if (!enumData) {
      console.log('NO SE ENCONTRO LA INFORMACIOOOON!!!');
      
      return null
    };

    let variantSelectedExists = false;

    const valuesToreturn =  Object.entries(enumData.variants).map(([variantKey, variantName]) => {
      const variantNameTrim = variantName.trim();

      if (variantNameTrim === '') {
        return null;
      }

      if (enumVariantNameSelect === variantNameTrim) {
        variantSelectedExists = true;
      }

      return <option key={variantKey} value={variantName}>{variantName}</option>
    });

    if (!variantSelectedExists) {
      const variantName = firstVariantFromEnumI(enumData) as string;
      setEnumVariantNameSelect(variantName);
      varaBlocksDispatch(modifySendMessageEnumVariantName({
        blockId: sendMessageBlockId,
        newEnumVariantName: variantName
      }))
    }

    return valuesToreturn;
  }

  return (
    <>
      <p>
        Send Message: 
      </p>
      <label htmlFor={`${sendMessageBlockId}-to`}>to: </label>
      <input 
        type="text" 
        name={`${sendMessageBlockId}-to`}
        id={`${sendMessageBlockId}-to`}
        className="send-message__input"
        onChange={(e) => {
          varaBlocksDispatch(setSendMessageActorId({
            blockId: sendMessageBlockId,
            newActorId: e.target.value 
          }));
          setSendMessageToActorId(e.target.value);
        }}
        value={sendMessageToActorId}
      />
      <p>
        Enum: <span className="send-reply-block__enum-name">{ enumNameSelect }</span>
      </p>
      <label htmlFor={`${sendMessageBlockId}-variant`}>Variant: </label>
      <select 
        name={`${sendMessageBlockId}-variant`} 
        id={`${sendMessageBlockId}-variant`}
        className="send-reply-block__enum-variant-name-select"
        onChange={(e) => {
          console.log("Dato seleccionado:");
          console.log(e.target.value);
          setEnumVariantNameSelect(e.target.value);
          varaBlocksDispatch(modifySendMessageEnumVariantName({
            blockId: sendMessageBlockId,
            newEnumVariantName: e.target.value
          }));
        }}
        value={enumVariantNameSelect}
      >
        {
          enumVariantsOptions()
        }
      </select>
    </>
  )
}
