import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";

var scale = 1.5;

function pdfFile(file, canvas) {
  pdfjsLib.workerSrc = "pdf.worker.js";
  pdfjsLib.getDocument(file).promise.then(function (pdfDoc) {
    var pdf = pdfDoc;
    document.getElementById("page_count").textContent = pdfDoc.numPages;
    var pageNum = pdfDoc.numPages;
    renderPage(pdf, pageNum, canvas);
  });
}

function renderPage(pdf, num, canvas) {
  var pageRendering = true;
  pdf.getPage(num).then(function (page) {
    var viewport = page.getViewport({ scale: scale });
    var context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    var renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    var renderTask = page.render(renderContext);
    renderTask.promise.then(function () {
      pageRendering = false;
      // //You need to clear the existing rectangle
      // pdfPages[num] = context.getImageData(0, 0, canvas.width, canvas.height);
      //Now you can draw new rectangle
      drawRectangle(10, 10, 100, 50, context);
      // if (pageNumPending !== null) {
      //   renderPage(pageNumPending);
      //   pageNumPending = null;
      // }
    });
  });
}

function drawRectangle(x, y, w, h, context) {
  context.strokeStyle = "red";
  context.strokeRect(x, y, w, h);
}

const FileUploadPage = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [isFilePicked, setIsFilePicked] = useState(false);
  const canvasRef = useRef();
  const canvas = canvasRef.current;

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsFilePicked(true);
  };

  const handleSubmission = () => {
    console.log(selectedFile.Object);
    // pdfFile(selectedFile.data, canvas);
  };

  return (
    <div>
      <input type="file" name="file" onChange={changeHandler} />
      <div>
        <button onClick={handleSubmission}>Submit</button>
      </div>
    </div>
  );
};

export default FileUploadPage;
