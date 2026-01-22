declare module "html-pdf-node" {
  export type HtmlPdfMargin = {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };

  export type HtmlPdfOptions = {
    format?: string;
    printBackground?: boolean;
    margin?: HtmlPdfMargin;
    landscape?: boolean;
    scale?: number;
    preferCSSPageSize?: boolean;
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    pageRanges?: string;
    width?: string;
    height?: string;
    timeout?: number;
    omitBackground?: boolean;
  };

  export type HtmlPdfFile = {
    url?: string;
    content?: string;
  };

  export function generatePdf(
    file: HtmlPdfFile,
    options?: HtmlPdfOptions
  ): Promise<Buffer>;
}
