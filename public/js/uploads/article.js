function previewImage(input, previewId, coverTextId) {
    const file = input.files[0];
    const preview = document.getElementById(previewId);
    const coverText = document.getElementById(coverTextId);

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            coverText.style.display = 'none';
        }

        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
        coverText.style.display = 'flex';
    }
}

function previewImages(input) {
    const previewContainer = document.getElementById('previewimages');
    previewContainer.innerHTML = ''; // Clear any existing previews

    for (const file of input.files) {
        const reader = new FileReader();
        const img = document.createElement('img');
        img.style.objectFit = 'contain';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.marginBottom = '10px';

        reader.onload = function (e) {
            img.src = e.target.result;
        }

        reader.readAsDataURL(file);
        previewContainer.appendChild(img);
    }

    previewContainer.style.display = 'block'; // Show the container if images are present
}

const example_image_upload_handler = (blobInfo, progress) => {
    return new Promise((resolve, reject) => {
        // สร้าง FormData เพื่อส่งข้อมูล
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());

        fetch('https://sv7.ani-night.online/api/v2/upload/post/article', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin' // หรือ 'include' หากต้องการส่ง cookies
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 403) {
                        reject({ message: 'HTTP Error: ' + response.status, remove: true });
                        return;
                    }
                    reject('HTTP Error: ' + response.status);
                }

                return response.json();
            })
            .then(json => {
                // ตรวจสอบว่ามี location หรือไม่
                if (!json || typeof json.src !== 'string') {
                    reject('Invalid JSON: ' + JSON.stringify(json));
                    return;
                }

                resolve(json.src); // ส่ง URL กลับไปยัง TinyMCE
            })
            .catch(error => {
                reject('Image upload failed: ' + error.message);
            });
    });
};


tinymce.init({
    selector: '#editor',
    height: 800,
    plugins: 'link image media lists',
    toolbar: 'undo redo | image | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright | bullist numlist | link image media | removeformat',
    menubar: false, // ซ่อนเมนูบาร์
    setup: function (editor) {
        editor.on('change', function () {
            var content = editor.getContent(); // ดึงข้อมูลจาก TinyMCE editor
            document.getElementById('content').value = content; // อัพเดทค่าใน input hidden
            const previewElement = document.getElementById('preview-article-Demo');
            if (previewElement) {
                previewElement.innerHTML = content; // อัพเดทส่วนแสดงตัวอย่าง
            } else {
                console.error("Preview element not found");
            }
        });
    },
    images_upload_handler: example_image_upload_handler
});

function selectLocalImage() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = () => {
        const file = input.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            fetch('/upload/image/articles', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(result => {
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, 'image', result.url);
                })
                .catch(error => {
                    console.error('Error uploading image:', error);
                });
        }
    };
}