declare global {
    interface Window {
        LanguageModel?: {
            create: (options?: CreateOptions) => Promise<LanguageModelSession>;
            params: () => Promise<LanguageModelParams | null>;
        };
    }

    interface self {
        LanguageModel: {
            create: (options?: CreateOptions) => Promise<LanguageModelSession>;
            params: () => Promise<LanguageModelParams | null>;
        };
    }
}
