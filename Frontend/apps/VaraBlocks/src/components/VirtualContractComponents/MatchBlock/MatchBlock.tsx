import { useAppDispatch, useAppSelector } from '@/app/hooks';
import './MatchBlock.scss';
import { ControlFlow, Match, Variable } from '@/app/app_types/types';

interface Props {
    matchBlockId: string
}

// [TODO]: terminar de poner en cuanto se tengan las variables y filtrar cuando estas si tengan un tipo enum.

export function MatchBlock({ matchBlockId }: Props) {
    const matchBlocks = useAppSelector((state) => state.VaraBlocksData.matchBlocks);
    const loadMessageBlocks = useAppSelector((state) => state.VaraBlocksData.loadMessagesBlocks);
    const variables = useAppSelector((state) => state.VaraBlocksData.variablesBlocks);

    const loadMessagesVariableNames = Object.entries(loadMessageBlocks).map(([_, loadMessageBlock]) => {
        const loadMessageVariable = (loadMessageBlock as { LoadMessageI: { data: Variable, loadInInit: boolean } }).LoadMessageI.data;
        const loadMessageVariableName = loadMessageVariable.variableName.trim();

        if (loadMessageVariableName) return <option key={loadMessageVariableName} value={loadMessageVariableName}>{loadMessageVariableName}</option>;
        else return null;
    });

    const matchBlock = matchBlocks[matchBlockId] as { ControlFlow: { Match: { data: Match, matchArmsIds: string[], matchInInit: boolean } } };
    
    return (
        <>
            <label htmlFor={matchBlockId}>match </label>
            <select 
                name={matchBlockId} 
                id={matchBlockId}
                className='match-block__variable-select'
            >
                {
                    [...loadMessagesVariableNames]
                }
            </select>
        </>
    );
}
