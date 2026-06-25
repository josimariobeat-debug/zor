import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import AppRoot from "../AppRoot";

export const Route = createFileRoute("/$")({
  ssr: false,
  component: () => <ClientOnly fallback={null}><AppRoot /></ClientOnly>,
});
