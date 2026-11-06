
const tracks = [
  {
    id: 1,
    title: "GUZARISH (गुज़ारिश)",
    artist: "SATINDER SARTAAJ",
    album: "GUZARISH",
    src: "songs/song1.mp3",
    cover: "linear-gradient(135deg,#7659d8,#d77ca9)",
    icon: "✦"
  },
  {
    id: 2,
    title: "Alfaaz",
    artist: "Hamza Malik, Zain Zohaib",
    album: "ALFAAZ",
    src: "songs/song2.mp3",
    cover: "linear-gradient(135deg,#167d91,#785ce0)",
    icon: "☼"
  },
  {
    id: 3,
    title: "MERI ZINDAGI HAI TU",
    artist: "ASIM AZHAR, SABRI SISTERS",
    album: "OST | ARY DIGITAL",
    src: "songs/song3.mp3",
    cover: "linear-gradient(135deg,#287e9b,#63c9b2)",
    icon: "◈"
  }
];

const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const trackList = document.getElementById("trackList");
const albumArt = document.getElementById("albumArt");

const listHeading = document.getElementById("listHeading");
const trackCount = document.getElementById("trackCount");

let currentIndex = 0;
let currentView = "library";

let isShuffle = false;
let isRepeat = false;

let likedSongs = JSON.parse(
  localStorage.getItem("vybeLikedSongs") || "[]"
);

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${mins}:${secs}`;
}

// NAVIGATION: YOUR LIBRARY / LIKED SONGS

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => {
    currentView = button.dataset.view;

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
    });

    button.classList.add("active");

    listHeading.textContent =
      currentView === "liked" ? "Liked Songs" : "Your Library";

    renderTracks();

    document.getElementById("library").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

// RENDER SONGS

function renderTracks() {
  trackList.innerHTML = "";

  const visibleTracks = tracks
    .map((track, index) => ({ ...track, index }))
    .filter(track => {
      if (currentView === "liked") {
        return likedSongs.includes(track.id);
      }

      return true;
    });

  trackCount.textContent =
    `${String(visibleTracks.length).padStart(2, "0")} TRACKS`;

  if (visibleTracks.length === 0) {
    trackList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">♡</div>
        <h3>No liked songs yet</h3>
        <p>Tap the heart icon on a song to add it here.</p>
      </div>
    `;
    return;
  }

  visibleTracks.forEach((track, position) => {
    const isPlaying = track.index === currentIndex && !audio.paused;
    const isLiked = likedSongs.includes(track.id);

    const row = document.createElement("div");

    row.className =
      `track-row ${track.index === currentIndex ? "playing" : ""}`;

    row.innerHTML = `
      <span class="track-number">
        ${String(position + 1).padStart(2, "0")}
      </span>

      <div class="track-main">
        <div class="track-thumb"
             style="--cover:${track.cover}">
          ${track.icon}
        </div>

        <div class="track-text">
          <div class="track-title"></div>
          <div class="track-artist"></div>
        </div>
      </div>

      <span class="track-album"></span>

      <span class="track-duration">
        ${track.index === currentIndex && audio.duration
          ? formatTime(audio.duration)
          : "--:--"}
      </span>

      <button class="like-btn ${isLiked ? "liked" : ""}"
              aria-label="${isLiked ? "Unlike" : "Like"} song">
        ${isLiked ? "♥" : "♡"}
      </button>
    `;

    row.querySelector(".track-title").textContent = track.title;
    row.querySelector(".track-artist").textContent = track.artist;
    row.querySelector(".track-album").textContent = track.album;

    // Play selected song
    row.querySelector(".track-main").addEventListener("click", () => {
      loadTrack(track.index, true);
    });

    // Like / Unlike selected song
    row.querySelector(".like-btn").addEventListener("click", event => {
      event.stopPropagation();
      toggleLike(track.id);
    });

    trackList.appendChild(row);
  });
}

// LIKE SONG

function toggleLike(id) {
  if (likedSongs.includes(id)) {
    likedSongs = likedSongs.filter(songId => songId !== id);
  } else {
    likedSongs.push(id);
  }

  localStorage.setItem(
    "vybeLikedSongs",
    JSON.stringify(likedSongs)
  );

  renderTracks();
}

// LOAD SONG

function loadTrack(index, autoplay = false) {
  currentIndex = (index + tracks.length) % tracks.length;

  const track = tracks[currentIndex];

  audio.src = track.src;

  currentTitle.textContent = track.title;
  currentArtist.textContent =
    `${track.artist} · ${track.album}`;

  albumArt.style.background = track.cover;

  progress.value = 0;
  currentTime.textContent = "0:00";
  duration.textContent = "0:00";

  renderTracks();

  if (autoplay) {
    playTrack();
  }
}

// PLAY SONG

async function playTrack() {
  if (!audio.src) {
    loadTrack(currentIndex);
  }

  try {
    await audio.play();

    playBtn.textContent = "Ⅱ";
    playBtn.setAttribute("aria-label", "Pause");

    albumArt.classList.add("is-playing");

    renderTracks();

  } catch (error) {
    alert(
      "Song file not found! Please check: " +
      tracks[currentIndex].src
    );
  }
}

// PAUSE SONG

function pauseTrack() {
  audio.pause();

  playBtn.textContent = "▶";
  playBtn.setAttribute("aria-label", "Play");

  albumArt.classList.remove("is-playing");

  renderTracks();
}

// PLAY / PAUSE

playBtn.addEventListener("click", () => {
  if (audio.paused) {
    playTrack();
  } else {
    pauseTrack();
  }
});

// NEXT SONG

function nextTrack() {
  if (isShuffle && tracks.length > 1) {
    let randomIndex;

    do {
      randomIndex = Math.floor(Math.random() * tracks.length);
    } while (randomIndex === currentIndex);

    loadTrack(randomIndex, true);

  } else {
    loadTrack(currentIndex + 1, true);
  }
}

nextBtn.addEventListener("click", nextTrack);

// PREVIOUS SONG

prevBtn.addEventListener("click", () => {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
  } else {
    loadTrack(currentIndex - 1, true);
  }
});

// SHUFFLE

shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;

  shuffleBtn.classList.toggle("selected", isShuffle);
});

// REPEAT

repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;

  repeatBtn.classList.toggle("selected", isRepeat);

  audio.loop = isRepeat;
});

// SONG DURATION

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
  renderTracks();
});

// SONG PROGRESS

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;

  progress.value =
    (audio.currentTime / audio.duration) * 100;

  currentTime.textContent =
    formatTime(audio.currentTime);
});

// SEEK SONG

progress.addEventListener("input", () => {
  if (audio.duration) {
    audio.currentTime =
      (progress.value / 100) * audio.duration;
  }
});

// VOLUME CONTROL

volume.addEventListener("input", () => {
  audio.volume = Number(volume.value);
});

// AUTOMATIC NEXT SONG

audio.addEventListener("ended", () => {
  if (!isRepeat) {
    nextTrack();
  }
});

// INITIAL SETUP

audio.volume = Number(volume.value);

renderTracks();
loadTrack(0);
