const fs = require('fs');

// Used for signing in to YouTube
const Innertube = require('youtubei.js');
const creds_path = './yt_oauth_creds.json';

// listen1: One for all free music in China (Build from source)
// You can use it to export your music playlists to JSON
const music_tracks_backup_path = './listen1_backup.json';
let tracks = getTracks();

// Read already liked songs
const liked_songs_path = './liked_songs.json';
const liked_songs = new Set(JSON.parse(fs.readFileSync(liked_songs_path, {
    encoding: 'utf8',
    flag: 'a+'
}) || '[]'));

tracks = tracks.filter(track => !liked_songs.has(track.title));


function getTracks() {
    return Object
        .entries(JSON.parse(fs.readFileSync(music_tracks_backup_path, 'utf8')))
        .filter(([_, value]) => {
            return (value instanceof Object) && value.hasOwnProperty('tracks');
        })
        .map(([_, value]) => value['tracks'])
        .flat();
}


start().then(
    () => {
        console.log('---------------------------------------------------------');
        console.log('Done!');
        console.log('---------------------------------------------------------');
    },
    e => {
        console.log('---------------------------------------------------------');
        console.log('Error:', e);
        console.log('---------------------------------------------------------');
    }
).finally(() => {
    fs.writeFileSync(liked_songs_path, JSON.stringify([...liked_songs]));
});


async function start() {
    const youtube = await new Innertube({gl: 'US'});
    await signIn(youtube);
    await likeMusic(youtube);
}

async function signIn(youtube) {
    // Copied from https://github.com/LuanRT/YouTube.js
    youtube.ev.on('auth', (data) => {
        if (data.status === 'AUTHORIZATION_PENDING') {
            console.info(`Hello!\nOn your phone or computer, \
            go to ${data.verification_url} and enter the code ${data.code}`);
        } else if (data.status === 'SUCCESS') {
            fs.writeFileSync(creds_path, JSON.stringify(data.credentials));
            console.info('Successfully signed-in, enjoy!');
        }
    });

    youtube.ev.on('update-credentials', (data) => {
        fs.writeFileSync(creds_path, JSON.stringify(data.credentials));
        console.info('Credentials updated!', data);
    });

    const creds = fs.existsSync(creds_path)
        && JSON.parse(fs.readFileSync(creds_path).toString()) || {};
    await youtube.signIn(creds);
}

async function likeMusic(youtube) {
    for (let i = 0; i < tracks.length; i++) {
        console.log('Music ' + (i + 1) + ' of ' + tracks.length);
        const {title, artist} = tracks[i];
        const query = `${title} ${artist}`;
        console.log('query:', query);

        const result = await youtube.search(query);
        console.log('result:', result.videos[0]?.id);
        console.log('url:', result.videos[0]?.url);
        if (result.videos[0]?.id) {
            youtube.interact.like(result.videos[0].id).then(
                () => {
                    liked_songs.add(tracks[i].title);
                    fs.writeFileSync(liked_songs_path, JSON.stringify([...liked_songs]));
                },
                e => {
                    console.log('Error:', e);
                }
            );
        } else {
            // Not found musics also considered as liked
            liked_songs.add(tracks[i].title);
            fs.writeFileSync(liked_songs_path, JSON.stringify([...liked_songs]));
        }
        console.log('-------------------------------');
    }
}
