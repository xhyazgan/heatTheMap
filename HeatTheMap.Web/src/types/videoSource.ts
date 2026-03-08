export type VideoSourceType = 'webcam' | 'file' | 'url';

export interface WebcamSource {
  type: 'webcam';
}

export interface FileSource {
  type: 'file';
  file: File;
}

export interface UrlSource {
  type: 'url';
  url: string;
  username?: string;
  password?: string;
}

export type VideoSource = WebcamSource | FileSource | UrlSource;
