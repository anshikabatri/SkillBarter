import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [],
  template: ``
})
export class VideoCallComponent implements OnInit {
  sessionId: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';
    const roomName = `skillbarter-session-${this.sessionId}`;
    window.open(`https://meet.element.io/${roomName}`, '_blank');
    history.back();
  }
}