import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const chunkFailedMessage = /Failed to fetch dynamically imported module/;
    if (error?.message && chunkFailedMessage.test(error.message)) {
      console.warn('Chunk load failed. Reloading the page to fetch the latest version...');
      window.location.reload();
      return;
    }
    console.error(error);
  }
}
