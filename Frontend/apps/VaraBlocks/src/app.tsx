import './app.scss';
import '@gear-js/vara-ui/dist/style.css';
import { useAccount, useApi } from '@gear-js/react-hooks';
import { withProviders } from '@/app/hocs';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { 
  Root, 
  ErrorPage,
  // Index,
  VaraEditor
} from './routes';


function Component() {
  const { isApiReady } = useApi();
  const { isAccountReady } = useAccount();

  const isAppReady = isApiReady && isAccountReady;

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <h1>ERROR A NIVEL ROOT</h1>,
      children: [
        {
          errorElement: <ErrorPage />,
          children: [
            {
              index: true,
              element: <VaraEditor /> //<Index />
            },
            {
              path: "account",
              element: <p>Acount</p> //<Account />,
            },
            {
              path: "account/varaeditor",
              element: <VaraEditor />,
            },
          ]
        }
      ]
    },
    {
      path: "/*",
      element: <ErrorPage isRootError={true} />,
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export const App = withProviders(Component);
