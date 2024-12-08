document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById('content');
    const button = document.getElementById('changeContent');
  
    // Function to update the content with fade effect
    function updateContent(newText) {
      // Fade out
      content.classList.add('hidden');
  
      // Wait for the fade-out transition to complete
      content.addEventListener(
        'transitionend',
        function onTransitionEnd() {
          content.textContent = newText; // Update the content
          content.classList.remove('hidden'); // Fade in
          content.removeEventListener('transitionend', onTransitionEnd);
        }
      );
    }
  
    // Example: Change content when the button is clicked
    button.addEventListener('click', () => {
      const newText = `Updated Content: ${new Date().toLocaleTimeString()}`;
      updateContent(newText);
    });
  });
  