document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('videoInput');
  const processBtn = document.getElementById('processBtn');
  const progress = document.getElementById('progress');

  let selectedFile = null;

  // ✅ Click area opens file picker
  dropArea.addEventListener('click', () => {
    console.log("Click detected");
    fileInput.click();
  });

  // ✅ Drag over highlights drop zone
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
  });

  // ✅ Remove highlight on drag leave
  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
  });

  // ✅ Handle file drop
  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    selectedFile = e.dataTransfer.files[0];
    if (selectedFile) {
      console.log("File dropped:", selectedFile.name);
      progress.innerText = `Selected: ${selectedFile.name}`;
      processBtn.disabled = false;
    }
  });

  // ✅ Handle file input (click upload)
  fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log("File selected:", selectedFile.name);
      progress.innerText = `Selected: ${selectedFile.name}`;
      processBtn.disabled = false;
    }
  });
});
