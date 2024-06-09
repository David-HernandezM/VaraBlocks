import { 
    createContext,
    useState 
} from "react";
import { KeyringPair } from '@polkadot/keyring/types';

interface signlessDataContextI {
	signlessData: KeyringPair | null,
    noWalletAccountName: string | null,
	setSignlessData: React.Dispatch<React.SetStateAction<KeyringPair | null>> | null,
    setNoWalletAccountName: React.Dispatch<React.SetStateAction<string | null>> | null
}

interface Props {
    children: JSX.Element
}

export const signlessDataContext = createContext<signlessDataContextI>({
	signlessData: null,
    noWalletAccountName: null,
	setSignlessData: null,
    setNoWalletAccountName: null
});

export const SignlessDataProvider = ({ children }: Props) => {
    const [signlessData, setSignlessData] = useState<KeyringPair | null>(null);
    const [noWalletAccountName, setNoWalletAccountName] = useState<string | null>(null);

    return (
        <signlessDataContext.Provider value={{signlessData, setSignlessData, noWalletAccountName, setNoWalletAccountName}}>
            {children}
        </signlessDataContext.Provider>
    );
};