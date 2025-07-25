document.addEventListener("DOMContentLoaded", () => {
  const { PDFDocument } = PDFLib;
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("videoInput");
  const processBtn = document.getElementById("processBtn");
  const progress = document.getElementById("progress");
  const downloadLink = document.getElementById("downloadLink");
  const printBtn = document.getElementById("printBtn");
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let selectedFile = null;

  // ✅ Enable click-to-upload
  dropArea.addEventListener("click", () => fileInput.click());

  // ✅ Drag and Drop logic
  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    selectedFile = e.dataTransfer.files[0];
    if (selectedFile) {
      progress.innerText = `Selected: ${selectedFile.name}`;
      processBtn.disabled = false;
    }
  });

  // ✅ File input change
  fileInput.addEventListener("change", (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
      progress.innerText = `Selected: ${selectedFile.name}`;
      processBtn.disabled = false;
    }
  });

  // ✅ Generate PDF from video frames
  processBtn.addEventListener("click", async () => {
    if (!selectedFile) return alert("Upload a video first!");

    processBtn.disabled = true;
    processBtn.innerText = "Processing... ⏳";

    const url = URL.createObjectURL(selectedFile);
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const frameCount = 32;
      const interval = duration / frameCount;

      canvas.width = 1024; // High resolution for print
      canvas.height = 768;

      const pdfDoc = await PDFDocument.create();
      const pageWidth = 432; // 6 inch
      const pageHeight = 288; // 4 inch
      const frameWidth = pageWidth / 2;
      const frameHeight = pageHeight / 2;

      let images = [];

      progress.innerText = "Capturing frames...";
      for (let i = 0; i < frameCount; i++) {
        const time = i * interval;
        await seekVideo(video, time);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        images.push(dataUrl);
        progress.innerText = `Captured ${i + 1} / ${frameCount}`;
        await new Promise((r) => setTimeout(r, 50));
      }

      progress.innerText = "Building PDF...";
      for (let i = 0; i < images.length; i += 4) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        for (let j = 0; j < 4; j++) {
          if (i + j >= images.length) break;
          const img = await pdfDoc.embedJpg(
            await fetch(images[i + j]).then((r) => r.arrayBuffer())
          );
          const x = (j % 2) * frameWidth;
          const y = j < 2 ? pageHeight / 2 : 0;
          page.drawImage(img, { x, y, width: frameWidth, height: frameHeight });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(blob);

      downloadLink.href = pdfUrl;
      downloadLink.download = "flipbook.pdf";
      downloadLink.classList.remove("hidden");
      downloadLink.innerText = "Download PDF";

      printBtn.classList.remove("hidden");
      printBtn.onclick = () => {
        const win = window.open(pdfUrl, "_blank");
        win.print();
      };

      progress.innerText = "✅ PDF ready!";
      processBtn.innerText = "Create Flipbook";
      processBtn.disabled = false;
    };
  });

  function seekVideo(video, time) {
    return new Promise((resolve) => {
      video.currentTime = time;
      video.onseeked = () => resolve();
    });
  }
});
