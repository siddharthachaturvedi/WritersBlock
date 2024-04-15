document.addEventListener('DOMContentLoaded', function () {
    const writingArea = document.getElementById('writingArea');
    const wordCountDisplay = document.getElementById('wordCount');
    const charCountDisplay = document.getElementById('charCount');
    const gptSuggestButton = document.getElementById('gptSuggest');
    const themeToggle = document.getElementById('themeToggle');
    const placeholderText = 'Set your thoughts free...';

    // Placeholder functionality
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

    // Set placeholder on initial load
    setPlaceholder();

    // Event listeners
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
        event.preventDefault(); // Prevent default link behavior
        removePlaceholder();
        const paragraphs = writingArea.innerText.trim().split('\n');
        const lastParagraph = paragraphs.pop();
        if (lastParagraph && lastParagraph !== placeholderText) {
            const mockResponse = `\n\nGPT-4: "Following your last paragraph, here's an idea..."`;
            writingArea.innerText += mockResponse;
            updateWordAndCharCounts();
            // Scroll to the bottom of the document
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
        setPlaceholder();
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
});
