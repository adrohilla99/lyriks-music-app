import { describe, it, expect } from 'vitest';
import { normalizeTrack, normalizeTrackList } from './shazamCore';

describe('track normalization', () => {
  it('normalizes a raw iTunes track to app shape', () => {
    const raw = {
      trackId: 123,
      trackName: 'Example Song',
      artistName: 'Example Artist',
      artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/x/y/z/100x100bb.jpg',
      artistId: 999,
      primaryGenreName: 'Pop',
      previewUrl: 'https://audio.example/preview.m4a',
    };

    const normalized = normalizeTrack(raw);

    expect(normalized.key).toBe('123');
    expect(normalized.title).toBe('Example Song');
    expect(normalized.subtitle).toBe('Example Artist');
    expect(normalized.images.coverart).toContain('600x600bb');
    expect(normalized.artists[0].adamid).toBe('999');
    expect(normalized.hub.actions[0].uri).toBe(raw.previewUrl);
  });

  it('filters non-song rows and rows without preview urls', () => {
    const rows = [
      { wrapperType: 'track', kind: 'song', trackId: 1, trackName: 'A', artistName: 'X', previewUrl: 'https://a', artworkUrl100: 'https://img/100x100bb.jpg' },
      { wrapperType: 'track', kind: 'music-video', trackId: 2, trackName: 'B', artistName: 'Y', previewUrl: 'https://b', artworkUrl100: 'https://img/100x100bb.jpg' },
      { wrapperType: 'track', kind: 'song', trackId: 3, trackName: 'C', artistName: 'Z', artworkUrl100: 'https://img/100x100bb.jpg' },
    ];

    const normalized = normalizeTrackList(rows);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].key).toBe('1');
  });
});
