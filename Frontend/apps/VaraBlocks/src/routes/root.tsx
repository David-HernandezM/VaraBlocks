import { useAccount, useApi, TemplateAlertOptions, useAlert } from "@gear-js/react-hooks";
import { Outlet } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { 
	apiIsBusy,
	apiIsDisconnected,
	gearApiStarted, 
	polkadotAccountIsEnable,
} from "@/app/SliceReducers";
import { Header } from "@/components";
import { useEffect, useContext } from "react";

import { signlessDataContext } from '@/app/Context';

const messageOptions: TemplateAlertOptions = {
	title: "VaraBlocks: "
}; 

export default function Root() {
	const { setSignlessData } = useContext(signlessDataContext);
    const { isApiReady, api } = useApi();
	const { isAccountReady, account} = useAccount();
	
	const alert = useAlert();
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (account) {
			dispatch(polkadotAccountIsEnable(true));
		} else {
			dispatch(polkadotAccountIsEnable(false));
		}

		if (setSignlessData) setSignlessData(null);
	}, [account]);

	useEffect(() => {
		if (isApiReady) {
			api.on('disconnected', () => {
				alert.error('Api disconnected!', messageOptions);
				dispatch(apiIsDisconnected(true));
			});

			api.on('connected', () => {
				alert.success('Api connected!', messageOptions);
				dispatch(apiIsDisconnected(false));
			});

			dispatch(apiIsDisconnected(false));
			alert.success('Api started!', messageOptions);
		}

		dispatch(gearApiStarted(isApiReady));
	}, [isApiReady]);

    return (
		<>
			<Header isAccountVisible={isAccountReady} />
			<Outlet/>
		</>
	)
}
