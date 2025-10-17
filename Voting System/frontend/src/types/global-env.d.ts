// Provide ImportMeta typing so client.ts can access env without TS errors
interface ImportMeta {
  env: Record<string, string | undefined>;
}
