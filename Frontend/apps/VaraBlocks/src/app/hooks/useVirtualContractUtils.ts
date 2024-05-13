import { useAccount, useApi } from "@gear-js/react-hooks"
import useContractUtils from "./useContractUtils";
import { MAIN_CONTRACT } from "../consts";
import { ProgramMetadata } from "@gear-js/api";

const useVirtualContractUtils = () => {
    const account = useAccount();
    const {
        sendMessage,
        readState
    } = useContractUtils();

    const virtualContractData = async () => {
        if (!account) return;

        const constractState = await readState(
            MAIN_CONTRACT.programId,
            MAIN_CONTRACT.programMetadata,
            {
                VirtualContract: account.account?.decodedAddress
            }
        );

        return JSON.parse(JSON.stringify(constractState));
    }

    const messagesFromVirtualConctact = async () => {
        if (!account) return;

        const contractState = await readState(
            MAIN_CONTRACT.programId,
            MAIN_CONTRACT.programMetadata,
            {
                MessagesFromVirtualContract: account.account?.decodedAddress
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