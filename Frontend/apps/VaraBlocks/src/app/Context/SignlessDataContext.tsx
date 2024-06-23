import { 
    createContext,
    useState 
} from "react";
import { KeyringPair } from '@polkadot/keyring/types';

interface signlessDataContextI {
	signlessData: KeyringPair | null,
	setSignlessData: React.Dispatch<React.SetStateAction<KeyringPair | null>> | null,
}

interface Props {
    children: JSX.Element
}

export const signlessDataContext = createContext<signlessDataContextI>({
	signlessData: null,
	setSignlessData: null,
});

export const SignlessDataProvider = ({ children }: Props) => {
    const [signlessData, setSignlessData] = useState<KeyringPair | null>(null);

    return (
        <signlessDataContext.Provider value={{signlessData, setSignlessData}}>
            {children}
        </signlessDataContext.Provider>
    );
};