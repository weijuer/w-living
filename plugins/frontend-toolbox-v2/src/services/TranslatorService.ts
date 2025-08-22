// TranslatorService.ts

export interface TranslatorOptions {
    sourceLanguage: string; // 如 'en'
    targetLanguage: string; // 如 'zh'
}

export type TranslatorAvailability =
    | "unavailable"
    | "downloadable"
    | "downloading"
    | "available";

export class TranslatorService {
    // 检查指定语对的可用性
    static async availability(
        options: TranslatorOptions
    ): Promise<TranslatorAvailability> {
        // @ts-ignore
        return await (window as any).Translator.availability(options);
    }

    // 创建 Translator 实例
    static async create(options: TranslatorOptions): Promise<any> {
        // @ts-ignore
        return await (window as any).Translator.create(options);
    }

    // 翻译文本
    static async translate(
        text: string,
        options: TranslatorOptions
    ): Promise<string> {
        const translator = await this.create(options);
        return await translator.translate(text);
    }

    // 流式翻译（如需处理大段内容或流式场景）
    static async translateStreaming(
        text: string,
        options: TranslatorOptions
    ): Promise<ReadableStream<string>> {
        const translator = await this.create(options);
        return translator.translateStreaming(text);
    }
}
