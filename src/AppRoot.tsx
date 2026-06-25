import { BrowserRouter } from "react-router";
import App from "./App";
import { AppProviders } from "./providers";

export default function AppRoot() {
  return (
    <AppProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProviders>
  );
}
