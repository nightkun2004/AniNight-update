const video_players = document.querySelectorAll(".video_player");

video_players.forEach(video_player => {
    const video_player_html = `
        ${video_player.innerHTML}
        <div class="thumbnail"></div>
         <div class="controls" id="controls">
                    <div class="progress-area" id="progress-area">
                        <canvas class="bufferedBar"></canvas>
                        <div class="thunnaillBar"></div>
                        <div class="progress-bar">
                            <span></span>
                        </div>
                    </div>
                    <div class="left-controls">
                        <p class="icon" id="play-pause">
                            <i class="fas fa-play"></i>
                        </p>
                        <p class="icon" id="rewind">
                            <i class="fas fa-backward"></i>
                        </p>
                        <p class="icon" id="forward">
                            <i class="fas fa-forward"></i>
                        </p>
                        <div class="volume">
                            <p class="icon" id="volume-icon">
                                <i class="fas fa-volume-up"></i>
                            </p>
                            <input class="volume_range" type="range" id="volume-control" min="0" max="1" step="0.1"
                                value="1">
                        </div>
                        <div class="duration">
                            <p id="current-time">00:00</p> /
                            <p id="total-time">00:00</p>
                        </div>
                    </div>
                   
                    <div class="right-controls">
                        <p class="Subtitles" id="sub_btn">
                            <i class="fas fa-closed-captioning"></i>
                        </p>
                        <p class="quality" id="quality_btn">
                            คุณภาพ
                        </p>
                        <p class="icon" id="headerAudio_btn">
                            <i class="fas fa-gear"></i>
                        </p>
                        <p class="icon" id="fullscreen">
                            <i class="fas fa-expand"></i>
                        </p>
                    </div>

                    <!-- Popup Subtitles -->
                    <div class="header-Subtitles">
                        <h3>คำบรรยาย</h3>
                        <ul id="subtitleList">
                            <li class="activesub">ปิด</li>
                             <li data-subtitle="/sub/th/sub.srt" >ซับไทย</li>
                        </ul>
                    </div>
                    <div class="header-quality">
                        <h3>ความละเอียดวีดีโอ</h3>
                        <ul id="video-quality-list">
                            <li data-quality="fullHD">FullHD</li>
                            <li data-quality="1080p">1080p</li>
                            <li data-quality="720p">720p</li>
                            <li data-quality="480p">480p</li>
                            <li data-quality="360p">360p</li>
                            <li data-quality="280p">280p</li>
                            <li data-quality="140p">140p</li>
                        </ul>
                    </div>
                    <div class="header-audio-lists">
                        <h3>เลือกแทร็กเสียง</h3>
                        <ul id="video-audio-list">
                            <li data-audio="videomain" class="activeaudio">วีดีโอต้นฉบับ</li>
                            <li data-audio="/audios/th/thaiver.mp3">พากย์ไทย</li>
                            <li data-audio="/audios/jp/test.mp3">พากย์ญี่ปุ่น</li>
                        </ul>
                    </div>
                </div>
                `;
      video_player.innerHTML = video_player_html;
}); 


