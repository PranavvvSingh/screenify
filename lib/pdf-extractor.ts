export interface PDFExtractionResult {
  text: string;
  numPages: number;
  error?: string;
}

interface TextItem {
  str: string;
}

interface TextMarkedContent {
  type: string;
}

type PDFTextContentItem = TextItem | TextMarkedContent;

/**
 * Extracts text from a PDF file
 * @param file - The PDF file to extract text from
 * @returns Promise with extracted text, number of pages, and optional error
 */
export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  try {
    // Validate file type
    if (!file.type.includes('pdf')) {
      return {
        text: '',
        numPages: 0,
        error: 'Invalid file type. Please upload a PDF file.'
      };
    }

    // Dynamically import pdf.js only on the client side
    const pdfjsLib = await import('pdfjs-dist');

    // Configure the worker for PDF.js
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages;
    const textParts: string[] = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Concatenate text items with proper spacing
      const pageText = textContent.items
        .map((item: PDFTextContentItem) => {
          // Handle text items with str property
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' ');

      textParts.push(pageText);
    }

    // Join all pages with double newline
    const extractedText = textParts.join('\n\n').trim();

    return {
      text: extractedText,
      numPages,
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return {
      text: '',
      numPages: 0,
      error: error instanceof Error ? error.message : 'Failed to extract text from PDF'
    };
  }
}

/**
 * Validates if a file is a valid PDF
 * @param file - The file to validate
 * @returns True if file is a valid PDF
 */
export function isValidPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Gets a human-readable file size string
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
