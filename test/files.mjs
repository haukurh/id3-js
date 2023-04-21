import fs from 'fs';

export const id3v1 = fs.readFileSync('./test/files/id3v1.mp3');
export const id3v1v2 = fs.readFileSync('./test/files/id3v1v2.mp3');
export const id3v23 = fs.readFileSync('./test/files/id3v2.3.mp3');
export const id3v24 = fs.readFileSync('./test/files/id3v2.4.mp3');
export const no_meta = fs.readFileSync('./test/files/no-meta.mp3');