document.addEventListener("DOMContentLoaded", () => {
    const videoMain = document.getElementById("mainvideo");
    const videoQualityList = document.querySelectorAll('#video-quality-list li');
    const qualityMessage = document.getElementById('qualityMessage');
    const playPauseBtn = document.getElementById("play-pause");
    const rewindBtn = document.getElementById('rewind');
    const forwardBtn = document.getElementById('forward');
    const forward_popup = document.getElementById('forward_popup');
    const rewind_popup = document.getElementById('rewind_popup');
    const progressArea = document.getElementById("progress-area");
    const bufferedBar = document.querySelector(".bufferedBar");
    const progress_Bar = document.querySelector(".progress-bar");
    const thumbnail = document.querySelector(".thumbnail");
    const thunnaillBar = document.querySelector(".thunnaillBar");
    const volumeIcon = document.getElementById('volume-icon');
    const volumeControl = document.getElementById('volume-control');
    const fullscreenBtn = document.getElementById('fullscreen');
    const currentTimeElem = document.getElementById('current-time');
    const totalTimeElem = document.getElementById('total-time');
    const video_group = document.querySelector('.video-group');
    const headerSubtitle = document.querySelector('.header-Subtitles');
    const headerQuality = document.querySelector('.header-quality');
    const headerAudioLists = document.querySelector(".header-audio-lists");
    const controls = document.getElementById("controls");
    const sub_btn = document.getElementById("sub_btn");
    const quality_btn = document.getElementById("quality_btn");
    const headerAudio_btn = document.getElementById("headerAudio_btn");
    const audioList = document.getElementById('video-audio-list');
    const loadingMessage = document.getElementById('loadingMessage');
    const audioTracks = videoMain.getElementsByTagName('audio');

    let mouseMoveTimeout;

    function showControls() {
        controls.classList.remove("hidden");
        clearTimeout(mouseMoveTimeout);
        mouseMoveTimeout = setTimeout(() => {
            controls.classList.add("hidden");
        }, 3000);
    }

    showControls();

    video_group.addEventListener("mousemove", showControls);
    video_group.addEventListener("click", showControls);
    video_group.addEventListener("touchstart", showControls);

    controls.addEventListener("mousemove", showControls);
    controls.addEventListener("click", showControls);
    controls.addEventListener("touchstart", showControls);

    sub_btn.addEventListener("click", () => {
        headerSubtitle.classList.toggle("show");
    });
    quality_btn.addEventListener("click", () => {
        headerQuality.classList.toggle("show");
    });
    headerAudio_btn.addEventListener("click", () => {
        headerAudioLists.classList.toggle("show");
    });

    function playVideo() {
        if (videoMain.paused) {
            videoMain.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }

    function pauseVideo() {
        if (!videoMain.paused) {
            videoMain.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    function switchAudioTrack(audioSrc) {
        let foundTrack = false;
        for (let i = 0; i < audioTracks.length; i++) {
            if (audioTracks[i].src.includes(audioSrc)) {
                audioTracks[i].currentTime = videoMain.currentTime;
                audioTracks[i].volume = videoMain.volume;
                playVideo();
                audioTracks[i].play();
                foundTrack = true;
            } else {
                audioTracks[i].pause();
            }
        }
        
        if (audioSrc === "videomain") {
            videoMain.muted = false;
        } else {
            videoMain.muted = true;
        }
    
        if (!foundTrack && audioSrc !== "videomain") {
            const selectedAudioTrack = document.querySelector(`audio[src="${audioSrc}"]`);
            if (selectedAudioTrack) {
                selectedAudioTrack.currentTime = videoMain.currentTime;
                selectedAudioTrack.volume = videoMain.volume;
                selectedAudioTrack.play();
            }
        }
    }
    
    audioList.addEventListener('click', function(event) {
        if (event.target.tagName === 'LI') {
            const audioSrc = event.target.getAttribute('data-audio');
            switchAudioTrack(audioSrc);
    
            const items = document.querySelectorAll('#video-audio-list li');
            items.forEach(item => item.classList.remove('activeaudio'));
            event.target.classList.add('activeaudio');
        }
    });
    

    
    videoMain.addEventListener('pause', () => {
        for (let i = 0; i < audioTracks.length; i++) {
            if (!audioTracks[i].paused) {
                audioTracks[i].pause();
            }
        }
    });
    
    videoMain.addEventListener('play', () => {
        for (let i = 0; i < audioTracks.length; i++) {
            if (!audioTracks[i].paused) {
                audioTracks[i].play();
            }
        }
    });
    
    const defaultAudio = document.querySelector('#video-audio-list li.activeaudio').getAttribute('data-audio');
    switchAudioTrack(defaultAudio);

    function loadSubtitles(subtitleFilePath) {
        loadingMessage.style.display = 'block';

        fetch(subtitleFilePath)
            .then(response => response.text())
            .then(srtText => {
                const subtitles = parseSRT(srtText);
                syncSubtitles(subtitles);
                loadingMessage.style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching the SRT file:', error);
                loadingMessage.textContent = 'เกิดข้อผิดพลาดในการโหลดซับไตเติล';
                setTimeout(() => {
                    loadingMessage.style.display = 'none';
                }, 3000);
            });
    }

    function parseSRT(data) {
        const subtitles = [];
        const regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\n([\s\S]*?)(?=\n{2,}|$)/g;
        let match;
        while ((match = regex.exec(data)) !== null) {
            subtitles.push({
                index: match[1],
                start: timeToSeconds(match[2]),
                end: timeToSeconds(match[3]),
                text: match[4].replace(/\n/g, '<br>')
            });
        }
        return subtitles;
    }

    function timeToSeconds(time) {
        const [hours, minutes, seconds] = time.split(':');
        const [secs, ms] = seconds.split(',');
        return parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseInt(secs, 10) + parseInt(ms, 10) / 1000;
    }

    function syncSubtitles(subtitles) {
        const subtitleDiv = document.getElementById('subtitle');
        videoMain.addEventListener('timeupdate', function () {
            const currentTime = videoMain.currentTime;
            const currentSubtitle = subtitles.find(sub => currentTime >= sub.start && currentTime <= sub.end);
            if (currentSubtitle) {
                subtitleDiv.innerHTML = `<span>${currentSubtitle.text}</span>`;
            } else {
                subtitleDiv.innerHTML = '';
            }
        });
    }

    function checkSubtitles() {
        if (subtitleList.children.length === 1) {
            sub_btn.style.display = 'none';
        } else {
            sub_btn.style.display = 'block';
        }
    }

    checkSubtitles()

    subtitleList.addEventListener('click', function (event) {
        if (event.target.tagName === 'LI' && event.target.getAttribute('data-subtitle')) {
            const subtitleFilePath = event.target.getAttribute('data-subtitle');
            loadSubtitles(subtitleFilePath);

            const items = document.querySelectorAll('#subtitleList li');
            items.forEach(item => item.classList.remove('activesub'));
            event.target.classList.add('activesub');
        }
    });

    // Initial load of subtitles
    loadSubtitles(document.querySelector('#subtitleList li.activesub').getAttribute('data-subtitle'));

    playPauseBtn.addEventListener("click", () => {
        if (videoMain.paused) {
            playVideo();
        } else {
            pauseVideo();
        }
    });

    rewindBtn.addEventListener("click", () => {
        videoMain.currentTime -= 10;
        for (let i = 0; i < audioTracks.length; i++) {
            audioTracks[i].currentTime -= 10;
        }
    });
    
    forwardBtn.addEventListener("click", () => {
        videoMain.currentTime += 10;
        for (let i = 0; i < audioTracks.length; i++) {
            audioTracks[i].currentTime += 10;
        }
    });
    
    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            videoMain.currentTime -= 10;
            for (let i = 0; i < audioTracks.length; i++) {
                audioTracks[i].currentTime -= 10;
            }
            rewind_popup.classList.add("show");
            forward_popup.classList.remove("show");
            setTimeout(() => {
                rewind_popup.classList.remove("show");
            }, 1000);
        } else if (event.key === "ArrowRight") {
            videoMain.currentTime += 10;
            for (let i = 0; i < audioTracks.length; i++) {
                audioTracks[i].currentTime += 10;
            }
            forward_popup.classList.add("show");
            rewind_popup.classList.remove("show");
            setTimeout(() => {
                forward_popup.classList.remove("show");
            }, 1000);
        }
    });

    function handleKeypress(event) {
        switch (event.key) {
            case ' ':
                event.preventDefault();
                if (videoMain.paused) {
                    playVideo();
                } else {
                    pauseVideo();
                }
                break;
            case 'ArrowLeft':
                rewind10sec();
                break;
            case 'ArrowRight':
                forward10sec();
                break;
            case 'ArrowUp':
                if (videoMain.volume < 1) {
                    videoMain.volume += 0.1;
                    volumeControl.value = videoMain.volume;
                }
                break;
            case 'ArrowDown':
                if (videoMain.volume > 0) {
                    videoMain.volume -= 0.1;
                    volumeControl.value = videoMain.volume;
                }
                break;
            case 'm':
            case 'M':
             toggleMute();
                break;
            case 'f':
            case 'F':
                toggleFullscreen();
                break;
        }
    }

    document.addEventListener('keydown', handleKeypress);

    window.addEventListener('resize', () => {
        if (!document.fullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });

    fullscreenBtn.addEventListener("click", () => {
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
    });

    function toggleFullscreen() {
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

    volumeControl.addEventListener("input", (e) => {
        const volume = e.target.value;
        videoMain.volume = volume;
        for (let i = 0; i < audioTracks.length; i++) {
            audioTracks[i].volume = volume;
        }

        if (volume == 0) {
            volumeIcon.innerHTML = '<i class="fa-solid fa-volume-mute"></i>';
        } else if (volume <= 0.5) {
            volumeIcon.innerHTML = '<i class="fa-solid fa-volume-down"></i>';
        } else {
            volumeIcon.innerHTML = '<i class="fa-solid fa-volume-up"></i>';
        }
    });

    function toggleMute() {
        videoMain.muted = !videoMain.muted;
        if (videoMain.muted) {
            volumeControl.value = 0;
            volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            volumeControl.value = videoMain.volume;
            if (videoMain.volume === 0) {
                volumeIcon.innerHTML = '<i class="fas fa-volume-mute"></i>';
            } else if (videoMain.volume > 0 && videoMain.volume <= 0.5) {
                volumeIcon.innerHTML = '<i class="fas fa-volume-down"></i>';
            } else {
                volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        }
    }

    videoMain.addEventListener("timeupdate", () => {
        let progressWidth = (videoMain.currentTime / videoMain.duration) * 100;
        progress_Bar.style.width = `${progressWidth}%`;

        let currentVideoTime = videoMain.currentTime;
        let currentMin = Math.floor(currentVideoTime / 60);
        let currentSec = Math.floor(currentVideoTime % 60);

        let totalMintes = Math.floor(videoMain.duration / 60);
        let totalSeconds = Math.floor(videoMain.duration % 60);

        currentTimeElem.innerHTML = `${currentMin}:${currentSec < 10 ? "0" + currentSec : currentSec}`;
        totalTimeElem.textContent = `${totalMintes}:${totalSeconds < 10 ? '0' + totalSeconds : totalSeconds}`;
    });


    // event listener for seeking through progress bar
    progressArea.addEventListener("pointerdown", (e) => {
        progressArea.setPointerCapture(e.pointerId);
        setTimelinePosition(e);
        progressArea.addEventListener("pointermove", setTimelinePosition);
        progressArea.addEventListener("pointerup", () => {
            progressArea.removeEventListener("pointermove", setTimelinePosition);
        });
    });

    // function to set video timeline position
    function setTimelinePosition(e) {
        let progressWidthval = progressArea.clientWidth;
        let clickOffsetX = e.offsetX;
        let videoDuration = videoMain.duration;
        videoMain.currentTime = (clickOffsetX / progressWidthval) * videoDuration;

        let currentVideoTime = videoMain.currentTime;
        let currentMin = Math.floor(currentVideoTime / 60);
        let currentSec = Math.floor(currentVideoTime % 60);
        currentTimeElem.innerHTML = `${currentMin}:${currentSec < 10 ? "0" + currentSec : currentSec}`;
    }

    // event listener for updating buffered progress bar
    videoMain.addEventListener('progress', () => {
        drawProgress(bufferedBar, videoMain.buffered, videoMain.duration);
    });

    // function to draw buffered progress
    function drawProgress(canvas, buffered, duration) {
        let context = canvas.getContext('2d');
        let width = canvas.width;
        let height = canvas.height;
        context.clearRect(0, 0, width, height);
        for (let i = 0; i < buffered.length; i++) {
            let start = buffered.start(i) / duration * width;
            let end = buffered.end(i) / duration * width;
            context.fillStyle = "#ffffffe6";
            context.fillRect(start, 0, end - start, height);
        }
    }

    progressArea.addEventListener('mousemove', (event) => {
        const rect = progressArea.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const percent = x / progressArea.offsetWidth;
        const time = percent * videoMain.duration;
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time - minutes * 60);
        // thunnaillBar.style.width = `${percent * 100}%`;
        // thunnaillBar.style.setProperty("--x", `${x}px`);
        // thunnaillBar.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    });

    thunnaillBar.addEventListener("mousemove", (e) => {
        // Calculate video progress based on mouse position
        let x = e.offsetX;
        let progressWidthval = thunnaillBar.clientWidth + 2;
        let videoDuration = videoMain.duration;
        let progressTime = (x / progressWidthval) * videoDuration;

        // Update thumbnail visuals (ensure video is paused)
        // if (videoMain.paused) {
        //     updateThumbnail(progressTime);
        // }

        // Update thumbnail position
        // thumbnail.style.left = `${x}px`;
    });

    function changeVideoQuality(quality, target) {
        // ตรวจสอบคุณภาพว่าวีดีโอรองรับหรือไม่
        if (videoMain) {
            qualityMessage.innerText = `กำลังเปลี่ยนคุณภาพเป็น ${quality}...`;
            // เลือก source ที่เป็นคุณภาพนั้น ๆ
            const source = videoMain.querySelector(`source[data-quality="${quality}"]`);
            if (source) {
                const currentTime = videoMain.currentTime;
                videoMain.src = source.src;
                videoMain.load();
                videoMain.currentTime = currentTime;
                playVideo();
                qualityMessage.innerText = `เปลี่ยนคุณภาพเป็น ${quality} สำเร็จ!`;
                videoQualityList.forEach(item => item.classList.remove('activequality'));

                // เพิ่มคลาส activequality ให้กับรายการที่เลือก
                target.classList.add('activequality');
                setTimeout(() => {
                    qualityMessage.innerText = '';
                }, 2000);
            } else {
                qualityMessage.innerText = `ไม่พบสำหรับคุณภาพ ${quality}`;
                setTimeout(() => {
                    qualityMessage.innerText = '';
                }, 2000);
            }
        } else {
            qualityMessage.innerText = `วีดีโอไม่สามารถเล่นคุณภาพ ${quality} ได้`;
            setTimeout(() => {
                qualityMessage.innerText = '';
            }, 4000);
        }
    }


    // เพิ่ม event listener สำหรับแต่ละคุณภาพที่เลือก
    for (let i = 0; i < videoQualityList.length; i++) {
        videoQualityList[i].addEventListener('click', function () {
            const quality = this.getAttribute('data-quality');
            changeVideoQuality(quality);
        });
    }

    videoMain.addEventListener("ended", () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    })

    
})