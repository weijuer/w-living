// LanguageDetectorService.ts

export interface LanguageDetectorOptions {
    /** 预期要检测的语言，可选，提升精度 */
    expectedInputLanguages?: string[];
}

export type LanguageDetectionResult = {
    detectedLanguage: string; // BCP 47标签
    confidence: number; // 0~1
};

export type LanguageDetectorAvailability =
    | "unavailable"
    | "downloadable"
    | "downloading"
    | "available";

export class LanguageDetectorService {
    // 检查检测能力（可选指定参数）
    static async availability(
        options?: LanguageDetectorOptions
    ): Promise<LanguageDetectorAvailability> {
        // @ts-ignore
        return await (window as any).LanguageDetector.availability(options);
    }

    // 创建检测器
    static async create(options?: LanguageDetectorOptions): Promise<any> {
        // @ts-ignore
        return await (window as any).LanguageDetector.create(options);
    }

    // 检测语言
    static async detect(
        text: string,
        options?: LanguageDetectorOptions
    ): Promise<LanguageDetectionResult[]> {
        const detector = await this.create(options);
        return await detector.detect(text);
    }
}
