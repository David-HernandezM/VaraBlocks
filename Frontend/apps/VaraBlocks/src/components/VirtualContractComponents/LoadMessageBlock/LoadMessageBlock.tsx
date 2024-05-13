import { Variable } from "@/app/app_types/types";
import { useAppSelector, useAppDispatch } from "@/app/hooks"
import { modifyLoadMessageVariableName } from "@/app/SliceReducers";
import { metadataHasIn } from "@/app/utils"
import './LoadMessageBlock.scss';
import { useState } from "react";

interface LoadMessageBlockProps {
    loadMessageId: string,
}

export function LoadMessageBlock({ loadMessageId }: LoadMessageBlockProps) {
    // const metadataIn = useAppSelector((state) => state.VaraBlocksData.initMetadata);
    // const metadataOut = useAppSelector((state) => state.VaraBlocksData.handleMetadata);
    const loadMessagesBlocks = useAppSelector((state) => state.VaraBlocksData.loadMessagesBlocks);
    const varaBlocksDispatch = useAppDispatch();

    const [inputValue, setInputValue] = useState((loadMessagesBlocks[loadMessageId] as { LoadMessageI: { data: Variable, loadInInit: boolean } }).LoadMessageI.data.variableName);

    return (
      <>
        <label htmlFor={loadMessageId}>Load message in:</label>
        <input 
            type="text" 
            name={loadMessageId}
            id={loadMessageId}
            className="load-message__input"
            onChange={(e) => {
                varaBlocksDispatch(modifyLoadMessageVariableName({
                    blockId: loadMessageId,
                    newName: e.target.value
                }));
                setInputValue(e.target.value);
            }}
            value={inputValue}
            placeholder="variable name"
        />
      </>
    )
}