import { useAccount } from "@gear-js/react-hooks"
import useContractUtils from "./useContractUtils";
import { MAIN_CONTRACT } from "../consts";
import { HexString } from "@gear-js/api";

const useVirtualContractUtils = () => {
    const account = useAccount();
    const {
        readState
    } = useContractUtils();

    const virtualContractData = async (virtualContractId: string): Promise<any> => {

        const constractState = await readState(
            MAIN_CONTRACT.programId,
            MAIN_CONTRACT.programMetadata,
            {
                VirtualContract: virtualContractId
            }
        );

        return JSON.parse(JSON.stringify(constractState));
    }

    const messagesFromVirtualConctact = async (messagesForAddress: HexString): Promise<any> => {
        if (!account) return;

        const contractState = await readState(
            MAIN_CONTRACT.programId,
            MAIN_CONTRACT.programMetadata,
            {
                MessagesFromVirtualContract: messagesForAddress 
            }
        );

        return JSON.parse(JSON.stringify(contractState));
    }

    return {
        virtualContractData,
        messagesFromVirtualConctact
    }
}

export default useVirtualContractUtils;