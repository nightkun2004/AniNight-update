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

        reader.onload = function(e) {
            img.src = e.target.result;
        }

        reader.readAsDataURL(file);
        previewContainer.appendChild(img);
    }

    previewContainer.style.display = 'block'; // Show the container if images are present
}

// Initialize Quill editor
var quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['link', 'video', 'image'],
            [{ 'color': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['align', 'script', 'code-block'],
            [{ 'header': [1, 2, 3, 4, 5, 6] }],
            ['clean']
        ]
    },
    formats: [
        'bold', 'italic', 'header', 'underline', 'strike', 'link', 'color', 'list', 'bullet', 'indent',
        'video', 'align', 'script', 'code-block', 'image'
    ]
});

var contentInput = document.getElementById('content');

quill.on('text-change', function() {
    contentInput.value = quill.root.innerHTML;
});

quill.getModule('toolbar').addHandler('video', function() {
    var url = prompt('Enter the URL of the video:');
    if (url) {
        insertVideo(url);
    }
});

quill.getModule('toolbar').addHandler('image', function() {
    selectLocalImage();
});

function insertVideo(url) {
    var range = quill.getSelection();
    quill.insertEmbed(range.index, 'video', url, Quill.sources.USER);
}

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