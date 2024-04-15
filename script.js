document.addEventListener('DOMContentLoaded', function () {
    const writingArea = document.getElementById('writingArea');
    const wordCountDisplay = document.getElementById('wordCount');
    const charCountDisplay = document.getElementById('charCount');
    const gptSuggestButton = document.getElementById('gptSuggest');
    const themeToggle = document.getElementById('themeToggle');
    const placeholderText = 'Set your thoughts free...';

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
    setPlaceholder();

    writingArea.addEventListener('input', function () {
        const text = writingArea.innerText;
        if (text !== placeholderText) {
            const words = text.match(/\S+/g) ? text.match(/\S+/g).length : 0;
            const chars = text.length;
            wordCountDisplay.textContent = `${words} words`;
            charCountDisplay.textContent = `${chars} chars`;
        }
    });

    themeToggle.addEventListener('change', function () {
        const isDarkMode = themeToggle.checked;
        document.body.dataset.theme = isDarkMode ? 'dark' : 'light';
    });

    gptSuggestButton.addEventListener('click', function (event) {
        event.preventDefault();
        removePlaceholder();

        const paragraphs = writingArea.innerText.trim().split('\n');
        const lastParagraph = paragraphs.pop();

        if (lastParagraph && lastParagraph !== placeholderText) {
            showProcessingMessage();

            // Update the URL to point to your Flask server's endpoint
            const url = 'https://writenow.azurewebsites.net/getCompletion'; // Update this to your Azure URL
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
                if(data.text) {
                    writingArea.innerText += `\n\n${data.text}`;
                } else {
                    writingArea.innerText += `\n\nError: Received no data`;
                }
                updateWordAndCharCounts();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            })
            .catch(err => {
                removeProcessingMessage();
                console.error('Error fetching GPT-4 suggestion:', err);
                writingArea.innerText += `\n\nError: ${err.message}`;
            });
        } else {
            setPlaceholder();
        }
    });

    function updateWordAndCharCounts() {
        const text = writingArea.innerText;
        if (text !== placeholderText) {
            const words = text.match(/\S+/g) ? text.match(/\S+/g).length : 0;
            const chars = text.length;
            wordCountDisplay.textContent = `${words} words`;
            charCountDisplay.textContent = `${chars} chars`;
        }
    }

    function showProcessingMessage() {
        writingArea.innerText += '\n\nGPT-4 is thinking...';
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    function removeProcessingMessage() {
        writingArea.innerText = writingArea.innerText.replace('\n\nGPT-4 is thinking...', '');
    }
});