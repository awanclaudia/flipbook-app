{\rtf1\ansi\ansicpg1252\cocoartf2821
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const \{ PDFDocument, rgb \} = PDFLib;\
const \{ createFFmpeg, fetchFile \} = FFmpeg;\
\
const ffmpeg = createFFmpeg(\{ log: true \});\
\
const videoInput = document.getElementById('videoInput');\
const processBtn = document.getElementById('processBtn');\
const progressDiv = document.getElementById('progress');\
const downloadLink = document.getElementById('downloadLink');\
const printBtn = document.getElementById('printBtn');\
\
let selectedFile = null;\
videoInput.addEventListener('change', (e) => \{\
  selectedFile = e.target.files[0];\
  progressDiv.innerText = `Selected: $\{selectedFile.name\}`;\
\});\
\
processBtn.addEventListener('click', async () => \{\
  if (!selectedFile) \{\
    alert("Please upload a video first.");\
    return;\
  \}\
\
  progressDiv.innerText = "Loading FFmpeg...";\
  if (!ffmpeg.isLoaded()) await ffmpeg.load();\
\
  const filename = "input.mp4";\
  ffmpeg.FS('writeFile', filename, await fetchFile(selectedFile));\
\
  progressDiv.innerText = "Extracting frames...";\
  await ffmpeg.run(\
    '-i', filename,\
    '-vf', 'fps=32/6', // 32 frames in 6 seconds\
    'frame%03d.jpg'\
  );\
\
  const pdfDoc = await PDFDocument.create();\
  const pageWidth = 432; // 15.2 cm @ ~72 dpi (adjust for printer)\
  const pageHeight = 288; // 10.2 cm\
  const frameWidth = pageWidth / 2;\
  const frameHeight = pageHeight / 2;\
\
  for (let i = 1; i <= 32; i += 4) \{\
    const page = pdfDoc.addPage([pageWidth, pageHeight]);\
\
    for (let j = 0; j < 4; j++) \{\
      const idx = i + j;\
      if (idx > 32) break;\
      const name = `frame$\{String(idx).padStart(3, '0')\}.jpg`;\
      const data = ffmpeg.FS('readFile', name);\
      const img = await pdfDoc.embedJpg(data);\
\
      const x = (j % 2) * frameWidth;\
      const y = j < 2 ? pageHeight / 2 : 0;\
      page.drawImage(img, \{ x, y, width: frameWidth, height: frameHeight \});\
    \}\
  \}\
\
  const pdfBytes = await pdfDoc.save();\
  const blob = new Blob([pdfBytes], \{ type: 'application/pdf' \});\
  const url = URL.createObjectURL(blob);\
\
  downloadLink.href = url;\
  downloadLink.download = "flipbook.pdf";\
  downloadLink.style.display = "inline-block";\
  downloadLink.innerText = "Download PDF";\
\
  printBtn.style.display = "inline-block";\
  printBtn.onclick = () => \{\
    const win = window.open(url, '_blank');\
    win.print();\
  \};\
\
  progressDiv.innerText = "PDF ready!";\
\});\
}