import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const ITUNES_BASE_URL = 'https://itunes.apple.com';

const upscaleArtwork = (url) => url?.replace(/\d+x\d+bb/g, '600x600bb') || '';

export const normalizeTrack = (track) => ({
  key: String(track.trackId || track.collectionId || `${track.artistId || 'artist'}-${track.trackName || track.collectionName || 'track'}`),
  title: track.trackName || track.collectionName || track.artistName || 'Unknown track',
  subtitle: track.artistName || 'Unknown artist',
  images: {
    coverart: upscaleArtwork(track.artworkUrl100),
    background: upscaleArtwork(track.artworkUrl100),
  },
  artists: track.artistId ? [{ adamid: String(track.artistId) }] : [],
  genres: {
    primary: track.primaryGenreName || 'Music',
  },
  hub: {
    actions: track.previewUrl ? [{ type: 'uri', name: 'preview', uri: track.previewUrl }] : [],
  },
  previews: track.previewUrl ? [{ url: track.previewUrl }] : [],
});

export const normalizeTrackList = (results = []) => results
  .filter((track) => track.wrapperType === 'track' && track.kind === 'song')
  .map(normalizeTrack)
  .filter((track) => track.hub.actions.length > 0);

export const shazamCoreApi = createApi({
  reducerPath: 'shazamCoreApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ITUNES_BASE_URL,
  }),
  endpoints: (builder) => ({
    getTopCharts: builder.query({
      query: () => '/search?term=top%20hits&entity=song&limit=50',
      transformResponse: (response) => normalizeTrackList(response?.results),
    }),
    getSongsByGenre: builder.query({
      query: (genre) => `/search?term=${encodeURIComponent(genre)}&entity=song&limit=50`,
      transformResponse: (response) => normalizeTrackList(response?.results),
    }),
    getSongsByCountry: builder.query({
      query: (countryCode = 'US') => `/search?term=top%20songs&entity=song&country=${encodeURIComponent(countryCode)}&limit=50`,
      transformResponse: (response) => normalizeTrackList(response?.results),
    }),
    getSongsBySearch: builder.query({
      query: (searchTerm) => `/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=50`,
      transformResponse: (response) => normalizeTrackList(response?.results),
    }),
    getSongDetails: builder.query({
      query: ({ songid }) => `/lookup?id=${encodeURIComponent(songid)}&entity=song`,
      transformResponse: (response, _meta, { songid }) => {
        const matchedTrack = response?.results?.find((item) => String(item.trackId) === String(songid) && item.kind === 'song')
          || response?.results?.find((item) => item.kind === 'song');
        const song = normalizeTrack(matchedTrack || {});

        return {
          ...song,
          sections: [{ type: 'META' }, { type: 'LYRICS', text: [] }],
        };
      },
    }),
    getSongRelated: builder.query({
      async queryFn({ songid }, _queryApi, _extraOptions, fetchWithBQ) {
        const detailsResult = await fetchWithBQ(`/lookup?id=${encodeURIComponent(songid)}&entity=song`);
        if (detailsResult.error) return { error: detailsResult.error };

        const detailsResults = detailsResult.data?.results || [];
        const targetSong = detailsResults.find((item) => item.kind === 'song') || detailsResults[0];
        if (!targetSong?.artistId) return { data: [] };

        const relatedResult = await fetchWithBQ(`/lookup?id=${encodeURIComponent(targetSong.artistId)}&entity=song`);
        if (relatedResult.error) return { error: relatedResult.error };

        const relatedSongs = normalizeTrackList(relatedResult.data?.results)
          .filter((song) => String(song.key) !== String(songid))
          .slice(0, 10);

        return { data: relatedSongs };
      },
    }),
    getArtistDetails: builder.query({
      query: (artistId) => `/lookup?id=${encodeURIComponent(artistId)}&entity=song`,
      transformResponse: (response, _meta, artistId) => {
        const results = response?.results || [];
        const artistInfo = results.find((item) => item.wrapperType === 'artist') || results[0] || {};

        return {
          artist: {
            id: String(artistId),
            name: artistInfo.artistName || 'Unknown artist',
            genre: artistInfo.primaryGenreName || 'Music',
            artwork: upscaleArtwork(results.find((item) => item.artworkUrl100)?.artworkUrl100),
          },
          songs: normalizeTrackList(results),
        };
      },
    }),
  }),
});

export const {
  useGetTopChartsQuery,
  useGetSongsByGenreQuery,
  useGetSongDetailsQuery,
  useGetSongRelatedQuery,
  useGetArtistDetailsQuery,
  useGetSongsByCountryQuery,
  useGetSongsBySearchQuery,
} = shazamCoreApi;
