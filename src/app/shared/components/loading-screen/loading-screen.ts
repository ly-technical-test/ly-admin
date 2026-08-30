import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-loading-screen',
  styleUrl: './loading-screen.css',
  templateUrl: './loading-screen.html',
})
export class LoadingScreen {
  readonly fullscreen = input(false);
}
