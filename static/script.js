document.addEventListener('DOMContentLoaded', function () {
    const writingArea = document.getElementById('writingArea');
    const wordCountDisplay = document.getElementById('wordCount');
    const charCountDisplay = document.getElementById('charCount');
    const gptSuggestButton = document.getElementById('gptSuggest');
    const themeToggle = document.getElementById('themeToggle');
    const markdownPreview = document.getElementById('markdownPreview');
    const placeholderText = `Welcome to writeByte.org! 👋
    Your private, distraction-free writing space.
    1. Full Screen: F11 (PC) or Cmd+Ctrl+F (Mac)
    2. Need ideas? Click 'Get GPT-4 Suggestions'.
    3. To save: Press 'Download your masterpiece'.

    Everything vanishes on refresh. Nothing stored, nothing tracked.
    
    Happy writing! 🌈📝`;

    function updateWordAndCharCounts() {
        const text = writingArea.innerText;
        if (text !== placeholderText) {
            const words = text.match(/\S+/g) ? text.match(/\S+/g).length : 0;
            const chars = text.length;
            wordCountDisplay.textContent = `${words} words`;
            charCountDisplay.textContent = `${chars} chars`;
        }
    }

    function renderMarkdown() {
        const markdownText = writingArea.innerText;
        const html = marked(markdownText);
        markdownPreview.innerHTML = html;
    }

    // Load saved text from local storage when the page loads
    const savedText = localStorage.getItem('savedText');
    if (savedText) {
        writingArea.innerText = savedText;
        updateWordAndCharCounts(); // Update word and character counts based on loaded text
        renderMarkdown(); // Render markdown based on loaded text
    } else {
        setPlaceholder();
    }

    writingArea.addEventListener('input', function () {
        const text = this.innerText;
        localStorage.setItem('savedText', text); // Save the current text to local storage
        updateWordAndCharCounts(); // Update counts on every input event
        renderMarkdown(); // Render markdown on every input event
    });

    document.getElementById('ellipsis').addEventListener('click', function() {
        var content = document.getElementById('footer-hidden-content');
        if (content.style.maxHeight !== '0px' && content.style.maxHeight !== '') {
            content.style.maxHeight = '0px';
        } else {
            content.style.maxHeight = '500px';
        }
        this.classList.toggle('active');
    });

    document.getElementById('downloadMasterpiece').addEventListener('click', function(event) {
        event.preventDefault();
        const text = writingArea.innerText;
        const blob = new Blob([text], { type: 'text/plain' });
        const downloadLink = document.createElement('a');
        downloadLink.download = "My_Masterpiece.txt";
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.target = '_blank';
        downloadLink.click();
    });

    function setPlaceholder() {
        if (writingArea.innerText.trim() === '') {
            writingArea.innerText = placeholderText;
            writingArea.classList.add('placeholder');
        }
    }

    function removePlaceholder() {
        if (writingArea.innerText === placeholderText) {
            writingArea.innerText = '';
            writingArea.classList.remove('placeholder');
        }
    }

    writingArea.addEventListener('focus', removePlaceholder);
    writingArea.addEventListener('blur', setPlaceholder);

    themeToggle.addEventListener('change', function () {
        const isDarkMode = themeToggle.checked;
        document.body.dataset.theme = isDarkMode ? 'dark' : 'light';
    });

    gptSuggestButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        removePlaceholder();
        gptSuggestButton.disabled = true; // Disable the button
        gptSuggestButton.style.opacity = '0.5'; // Gray out the button

        const paragraphs = writingArea.innerText.trim().split('\n');
        const lastParagraph = paragraphs.pop();

        if (lastParagraph && lastParagraph !== placeholderText) {
            showProcessingMessage();
            const url = 'https://writenow.azurewebsites.net/getCompletion';
            const headers = new Headers({
                'Content-Type': 'application/json'
            });

            fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ lastParagraph: lastParagraph })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                removeProcessingMessage();
                if (data.text) {
                    writingArea.innerText += `\n\n${data.text}`;
                } else {
                    writingArea.innerText += `\n\nError: Received no data`;
                }
                updateWordAndCharCounts();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            })
            .catch(err => {
                console.error('Error fetching GPT-4 suggestion:', err);
                writingArea.innerText += `\n\nError: ${err.message}`;
                removeProcessingMessage();
            })
            .finally(() => {
                gptSuggestButton.disabled = false; // Re-enable the button
                gptSuggestButton.style.opacity = '1'; // Restore button opacity
            });
        } else {
            setPlaceholder();
        }
    });

    function showProcessingMessage() {
        writingArea.innerText += '\n\nGPT-4 is thinking...';
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    function removeProcessingMessage() {
        writingArea.innerText = writingArea.innerText.replace('\n\nGPT-4 is thinking...', '');
    }
});
