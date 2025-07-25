document.addEventListener("DOMContentLoaded", () => {
  const { PDFDocument } = PDFLib;
  const { createFFmpeg, fetchFile } = FFmpeg;
  const ffmpeg = createFFmpeg({ log: true });

  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('videoInput');
  const processBtn = document.getElementById('processBtn');
  const progress = document.getElementById('progress');
  const downloadLink = document.getElementById('downloadLink');
  const printBtn = document.getElementById('printBtn');

  let selectedFile = null;

  // ✅ Click to select
  dropArea.addEventListener('click', () => fileInput.click());

  // ✅ Drag & Drop
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
  });
  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    selectedFile = e.dataTransfer.files[0];
    if (selectedFile) {
      progress.innerText = `Selected: ${selectedFile.name}`;
      processBtn.disabled = false;
    }
  });

  // ✅ File input
  fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
      progress.innerText = `Selected: ${selectedFile.name}`;
      processBtn.disabled = false;
    }
  });

  // ✅ Generate PDF
  processBtn.addEventListener('click', async () => {
    if (!selectedFile) {
      alert("Please upload a video first.");
      return;
    }

    try {
      progress.innerText = "Loading FFmpeg (may take 10-20 sec)...";
      console.log("Loading FFmpeg...");
      if (!ffmpeg.isLoaded()) await ffmpeg.load();

      const filename = "input.mp4";
      ffmpeg.FS('writeFile', filename, await fetchFile(selectedFile));

      progress.innerText = "Extracting 32 frames (may take a while)...";
      console.log("Running FFmpeg...");
      await ffmpeg.run('-i', filename, '-vf', 'fps=32/6', 'frame%03d.jpg');

      progress.innerText = "Creating PDF...";
      console.log("Building PDF...");
      const pdfDoc = await PDFDocument.create();

      const pageWidth = 432; // 6 inch
      const pageHeight = 288; // 4 inch
      const frameWidth = pageWidth / 2;
      const frameHeight = pageHeight / 2;

      for (let i = 1; i <= 32; i += 4) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        for (let j = 0; j < 4; j++) {
          const idx = i + j;
          if (idx > 32) break;
          const name = `frame${String(idx).padStart(3, '0')}.jpg`;
          const data = ffmpeg.FS('readFile', name);
          const img = await pdfDoc.embedJpg(data);
          const x = (j % 2) * frameWidth;
          const y = j < 2 ? pageHeight / 2 : 0;
          page.drawImage(img, { x, y, width: frameWidth, height: frameHeight });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      downloadLink.href = url;
      downloadLink.download = "flipbook.pdf";
      downloadLink.classList.remove('hidden');
      downloadLink.innerText = "Download PDF";

      printBtn.classList.remove('hidden');
      printBtn.onclick = () => {
        const win = window.open(url, '_blank');
        win.print();
      };

      progress.innerText = "PDF ready!";
      console.log("Done!");
    } catch (error) {
      console.error("Error:", error);
      progress.innerText = "Failed to generate PDF. Check console.";
    }
  });
});
