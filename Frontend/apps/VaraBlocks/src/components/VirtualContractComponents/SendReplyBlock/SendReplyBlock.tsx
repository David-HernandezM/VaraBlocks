import { SendReply, Variable } from "@/app/app_types/types";
import { 
  useAppSelector, 
  useAppDispatch 
} from "@/app/hooks"
import { 
  modifySendReplyEnumName, 
  modifySendReplyEnumVariantName
} from "@/app/SliceReducers";
import { metadataHasIn, enumDataByName, firstVariantFromEnumI } from "@/app/utils"
import { useState } from "react";
import './SendReplyBlock.scss';

interface SendReplyBlockProps {
  sendReplyBlockId: string,
}

// [TODO]: add the case when a variable has the same out metadata on init or handle

export function SendReplyBlock({ sendReplyBlockId }: SendReplyBlockProps) {
  const metadataInit = useAppSelector((state) => state.VaraBlocksData.initMetadata);
  const metadataHandle = useAppSelector((state) => state.VaraBlocksData.handleMetadata);
  const enums = useAppSelector((state) => state.VaraBlocksData.enums);
  const sendReplyBlock = useAppSelector((state) => state.VaraBlocksData.sendReplyBlocks[sendReplyBlockId]);
  const varaBlocksDispatch = useAppDispatch();

  // const [enumNameSelect, setEnumNameSelect] = useState(
  //   (sendReplyBlock as { SendReplyI: { data: SendReply, sendReplyInInit: boolean } }).SendReplyI.data.message.enumFrom
  // );

  const enumNameSelect = (sendReplyBlock as { SendReplyI: { data: SendReply, sendReplyInInit: boolean } }).SendReplyI.data.message.enumFrom;
  const [enumVariantNameSelect, setEnumVariantNameSelect] = useState(
    (sendReplyBlock as { SendReplyI: { data: SendReply, sendReplyInInit: boolean } }).SendReplyI.data.message.val
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
      varaBlocksDispatch(modifySendReplyEnumVariantName({
        blockId: sendReplyBlockId,
        newEnumVariantName: variantName
      }))
    }

    return valuesToreturn;
  }

  return (
    <>
      <p>
        Send reply: 
      </p>
      <p>
        Enum: <span className="send-reply-block__enum-name">{ enumNameSelect }</span>
      </p>
      {/* <select 
        name={sendReplyBlockId} 
        id={sendReplyBlockId}
        className="send-reply-block__enum-name-select"
        value={enumNameSelect}
        onChange={(e) => {
          setEnumNameSelect(e.target.value);
          varaBlocksDispatch(modifySendReplyEnumName({
            blockId: sendReplyBlockId,
            newEnumName: e.target.value
          }));
        }}
      >
        {
          Object.entries(enums).map(([enumKey, enumData]) => {
            return <option key={enumKey
            } value={enumData.enumName}>{enumData.enumName}</option>;
          })
        }
      </select> */}
      <p>
        Variant: 
      </p>
      <select 
        name={`sendReplyBlockVariantSelect${sendReplyBlockId}`} 
        id={`sendReplyBlockVariantSelect${sendReplyBlockId}`}
        className="send-reply-block__enum-variant-name-select"
        onChange={(e) => {
          console.log("Dato seleccionado:");
          console.log(e.target.value);
          setEnumVariantNameSelect(e.target.value);
          varaBlocksDispatch(modifySendReplyEnumVariantName({
            blockId: sendReplyBlockId,
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
