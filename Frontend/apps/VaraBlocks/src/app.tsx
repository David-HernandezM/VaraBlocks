
import { withProviders } from '@/app/hocs';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { SignlessDataProvider } from "@/app/Context"; 
import { 
  Root, 
  ErrorPage,
  Index,
  VaraEditor
} from './routes';

import './app.scss';
import '@gear-js/vara-ui/dist/style.css';

function Component() {
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
              element: <VaraEditor />, //<Index />
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
    <SignlessDataProvider>
      <RouterProvider router={router} />
    </SignlessDataProvider>
  );
}

export const App = withProviders(Component);
