document.addEventListener("DOMContentLoaded", () => {
    const videoMain = document.getElementById("Mainvideo");
    const playPauseBtn = document.getElementById("play-pause");
    const progressArea = document.getElementById("progress-area");
    const progressBar = document.querySelector(".progress-bar");
    const fullscreenBtn = document.querySelector(".fullscreen");
    const currentTimeElem = document.getElementById('current-time');
    const totalTimeElem = document.getElementById('total-time');
    const thumbnail = document.querySelector(".thumbnail");
    const thunnaillBar = document.querySelector(".thunnaillBar");

    var thumbnails = [];
    var thumbnailWidth = 158;
    var thumbnailHeight = 90;
    var horizontalItemCount = 5;
    var verticalItemCount = 5;

    const videoTitleElement = document.getElementById("VideoID");
    const episodeElement = document.getElementById("EpisodeID");

    // ดึงค่า data-* attributes
    const videoId = videoTitleElement.dataset.videoid;
    const episodeId = episodeElement.dataset.episodeid;

    // console.log("Video ID:", videoId);
    // console.log("Episode ID:", episodeId);

    async function fetchVideoData() {
        const apiUrl = `http://localhost:5000/api/v2/Series/medias/${videoId}/${episodeId}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            // console.log(data)

            if (response.ok && data.episode.videoUrl) {
                // ดึงวิดีโอเป็น Blob
                const videoResponse = await fetch(data.episode.videoUrl);
                const videoBlob = await videoResponse.blob();

                // สร้าง Blob URL
                const blobUrl = URL.createObjectURL(videoBlob);
                videoMain.src = blobUrl;
                videoMain.poster = data.series.poster;

                const VideoId_info = document.getElementById("videoid_info")
                VideoId_info.textContent = data.series.videoId;

                // ลบ Blob URL หลังจากเล่นจบ
                videoMain.onended = () => {
                    URL.revokeObjectURL(blobUrl);
                    console.log("Blob URL revoked");
                };
            } else {
                console.error("Failed to load video from API");
            }
        } catch (error) {
            console.error("Error fetching video data:", error);
        }
    }

    fullscreenBtn.addEventListener("click", () => {
        FullScreen();
    });

    function FullScreen() {
        const videoPlayer = document.querySelector('.video_player');
        if (!document.fullscreenElement) {
            videoPlayer.requestFullscreen().then(() => {
                videoPlayer.classList.add("openFullScreen");
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            }).catch(err => {
                console.error(`An error occurred while trying to enable full screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen().then(() => {
                videoPlayer.classList.remove("openFullScreen");
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }).catch(err => {
                console.error(`An error occurred while trying to exit full screen mode: ${err.message}`);
            });
        }
    }


    function toggleVideo() {
        if (videoMain.paused) {
            videoMain.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            videoMain.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    playPauseBtn.addEventListener("click", toggleVideo);

    videoMain.addEventListener('timeupdate', () => {
        if (!videoMain.duration) return;

        let progressWidth = (videoMain.currentTime / videoMain.duration) * 100;
        progressBar.style.width = `${progressWidth}%`;

        let currentMin = Math.floor(videoMain.currentTime / 60);
        let currentSec = Math.floor(videoMain.currentTime % 60);
        let totalMin = Math.floor(videoMain.duration / 60);
        let totalSec = Math.floor(videoMain.duration % 60);

        currentTimeElem.textContent = `${currentMin}:${currentSec < 10 ? '0' + currentSec : currentSec}`;
        totalTimeElem.textContent = `${totalMin}:${totalSec < 10 ? '0' + totalSec : totalSec}`;
    });

    // progressArea.addEventListener('mousemove', (event) => {
    //     if (!videoMain.duration) return;

    //     const rect = progressArea.getBoundingClientRect();
    //     const x = event.clientX - rect.left;
    //     const percent = x / progressArea.offsetWidth;
    //     const previewTime = percent * videoMain.duration;

    //     const thumbnailIndex = Math.floor(previewTime / thumbnailInterval);
    //     const thumbnailURL = `${thumbnailBaseURL}${thumbnailIndex}.jpg`;

    //     thumbnailImage.src = thumbnailURL;
    //     thumbnailPreviewContainer.style.left = `${x - thumbnailPreviewContainer.offsetWidth / 2}px`;
    //     thumbnailPreviewContainer.style.display = "block"; 
    // });

    thunnaillBar.addEventListener("mousemove", (e) => {
        let x = e.offsetX;
        let progressWidthval = thunnaillBar.clientWidth;
        let videoDuration = videoMain.duration;
        let progressTime = (x / progressWidthval) * videoDuration;

        if (videoMain.paused) {
            updateThumbnail(progressTime);
        }

        thumbnail.style.left = `${x - (thumbnailWidth / 2)}px`; // Center thumbnail
    });

    thunnaillBar.addEventListener("mouseout", () => {
        thumbnail.style.display = 'none'; // ซ่อน thumbnail เมื่อนำเมาส์ออกจาก thunnaillBar
    });

    progressArea.addEventListener("mouseleave", () => {
        thumbnail.style.display = "none";
    });

    function updateThumbnail(progressTime) {
        for (var item of thumbnails) {
            var data = item.sec.find(xl => xl.index === Math.floor(progressTime));
            if (data && data.item !== undefined) {
                thumbnail.style.backgroundImage = `url(${item.data})`;
                thumbnail.style.backgroundPositionX = `${data.backgroundPositionX}px`;
                thumbnail.style.backgroundPositionY = `${data.backgroundPositionY}px`;
                thumbnail.style.display = 'block';
                return;
            }
        }

        generateThumbnail(progressTime);
    }

    function generateThumbnail(time) {
        if (!videoMain.paused) return;

        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        canvas.width = thumbnailWidth;
        canvas.height = thumbnailHeight;
        videoMain.currentTime = time;

        videoMain.addEventListener('seeked', function () {
            context.drawImage(videoMain, 0, 0, thumbnailWidth, thumbnailHeight);
            let thumbnailURL = canvas.toDataURL('image/jpeg');
            displayThumbnail(thumbnailURL);
        }, { once: true });
    }

    function displayThumbnail(url) {
        thumbnail.style.backgroundImage = `url(${url})`;
        thumbnail.style.display = 'block';
    }
    progressArea.addEventListener("pointerdown", (e) => {
        const rect = progressArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / progressArea.offsetWidth;
        if (videoMain.duration) {
            videoMain.currentTime = percent * videoMain.duration;
        }
    });

    fetchVideoData();

    // คีย์ลัดสำหรับตัวเล่น
    function handleKeypress(e) {
        switch (e.key) {
            case ' ':
                toggleVideo();
                break;
            case 'f':
            case 'ด':
            case 'โ':
            case 'F':
                FullScreen();
                break;
        }
    }

    document.addEventListener('keydown', handleKeypress);
});
