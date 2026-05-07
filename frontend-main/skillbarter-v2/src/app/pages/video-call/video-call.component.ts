import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="jitsi-container" style="width:100%; height:100vh;"></div>
  `
})
export class VideoCallComponent implements OnInit, OnDestroy {
  private api: any;
  sessionId: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || 'skillbarter-session';
    this.loadJitsi();
  }

  loadJitsi() {
    const script = document.createElement('script');
    script.src = 'https://8x8.vc/external_api.js';
    script.onload = () => this.startCall();
    document.body.appendChild(script);
  }

  startCall() {
    this.api = new JitsiMeetExternalAPI('8x8.vc', {
      roomName: `skillbarter-session-${this.sessionId}`,
      parentNode: document.getElementById('jitsi-container'),
      width: '100%',
      height: '100%'
    });
  }
  ngOnDestroy() {
    if (this.api) this.api.dispose();
  }
}