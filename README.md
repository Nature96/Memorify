# Memorify

The premise of the project is as follows: Spotify, in an effort to introduce its users to new music that they might like, curates two playlists for every user, called Discover Weekly and Release Radar.

Discover Weekly is created by Spotify tracking what kind of music and songs you've been adding to your playlist, and finding similar songs within those same genres, but by artists whose music you have never heard. Release Radar does something different, it takes into account the artists and musicians you DO follow, and curates a playlist of their newest songs.

The problem however, lies in the fact that Spotify automatically updates these Discover Weekly and Release Radar every Monday and Friday respectively. Once these playlists have been updated, there is no way to go back to a previous week and get those songs into your Liked Songs. Once they're gone, they're gone forever. Enter Memorify! Memorify will automatically back up those playlists in your Spotify account with the date it was backed up, so you'll never lose those songs.


To run - 

Frontend:
cd Projects/memorify/client
npm start

Backend:
cd Projects/memorify/server
node index.js