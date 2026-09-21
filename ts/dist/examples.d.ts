import type { ExampleLang } from '@voxgig/sdkgen';
export declare const EXAMPLE_LANGUAGES: ExampleLang[];
export declare function exampleLanguage(target: any): ExampleLang | undefined;
export declare function entityExample(entity: any, lang: ExampleLang): string;
